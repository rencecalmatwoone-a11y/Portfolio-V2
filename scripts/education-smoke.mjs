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
const output = path.join(tmpdir(), "portfolio-education-review");
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
  const section = page.locator("#education");
  assert.equal(await section.getByRole("heading", { level: 2 }).innerText(), "Education");
  assert.deepEqual(await section.getByRole("heading", { level: 3 }).allTextContents(), [
    "Bachelor of Science in Information Technology",
    "High School · Senior High School",
  ]);
  assert.equal(await section.locator("article").count(), 2);
  assert.deepEqual(await section.locator("article p").allTextContents(), [
    "National College of Science and Technology",
    "Cavite, Philippines",
    "2023 — Present",
    "Alongside my IT studies, I put what I learn into practice through interface design and front-end development projects.",
    "Tagaytay City Science National High School – Integrated Senior High School",
    "Tagaytay, Cavite",
    "2016 — 2022",
  ]);
  assert.equal(await section.evaluate(el => el.previousElementSibling.id), "stack");
  assert.equal(await section.evaluate(el => el.nextElementSibling.id), "certifications");
  assert.equal(await page.locator("main > section").count(), 6);
  assert.equal(await section.locator("button, a, script").count(), 0);
  assert.equal(await section.locator("img").count(), 2);
  for (const entry of await section.locator("article").all()) {
    assert.equal(await entry.locator("img").count(), 1);
  }
  await section.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => [...document.querySelectorAll("#education img")].every(img => img.complete && img.naturalWidth > 0));

  for (const theme of ["light", "dark"]) {
    await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
    for (const width of [320, 375, 639, 640, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      await section.scrollIntoViewIfNeeded();
      const geometry = await section.evaluate(el => {
        const skills = document.querySelector("#stack");
        const entries = [...el.querySelectorAll("article")].map(entry => {
          const academic = entry.firstElementChild.getBoundingClientRect();
          const period = entry.children[1].getBoundingClientRect();
          const description = entry.children[2]?.getBoundingClientRect();
          return {
            stacked: period.top >= academic.bottom && period.left === academic.left,
            columns: period.left > academic.right && Math.abs(period.top - academic.top) < 1,
            descriptionBelow: !description || description.top >= Math.max(period.bottom, academic.bottom),
          };
        });
        return {
          overflow: document.documentElement.scrollWidth > innerWidth,
          clipped: [...el.querySelectorAll("h2, h3, p")].some(node => node.scrollWidth > node.clientWidth),
          aligned: el.getBoundingClientRect().x === skills.getBoundingClientRect().x && el.clientWidth === skills.clientWidth,
          headingFont: getComputedStyle(el.querySelector("h2")).font,
          skillsHeadingFont: getComputedStyle(skills.querySelector("h2")).font,
          degreeSize: parseFloat(getComputedStyle(el.querySelector("h3")).fontSize),
          projectTitleSize: parseFloat(getComputedStyle(document.querySelector("#work h3")).fontSize),
          entries,
        };
      });
      assert.equal(geometry.overflow, false, `Overflow ${width}/${theme}`);
      assert.equal(geometry.clipped, false, `Clipped text ${width}/${theme}`);
      assert.ok(geometry.aligned);
      assert.equal(geometry.headingFont, geometry.skillsHeadingFont);
      assert.ok(geometry.degreeSize <= geometry.projectTitleSize);
      for (const entry of geometry.entries) {
        assert.ok(width < 640 ? entry.stacked : entry.columns, `Layout ${width}/${theme}`);
        assert.ok(entry.descriptionBelow);
      }
      const violations = await page.evaluate(async () => (await window.axe.run("#education", {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
      })).violations.map(({ id, nodes }) => ({ id, targets: nodes.map(node => node.target) })));
      assert.deepEqual(violations, [], `Accessibility ${width}/${theme}`);
      if ([320, 375, 768, 1440].includes(width)) {
        await section.screenshot({ path: path.join(output, `education-${width}-${theme}.png`) });
      }
      results.push({ width, theme, layout: "passed", accessibility: "passed" });
    }
  }

  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.ok(await section.isVisible());
  assert.deepEqual(await section.evaluate(el => [...el.querySelectorAll("*")].filter(node =>
    getComputedStyle(node).animationName !== "none" || getComputedStyle(node).transitionDuration !== "0s",
  ).map(node => node.tagName)), []);

  const staticPage = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 320, height: 812 } });
  await staticPage.goto(baseURL, { waitUntil: "networkidle" });
  for (const node of await staticPage.locator("#education h2, #education h3, #education p").all()) {
    assert.ok(await node.isVisible());
  }
  assert.match(await staticPage.locator("#education").innerText(), /2023 — Present/);
  assert.deepEqual(failures, []);
  console.log(JSON.stringify({ results, reducedMotion: "static", noJavaScript: "visible", screenshots: output }, null, 2));
} finally {
  await browser.close();
}
