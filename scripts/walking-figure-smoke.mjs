import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(tmpdir(), "portfolio-v2-browser-tools/node_modules/playwright"));
const browser = await chromium.launch({
  executablePath: process.env.BROWSER_PATH || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: true,
});
const output = path.join(tmpdir(), "portfolio-walking-review");
const baseURL = process.env.BASE_URL || "http://localhost:3000";
await mkdir(output, { recursive: true });

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const track = page.locator("[data-walking-figure]");
  const button = track.getByRole("button");
  const sprite = button.locator('span[aria-hidden="true"]');
  const bubble = button.getByRole("tooltip", { includeHidden: true });
  const traveler = button.locator("..");

  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(baseURL, { waitUntil: "networkidle" });
    await page.waitForFunction(() => document.querySelector("[data-walking-figure]")?.dataset.running === "true");
    const trackBounds = await track.boundingBox();
    const socialBounds = await page.getByRole("list", { name: "Social and email links" }).boundingBox();
    assert.ok(trackBounds.y >= socialBounds.y + socialBounds.height, `Social overlap at ${width}`);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
    assert.equal((await page.request.get(`${baseURL}/images/hero/walking-figure.webp`)).status(), 200);

    await traveler.evaluate((el) => { el.getAnimations()[0].currentTime = 0; });
    const start = await button.boundingBox();
    assert.ok(Math.abs(start.x - trackBounds.x) < 4, "Begins at left corner");
    const before = await sprite.evaluate((el) => getComputedStyle(el).backgroundPosition);
    await page.waitForTimeout(190);
    const after = await sprite.evaluate((el) => getComputedStyle(el).backgroundPosition);
    assert.notEqual(before, after, "Leg frames advance");
    assert.ok((await button.boundingBox()).x > start.x, "Walks toward the right");

    // DOM click avoids Playwright waiting for an animated target to stop moving.
    await button.evaluate((el) => el.click());
    await page.waitForFunction(() => document.querySelector("[data-walking-figure]").dataset.running === "false");
    await traveler.evaluate(async (el) => { await Promise.all(el.getAnimations().map((animation) => animation.ready)); });
    const pausedX = (await button.boundingBox()).x;
    await page.waitForTimeout(220);
    assert.equal((await button.boundingBox()).x, pausedX, "Pause holds position");
    await button.focus();
    await page.waitForTimeout(180);
    assert.equal(await bubble.isVisible(), true, "Keyboard focus reveals the speech bubble");
    assert.equal((await bubble.innerText()).replace(/\s+/g, " ").trim(), "I'm just casually walking while listening to Frank Ocean.");
    await page.keyboard.press("Enter");
    await button.evaluate((el) => el.blur());
    await page.waitForTimeout(160);
    assert.ok((await button.boundingBox()).x > pausedX, "Keyboard resumes motion");

    for (const progress of [0, 0.5, 0.85]) {
      await traveler.evaluate((el, value) => {
        const animation = el.getAnimations()[0];
        animation.currentTime = Number(animation.effect.getTiming().duration) * value;
      }, progress);
      const figureBounds = await button.boundingBox();
      await page.mouse.move(figureBounds.x + figureBounds.width / 2, figureBounds.y + figureBounds.height / 2);
      await page.waitForTimeout(200);
      assert.equal(await bubble.isVisible(), true, "Hover reveals the speech bubble");
      const bubbleBounds = await bubble.boundingBox();
      assert.ok(bubbleBounds.x >= 0 && bubbleBounds.x + bubbleBounds.width <= width, `Bubble fits at ${width}, progress ${progress}`);
      const side = await bubble.getAttribute("data-side");
      const visibleFigureBounds = await button.boundingBox();
      assert.equal(side, "top", `Bubble stays above figure at ${width}, progress ${progress}`);
      assert.ok(Math.abs(bubbleBounds.y + bubbleBounds.height + 4 - visibleFigureBounds.y) <= 1, `Bubble stays 4px above figure at ${width}, progress ${progress}`);
      await page.mouse.move(bubbleBounds.x + bubbleBounds.width / 2, bubbleBounds.y + bubbleBounds.height / 2);
      const hoverX = (await button.boundingBox()).x;
      await page.waitForTimeout(100);
      assert.ok((await button.boundingBox()).x > hoverX, "Figure keeps walking while hovering the bubble");
      assert.equal(await bubble.isVisible(), true, "Bubble remains visible while hovered");
      if (progress === 0) {
        for (const theme of ["light", "dark"]) {
          await page.evaluate((value) => { document.documentElement.dataset.theme = value; }, theme);
          await page.screenshot({ path: path.join(output, `bubble-${theme}-${width}.png`) });
        }
      }
      await page.mouse.move(0, 0);
      await bubble.waitFor({ state: "hidden", timeout: 2000 });
      assert.equal(await bubble.isVisible(), false, "Bubble hides after hover");
    }
    await button.focus();
    await page.keyboard.press("Escape");
    await bubble.waitFor({ state: "hidden", timeout: 2000 });
    assert.equal(await bubble.isVisible(), false, "Escape dismisses bubble");
    await button.evaluate((el) => el.blur());
    await traveler.evaluate((el) => { el.getAnimations()[0].currentTime = 0; });

    for (const theme of ["light", "dark"]) {
      await page.evaluate((value) => { document.documentElement.dataset.theme = value; }, theme);
      await page.screenshot({ path: path.join(output, `${theme}-${width}.png`) });
    }

    await traveler.evaluate((el) => el.getAnimations()[0].finish());
    await page.waitForFunction(() => document.querySelector("[data-walking-figure]").dataset.phase === "stand-right");
    await sprite.evaluate((el) => getComputedStyle(el).animationName);
    const end = await button.boundingBox();
    assert.ok(Math.abs(end.x + end.width - trackBounds.x - trackBounds.width) < 1, "Ends at right corner");
    assert.equal(await sprite.evaluate((el) => el.getAnimations().length), 0, "Stops stepping at destination");
    assert.equal(await traveler.evaluate((el) => el.getAnimations()[0].effect.getTiming().duration), 1800, "Stands for 1.8 seconds");
    await page.waitForTimeout(200);
    assert.deepEqual(await button.boundingBox(), end, "Stands still at right corner");
    await page.setViewportSize({ width: width + 20, height: 1000 });
    const resizedTrack = await track.boundingBox();
    const resizedEnd = await button.boundingBox();
    assert.ok(Math.abs(resizedEnd.x + resizedEnd.width - resizedTrack.x - resizedTrack.width) < 1, "Stays at right corner after resize");
    await page.waitForFunction(() => document.querySelector("[data-walking-figure]").dataset.phase === "walk-left");
    assert.equal(await sprite.evaluate((el) => getComputedStyle(el).transform), "matrix(-1, 0, 0, 1, 0, 0)", "Faces left on the return walk");
    const returnStart = await button.boundingBox();
    await page.waitForTimeout(200);
    assert.ok((await button.boundingBox()).x < returnStart.x, "Walks back toward left");
    await traveler.evaluate((el) => el.getAnimations()[0].finish());
    await page.waitForFunction(() => document.querySelector("[data-walking-figure]").dataset.phase === "stand-left");
    await sprite.evaluate((el) => getComputedStyle(el).animationName);
    const leftEnd = await button.boundingBox();
    assert.ok(Math.abs(leftEnd.x - resizedTrack.x) < 1, "Returns exactly to left corner");
    assert.equal(await sprite.evaluate((el) => el.getAnimations().length), 0, "Stops stepping at left corner");
    // User pause also freezes the rest countdown, with no delayed turnaround.
    await button.click();
    await page.waitForTimeout(1900);
    assert.equal(await track.getAttribute("data-phase"), "stand-left", "Rest stays paused");
    assert.deepEqual(await button.boundingBox(), leftEnd);
    await button.click();
    await page.mouse.move(0, 0);
    await button.evaluate((el) => el.blur());
    await page.waitForFunction(() => document.querySelector("[data-walking-figure]").dataset.phase === "walk-right");
    assert.equal(await sprite.evaluate((el) => getComputedStyle(el).transform), "none", "Faces right for the next loop");
    assert.ok((await button.boundingBox()).x < resizedTrack.x + 15, "Automatically starts another loop from left");
  }

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForFunction(() => document.querySelector("[data-walking-figure]").dataset.running === "false");
  await traveler.evaluate(async (el) => { await Promise.all(el.getAnimations().map((animation) => animation.ready)); });
  const offscreenX = await traveler.evaluate((el) => getComputedStyle(el).transform);
  await page.waitForTimeout(200);
  assert.equal(await traveler.evaluate((el) => getComputedStyle(el).transform), offscreenX, "Offscreen animation pauses");
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(await button.isVisible(), false, "Reduced motion has no inactive animation control");
  const still = track.locator(":scope > span");
  assert.equal(await still.isVisible(), true);
  const stillBounds = await still.boundingBox();
  await page.waitForTimeout(200);
  assert.deepEqual(await still.boundingBox(), stillBounds, "Reduced motion figure stays still");
  await still.focus();
  assert.equal(await still.getByRole("tooltip").isVisible(), true, "Reduced motion keeps the bubble accessible");
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ result: "passed", widths: [320, 375, 768, 1440], checks: ["left-to-right travel", "stride frames", "social spacing", "pause and keyboard resume", "1.8 second corner rests", "right-to-left return and facing", "automatic loop", "paused rest countdown", "offscreen pause", "reduced motion", "no overflow"], screenshots: output }, null, 2));
} finally {
  await browser.close();
}
