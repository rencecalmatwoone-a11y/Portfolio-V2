import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(tmpdir(), "portfolio-v2-browser-tools/node_modules/playwright"));
const browser = await chromium.launch({
  executablePath: process.env.BROWSER_PATH || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: true,
});

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(process.env.BASE_URL || "http://localhost:3000", { waitUntil: "networkidle" });
  const track = page.locator("[data-walking-figure]");
  const figure = track.getByRole("button");
  const toggle = page.getByRole("switch", { name: "Dark mode" });
  await page.waitForFunction(() => document.querySelector("[data-walking-figure]").dataset.running === "true");
  const clip = await track.boundingBox();

  for (const paused of [false, true]) {
    if (paused) await figure.evaluate(el => el.click());
    for (let direction = 0; direction < 2; direction++) {
      await toggle.click();
      await page.waitForFunction(() => document.getAnimations().some(a => a.effect?.pseudoElement === "::view-transition-new(root)" && a.playState === "running"));
      // Hold the wipe on the old page: a frozen walker would otherwise be
      // hidden by the advancing new page and could escape a DOM-only check.
      await page.evaluate(async () => {
        const wipe = document.getAnimations().find(a => a.effect?.pseudoElement === "::view-transition-new(root)" && a.playState === "running");
        wipe.pause();
        await wipe.ready;
        wipe.currentTime = 0;
      });
      await page.waitForTimeout(120);
      const layers = await page.evaluate(() => ({
        name: getComputedStyle(document.querySelector("[data-walking-figure]")).viewTransitionName,
        oldDisplay: getComputedStyle(document.documentElement, "::view-transition-old(walking-figure)").display,
      }));
      assert.equal(layers.name, "walking-figure");
      assert.equal(layers.oldDisplay, "none");
      const beforeX = (await figure.boundingBox()).x;
      const before = await page.screenshot({ clip });
      await page.waitForTimeout(220);
      const after = await page.screenshot({ clip });
      const afterX = (await figure.boundingBox()).x;
      if (paused) {
        assert.equal(afterX, beforeX, "User pause survives theme toggle");
        assert.ok(after.equals(before), "Paused figure stays visually still during wipe");
      } else {
        assert.ok(afterX > beforeX, "Travel continues during wipe");
        assert.ok(!after.equals(before), "Rendered walker changes on the outgoing page");
      }
      await page.evaluate(() => document.getAnimations().find(a => a.effect?.pseudoElement === "::view-transition-new(root)" && a.playState === "paused").finish());
      await page.waitForFunction(() => !document.documentElement.dataset.themeTransition);
    }
  }
  assert.deepEqual(errors, []);
  console.log("Passed: visible walking during both theme wipes, user pause preserved, transition cleanup, no browser errors.");
} finally {
  await browser.close();
}
