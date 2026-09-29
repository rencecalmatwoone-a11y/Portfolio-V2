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
const output = path.join(tmpdir(), "portfolio-v2-cinematic-banner");
await mkdir(output, { recursive: true });

try {
  for (const width of [375, 768, 1440]) {
    for (const reducedMotion of ["no-preference", "reduce"]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion });
      const page = await context.newPage();
      await page.goto(process.env.BASE_URL || "http://localhost:3100", { waitUntil: "networkidle" });
      const scene = page.locator("section[aria-label='A quiet sunset drive'] > div");
      await scene.evaluate((element) => {
        window.scrollTo({ top: window.scrollY + element.getBoundingClientRect().top - 120, behavior: "instant" });
      });
      await scene.locator("img").evaluateAll(async (images) => {
        await Promise.all(images.map((image) => image.decode()));
      });
      const state = await scene.evaluate((element) => {
        const [base, mid, foreground] = element.querySelectorAll("img");
        const [dim, glow] = element.querySelector("span").querySelectorAll("span");
        const section = element.parentElement;
        const sceneBounds = element.getBoundingClientRect();
        const sectionBounds = section.getBoundingClientRect();
        return {
          height: element.getBoundingClientRect().height,
          width: element.getBoundingClientRect().width,
          left: element.getBoundingClientRect().left,
          right: element.getBoundingClientRect().right,
          styleLoaded: getComputedStyle(document.documentElement).getPropertyValue("--content-width").trim(),
          imagesLoaded: [base, mid, foreground].every((image) => image.complete && image.naturalWidth > 0),
          baseFit: getComputedStyle(base).objectFit,
          basePosition: getComputedStyle(base).objectPosition,
          grassMask: getComputedStyle(mid.parentElement).maskImage,
          wind: getComputedStyle(mid.parentElement).animationName,
          dim: getComputedStyle(dim).animationName,
          glow: getComputedStyle(glow).animationName,
          guidelineAligned: Math.abs(
            Number.parseFloat(getComputedStyle(section, "::after").top)
              - (sceneBounds.top - sectionBounds.top + sceneBounds.height - 4),
          ) < 1,
          cornerBlend: getComputedStyle(element, "::after").backgroundImage,
          sunsetRays: getComputedStyle(element.lastElementChild).backgroundImage,
          rayMask: getComputedStyle(element.lastElementChild).maskImage,
          rayAnimation: getComputedStyle(element.lastElementChild).animationName,
          heroFirst: document.querySelector("main > section:first-child")?.getAttribute("aria-labelledby") === "hero-heading",
          quoteLast: section.parentElement === document.querySelector("main > section:last-child"),
          betweenQuoteAndDots: section.previousElementSibling?.querySelector("blockquote") !== null
            && section.nextElementSibling?.getAttribute("data-slot") === "dot-grid-pattern",
        };
      });
      assert.equal(state.styleLoaded, "46rem");
      assert.ok(state.left >= 0 && state.right <= width, `Banner outside viewport at ${width}px`);
      assert.equal(state.imagesLoaded, true);
      assert.equal(state.baseFit, "cover");
      assert.equal(state.basePosition, "50% 50%");
      assert.match(state.grassMask, /radial-gradient/);
      assert.equal(state.height >= (width <= 600 ? 155 : 200), true);
      assert.equal(state.height <= (width <= 600 ? 190 : 260), true);
      assert.equal(state.wind === "none", reducedMotion === "reduce");
      assert.equal(state.dim === "none", reducedMotion === "reduce");
      assert.equal(state.glow === "none", reducedMotion === "reduce");
      assert.equal(state.guidelineAligned, true);
      assert.match(state.cornerBlend, /radial-gradient/);
      assert.match(state.sunsetRays, /conic-gradient/);
      assert.match(state.rayMask, /radial-gradient/);
      assert.equal(state.rayAnimation === "none", reducedMotion === "reduce" || width <= 600);
      assert.equal(state.heroFirst, true);
      assert.equal(state.quoteLast, true);
      assert.equal(state.betweenQuoteAndDots, true);
      if (reducedMotion === "no-preference") {
        const brightness = await scene.evaluate(async (element) => {
          const [dim, glow] = element.querySelector("span").querySelectorAll("span");
          const animations = [...dim.getAnimations(), ...glow.getAnimations()];
          await Promise.all(animations.map((animation) => animation.ready));
          animations.forEach((animation) => { animation.currentTime = 0; animation.pause(); });
          const bright = { dim: Number(getComputedStyle(dim).opacity), glow: Number(getComputedStyle(glow).opacity) };
          await new Promise((resolve) => requestAnimationFrame(resolve));
          animations.forEach((animation) => { animation.currentTime = 1700; });
          const dark = { dim: Number(getComputedStyle(dim).opacity), glow: Number(getComputedStyle(glow).opacity) };
          return { bright, dark };
        });
        assert.ok(brightness.dark.dim > brightness.bright.dim + 0.5);
        assert.ok(brightness.bright.glow > brightness.dark.glow + 0.4);
        await scene.evaluate((element) => {
          element.querySelector("span").querySelectorAll("span").forEach((layer) => {
            layer.getAnimations().forEach((animation) => { animation.currentTime = 0; });
          });
        });
        await scene.screenshot({ path: path.join(output, `${width}-bright.png`) });
        await scene.evaluate((element) => {
          element.querySelector("span").querySelectorAll("span").forEach((layer) => {
            layer.getAnimations().forEach((animation) => { animation.currentTime = 1700; });
          });
        });
      }
      await scene.screenshot({ path: path.join(output, `${width}-${reducedMotion}.png`) });
      await page.screenshot({ path: path.join(output, `${width}-${reducedMotion}-page.png`) });
      if (width === 1440 && reducedMotion === "reduce") {
        await page.evaluate(() => { document.documentElement.dataset.theme = "dark"; });
        assert.equal(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), "rgb(0, 0, 0)");
        await scene.screenshot({ path: path.join(output, "1440-dark.png") });
      }
      await context.close();
    }
  }
  console.log(`Banner smoke passed; screenshots: ${output}`);
} finally {
  await browser.close();
}
