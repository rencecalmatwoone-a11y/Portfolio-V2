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
const output = path.join(tmpdir(), "portfolio-theme-decorations-review");
await mkdir(output, { recursive: true });

async function checkAtWidth(width) {
  const page = await browser.newPage({ viewport: { width, height: 1000 } });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(process.env.BASE_URL || "http://localhost:3000", { waitUntil: "domcontentloaded" });
  const track = page.locator("[data-walking-figure]");
  const figure = track.getByRole("button");
  const toggle = page.getByRole("switch", { name: "Dark mode" });
  await page.waitForFunction(() => document.querySelector("[data-walking-figure]").dataset.running === "true");
  for (const paused of [false, true]) {
    if (paused) await figure.evaluate(el => el.click());
    for (let direction = 0; direction < 2; direction++) {
      await toggle.click();
      await page.waitForFunction(() => document.getAnimations().some(a => a.effect?.pseudoElement === "::view-transition-new(root)" && a.playState === "running"));
      // Hold every reveal to check live GIFs and edge fades during the wipe.
      await page.evaluate(async () => {
        const wipes = document.getAnimations().filter(a => a.effect?.pseudoElement?.startsWith("::view-transition-new(") && a.playState === "running");
        wipes.forEach(wipe => wipe.pause());
        await Promise.all(wipes.map(wipe => wipe.ready));
        wipes.forEach(wipe => { wipe.currentTime = 425; });
      });
      await page.waitForTimeout(120);
      const layers = await page.evaluate(() => ({
        name: getComputedStyle(document.querySelector("[data-walking-figure]")).viewTransitionName,
        groups: ["walking-figure", "quote-gif"].map(name => getComputedStyle(document.documentElement, `::view-transition-group(${name})`).display),
        oldDisplay: getComputedStyle(document.documentElement, "::view-transition-old(walking-figure)").display,
        edges: ["::before", "::after"].map(pseudo => getComputedStyle(document.querySelector("[data-walking-figure]"), pseudo).display),
      }));
      assert.equal(layers.name, "walking-figure");
      assert.ok(layers.groups.every(display => display !== "none"), "Both GIF layers remain visible throughout the wipe");
      assert.equal(layers.oldDisplay, "none", "No frozen outgoing walker is rendered");
      assert.deepEqual(layers.edges, ["none", "none"], "Only the colored wrap fades are hidden during the wipe");
      const clip = await track.boundingBox();
      const time = () => figure.evaluate(el => el.parentElement.getAnimations()[0].currentTime);
      const beforeTime = await time();
      const before = await page.screenshot({ clip });
      await page.waitForTimeout(220);
      const after = await page.screenshot({ clip });
      const afterTime = await time();
      if (paused) {
        assert.equal(afterTime, beforeTime, "User pause survives theme toggle");
        assert.ok(after.equals(before), "Paused walker remains visible and still during the wipe");
      } else {
        assert.ok(afterTime > beforeTime, "Travel continues without restarting");
        assert.ok(!after.equals(before), "The visible walker keeps animating during the wipe");
      }
      await page.screenshot({ path: path.join(output, `walker-${width}-${direction}-${paused ? "paused" : "running"}.png`) });
      await page.evaluate(() => document.getAnimations().filter(a => a.effect?.pseudoElement?.startsWith("::view-transition-new(") && a.playState === "paused").forEach(a => a.finish()));
      await page.waitForFunction(() => !document.documentElement.dataset.themeTransition);
      assert.equal(await track.evaluate(el => getComputedStyle(el).viewTransitionName), "none", "The walker returns to normal rendering after the wipe");
      assert.ok(await track.evaluate(el => ["::before", "::after"].every(pseudo => getComputedStyle(el, pseudo).display !== "none")), "Wrap fades return after the wipe");
      assert.equal(await track.getAttribute("data-running"), String(!paused));
    }
  }

  const gif = page.locator("[data-quote-gif]");
  await gif.evaluate(el => window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - 120, behavior: "instant" }));
  await page.waitForFunction(() => document.querySelector("[data-quote-gif]").dataset.running === "true");
  const gifClip = await gif.boundingBox();
  // Exclude the neighboring car scene's live blending along the lower edge.
  gifClip.height -= 20;
  for (let direction = 0; direction < 2; direction++) {
    await toggle.click();
    await page.waitForFunction(() => document.getAnimations().some(a => a.effect?.pseudoElement === "::view-transition-new(root)" && a.playState === "running"));
    await page.evaluate(async () => {
      const wipes = document.getAnimations().filter(a => a.effect?.pseudoElement?.startsWith("::view-transition-new(") && a.playState === "running");
      wipes.forEach(wipe => wipe.pause());
      await Promise.all(wipes.map(wipe => wipe.ready));
      // Keep the outgoing snapshot steady while the live GIF keeps playing.
      wipes.forEach(wipe => { wipe.currentTime = 0; });
    });
    await page.waitForTimeout(120);
    assert.equal(await gif.evaluate(el => getComputedStyle(el).viewTransitionName), "quote-gif");
    assert.notEqual(await page.evaluate(() => getComputedStyle(document.documentElement, "::view-transition-group(quote-gif)").display), "none");
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement, "::view-transition-old(quote-gif)").display), "none");
    const before = await page.screenshot({ clip: gifClip, path: path.join(output, `quote-${width}-${direction}-before.png`) });
    await page.waitForTimeout(220);
    const after = await page.screenshot({ clip: gifClip, path: path.join(output, `quote-${width}-${direction}-after.png`) });
    assert.ok(!after.equals(before), "The visible quote GIF keeps animating during the wipe");
    await page.evaluate(() => document.getAnimations().filter(a => a.effect?.pseudoElement?.startsWith("::view-transition-new(") && a.playState === "paused").forEach(a => a.finish()));
    await page.waitForFunction(() => !document.documentElement.dataset.themeTransition);
    assert.equal(await gif.evaluate(el => getComputedStyle(el).viewTransitionName), "none");
    assert.equal(await gif.getAttribute("data-running"), "true");
  }

  await page.emulateMedia({ reducedMotion: "reduce" });
  for (let direction = 0; direction < 2; direction++) {
    await toggle.focus();
    await page.keyboard.press("Space");
    assert.equal(await toggle.getAttribute("aria-checked"), String(direction === 0));
    assert.equal(await page.evaluate(() => localStorage.getItem("portfolio-theme")), direction === 0 ? "dark" : "light");
    assert.equal(await page.evaluate(() => Boolean(document.documentElement.dataset.themeTransition)), false, "Reduced motion switches immediately");
    assert.equal(await gif.evaluate(el => getComputedStyle(el).visibility), "visible");
  }
  assert.deepEqual(errors, []);
  await page.close();
  console.log(`Passed at ${width}px: GIFs stay visible during both theme wipes, only colored edges hidden, pause preserved, reduced motion and keyboard switching, no browser errors.`);
}

try {
  for (const width of [375, 1440]) await checkAtWidth(width);
} finally {
  await browser.close();
}
