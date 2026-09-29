import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const require = createRequire(import.meta.url);
const toolsPath = path.join(tmpdir(), "portfolio-v2-browser-tools/node_modules");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(toolsPath, "playwright"));
const browser = await chromium.launch({ executablePath: process.env.BROWSER_PATH || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", headless: true });
const baseURL = process.env.BASE_URL || "http://localhost:3225";
const output = path.join(tmpdir(), "portfolio-case-study-review");
await mkdir(output, { recursive: true });
const slugs = ["ratioflow", "tutoyhub", "musync"];
const errors = [];
const results = [];

try {
  const page = await browser.newPage({ reducedMotion: "reduce" });
  page.on("pageerror", error => errors.push(error.message));
  page.on("response", response => {
    if (response.status() >= 400 && !response.url().includes("missing-project")) errors.push(`${response.status()} ${response.url()}`);
  });
  for (const slug of slugs) {
    const response = await page.goto(`${baseURL}/work/${slug}`, { waitUntil: "networkidle" });
    assert.equal(response.status(), 200);
    assert.equal(await page.locator("main").count(), 1);
    assert.equal(await page.locator("h1").count(), 1);
    assert.equal(await page.getByRole("link", { name: "Source Code" }).count(), 0);
    assert.ok(await page.getByRole("link", { name: "View Live" }).getAttribute("href"));
    assert.equal(await page.locator("main figure").count(), 2);
    assert.equal(await page.locator("main figure img").first().getAttribute("loading"), null);
    for (const image of (await page.locator("main figure img").all()).slice(1)) {
      assert.equal(await image.getAttribute("loading"), "lazy");
      await image.scrollIntoViewIfNeeded();
    }
    await page.waitForFunction(() => [...document.querySelectorAll("main img")].every(img => img.complete && img.naturalWidth > 0));
    assert.deepEqual(await page.locator('[aria-labelledby="more-projects-heading"] a').evaluateAll(es => es.map(e => e.getAttribute("href"))), slugs.filter(s => s !== slug).map(s => `/work/${s}`));
    const index = page.getByRole("navigation", { name: "Project index" });
    for (const theme of ["light", "dark"]) {
      await page.evaluate(theme => { document.documentElement.dataset.theme = theme; window.dispatchEvent(new Event("themechange")); }, theme);
      for (const width of [320, 375, 767, 768, 1024, 1440, 1920]) {
        await page.setViewportSize({ width, height: 900 });
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${slug}/${theme}/${width} overflow`);
        assert.equal(await index.locator("ul").isVisible(), width >= 768);
        assert.equal(await index.evaluate(el => getComputedStyle(el).position), width >= 768 ? "fixed" : "static");
        assert.ok(await index.getByRole("link", { name: "← Projects", exact: true }).isVisible());
        assert.ok(await index.getByRole("switch", { name: "Dark mode" }).isVisible());
        if (width >= 768) {
          assert.ok((await page.locator("main").boundingBox()).x >= (await index.boundingBox()).x + (await index.boundingBox()).width, "Index does not overlap page");
        }
        results.push(`${slug}/${theme}/${width}`);
      }
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
      const violations = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } })).violations.map(({ id, nodes }) => ({ id, targets: nodes.map(n => n.target) })));
      assert.deepEqual(violations, [], `${slug}/${theme} accessibility`);
      await page.screenshot({ path: path.join(output, `${slug}-${theme}.png`), fullPage: true });
    }
    for (const id of ["overview", "stack", "gallery", "highlights"]) {
      await index.locator(`a[href="#${id}"]`).focus();
      assert.notEqual(await index.locator(`a[href="#${id}"]`).evaluate(el => getComputedStyle(el).outlineStyle), "none");
      await page.keyboard.press("Enter");
      await page.waitForFunction(id => document.querySelector('nav [aria-current="location"]')?.getAttribute("href") === `#${id}`, id, { timeout: 5000 });
      assert.equal(await page.locator(":focus").getAttribute("id"), id);
    }
    await page.setViewportSize({ width: 375, height: 812 });
    await page.locator(":focus").evaluate(el => el.blur());
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.screenshot({ path: path.join(output, `${slug}-mobile-dark.png`), fullPage: true });
  }
  await page.goto(`${baseURL}/work/collecthieves-tutoy-hub`, { waitUntil: "networkidle" });
  assert.equal(new URL(page.url()).pathname, "/work/tutoyhub");
  assert.equal((await page.goto(`${baseURL}/work/missing-project`)).status(), 404);
  await page.goto(`${baseURL}/work/ratioflow`, { waitUntil: "networkidle" });
  await page.locator('[aria-labelledby="more-projects-heading"] a').first().click();
  await page.waitForURL("**/work/tutoyhub");
  await page.getByRole("link", { name: "← Projects", exact: true }).click();
  await page.waitForURL("**/#work");
  assert.equal(await page.getByRole("navigation", { name: "Section index" }).isVisible(), true);
  assert.deepEqual(await page.locator("#work article > a").evaluateAll(es => es.map(e => e.getAttribute("href"))), slugs.map(s => `/work/${s}`));
  await page.locator("#work article > a").first().click();
  await page.waitForURL("**/work/ratioflow");
  const staticPage = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 375, height: 812 } });
  await staticPage.goto(`${baseURL}/work/ratioflow`, { waitUntil: "networkidle" });
  assert.equal(await staticPage.locator("h1").innerText(), "RatioFlow");
  assert.equal(await staticPage.locator("main figure").count(), 2);
  assert.ok(await staticPage.getByRole("link", { name: "← Projects", exact: true }).isVisible());
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ responsiveChecks: results.length, routes: "passed including legacy redirect and 404", navigation: "keyboard, active sections, related projects, homepage return passed", accessibility: "automated WCAG A/AA checks passed", noJavaScript: "passed", screenshots: output, browserErrors: errors }, null, 2));
} finally {
  await browser.close();
}
