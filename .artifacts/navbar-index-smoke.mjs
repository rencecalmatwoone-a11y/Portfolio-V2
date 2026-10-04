import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(tmpdir(), "portfolio-v2-browser-tools/node_modules/playwright"));
const browser = await chromium.launch({ executablePath: process.env.BROWSER_PATH || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", headless: true });
const baseURL = process.env.BASE_URL || "http://localhost:3217";
const output = path.join(tmpdir(), "portfolio-index-review");
await mkdir(output, { recursive: true });
const ids = ["work", "stack", "education", "certifications", "github"];
const errors = [];
const results = [];

try {
  const page = await browser.newPage();
  page.on("pageerror", error => errors.push(error.message));
  page.on("response", response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
  const desktop = page.getByRole("navigation", { name: "Section index", exact: true });
  const trigger = page.getByRole("button", { name: "Index", exact: true });
  const dialog = page.getByRole("dialog", { name: "Index", exact: true });
  async function activeIs(id) {
    await page.waitForFunction(id => document.querySelector('nav[aria-label="Section index"] [aria-current="location"]')?.getAttribute("href") === `#${id}`, id);
  }
  async function checkA11y(selector) {
    const violations = await page.evaluate(async selector => (await window.axe.run(selector, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } })).violations.map(({ id, nodes }) => ({ id, targets: nodes.map(node => node.target) })), selector);
    assert.deepEqual(violations, []);
  }
  for (const theme of ["light", "dark"]) {
    await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
    for (const width of [320, 375, 430, 767, 768, 820, 1024, 1280, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await page.waitForTimeout(250);
      assert.equal(await desktop.locator('[aria-current]').count(), 0, "Hero should be neutral");
      assert.equal(await page.locator("body > header").count(), 0);
      const overflow = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth, elements: [...document.querySelectorAll("body *")].filter(el => el.getBoundingClientRect().right > innerWidth + 1).map(el => `${el.tagName}.${el.className}`).slice(0, 12) }));
      assert.equal(overflow.overflow, false, `${width}/${theme}: ${JSON.stringify(overflow.elements)}`);
      if (width >= 768) {
        assert.equal(await desktop.isVisible(), true);
        assert.equal(await trigger.isVisible(), false);
        assert.equal(await desktop.evaluate(el => getComputedStyle(el).position), "fixed");
        const original = await desktop.boundingBox();
        await checkA11y('nav[aria-label="Section index"]');
        for (const id of ids) {
          await desktop.locator(`a[href="#${id}"]`).click();
          await activeIs(id);
          await page.waitForTimeout(800);
          const state = await desktop.locator(`a[href="#${id}"]`).evaluate(el => ({ line: getComputedStyle(el, "::before").opacity, color: getComputedStyle(el).color }));
          assert.equal(state.line, "1");
          const inactiveColor = await desktop.locator('a:not([aria-current])').first().evaluate(el => getComputedStyle(el).color);
          assert.notEqual(state.color, inactiveColor);
          assert.equal((await desktop.boundingBox()).y, original.y);
          const section = await page.locator(`#${id}`).boundingBox();
          assert.ok(section.x > original.x + original.width, `Overlap: ${width}/${id}`);
          assert.ok(section.y >= 0 && section.y < 900, `Destination visible: ${id}`);
        }
      } else {
        assert.equal(await desktop.isVisible(), true);
        assert.equal(await trigger.count(), 0);
        assert.equal(await dialog.count(), 0);
        assert.equal(await desktop.evaluate(el => getComputedStyle(el).position), "fixed");
        assert.equal(await desktop.locator("a").count(), ids.length);
        assert.equal(await desktop.locator('button[role="switch"]').isVisible(), true);
        assert.equal(await desktop.locator("ul").evaluate(el => el.scrollWidth <= el.clientWidth), true);
        const bounds = await desktop.boundingBox();
        assert.equal(bounds.y, 0, "Mobile navigation stays at the top");
        for (const link of await desktop.locator("a").all()) {
          assert.ok((await link.boundingBox()).height >= 44, "Mobile links have touch-sized targets");
          assert.equal(await link.evaluate(el => el.scrollWidth <= el.clientWidth), true, "Mobile labels fit");
        }
        await checkA11y('nav[aria-label="Section index"]');
      }
      await page.screenshot({ path: path.join(output, `index-${width}-${theme}.png`) });
      results.push({ width, theme, navigation: "passed" });
    }
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  // Real scrolling in both directions, independent of clicks and hashes.
  for (const id of [...ids].reverse()) {
    await page.locator(`#${id}`).evaluate(el => window.scrollTo({ top: el.offsetTop - innerHeight * 0.2, behavior: "instant" }));
    await activeIs(id);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForFunction(() => !document.querySelector('nav[aria-label="Section index"] [aria-current]'));
  await page.screenshot({ path: path.join(output, "desktop-top.png") });
  await page.keyboard.press("Tab");
  await desktop.locator("a").first().focus();
  assert.notEqual(await desktop.locator("a").first().evaluate(el => getComputedStyle(el).outlineStyle), "none");
  await page.keyboard.press("Enter");
  await activeIs("work");

  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), "auto");
  assert.equal(await desktop.locator("a").first().evaluate(el => getComputedStyle(el).transitionDuration), "0s");
  await page.goto(`${baseURL}/work/ratioflow`, { waitUntil: "domcontentloaded" });
  const projectIndex = page.getByRole("navigation", { name: "Project index", exact: true });
  assert.equal(await projectIndex.locator('[aria-current]').count(), 0);
  await projectIndex.getByRole("link", { name: "Projects", exact: false }).click();
  await page.waitForURL(`${baseURL}/#work`);
  await activeIs("work");
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ results, keyboard: "passed", scrollTracking: "passed", crossRoute: "passed", reducedMotion: "passed", browserErrors: errors, screenshots: output }, null, 2));
} finally {
  await browser.close();
}

