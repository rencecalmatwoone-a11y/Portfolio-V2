import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(tmpdir(), "portfolio-v2-browser-tools/node_modules/playwright"));
const browser = await chromium.connectOverCDP(process.env.CDP_URL || "http://127.0.0.1:9228");
const sizes = [[320, 568], [375, 667], [390, 844], [568, 320], [768, 1024], [1024, 768], [1440, 900]];
try {
  for (const [width, height] of sizes) {
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: width < 1024, isMobile: width < 768 });
    try {
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", e => errors.push(e.message));
      await page.goto(process.env.BASE_URL || "http://localhost:3000", { waitUntil: "domcontentloaded" });
      const panel = page.getByRole("dialog", { name: "Music player" });
      const audio = page.locator("audio");
      const click = async locator => width < 1024 ? locator.tap() : locator.click();
      const button = name => panel.getByRole("button", { name, exact: true });
      const main = async () => {
        for (let i = 0; await panel.getAttribute("data-view") !== "main"; i++) {
          assert.ok(i < 6);
          await click(button("Menu: go back"));
        }
      };
      await click(page.getByRole("button", { name: "Open music player" }));
      await page.waitForFunction(() => document.querySelector('[role="dialog"]').dataset.booted === "true");
      await click(button("Select Nights by Frank Ocean"));
      await page.waitForFunction(() => !document.querySelector("audio").paused && document.querySelector("audio").currentTime > 0.1);
      for (const theme of ["dark", "light"]) {
        await click(page.getByRole("switch", { name: "Dark mode" }));
        await page.waitForFunction(theme => document.documentElement.dataset.theme === theme && !document.documentElement.dataset.themeTransition, theme);
        assert.equal(await panel.isVisible(), true);
        assert.equal(await audio.evaluate(el => el.paused), false);
        assert.equal(await panel.getByRole("img").isVisible(), true);
        await panel.getByRole("slider", { name: "Seek through song" }).fill("42");
        assert.ok(await audio.evaluate(el => el.currentTime) >= 42);
        await click(button("Pause song"));
        assert.equal(await audio.evaluate(el => el.paused), true);
        await click(button("Play song"));
        await click(button("Next song"));
        await page.waitForFunction(() => document.querySelector("audio").currentSrc.endsWith("futura-free.mp3") && !document.querySelector("audio").paused);
        await click(button("Previous song"));
        await page.waitForFunction(() => document.querySelector("audio").currentSrc.endsWith("nights.mp3") && !document.querySelector("audio").paused);
        await main();
        await click(button("Settings"));
        await click(button("Shuffle: Off"));
        await click(button("Shuffle: On"));
        await click(button("Repeat: Off"));
        await click(button("Repeat: One"));
        await click(button("Repeat: All"));
        await click(button("LCD Filter: On"));
        await click(button("LCD Filter: Off"));
        await click(button("Backlight: On"));
        await click(button("Backlight: Off"));
        await click(panel.getByRole("button", { name: /^Volume: / }));
        await panel.getByRole("slider", { name: "Music volume" }).fill("0.4");
        assert.equal(await audio.evaluate(el => el.volume), 0.4);
        await click(button("Mute music").first());
        assert.equal(await audio.evaluate(el => el.muted), true);
        await click(button("Unmute music").first());
        await main();
        await click(button("Now Playing"));
        await panel.getByRole("img").scrollIntoViewIfNeeded();
        const box = await panel.boundingBox();
        assert.ok(box.x >= 0 && box.x + box.width <= width);
        assert.ok(box.height <= height);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
        await page.screenshot({ path: path.join(tmpdir(), "portfolio-ipod-review", `responsive-${width}-${height}-${theme}.png`) });
      }
      // Keyboard activation of the actual theme control also preserves the panel.
      await page.getByRole("switch", { name: "Dark mode" }).focus();
      await page.keyboard.press("Space");
      await page.waitForFunction(() => document.documentElement.dataset.theme === "dark" && !document.documentElement.dataset.themeTransition);
      assert.equal(await panel.isVisible(), true);
      assert.deepEqual(errors, []);
      console.log(`Passed ${width}x${height}: both themes, theme persistence, artwork, transport, seek, settings, volume, keyboard`);
    } finally { await context.close(); }
  }
} finally { await browser.close(); }
