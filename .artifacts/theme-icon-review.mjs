import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(path.join(tmpdir(), "portfolio-v2-browser-tools/node_modules/playwright"));
const browser = await chromium.launch({
  executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: true,
});

try {
  for (const width of [1440, 375]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.addInitScript(() => {
      if (!localStorage.getItem("portfolio-theme")) localStorage.setItem("portfolio-theme", "light");
    });
    await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
    const toggle = page.getByRole("switch", { name: "Dark mode", exact: true });
    const nav = page.getByRole("navigation", { name: "Section index", exact: true });
    assert.equal(await toggle.innerText(), "");
    assert.equal(await toggle.locator("span").count(), 1);
    assert.match(await toggle.locator("svg").getAttribute("class"), /lucide-moon/);
    assert.equal(await toggle.getAttribute("title"), "Switch to dark mode");
    await nav.screenshot({ path: `.artifacts/theme-icon-${width}-light.png` });
    await toggle.click();
    await page.waitForFunction(() => document.documentElement.dataset.theme === "dark" && !document.documentElement.dataset.themeTransition);
    assert.equal(await toggle.getAttribute("aria-checked"), "true");
    assert.match(await toggle.locator("svg").getAttribute("class"), /lucide-sun/);
    assert.equal(await toggle.getAttribute("title"), "Switch to light mode");
    await nav.screenshot({ path: `.artifacts/theme-icon-${width}-dark.png` });
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(await toggle.getAttribute("aria-checked"), "true");
    await toggle.focus();
    await page.keyboard.press("Space");
    await page.waitForFunction(() => document.documentElement.dataset.theme === "light" && !document.documentElement.dataset.themeTransition);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await toggle.click();
    await page.waitForFunction(() => document.documentElement.dataset.theme === "dark");
    assert.equal(await page.evaluate(() => Boolean(document.documentElement.dataset.themeTransition)), false);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    assert.deepEqual(errors, []);
    console.log(`Passed ${width}px: icon-only appearance, both theme clicks, keyboard, persistence, reduced motion, no overflow or browser errors.`);
    await context.close();
  }
} finally {
  await browser.close();
}
