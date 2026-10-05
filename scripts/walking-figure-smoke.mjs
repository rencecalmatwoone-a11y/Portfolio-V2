import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const require = createRequire(import.meta.url);
const sharp = require("sharp");
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
  const copy = track.locator("[data-wrap-copy]");
  const sprite = button.locator('span[aria-hidden="true"]');
  const spriteBackground = () => sprite.evaluate((el) => getComputedStyle(el).backgroundImage);
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
    assert.equal((await page.request.get(`${baseURL}/images/hero/super-happy-pixel-dungeon-transparent.gif`)).status(), 200);
    assert.match(await spriteBackground(), /super-happy-pixel-dungeon-transparent\.gif/, "Hero uses the transparent GIF");
    const spriteBounds = await sprite.boundingBox();
    assert.ok(Math.abs(spriteBounds.width / spriteBounds.height - 230 / 460) < 0.01, "GIF retains its proportions");

    await traveler.evaluate((el) => { el.getAnimations()[0].currentTime = 0; });
    const start = await button.boundingBox();
    assert.ok(Math.abs(start.x - trackBounds.x) < 4, "Begins at left corner");
    await page.waitForTimeout(190);
    assert.ok((await button.boundingBox()).x > start.x, "Walks toward the right");

    // DOM click avoids Playwright waiting for an animated target to stop moving.
    await button.evaluate((el) => el.click());
    await page.waitForFunction(() => document.querySelector("[data-walking-figure]").dataset.running === "false");
    await traveler.evaluate(async (el) => { await Promise.all(el.getAnimations().map((animation) => animation.ready)); });
    const pausedX = (await button.boundingBox()).x;
    assert.match(await spriteBackground(), /super-happy-pixel-dungeon-still\.webp/, "Pause uses a static GIF frame");
    await page.waitForTimeout(220);
    assert.equal((await button.boundingBox()).x, pausedX, "Pause holds position");
    assert.match(await spriteBackground(), /super-happy-pixel-dungeon-still\.webp/, "Pause keeps the static frame");
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

    const timing = await traveler.evaluate((el) => el.getAnimations()[0].effect.getTiming());
    assert.equal(timing.iterations, Infinity, "Travel loops continuously");
    assert.equal(timing.easing, "linear", "Travel keeps a constant speed");
    assert.equal(await track.getAttribute("data-phase"), null, "No standing or turn-around phases");
    assert.equal(await copy.getAttribute("tabindex"), "-1", "Wrap copy does not add a keyboard stop");
    assert.equal(await button.count(), 1, "One accessible pause control");

    const seek = async (progress) => traveler.evaluate(async (el, value) => {
      el.style.animationPlayState = "paused";
      const animation = el.getAnimations()[0];
      await animation.ready;
      animation.currentTime = Number(animation.effect.getTiming().duration) * value;
    }, progress);

    await seek(0.5);
    for (const theme of ["light", "dark"]) {
      await page.evaluate((value) => { document.documentElement.dataset.theme = value; }, theme);
      const figureBounds = await button.boundingBox();
      const { data, info } = await sharp(await page.screenshot({ clip: trackBounds })).removeAlpha().raw().toBuffer({ resolveWithObject: true });
      const pixel = (x, y) => data.subarray((y * info.width + x) * info.channels, (y * info.width + x + 1) * info.channels);
      const figureX = Math.round(figureBounds.x - trackBounds.x);
      assert.deepEqual(pixel(figureX + 1, 2), pixel(figureX - 4, 2), `GIF background is transparent in ${theme} at ${width}`);
    }

    await seek(1 - spriteBounds.width / (trackBounds.width * 2));
    const exiting = await button.boundingBox();
    const entering = await copy.boundingBox();
    assert.ok(exiting.x < trackBounds.x + trackBounds.width && exiting.x + exiting.width > trackBounds.x + trackBounds.width, "Character crosses the right edge");
    assert.ok(entering.x < trackBounds.x && entering.x + entering.width > trackBounds.x, "Same character enters through the left edge");
    assert.ok(Math.abs(exiting.x - entering.x - trackBounds.width) < 1, "Wrap copies remain exactly one track width apart");
    assert.match(await spriteBackground(), /transparent\.gif/, "GIF keeps walking during wrap");
    assert.equal(await sprite.evaluate((el) => getComputedStyle(el).transform), "none", "Character keeps facing right");
    for (const theme of ["light", "dark"]) {
      await page.evaluate((value) => { document.documentElement.dataset.theme = value; }, theme);
      await page.screenshot({ path: path.join(output, `wrap-${theme}-${width}.png`) });
    }
    await seek(1.001);
    const wrapped = await button.boundingBox();
    assert.ok(Math.abs(wrapped.x - trackBounds.x) < 2, "Next loop begins immediately at the left edge");
    await traveler.evaluate((el) => el.style.removeProperty("animation-play-state"));
    await page.waitForTimeout(200);
    assert.ok((await button.boundingBox()).x > wrapped.x, "Character keeps walking after wrapping");
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
  assert.match(await still.evaluate((el) => getComputedStyle(el).backgroundImage), /super-happy-pixel-dungeon-still\.webp/, "Reduced motion uses a static GIF frame");
  const stillBounds = await still.boundingBox();
  await page.waitForTimeout(200);
  assert.deepEqual(await still.boundingBox(), stillBounds, "Reduced motion figure stays still");
  await still.focus();
  assert.equal(await still.getByRole("tooltip").isVisible(), true, "Reduced motion keeps the bubble accessible");
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ result: "passed", widths: [320, 375, 768, 1440], checks: ["transparent GIF in both themes", "proportions", "continuous edge wrap", "constant speed without standing or turning", "social spacing", "pause and keyboard resume", "accessible speech bubble", "offscreen pause", "reduced motion", "no overflow"], screenshots: output }, null, 2));
} finally {
  await browser.close();
}
