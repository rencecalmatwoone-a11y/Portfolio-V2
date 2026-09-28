import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(tmpdir(), "portfolio-v2-browser-tools/node_modules/playwright"));
const browser = await chromium.launch({ executablePath: process.env.BROWSER_PATH || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", headless: true });
const baseURL = process.env.BASE_URL || "http://localhost:3193";
const output = path.join(tmpdir(), "portfolio-certifications-review");
await mkdir(output, { recursive: true });
const errors = [];
const results = [];

try {
  const page = await browser.newPage();
  page.on("pageerror", error => errors.push(error.message));
  page.on("response", response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
  const section = page.locator("#certifications");
  const carousel = section.getByRole("group", { name: "Certification collection", exact: true });
  const active = section.locator('[data-position="active"]');
  const next = section.getByRole("button", { name: "Next certification" });
  const previous = section.getByRole("button", { name: "Previous certification" });
  await page.waitForSelector('#certifications [data-enhanced="true"]');
  assert.equal(await section.evaluate(el => el.previousElementSibling.id), "education");
  assert.equal(await section.evaluate(el => el.nextElementSibling.id), "github");
  assert.equal(await section.locator("article").count(), 9);
  assert.equal(await section.getByRole("heading", { level: 3 }).count(), 1);
  assert.equal(await section.locator("[inert]").count(), 8);
  const titles = await section.locator("article h3").allTextContents();
  assert.equal(new Set(titles).size, 9);
  assert.equal(await section.locator("article").filter({ hasText: "In Progress" }).count(), 0);

  for (const theme of ["light", "dark"]) {
    await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
    for (const width of [320, 375, 639, 640, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      await section.scrollIntoViewIfNeeded();
      await carousel.focus();
      await page.keyboard.press("Home");
      for (let index = 0; index < titles.length; index++) {
        if (index) await next.click();
        await page.waitForFunction(title => document.querySelector('#certifications [data-position="active"] h3')?.textContent === title, titles[index]);
        await page.waitForTimeout(400);
        const geometry = await active.evaluate(el => {
          const card = el.querySelector("article").getBoundingClientRect();
          const stage = el.parentElement.getBoundingClientRect();
          return {
            overflow: document.documentElement.scrollWidth > innerWidth,
            clipped: [...el.querySelectorAll("h3, p, a")].some(node => node.scrollWidth > node.clientWidth + 1),
            contained: card.left >= stage.left - 1 && card.right <= stage.right + 1 && card.top >= stage.top - 1 && card.bottom <= stage.bottom + 1,
          };
        });
        assert.deepEqual(geometry, { overflow: false, clipped: false, contained: true }, `${width}/${theme}/${titles[index]}`);
        assert.equal(await section.getByRole("link").count(), titles[index] === "Generative AI Fundamentals" ? 0 : 1);
        if (width === 1440 || index === 0) {
          const violations = await page.evaluate(async () => (await window.axe.run("#certifications", {
            runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
          })).violations.map(({ id, nodes }) => ({ id, targets: nodes.map(node => node.target) })));
          assert.deepEqual(violations, [], `Accessibility ${width}/${theme}/${index}`);
        }
      }
      await next.click();
      assert.equal(await active.locator("h3").textContent(), titles[0]);
      await page.waitForFunction(() => [...document.querySelectorAll('#certifications [data-position="active"] img')].every(img => img.complete && img.naturalWidth > 0));
      if ([320, 375, 768, 1440].includes(width)) {
        await page.waitForTimeout(400);
        await section.screenshot({ path: path.join(output, `certifications-${width}-${theme}.png`) });
      }
      results.push({ width, theme, allSlides: "passed" });
    }
  }

  await previous.click();
  assert.equal(await active.locator("h3").textContent(), titles.at(-1));
  await carousel.focus();
  await page.keyboard.press("Home");
  await page.keyboard.press("ArrowRight");
  assert.equal(await active.locator("h3").textContent(), titles[1]);
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("End");
  assert.equal(await active.locator("h3").textContent(), titles.at(-1));
  await page.keyboard.press("Home");
  await page.keyboard.press("Tab");
  assert.ok(await active.getByRole("link").evaluate(el => el === document.activeElement));
  assert.notEqual(await active.getByRole("link").evaluate(el => getComputedStyle(el).outlineStyle), "none");
  await page.keyboard.press("ArrowRight");
  assert.ok(await carousel.evaluate(el => el === document.activeElement));
  await page.keyboard.press("Tab");
  assert.ok(await active.getByRole("link").evaluate(el => el === document.activeElement));
  await page.keyboard.press("Tab");
  assert.ok(await previous.evaluate(el => el === document.activeElement));
  await page.keyboard.press("Space");
  assert.equal(await active.locator("h3").textContent(), titles[0]);

  const link = active.getByRole("link");
  assert.equal(await link.getAttribute("target"), "_blank");
  assert.equal(await link.getAttribute("rel"), "noopener noreferrer");
  await page.context().route("https://www.coursera.org/**", route => route.fulfill({ status: 200, contentType: "text/html", body: "Credential destination intercepted for navigation test" }));
  await link.focus();
  const popupPromise = page.waitForEvent("popup");
  await page.keyboard.press("Enter");
  const popup = await popupPromise;
  await popup.waitForLoadState();
  assert.match(popup.url(), /VVJ5N064B6XN/);
  await popup.close();

  await page.setViewportSize({ width: 375, height: 900 });
  await active.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  let box = await active.boundingBox();
  await page.mouse.move(box.x + box.width * 0.8, box.y + 30);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.2, box.y + 32, { steps: 8 });
  await page.mouse.up();
  assert.equal(await active.locator("h3").textContent(), titles[1]);

  const cdp = await page.context().newCDPSession(page);
  await page.waitForTimeout(400);
  box = await active.boundingBox();
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: box.x + box.width * 0.8, y: box.y + 30 }] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: box.x + box.width * 0.2, y: box.y + 31 }] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await page.waitForTimeout(100);
  assert.equal(await active.locator("h3").textContent(), titles[2]);

  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.deepEqual(await section.evaluate(el => [...el.querySelectorAll("*")].filter(node =>
    getComputedStyle(node).animationName !== "none" || getComputedStyle(node).transitionDuration !== "0s",
  ).map(node => node.tagName)), []);
  await next.click();
  assert.equal(await active.locator("h3").textContent(), titles[3]);

  const staticPage = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 320, height: 900 } });
  await staticPage.goto(baseURL, { waitUntil: "networkidle" });
  assert.equal(await staticPage.locator("#certifications").getByRole("heading", { level: 3 }).count(), 9);
  assert.equal(await staticPage.locator("#certifications").getByRole("link").count(), 8);
  assert.equal(await staticPage.locator("#certifications").getByRole("button").count(), 0);
  assert.equal(await staticPage.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  for (const img of await staticPage.locator("#certifications img").all()) {
    await img.scrollIntoViewIfNeeded();
    await img.evaluate(img => img.decode());
    assert.equal(await img.getAttribute("loading"), "lazy");
    assert.equal(await img.evaluate(img => getComputedStyle(img).objectFit), "contain");
  }
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ results, keyboard: "passed", mouseDrag: "passed", touchSwipe: "passed", reducedMotion: "passed", noJavaScript: "all credentials visible", screenshots: output }, null, 2));
} finally {
  await browser.close();
}
