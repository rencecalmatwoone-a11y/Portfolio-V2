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
const baseURL = process.env.BASE_URL || "http://localhost:3104";
const output = path.join(tmpdir(), "portfolio-tech-stack-review");
await mkdir(output, { recursive: true });
const failures = [];
const results = [];

try {
  const page = await browser.newPage();
  page.on("pageerror", error => failures.push(error.message));
  page.on("response", response => {
    if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`);
  });
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
  const section = page.locator("#stack");
  assert.equal(await section.count(), 1);
  assert.equal(await section.getByRole("heading", { level: 2 }).innerText(), "Tech Stack");
  assert.deepEqual(await section.locator("button").allTextContents(), ["All", "Front-End", "Design", "Tools"]);
  assert.equal(await section.locator("li").count(), 13);
  assert.equal(await section.locator("li img").count(), 13);
  assert.equal(await section.evaluate(el => el.previousElementSibling.id), "work");
  assert.equal(await page.locator("main > section").count(), 6);

  for (const theme of ["light", "dark"]) {
    await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
    for (const width of [320, 375, 639, 640, 768, 1023, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.mouse.move(0, 0);
      await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      const geometry = await section.evaluate(el => {
        const chips = [...el.querySelectorAll("li")].map(h => h.getBoundingClientRect().toJSON());
        const work = document.querySelector("#work");
        return {
          chips,
          overflow: document.documentElement.scrollWidth > innerWidth,
          aligned: el.getBoundingClientRect().x === work.getBoundingClientRect().x && el.clientWidth === work.clientWidth,
          headingFont: getComputedStyle(el.querySelector("h2")).font,
          workHeadingFont: getComputedStyle(work.querySelector("h2")).font,
          font: getComputedStyle(el.querySelector("li")).fontFamily,
          bodyFont: getComputedStyle(document.body).fontFamily,
          clipped: [...el.querySelectorAll("li")].some(li => li.scrollWidth > li.clientWidth),
        };
      });
      assert.equal(geometry.overflow, false, `Overflow ${width}/${theme}`);
      assert.equal(geometry.clipped, false);
      assert.ok(geometry.aligned);
      assert.equal(geometry.headingFont, geometry.workHeadingFont);
      assert.equal(geometry.font, geometry.bodyFont);
      const [first, second] = geometry.chips;
      assert.equal(first.y, second.y);
      assert.ok(first.right < second.x);
      assert.ok(geometry.chips.at(-1).y > first.y, "Chips wrap into rows");
      for (const [category, count] of [["Front-End", 7], ["Design", 3], ["Tools", 3], ["All", 13]]) {
        const filter = section.getByRole("button", { name: category, exact: true });
        await filter.click();
        await page.waitForFunction(({ category, count }) =>
          document.querySelectorAll("#stack li").length === count &&
          document.querySelector('#stack button[aria-pressed="true"]').textContent === category,
        { category, count });
        assert.equal(await section.locator('button[aria-pressed="true"]').count(), 1);
        assert.match(await section.getByRole("status").textContent(), new RegExp(`${count} skills and tools`));
      }
      await page.waitForFunction(() => [...document.querySelectorAll("#stack img")].every(img => img.complete && img.naturalWidth > 0));
      const violations = await page.evaluate(async () => (await window.axe.run("#stack", {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
      })).violations.map(({ id, nodes }) => ({ id, targets: nodes.map(n => n.target) })));
      assert.deepEqual(violations, [], `Accessibility ${width}/${theme}`);
      if ([320, 375, 768, 1440].includes(width)) {
        await section.screenshot({ path: path.join(output, `skills-${width}-${theme}.png`) });
      }
      results.push({ width, theme, wrapping: "passed", filters: "passed" });
    }
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  const all = section.getByRole("button", { name: "All", exact: true });
  await all.focus();
  await page.keyboard.press("Tab");
  assert.equal(await page.locator(":focus").innerText(), "Front-End");
  assert.equal(await page.locator(":focus").evaluate(el => getComputedStyle(el).outlineStyle), "solid");
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => document.querySelectorAll("#stack li").length === 7);
  await page.keyboard.press("Tab");
  await page.keyboard.press("Space");
  await page.waitForFunction(() => document.querySelectorAll("#stack li").length === 3);
  assert.deepEqual(await section.locator("li").allTextContents(), ["Figma", "Google Stitch", "WordPress"]);
  assert.notEqual(await section.locator("ul").evaluate(el => getComputedStyle(el).animationName), "none");
  await section.locator("ul").evaluate(el => Promise.all(el.getAnimations().map(animation => animation.finished)));
  assert.equal(await section.locator("ul").evaluate(el => getComputedStyle(el).opacity), "1");
  const item = section.locator("li").first();
  await item.hover();
  await page.waitForTimeout(250);
  assert.equal(await item.evaluate(el => getComputedStyle(el).transform), "matrix(1, 0, 0, 1, 0, -1)");
  await all.hover();
  await page.waitForTimeout(250);
  assert.equal(await all.evaluate(el => getComputedStyle(el).transform), "matrix(1, 0, 0, 1, 0, -1)");
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(await section.locator("ul").evaluate(el => getComputedStyle(el).animationName), "none");
  assert.equal(await all.evaluate(el => getComputedStyle(el).transform), "none");
  assert.equal(await item.evaluate(el => getComputedStyle(el).transform), "none");
  assert.equal(await item.evaluate(el => getComputedStyle(el).transitionDuration), "0s");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await section.locator("button").evaluateAll(buttons => {
    for (let i = 0; i < 12; i++) buttons[i % buttons.length].click();
    buttons[0].click();
  });
  await page.waitForFunction(() => document.querySelectorAll("#stack li").length === 13);
  assert.equal(await all.getAttribute("aria-pressed"), "true");

  const staticPage = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 320, height: 812 } });
  await staticPage.goto(baseURL, { waitUntil: "networkidle" });
  for (const item of await staticPage.locator("#stack li").all()) assert.ok(await item.isVisible());
  assert.equal(await staticPage.locator("#stack li").count(), 13);
  const touch = await browser.newPage({ hasTouch: true, isMobile: true, viewport: { width: 375, height: 812 } });
  await touch.goto(baseURL, { waitUntil: "networkidle" });
  await touch.getByRole("button", { name: "Tools", exact: true }).tap();
  await touch.waitForFunction(() => document.querySelectorAll("#stack li").length === 3);
  assert.deepEqual(await touch.locator("#stack li").allTextContents(), ["Git", "GitHub", "Vercel"]);
  assert.deepEqual(failures, []);
  console.log(JSON.stringify({ results, keyboard: "passed", reducedMotion: "passed", touch: "passed", noJavaScript: "all skills visible", typography: "matches Selected Work and body", accessibility: "section WCAG A/AA passed", screenshots: output }, null, 2));
} finally {
  await browser.close();
}
