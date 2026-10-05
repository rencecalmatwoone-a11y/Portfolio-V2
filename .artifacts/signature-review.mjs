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
  const page = await browser.newPage({ viewport: { width: 1000, height: 650 } });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  const signature = page.locator("button[data-signature-state]");
  await signature.hover();
  await signature.evaluate((el) => {
    const stage = el.cloneNode(true);
    stage.style.cssText = "display:block;position:static;width:699px;height:531px;min-width:0";
    stage.querySelector("span").remove();
    stage.querySelector("svg").style.cssText = "position:static;width:699px;height:531px;opacity:1;transform:none;filter:none";
    document.body.replaceChildren(stage);
    document.body.style.cssText = "margin:0;background:white;display:grid;place-items:center;height:650px";
  });
  await signature.evaluate((el) => {
    const animation = el.querySelector("mask polyline").getAnimations()[0];
    animation.pause();
    animation.currentTime = 0;
  });
  for (const time of [0, 140, 280, 420, 560, 700, 840, 980, 1120, 1260, 1399]) {
    await signature.evaluate((el, time) => {
      el.querySelector("mask polyline").getAnimations()[0].currentTime = time;
    }, time);
    await page.screenshot({ path: `.artifacts/signature-before-${time}.png` });
  }
  await page.setContent('<body style="margin:0;background:white;display:grid;place-items:center;height:100vh"><svg width="699" height="531" viewBox="231 9 233 177"><image href="http://localhost:3000/images/hero/rence-signature.png" width="818" height="198"/></svg></body>');
  await page.waitForTimeout(500);
  await page.screenshot({ path: ".artifacts/signature-source.png" });
  console.log("Saved source and baseline writing frames.");
} finally {
  await browser.close();
}
