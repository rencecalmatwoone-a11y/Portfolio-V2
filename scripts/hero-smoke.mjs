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
const baseURL = process.env.BASE_URL || "http://localhost:3100";
const output = path.join(tmpdir(), "portfolio-v2-hero-review");
await mkdir(output, { recursive: true });
const failures = [];
const results = [];

try {
  for (const theme of ["light", "dark"]) {
    const context = await browser.newContext({ colorScheme: theme, reducedMotion: "reduce" });
    const page = await context.newPage();
    page.on("pageerror", (error) => failures.push(error.message));
    page.on("response", (response) => {
      if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`);
    });

    for (const width of [320, 375, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: width < 600 ? 900 : 1000 });
      await page.goto(baseURL, { waitUntil: "networkidle" });
      // Light is the default even when the operating system prefers dark mode.
      assert.equal(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), "rgb(255, 255, 255)");
      await page.evaluate((theme) => { document.documentElement.dataset.theme = theme; }, theme);
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator("h1").count(), 1);
      assert.match(await page.locator("h1").innerText(), /John Mark/);
      const hero = page.locator("section[aria-labelledby='hero-heading']");
      for (const role of ["UI/UX Designer", "Front-End Developer"]) {
        assert.ok((await hero.innerText()).includes(role));
      }
      assert.ok(!(await hero.innerText()).includes("Project Manager"));
      const geometry = await hero.evaluate((el) => {
        const heading = el.querySelector("h1");
        const image = el.querySelector("img");
        return {
          viewport: innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          contentWidth: el.firstElementChild.getBoundingClientRect().width,
          headingLeft: heading.getBoundingClientRect().left,
          bodyLeft: el.querySelector("p").getBoundingClientRect().left,
          fontSize: parseFloat(getComputedStyle(heading).fontSize),
          font: getComputedStyle(heading).fontFamily,
          animation: getComputedStyle(heading).animationName,
          imageLoaded: image.complete && image.naturalWidth > 0,
          background: getComputedStyle(document.body).backgroundColor,
          height: el.getBoundingClientRect().height,
        };
      });
      assert.equal(geometry.scrollWidth, width, `Overflow: ${width}/${theme}`);
      assert.ok(geometry.contentWidth <= 736);
      assert.equal(geometry.headingLeft, geometry.bodyLeft);
      assert.ok(geometry.fontSize <= 52);
      assert.match(geometry.font, /Geist/i);
      assert.equal(geometry.animation, "none");
      assert.ok(geometry.imageLoaded);
      assert.equal(geometry.background, theme === "dark" ? "rgb(0, 0, 0)" : "rgb(255, 255, 255)");
      await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
      const audit = await page.evaluate(async () => {
        const result = await window.axe.run(document, { runOnly: {type:"tag",values:["wcag2a","wcag2aa","wcag21aa"]} });
        return result.violations.map(({id,nodes})=>({id,targets:nodes.map(n=>n.target)}));
      });
      assert.deepEqual(audit, [], `Accessibility: ${width}/${theme}`);
      await page.screenshot({ path: path.join(output, `hero-${width}-${theme}.png`), fullPage: true });
      results.push({ width, theme, ...geometry });
    }

    const links = page.locator("main a");
    const expected = [
      "https://johnmark-clarence-mendoza.vercel.app/#contact",
      "https://github.com/rencecalmatwoone-a11y",
      "https://www.linkedin.com/in/johnmark-clarence-mendoza-9941322b5/",
      "mailto:rencecalmatwo.one@gmail.com",
      "https://x.com/rencedezvous",
    ];
    assert.deepEqual(await links.evaluateAll(els=>els.map(el=>el.getAttribute("href"))), expected);
    for (const href of expected) {
      await page.keyboard.press("Tab");
      assert.equal(await page.locator(":focus").getAttribute("href"), href);
      assert.equal(await page.locator(":focus").evaluate(el=>getComputedStyle(el).outlineStyle), "solid");
    }
    // Intercept the destination to verify keyboard activation without depending on an external service.
    await page.route("https://johnmark-clarence-mendoza.vercel.app/**", route=>route.fulfill({body:"<main id='contact'>Contact destination</main>",contentType:"text/html"}));
    await links.first().focus();
    await page.keyboard.press("Enter");
    await page.waitForURL("**/#contact");
    await context.close();
  }

  const staticContext = await browser.newContext({ javaScriptEnabled: false, viewport:{width:375,height:900} });
  const staticPage = await staticContext.newPage();
  await staticPage.goto(baseURL, {waitUntil:"networkidle"});
  assert.ok(await staticPage.locator("h1").isVisible());
  assert.equal(await staticPage.locator("main a").count(), 5);
  await staticContext.close();

  const motionPage = await browser.newPage({ reducedMotion:"no-preference" });
  await motionPage.goto(baseURL, {waitUntil:"networkidle"});
  const motion = await motionPage.locator("h1").evaluate(el=>({name:getComputedStyle(el).animationName,duration:getComputedStyle(el).animationDuration}));
  assert.notEqual(motion.name, "none");
  assert.equal(motion.duration, "0.42s");
  await motionPage.locator("main a").first().hover();
  await motionPage.waitForTimeout(250);
  assert.notEqual(await motionPage.locator("main a span[aria-hidden]").first().evaluate(el=>getComputedStyle(el).transform), "none");
  await motionPage.close();

  const touchContext = await browser.newContext({viewport:{width:375,height:812},hasTouch:true,isMobile:true,reducedMotion:"reduce"});
  const touchPage = await touchContext.newPage();
  await touchPage.goto(baseURL,{waitUntil:"networkidle"});
  await touchPage.route("https://johnmark-clarence-mendoza.vercel.app/**",route=>route.fulfill({body:"<main id='contact'>Contact destination</main>",contentType:"text/html"}));
  await touchPage.getByRole("link",{name:"Let’s talk"}).tap();
  await touchPage.waitForURL("**/#contact");
  await touchContext.close();

  assert.deepEqual(failures, []);
  console.log(JSON.stringify({results, keyboard:"passed",contact:"keyboard and touch passed (destination intercepted)",accessibility:"WCAG A/AA checks passed",noJavaScript:"passed",motion:"passed",screenshots:output}, null, 2));
} finally {
  await browser.close();
}
