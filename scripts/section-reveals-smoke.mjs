import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(tmpdir(), "portfolio-v2-browser-tools/node_modules/playwright"));
const browser = await chromium.launch({
  executablePath: process.env.BROWSER_PATH || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: true,
});
const url = process.env.BASE_URL || "http://localhost:3112";
try {
  for (const width of [375, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(url, { waitUntil: "networkidle" });
    const veil = page.locator("main + div[aria-hidden='true']");
    const overlay = await veil.evaluate(el => {
      const style = getComputedStyle(el);
      return { position: style.position, bottom: el.getBoundingClientRect().bottom,
        pointerEvents: style.pointerEvents, blur: style.backdropFilter, mask: style.maskImage };
    });
    assert.equal(overlay.position, "fixed");
    assert.equal(overlay.bottom, 900);
    assert.equal(overlay.pointerEvents, "none");
    assert.equal(overlay.blur, "blur(1.5px)");
    assert.notEqual(overlay.mask, "none");
    await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForFunction(() => getComputedStyle(document.querySelector("main + div[aria-hidden='true']")).opacity === "0.45");
    await page.waitForFunction(() => getComputedStyle(document.querySelector("main + div[aria-hidden='true']")).backdropFilter === "blur(0.5px)");
    assert.equal(await veil.evaluate(el => getComputedStyle(el).backdropFilter), "blur(0.5px)");
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForFunction(() => getComputedStyle(document.querySelector("main + div[aria-hidden='true']")).opacity === "1");
    for (const id of ["work", "stack", "education", "certifications", "github"]) {
      await page.evaluate(id => window.scrollTo(0, id === "work" ? document.body.scrollHeight : 0), id);
      await page.waitForTimeout(100);
      await page.locator(`#${id}`).evaluate(el => el.scrollIntoView({ block: "start", behavior: "instant" }));
      await page.waitForFunction(id => document.getElementById(id).getAnimations().some(a => a.effect.getKeyframes().some(k => k.filter === "blur(0.5px)")), id);
      await page.waitForTimeout(1400);
      assert.equal(await page.locator(`#${id}`).evaluate(el => getComputedStyle(el).filter), "none");
      assert.equal(await page.locator(`#${id}`).evaluate(el => getComputedStyle(el).opacity), "1");
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    assert.equal(await veil.evaluate(el => getComputedStyle(el).display), "none");
    await page.locator("#education").evaluate(el => el.scrollIntoView());
    await page.waitForTimeout(100);
    assert.equal(await page.locator("#education").evaluate(el => el.getAnimations().length), 0);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    assert.deepEqual(errors, []);
    await page.close();
  }
  const page = await browser.newPage({ javaScriptEnabled: false });
  await page.goto(url);
  for (const section of await page.locator("main > section").all()) {
    assert.equal(await section.evaluate(el => getComputedStyle(el).opacity), "1");
    assert.equal(await section.evaluate(el => getComputedStyle(el).filter), "none");
  }
  console.log("Section reveals passed: desktop/mobile entry and re-entry, settled styles, reduced motion, no overflow, no JavaScript.");
} finally {
  await browser.close();
}
