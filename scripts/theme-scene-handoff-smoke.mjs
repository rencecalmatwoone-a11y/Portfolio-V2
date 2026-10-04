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
  for (const width of [320, 375, 600, 768, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(process.env.BASE_URL || "http://localhost:3000", { waitUntil: "networkidle" });
    await page.locator("[data-car-scene]").first().evaluate((scene) => {
      window.scrollTo({ top: window.scrollY + scene.getBoundingClientRect().top - 120, behavior: "instant" });
    });
    // Delay JS cleanup after native overlay teardown to expose even a one-frame
    // gap. The underlying page must already show only the selected scene.
    await page.evaluate(() => {
      const start = document.startViewTransition.bind(document);
      window.handoffs = [];
      document.startViewTransition = (update) => {
        const transition = start(update);
        return {
          ready: transition.ready,
          updateCallbackDone: transition.updateCallbackDone,
          skipTransition: () => transition.skipTransition(),
          finished: transition.finished.then(async () => {
            const root = document.documentElement;
            window.handoffs.push({
              theme: root.dataset.theme,
              active: root.matches(":active-view-transition"),
              visible: [...document.querySelectorAll("[data-car-scene]")]
                .filter((scene) => getComputedStyle(scene).visibility === "visible" && Number(getComputedStyle(scene).opacity) > 0)
                .map((scene) => scene.dataset.carScene),
            });
            await new Promise((resolve) => setTimeout(resolve, 120));
          }),
        };
      };
    });
    for (let index = 0; index < 6; index++) {
      const theme = index % 2 === 0 ? "dark" : "light";
      await page.getByRole("switch", { name: "Dark mode" }).click();
      await page.waitForFunction(() => !document.documentElement.dataset.themeTransition);
      const handoff = await page.evaluate(() => window.handoffs.at(-1));
      assert.equal(handoff.active, false, "Native overlay has ended before delayed cleanup");
      assert.deepEqual(handoff.visible, [theme], `Only ${theme} scene visible at ${width}px handoff ${index + 1}`);
      assert.equal(await page.evaluate(() => Boolean(document.documentElement.dataset.themeScenesLive || document.documentElement.dataset.themeWipeReady)), false);
    }
    assert.deepEqual(errors, []);
    await page.close();
    console.log(`Passed repeated scene handoffs at ${width}px`);
  }
} finally {
  await browser.close();
}
