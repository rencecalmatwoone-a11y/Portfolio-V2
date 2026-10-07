import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(tmpdir(), "portfolio-v2-browser-tools/node_modules/playwright"));
const browser = await chromium.connectOverCDP(process.env.CDP_URL || "http://127.0.0.1:9228");
try {
  for (const fixedVolume of [false, true]) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    try {
      await context.addInitScript(fixed => {
        if (!fixed) return;
        Object.defineProperty(HTMLMediaElement.prototype, "volume", { configurable: true, get: () => 1, set: () => {} });
        const createGain = AudioContext.prototype.createGain;
        AudioContext.prototype.createGain = function () {
          const gain = createGain.call(this);
          const input = this.createAnalyser(), output = this.createAnalyser();
          const connect = AudioNode.prototype.connect;
          const createSource = this.createMediaElementSource.bind(this);
          this.createMediaElementSource = element => {
            const source = createSource(element);
            connect.call(source, input);
            return source;
          };
          connect.call(gain, output);
          window.volumeProbe = { gain, input, output, context: this };
          return gain;
        };
      }, fixedVolume);
      const page = await context.newPage();
      await page.goto(process.env.BASE_URL || "http://localhost:3000", { waitUntil: "domcontentloaded" });
      await page.getByRole("button", { name: "Open music player" }).tap();
      const panel = page.getByRole("dialog", { name: "Music player" });
      await page.waitForFunction(() => document.querySelector('[role="dialog"]').dataset.booted === "true");
      await panel.getByRole("button", { name: "Select Nights by Frank Ocean" }).tap();
      await page.waitForFunction(() => document.querySelector("audio").currentTime > 1);
      const back = () => panel.getByRole("button", { name: "Menu: go back" }).tap();
      while (await panel.getAttribute("data-view") !== "main") await back();
      await panel.getByRole("button", { name: "Settings", exact: true }).tap();
      await panel.getByRole("button", { name: /^Volume:/ }).tap();
      const slider = panel.getByRole("slider", { name: "Music volume" });
      async function checkLevel(level) {
        await page.waitForTimeout(200);
        if (!fixedVolume) {
          assert.ok(Math.abs(await page.locator("audio").evaluate(el => el.muted ? 0 : el.volume) - level) < 0.001);
        } else {
          const signal = await page.evaluate(() => {
            const { input, output, context } = window.volumeProbe;
            const rms = analyser => {
              const data = new Float32Array(analyser.fftSize);
              analyser.getFloatTimeDomainData(data);
              return Math.sqrt(data.reduce((sum, value) => sum + value * value, 0) / data.length);
            };
            return { input: rms(input), output: rms(output), state: context.state };
          });
          assert.equal(signal.state, "running");
          assert.ok(signal.input > 0.001, "Real MP3 samples reach the gain stage");
          assert.ok(Math.abs(signal.output / signal.input - level) < 0.04, `Actual signal attenuation: ${JSON.stringify(signal)}, expected ${level}`);
        }
      }
      await slider.fill("0.25");
      await checkLevel(0.25);
      await panel.getByRole("button", { name: "Increase volume" }).tap();
      assert.equal(Number(await slider.inputValue()), 0.3);
      await checkLevel(0.3);
      await panel.getByRole("button", { name: "Decrease volume" }).tap();
      await checkLevel(0.25);
      await panel.getByRole("button", { name: "Mute music", exact: true }).last().tap();
      await checkLevel(0);
      await panel.getByRole("button", { name: "Unmute music", exact: true }).last().tap();
      await checkLevel(0.25);
      await slider.fill("0");
      await checkLevel(0);
      await panel.getByRole("button", { name: "Unmute music", exact: true }).last().tap();
      await checkLevel(0.65);
      const wheel = panel.getByRole("group", { name: "iPod click wheel" });
      const rect = await wheel.boundingBox();
      const point = a => ({ x: rect.x + rect.width / 2 + Math.cos(a) * rect.width * 0.4, y: rect.y + rect.height / 2 + Math.sin(a) * rect.height * 0.4 });
      const session = await context.newCDPSession(page);
      await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point(-0.8)] });
      for (let i = 1; i <= 10; i++) await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [point(-0.8 + i * 0.06)] });
      await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await page.waitForTimeout(300);
      assert.ok(Number(await slider.inputValue()) > 0.73 && Number(await slider.inputValue()) < 0.77);
      await checkLevel(Number(await slider.inputValue()));
      const savedLevel = Number(await slider.inputValue());
      await panel.getByRole("button", { name: "Pause song", exact: true }).tap();
      await panel.getByRole("button", { name: "Next song", exact: true }).tap();
      await page.waitForFunction(() => document.querySelector("audio").currentSrc.endsWith("futura-free.mp3") && document.querySelector("audio").currentTime > 1);
      await checkLevel(savedLevel);
      console.log(`Passed ${fixedVolume ? "simulated fixed native volume with measured Web Audio output" : "native volume"}: slider, wheel drag, step controls, mute, zero-volume restore`);
    } finally { await context.close(); }
  }
} finally { await browser.close(); }
