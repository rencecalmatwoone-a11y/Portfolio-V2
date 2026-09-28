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
const baseURL = process.env.BASE_URL || "http://localhost:3102";
const output = path.join(tmpdir(), "portfolio-social-review");
await mkdir(output, { recursive: true });
const failures = [];
const handles = ["rencecalmatwoone-a11y", "johnmark-clarence-mendoza-9941322b5", "rencecalmatwo.one@gmail.com", "@Rencedezvous"];
const profileText = [["Hiholop", "Let's GIT it", "0 followers", "2 following"], ["LinkedIn profile"], ["Email"], ["Rence", "Tagaytay, Calabarzon", "April 2018", "95 Following", "176 Followers"]];

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on("pageerror", (error) => failures.push(error.message));
  page.on("response", (response) => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
  for (const theme of ["light", "dark"]) {
    for (const width of [320, 375, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(baseURL, { waitUntil: "networkidle" });
      await page.evaluate((theme) => { document.documentElement.dataset.theme = theme; }, theme);
      const links = page.getByRole("list", { name: "Social and email links" }).getByRole("link");
      for (let index = 0; index < handles.length; index++) {
        const link = links.nth(index);
        await link.hover();
        const card = page.getByRole("tooltip");
        await card.waitFor({ state: "visible" });
        await page.waitForFunction((handle) => document.querySelector('[role="tooltip"]')?.textContent.includes(handle), handles[index]);
        await page.waitForTimeout(250);
        const bounds = await card.boundingBox();
        const anchor = await link.boundingBox();
        assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width, `Card overflow: ${theme}/${width}/${index}`);
        assert.ok(bounds.y >= 0 && bounds.y + bounds.height < anchor.y, "Preview appears above the icon");
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
        const content = await card.innerText();
        for (const expected of profileText[index]) assert.ok(content.includes(expected), `Missing profile detail: ${expected}`);
        assert.ok(!content.includes("UI/UX Designer"), "Do not substitute the portfolio bio for social account data");
        await page.waitForFunction(() => [...document.querySelectorAll('[role="tooltip"] img')].filter((image) => getComputedStyle(image).display !== "none").every((image) => image.complete && image.naturalWidth > 0));
        // Travel through the gap to the card and ensure it remains open.
        await page.mouse.move(anchor.x + anchor.width / 2, bounds.y + bounds.height - 8, { steps: 6 });
        await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height - 8, { steps: 6 });
        await page.waitForTimeout(250);
        assert.ok(await card.isVisible());
        if (index === 0 || index === 3) await page.screenshot({ path: path.join(output, `${theme}-${width}-${index === 0 ? "github" : "x"}.png`) });
        await page.keyboard.press("Escape");
        await card.waitFor({ state: "detached" });
      }
    }
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(baseURL, { waitUntil: "networkidle" });
  const github = page.getByRole("link", { name: "GitHub", exact: true });
  await github.hover();
  const item = await github.locator("..").boundingBox();
  await page.mouse.move(item.x + 4, item.y + 8);
  await page.waitForTimeout(350);
  const first = await page.getByRole("tooltip").boundingBox();
  await page.mouse.move(item.x + item.width - 4, item.y + item.height - 8);
  await page.waitForTimeout(350);
  const second = await page.getByRole("tooltip").boundingBox();
  assert.ok(Math.abs(second.x - first.x) > 5, "Card follows the pointer");
  assert.notEqual(await github.evaluate((el) => getComputedStyle(el).transform), "none", "Icon follows the pointer");
  await page.mouse.move(1000, 900);
  await page.getByRole("tooltip").waitFor({ state: "detached" });
  await github.focus();
  await page.getByRole("tooltip").waitFor({ state: "visible" });
  assert.ok(await github.getAttribute("aria-describedby"));
  await page.keyboard.press("Tab");
  assert.equal(await page.locator(":focus").getAttribute("aria-label"), "LinkedIn");
  await page.waitForFunction(() => document.querySelector('[role="tooltip"]')?.textContent.includes("johnmark-clarence"));
  await page.keyboard.press("Escape");
  await page.getByRole("tooltip").waitFor({ state: "detached" });

  await page.emulateMedia({ reducedMotion: "reduce" });
  await github.hover();
  await page.mouse.move(item.x + 4, item.y + 8);
  await page.waitForTimeout(100);
  assert.equal(await github.evaluate((el) => getComputedStyle(el).transform), "none");
  assert.equal(await page.getByRole("tooltip").evaluate((el) => getComputedStyle(el).transform), "none");
  await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
  const violations = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } })).violations.map(({ id }) => id));
  assert.deepEqual(violations, []);
  await page.setViewportSize({ width: 375, height: 900 });
  await page.getByRole("tooltip").waitFor({ state: "detached" });

  const touch = await browser.newPage({ viewport: { width: 375, height: 900 }, hasTouch: true, isMobile: true });
  await touch.goto(baseURL, { waitUntil: "networkidle" });
  await touch.route("https://github.com/**", (route) => route.fulfill({ body: "<main>GitHub destination</main>", contentType: "text/html" }));
  await touch.getByRole("link", { name: "GitHub", exact: true }).tap();
  await touch.waitForURL("https://github.com/rencecalmatwoone-a11y");
  const staticPage = await browser.newPage({ javaScriptEnabled: false });
  await staticPage.goto(baseURL, { waitUntil: "networkidle" });
  assert.equal(await staticPage.getByRole("list", { name: "Social and email links" }).getByRole("link").count(), 4);
  assert.deepEqual(failures, []);
  console.log(JSON.stringify({ result: "passed", widths: [320, 375, 768, 1440], themes: ["light", "dark"], checks: ["all profile handles", "card placement", "hover persistence", "magnetic icon and card", "keyboard focus and Escape", "reduced motion", "WCAG A/AA", "resize dismissal", "touch navigation (intercepted)"], screenshots: output }, null, 2));
} finally {
  await browser.close();
}
