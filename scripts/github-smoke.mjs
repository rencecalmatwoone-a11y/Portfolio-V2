import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(tmpdir(), "portfolio-v2-browser-tools/node_modules/playwright"));
const browser = await chromium.launch({ executablePath: process.env.BROWSER_PATH || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", headless: true });
const baseURL = process.env.BASE_URL || "http://localhost:3196";
const endpoint = `${baseURL}/api/github`;
const output = path.join(tmpdir(), "portfolio-github-review");
await mkdir(output, { recursive: true });

try {
  const page = await browser.newPage({ hasTouch: true });
  await page.clock.install();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  const response = await page.request.get(endpoint);
  assert.equal(response.status(), 200);
  const payload = await response.json();
  await page.goto(baseURL, { waitUntil: "networkidle" });
  const section = page.locator("#github");
  const days = section.locator("button[data-level]");
  await days.first().waitFor();
  assert.equal(await days.count(), payload.contributions.length);
  const total = payload.contributions.reduce((sum, day) => sum + day.count, 0);
  assert.ok((await section.innerText()).includes(`${total.toLocaleString("en")} contributions`));
  assert.equal(await section.getByRole("link").getAttribute("href"), "https://github.com/rencecalmatwoone-a11y");
  await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
  for (const theme of ["light", "dark"]) {
    await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
    for (const width of [320, 375, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await section.scrollIntoViewIfNeeded();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Overflow ${theme}/${width}`);
      assert.equal(await section.evaluate(el => [...el.querySelectorAll("p, h2, a")].some(node => node.scrollWidth > node.clientWidth)), false);
      const violations = await page.evaluate(async () => (await window.axe.run("#github", { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } })).violations.map(x => ({ id: x.id, targets: x.nodes.map(n => n.target) })));
      assert.deepEqual(violations, [], `${theme}/${width}`);
      if ([320, 1440].includes(width)) await section.screenshot({ path: path.join(output, `${theme}-${width}.png`) });
    }
  }
  await page.setViewportSize({ width: 375, height: 812 });
  await days.last().focus();
  await page.keyboard.press("ArrowLeft");
  assert.equal(await days.nth(payload.contributions.length - 8).evaluate(el => el === document.activeElement), true);
  await page.keyboard.press("Home");
  assert.equal(await days.first().evaluate(el => el === document.activeElement), true);
  await page.keyboard.press("End");
  assert.equal(await days.last().evaluate(el => el === document.activeElement), true);
  await days.last().tap();
  assert.ok((await section.innerText()).includes(await days.last().getAttribute("aria-label")));
  assert.equal(await section.locator('button[data-level][tabindex="0"]').count(), 1);
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(await section.evaluate(el => [...el.querySelectorAll("*")].some(node => getComputedStyle(node).animationName !== "none")), false);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator('nav a[href="#github"]').first().click();
  await page.waitForFunction(() => document.querySelector('nav a[href="#github"]')?.getAttribute("aria-current") === "location");

  // A failed background refresh keeps the real calendar visible.
  await page.route(endpoint, route => route.fulfill({ status: 503, body: "Unavailable" }));
  await page.clock.fastForward(300_000);
  await section.getByText(/Could not refresh\. Showing the last available activity/).waitFor();
  assert.equal(await days.count(), payload.contributions.length);

  // A first-load failure keeps the saved real calendar visible; retry recovers.
  const failure = await browser.newPage();
  await failure.route(endpoint, route => route.fulfill({ json: { contributions: [{ date: "2026-02-31", count: 5, level: 2 }] } }));
  await failure.goto(baseURL, { waitUntil: "networkidle" });
  await failure.getByText(/Could not refresh\. Showing the last available activity/).waitFor();
  assert.equal(await failure.locator("#github button[data-level]").count(), 366);
  await failure.unroute(endpoint);
  await failure.route(endpoint, route => route.fulfill({ json: payload }));
  await failure.getByRole("button", { name: "Try again" }).click();
  await failure.locator("#github button[data-level]").first().waitFor();
  const staticPage = await browser.newPage({ javaScriptEnabled: false });
  await staticPage.goto(baseURL, { waitUntil: "networkidle" });
  assert.ok(await staticPage.locator("#github").getByRole("link").isVisible());
  assert.ok(await staticPage.locator("#github noscript p").isVisible());
  assert.equal(await staticPage.locator("#github button[data-level]").count(), 366);
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ liveDays: payload.contributions.length, liveTotal: total, themesAndWidths: 12, keyboard: "passed", refreshFailure: "preserved data", invalidDataAndRetry: "passed", accessibility: "passed", noJavaScript: "saved calendar and profile link", screenshots: output }, null, 2));
} finally {
  await browser.close();
}
