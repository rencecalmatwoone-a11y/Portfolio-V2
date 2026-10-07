import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(tmpdir(), "portfolio-v2-browser-tools/node_modules/playwright"));
const browser = await chromium.connectOverCDP(process.env.CDP_URL || "http://127.0.0.1:9228");
try {
  for (const width of [320, 390, 768]) {
    const context = await browser.newContext({ viewport: { width, height: 850 }, hasTouch: true, isMobile: true });
    try {
      const page = await context.newPage();
      await page.goto(process.env.BASE_URL || "http://localhost:3000", { waitUntil: "domcontentloaded" });
      await page.getByRole("button", { name: "Open music player" }).tap();
      const panel = page.getByRole("dialog", { name: "Music player" });
      await page.waitForFunction(() => document.querySelector('[role="dialog"]').dataset.booted === "true");
      await panel.getByRole("button", { name: "Select Nights by Frank Ocean" }).tap();
      await page.waitForFunction(() => document.querySelector("audio").currentTime > 0.2);
      const source = await page.locator("audio").getAttribute("src");
      const slider = panel.getByRole("slider", { name: "Seek through song" });
      const session = await context.newCDPSession(page);
      const wheel = await panel.getByRole("group", { name: "iPod click wheel" }).boundingBox();
      const point = angle => ({ x: wheel.x + wheel.width / 2 + Math.cos(angle) * wheel.width * 0.39, y: wheel.y + wheel.height / 2 + Math.sin(angle) * wheel.height * 0.39 });
      async function drag(start, direction, paused) {
        await slider.fill("60");
        await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point(start)] });
        const values = [];
        for (let i = 1; i <= 10; i++) {
          await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [point(start + direction * i * 0.06)] });
          await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
          values.push(Number(await slider.inputValue()));
        }
        await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
        await page.waitForTimeout(300);
        assert.equal(new Set(values).size, 10, `Every small movement updates the indicator: ${values}`);
        for (let i = 1; i < values.length; i++) {
          const change = (values[i] - values[i - 1]) * direction;
          assert.ok(change > 0 && change < 2, `Continuous motion, not five-second jumps: ${values}`);
        }
        assert.equal(await page.locator("audio").getAttribute("src"), source, "Dragging over buttons does not skip tracks");
        assert.equal(await panel.getAttribute("data-view"), "playing");
        assert.equal(await page.locator("audio").evaluate(el => el.paused), paused);
        const time = await page.locator("audio").evaluate(el => el.currentTime);
        assert.ok(Math.abs(Number(await slider.inputValue()) - time) < 0.5, "Indicator stays synchronized with audio");
      }
      await drag(-0.8, 1, false);
      // Start on Next; crossing the angle boundary must not skip the song.
      await drag(0, 1, false);
      await drag(3, 1, false);
      await panel.getByRole("button", { name: "Pause song" }).tap();
      await drag(0, -1, true);
      await panel.getByRole("button", { name: "Play song", exact: true }).tap();
      await page.waitForFunction(() => !document.querySelector("audio").paused);
      await panel.getByRole("button", { name: "Next song" }).tap();
      await page.waitForFunction(() => document.querySelector("audio").currentSrc.endsWith("futura-free.mp3"));
      console.log(`Passed ${width}px: continuous forward/reverse touch seeking, button-origin drags, angle wrap, paused seeking, tap controls`);
    } finally { await context.close(); }
  }
} finally { await browser.close(); }

