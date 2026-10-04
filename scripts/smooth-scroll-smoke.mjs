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
const url = process.env.BASE_URL || "http://localhost:3000";
const output = path.join(tmpdir(), "portfolio-scroll-review");
await mkdir(output, { recursive: true });

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.documentElement.classList.contains("lenis"));
  await page.mouse.move(1200, 450);
  await page.mouse.wheel(0, 650);
  const samples = [];
  for (let i = 0; i < 12; i++) {
    await page.waitForTimeout(80);
    samples.push(await page.evaluate(() => scrollY));
  }
  assert(samples[0] > 0 && samples[0] < 650, `Wheel input should ease: ${samples}`);
  assert(samples.every((value, i) => i === 0 || value >= samples[i - 1]), `Scroll should progress without bouncing: ${samples}`);
  await page.waitForFunction(() => Math.abs(scrollY - 650) <= 1);
  console.log("650px wheel input, sampled every 80ms:", samples);
  await page.screenshot({ path: path.join(output, "portfolio-desktop.png") });

  // Native anchors must retain their URL, focus, and sticky-header clearance.
  await page.mouse.wheel(0, 300);
  await page.locator('nav a[href="#education"]').click();
  await page.waitForFunction(() => location.hash === "#education" && document.activeElement?.id === "education" && Math.abs(document.getElementById("education").getBoundingClientRect().top - 32) < 3);
  await page.keyboard.press("PageDown");
  const anchorY = await page.evaluate(() => scrollY);
  await page.waitForFunction(y => scrollY > y, anchorY);
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
  await page.getByRole("button", { name: "Back to top" }).click();
  await page.waitForFunction(() => scrollY === 0);

  // Changing the OS preference should remove inertia immediately and restore it cleanly.
  await page.mouse.wheel(0, 650);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForFunction(() => !document.documentElement.classList.contains("lenis"));
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.mouse.wheel(0, 400);
  await page.waitForFunction(() => scrollY === 400);
  await page.waitForTimeout(250);
  assert.equal(await page.evaluate(() => scrollY), 400);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.waitForFunction(() => document.documentElement.classList.contains("lenis"));

  await page.getByRole("link", { name: "View All", exact: true }).click();
  await page.waitForURL("**/work");
  await page.waitForFunction(() => document.getElementById("all-work") && document.documentElement.classList.contains("lenis"));
  await page.locator('nav a[href="/#work"]').click();
  await page.waitForFunction(() => document.getElementById("education") && document.documentElement.classList.contains("lenis"));
  assert.deepEqual(errors, []);

  const mobile = await browser.newPage({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  await mobile.goto(url, { waitUntil: "domcontentloaded" });
  await mobile.waitForFunction(() => document.documentElement.classList.contains("lenis"));
  const cdp = await mobile.context().newCDPSession(mobile);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 185, y: 650 }] });
  for (const y of [590, 530, 470, 410, 350]) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 185, y }] });
    await mobile.waitForTimeout(30);
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await mobile.waitForFunction(() => scrollY > 100);
  assert.equal(await mobile.evaluate(() => document.documentElement.classList.contains("lenis-smooth")), false);
  assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await mobile.screenshot({ path: path.join(output, "portfolio-mobile.png") });

  const noJS = await browser.newPage({ javaScriptEnabled: false });
  await noJS.goto(url);
  await noJS.locator('nav a[href="#education"]').click();
  await noJS.waitForFunction(() => scrollY > 0);
  console.log("Passed wheel easing, anchors/focus, keyboard, back-to-top, reduced motion, route navigation, native touch, no overflow, and no-JS navigation.");
} finally {
  await browser.close();
}
