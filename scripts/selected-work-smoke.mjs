import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const require = createRequire(import.meta.url);
const toolsPath = path.join(tmpdir(), "portfolio-v2-browser-tools/node_modules");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(toolsPath, "playwright"));
const browser = await chromium.launch({
  executablePath: process.env.BROWSER_PATH || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: true,
});
const baseURL = process.env.BASE_URL || "http://localhost:3104";
const output = path.join(tmpdir(), "portfolio-selected-work-review");
await mkdir(output, { recursive: true });
const failures = [];
const results = [];
const slugs = ["ratioflow", "collecthieves-tutoy-hub", "musync"];

try {
  const page = await browser.newPage({ reducedMotion: "reduce" });
  page.on("pageerror", error => failures.push(error.message));
  page.on("response", response => {
    if (response.status() >= 400 && !response.url().includes("missing-project")) {
      failures.push(`${response.status()} ${response.url()}`);
    }
  });
  for (const theme of ["light", "dark"]) {
    for (const width of [320, 375, 768, 895, 896, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(baseURL, { waitUntil: "networkidle" });
      await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
      const section = page.locator("#work");
      await section.scrollIntoViewIfNeeded();
      await page.waitForFunction(() => [...document.querySelectorAll("#work img")].every(img => img.complete && img.naturalWidth > 0));
      assert.equal(await section.locator("h2").innerText(), "Selected Work");
      assert.equal(await section.locator("h3").count(), 3);
      assert.deepEqual(await section.locator("a").evaluateAll(es => es.map(e => e.getAttribute("href"))), slugs.map(slug => `/work/${slug}`));
      const geometry = await section.evaluate(el => {
        const cards = [...el.querySelectorAll("article")].map(card => card.getBoundingClientRect().toJSON());
        return { cards, scrollWidth: document.documentElement.scrollWidth, followsHero: el.previousElementSibling?.getAttribute("aria-labelledby") === "hero-heading" };
      });
      assert.equal(geometry.scrollWidth, width, `Overflow ${width}/${theme}`);
      assert.ok(geometry.followsHero);
      if (width >= 896) {
        assert.equal(geometry.cards[0].y, geometry.cards[1].y);
        assert.ok(geometry.cards[1].x > geometry.cards[0].x);
        assert.ok(geometry.cards[2].y > geometry.cards[0].y);
      } else {
        assert.equal(geometry.cards[0].x, geometry.cards[1].x);
        assert.ok(geometry.cards[1].y > geometry.cards[0].y);
      }
      const images = await section.locator("img[data-project-image]").evaluateAll(es => es.map(e => ({
        lazy: e.loading, src: e.currentSrc, alt: e.alt, sizes: e.sizes,
        width: e.width, fit: getComputedStyle(e).objectFit,
      })));
      for (const img of images) {
        assert.equal(img.lazy, "lazy");
        assert.match(img.src, /\/_next\/image/);
        assert.ok(img.alt.length > 30 && img.sizes.length > 0);
        assert.ok(img.width > 220);
        assert.equal(img.fit, "cover");
      }
      await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
      const violations = await page.evaluate(async () => (await window.axe.run("#work", {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
      })).violations.map(({ id, nodes }) => ({ id, targets: nodes.map(n => n.target) })));
      assert.deepEqual(violations, [], `Accessibility ${width}/${theme}`);
      await page.screenshot({ path: path.join(output, `projects-${width}-${theme}.png`), fullPage: true });
      results.push({ width, theme, columns: width >= 896 ? 2 : 1 });
    }
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(baseURL, { waitUntil: "networkidle" });
  const links = page.locator("#work a");
  await links.first().focus();
  for (let i = 0; i < slugs.length; i++) {
    assert.equal(await page.locator(":focus").getAttribute("href"), `/work/${slugs[i]}`);
    assert.equal(await page.locator(":focus").evaluate(el => getComputedStyle(el).outlineStyle), "solid");
    if (i < slugs.length - 1) await page.keyboard.press("Tab");
  }
  await page.keyboard.press("Enter");
  await page.waitForURL(`**/work/${slugs[2]}`);
  assert.equal(await page.locator("h1").innerText(), "MUSYNC");
  await page.getByRole("link", { name: "Selected Work" }).click();
  await page.waitForURL("**/#work");
  for (const slug of slugs) {
    const response = await page.goto(`${baseURL}/work/${slug}`);
    assert.equal(response.status(), 200);
    assert.equal(await page.locator("h1").count(), 1);
    assert.ok(await page.getByRole("link", { name: "Visit live project" }).getAttribute("href"));
  }
  assert.equal((await page.goto(`${baseURL}/work/missing-project`)).status(), 404);

  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await links.first().hover();
  await page.waitForTimeout(500);
  assert.equal(await links.first().locator("img[data-project-image]").evaluate(el => getComputedStyle(el).transform), "matrix(1.02, 0, 0, 1.02, 0, 0)");
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(await links.first().locator("img[data-project-image]").evaluate(el => getComputedStyle(el).transform), "none");
  assert.equal(await links.first().locator("img[data-project-image]").evaluate(el => getComputedStyle(el).transitionDuration), "0s");

  const touch = await browser.newPage({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  await touch.goto(baseURL, { waitUntil: "networkidle" });
  await touch.locator("#work a").first().tap();
  await touch.waitForURL("**/work/ratioflow");
  const staticPage = await browser.newPage({ viewport: { width: 375, height: 812 }, javaScriptEnabled: false });
  await staticPage.goto(baseURL, { waitUntil: "networkidle" });
  assert.equal(await staticPage.locator("#work a").count(), 3);
  for (const link of await staticPage.locator("#work a").all()) assert.ok(await link.isVisible());
  assert.deepEqual(failures, []);
  console.log(JSON.stringify({ results, keyboard: "passed", routes: "3 destinations and unknown 404 passed", touch: "passed", reducedMotion: "passed", hover: "passed", noJavaScript: "passed", accessibility: "section WCAG A/AA automated checks passed", screenshots: output }, null, 2));
} finally {
  await browser.close();
}
