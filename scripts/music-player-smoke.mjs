import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(tmpdir(), "portfolio-v2-browser-tools/node_modules/playwright"));
const browser = await chromium.connectOverCDP(process.env.CDP_URL || "http://127.0.0.1:9228");
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const baseURL = process.env.BASE_URL || "http://localhost:3000";
const output = path.join(tmpdir(), "portfolio-ipod-review");
await mkdir(output, { recursive: true });
const errors = [];
const audioRequests = [];

try {
  const page = await context.newPage();
  page.on("pageerror", error => errors.push(error.message));
  page.on("request", request => { if (request.url().includes("/audio/")) audioRequests.push(request.url()); });
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  const player = page.getByRole("dialog", { name: "Music player" });
  const audio = page.locator("audio");
  const wheel = player.getByRole("group", { name: "iPod click wheel" });
  const trigger = () => page.getByRole("button", { name: /^(Open music player|Music player: playing)/ });
  const back = () => player.getByRole("button", { name: "Menu: go back", exact: true }).click();
  const view = () => player.getAttribute("data-view");
  async function mainMenu() {
    for (let count = 0; await view() !== "main"; count++) {
      assert.ok(count < 6, "Menu navigation reaches main");
      await back();
    }
  }
  async function settings() {
    await mainMenu();
    await player.getByRole("button", { name: "Settings", exact: true }).click();
  }
  async function songs() {
    if (await view() === "playing") await back();
    else if (await view() !== "songs") {
      await mainMenu();
      await player.getByRole("button", { name: "Music", exact: true }).click();
      await player.getByRole("button", { name: "All Songs", exact: true }).click();
    }
  }
  async function nowPlaying() {
    await mainMenu();
    await player.getByRole("button", { name: "Now Playing", exact: true }).click();
  }
  assert.equal(await audio.evaluate(el => el.paused), true);
  assert.equal(audioRequests.length, 0, "No audio download before interaction");
  await trigger().click();
  await player.getByRole("status").waitFor();
  await page.screenshot({ path: path.join(output, "boot.png") });
  await page.waitForFunction(() => document.querySelector('[role="dialog"]').dataset.booted === "true");

  for (const theme of ["light", "dark"]) {
    for (const width of [320, 375, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(baseURL, { waitUntil: "domcontentloaded" });
      await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
      await trigger().click();
      await page.waitForFunction(() => document.querySelector('[role="dialog"]').dataset.booted === "true");
      await songs();
      const box = await player.boundingBox();
      assert.ok(box.x >= 0 && box.x + box.width <= width, `${theme}/${width} panel overflow`);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
      assert.equal(await player.getByRole("list", { name: "Music playlist" }).getByRole("button").count(), 4);
      await page.screenshot({ path: path.join(output, `${theme}-${width}-songs.png`) });
      await nowPlaying();
      assert.equal(await player.getByRole("img").isVisible(), true, "Album artwork is visible by default");
      await page.waitForFunction(() => [...document.querySelectorAll('[role="dialog"] img')].every(el => el.complete && el.naturalWidth > 0));
      await page.screenshot({ path: path.join(output, `${theme}-${width}-playing.png`) });
      await trigger().click();
      assert.equal(await trigger().evaluate(el => el === document.activeElement), true);
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await trigger().click();
  await page.waitForFunction(() => document.querySelector('[role="dialog"]').dataset.booted === "true");

  // Highlighting with the wheel changes menu selection without changing audio.
  await songs();
  await player.getByRole("button", { name: "Next menu item" }).click();
  assert.equal(await player.locator('[data-highlighted="true"]').innerText(), "Futura Free");
  assert.ok((await audio.getAttribute("src")).endsWith("nights.mp3"));
  await player.getByRole("button", { name: "Previous menu item" }).click();
  await page.waitForTimeout(230);
  assert.equal(await player.locator('[data-highlighted="true"]').innerText(), "Nights");
  const bounds = await wheel.boundingBox();
  const cx = bounds.x + bounds.width / 2, cy = bounds.y + bounds.height / 2, radius = bounds.width * 0.42;
  // Drag the ring through an arc away from the five buttons.
  await page.mouse.move(cx + Math.cos(-Math.PI / 4) * radius, cy + Math.sin(-Math.PI / 4) * radius);
  await page.mouse.down();
  for (let angle = -0.7; angle <= -0.1; angle += 0.1) await page.mouse.move(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
  await page.mouse.up();
  assert.equal(await player.locator('[data-highlighted="true"]').innerText(), "Japanese Denim");
  assert.equal(await audio.evaluate(el => el.paused), true);
  await wheel.focus();
  await page.keyboard.press("ArrowDown");
  assert.equal(await player.locator('[data-highlighted="true"]').innerText(), "Les");
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => { const el = document.querySelector("audio"); return el.currentSrc.endsWith("les.mp3") && !el.paused && el.currentTime > 0.2; });
  assert.equal(await player.getByRole("img").isVisible(), true);
  const beforeTheme = await audio.evaluate(el => ({ src: el.currentSrc, time: el.currentTime }));
  const themeSwitch = page.getByRole("switch", { name: "Dark mode" });
  for (const theme of ["dark", "light"]) {
    await themeSwitch.click();
    await page.waitForFunction(theme => document.documentElement.dataset.theme === theme && !document.documentElement.dataset.themeTransition, theme);
    assert.equal(await player.isVisible(), true, "Theme switching keeps the player open");
    assert.equal(await view(), "playing");
    assert.equal(await audio.evaluate(el => el.paused), false);
    assert.equal(await audio.evaluate(el => el.currentSrc), beforeTheme.src);
    assert.ok(await audio.evaluate(el => el.currentTime) >= beforeTheme.time);
    assert.equal(await player.getByRole("img").isVisible(), true);
    if (theme === "dark") assert.equal(await player.evaluate(el => getComputedStyle(el).getPropertyValue("--wheel-top").trim()), "#c41e3a");
  }
  await player.getByRole("button", { name: "Pause song" }).click();

  // Artist browsing has canonical grouping and returns through the menu hierarchy.
  await mainMenu();
  await player.getByRole("button", { name: "Music", exact: true }).click();
  await player.getByRole("button", { name: "Artists", exact: true }).click();
  assert.equal(await player.getByRole("list", { name: "Artists menu" }).getByRole("button").count(), 3);
  await player.getByRole("button", { name: "Frank Ocean", exact: true }).click();
  assert.equal(await player.getByRole("list", { name: "Music playlist" }).getByRole("button").count(), 2);
  await back();
  assert.equal(await view(), "artists");

  const tracks = [["Nights", "Frank Ocean", "nights.mp3"], ["Futura Free", "Frank Ocean", "futura-free.mp3"], ["Japanese Denim", "Daniel Caesar", "japanese-denim.mp3"], ["Les", "Childish Gambino", "les.mp3"]];
  const durations = {};
  for (const [title, artist, filename] of tracks) {
    await songs();
    await player.getByRole("button", { name: `Select ${title} by ${artist}`, exact: true }).click();
    await page.waitForFunction(filename => { const el = document.querySelector("audio"); return el.currentSrc.endsWith(filename) && !el.paused && el.currentTime > 0.15 && el.readyState >= 3; }, filename);
    durations[title] = await audio.evaluate(el => el.duration);
    assert.ok(durations[title] > 200);
    await player.getByRole("button", { name: "Pause song" }).click();
    assert.equal(await audio.evaluate(el => el.paused), true);
  }
  await player.getByRole("button", { name: "Next song" }).click();
  await page.waitForFunction(() => { const el = document.querySelector("audio"); return el.currentSrc.endsWith("nights.mp3") && !el.paused && el.currentTime > 0.2; });
  await player.getByRole("slider", { name: "Seek through song" }).fill("30");
  assert.ok(await audio.evaluate(el => el.currentTime >= 30));
  await wheel.hover();
  await page.mouse.wheel(0, 70);
  assert.ok(await audio.evaluate(el => el.currentTime >= 35), "Rotating wheel seeks during playback");
  await player.getByRole("button", { name: "Next song" }).click();
  await page.waitForFunction(() => { const el = document.querySelector("audio"); return el.currentSrc.endsWith("futura-free.mp3") && !el.paused && el.currentTime > 0.2; });
  await player.getByRole("button", { name: "Previous song" }).click();
  await page.waitForFunction(() => { const el = document.querySelector("audio"); return el.currentSrc.endsWith("nights.mp3") && !el.paused && el.currentTime > 0.2; });
  await trigger().click();
  assert.equal(await audio.evaluate(el => el.paused), false, "Closing preserves music");
  await trigger().click();
  await audio.evaluate(el => { el.currentTime = el.duration - 0.15; });
  await page.waitForFunction(() => { const el = document.querySelector("audio"); return el.currentSrc.endsWith("futura-free.mp3") && !el.paused && el.currentTime > 0.2; });

  // Shuffle Songs plays every track in a randomized order without duplicates.
  await mainMenu();
  await player.getByRole("button", { name: "Shuffle Songs", exact: true }).click();
  await page.waitForFunction(() => { const el = document.querySelector("audio"); return !el.paused && el.readyState >= 3; });
  const shuffleOrder = [await audio.evaluate(el => el.currentSrc)];
  for (let count = 0; count < 3; count++) {
    const previous = shuffleOrder.at(-1);
    await player.getByRole("button", { name: "Next song" }).click();
    await page.waitForFunction(previous => { const el = document.querySelector("audio"); return el.currentSrc !== previous && !el.paused && el.currentTime > 0.2; }, previous);
    shuffleOrder.push(await audio.evaluate(el => el.currentSrc));
  }
  assert.equal(new Set(shuffleOrder).size, 4);
  const lastShuffleTrack = shuffleOrder.at(-1);
  await audio.evaluate(el => { el.currentTime = el.duration - 0.15; });
  await page.waitForFunction(src => { const el = document.querySelector("audio"); return el.currentSrc === src && el.ended && el.paused; }, lastShuffleTrack);
  await player.getByRole("button", { name: "Play song", exact: true }).click();
  await page.waitForFunction(() => { const el = document.querySelector("audio"); return !el.paused && el.currentTime > 0.2; });

  await settings();
  assert.equal(await audio.evaluate(el => el.paused), false, "Browsing does not stop music");
  await player.getByRole("button", { name: "Shuffle: On", exact: true }).click();
  await player.getByRole("button", { name: "Repeat: Off", exact: true }).click();
  await nowPlaying();
  const repeatedFile = await audio.evaluate(el => el.currentSrc);
  await audio.evaluate(el => { el.currentTime = el.duration - 0.15; });
  await page.waitForFunction(src => { const el = document.querySelector("audio"); return el.currentSrc === src && !el.paused && el.currentTime < 2; }, repeatedFile);
  await settings();
  await player.getByRole("button", { name: "Repeat: One", exact: true }).click();
  await nowPlaying();
  await songs();
  await player.getByRole("button", { name: "Select Les by Childish Gambino" }).click();
  await page.waitForFunction(() => { const el = document.querySelector("audio"); return el.currentSrc.endsWith("les.mp3") && el.readyState >= 3 && !el.paused && el.currentTime > 0.2; });
  await audio.evaluate(el => { el.currentTime = el.duration - 0.15; });
  await page.waitForFunction(() => { const el = document.querySelector("audio"); return el.currentSrc.endsWith("nights.mp3") && !el.paused && el.currentTime > 0.2; });
  await settings();
  await player.getByRole("button", { name: "Repeat: All", exact: true }).click();
  await player.getByRole("button", { name: "LCD Filter: On", exact: true }).click();
  assert.equal(await player.getAttribute("data-lcd-filter"), "false");
  await player.getByRole("button", { name: "LCD Filter: Off", exact: true }).click();
  await player.getByRole("button", { name: "Backlight: On", exact: true }).click();
  assert.equal(await player.getAttribute("data-backlight"), "false");
  await player.getByRole("button", { name: "Backlight: Off", exact: true }).click();
  await player.getByRole("button", { name: /Volume: / }).click();
  await player.getByRole("slider", { name: "Music volume" }).fill("0.25");
  assert.equal(await audio.evaluate(el => el.volume), 0.25);
  await player.getByRole("button", { name: "Increase volume" }).click();
  assert.equal(await audio.evaluate(el => el.volume), 0.3);
  await player.getByRole("button", { name: "Mute music", exact: true }).first().click();
  assert.equal(await audio.evaluate(el => el.muted), true);
  await player.getByRole("button", { name: "Unmute music", exact: true }).first().click();
  assert.equal(await audio.evaluate(el => el.muted), false);
  await page.screenshot({ path: path.join(output, "volume.png") });
  await settings();
  await page.screenshot({ path: path.join(output, "settings.png") });
  await nowPlaying();
  await player.getByRole("button", { name: "Pause song" }).click();

  await page.route("**/audio/japanese-denim.mp3", route => route.abort());
  await songs();
  await player.getByRole("button", { name: "Select Japanese Denim by Daniel Caesar" }).click();
  await player.getByRole("button", { name: "Retry song" }).waitFor();
  assert.match(await player.getByRole("status").innerText(), /Couldn't play/);
  await page.unroute("**/audio/japanese-denim.mp3");
  await player.getByRole("button", { name: "Retry song" }).click();
  await page.waitForFunction(() => { const el = document.querySelector("audio"); return !el.paused && el.currentTime > 0.2; });
  await player.getByRole("button", { name: "Pause song" }).click();

  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(await player.evaluate(el => getComputedStyle(el).animationName), "none");
  await mainMenu();
  await page.keyboard.press("Escape");
  assert.equal(await player.isVisible(), false);
  assert.equal(await trigger().evaluate(el => el === document.activeElement), true);
  await trigger().click();
  await page.mouse.click(30, 800);
  assert.equal(await player.isVisible(), false);

  const touchContext = await browser.newContext({ viewport: { width: 320, height: 568 }, hasTouch: true, isMobile: true });
  try {
    const touch = await touchContext.newPage();
    await touch.goto(baseURL, { waitUntil: "domcontentloaded" });
    await touch.getByRole("button", { name: "Open music player" }).tap();
    const touchPanel = touch.getByRole("dialog", { name: "Music player" });
    await touch.waitForFunction(() => document.querySelector('[role="dialog"]').dataset.booted === "true");
    const box = await touchPanel.boundingBox();
    assert.ok(box.y >= 0 && box.y + box.height <= 568);
    const touchWheel = await touchPanel.getByRole("group", { name: "iPod click wheel" }).boundingBox();
    const session = await touchContext.newCDPSession(touch);
    const point = angle => ({ x: touchWheel.x + touchWheel.width / 2 + Math.cos(angle) * touchWheel.width * 0.42, y: touchWheel.y + touchWheel.height / 2 + Math.sin(angle) * touchWheel.width * 0.42 });
    await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point(-Math.PI / 4)] });
    for (let angle = -0.7; angle <= -0.1; angle += 0.1) await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [point(angle)] });
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    assert.equal(await touchPanel.locator('[data-highlighted="true"]').innerText(), "Japanese Denim");
    // Let Chrome finish the synthetic touch gesture before starting a separate tap.
    await touch.waitForTimeout(300);
    await touchPanel.getByRole("button", { name: "Previous menu item" }).tap();
    await touchPanel.getByRole("button", { name: "Select Futura Free", exact: true }).tap();
    await touch.waitForFunction(() => { const el = document.querySelector("audio"); return el.currentSrc.endsWith("futura-free.mp3") && !el.paused && el.currentTime > 0.2; });
    await touch.screenshot({ path: path.join(output, "touch-320-short.png") });
    await touchPanel.getByRole("button", { name: "Pause song" }).tap();
    await touch.getByRole("button", { name: "Open music player" }).tap();
    assert.equal(await touchPanel.isVisible(), false);
  } finally { await touchContext.close(); }

  // Use the browser clock to verify the real idle timeout without a 30s wait.
  const idle = await context.newPage();
  await idle.clock.install();
  await idle.goto(baseURL, { waitUntil: "domcontentloaded" });
  await idle.getByRole("button", { name: "Open music player" }).click();
  await idle.clock.runFor(600);
  const idlePlayer = idle.getByRole("dialog", { name: "Music player" });
  assert.equal(await idlePlayer.getAttribute("data-backlight"), "true");
  await idle.clock.fastForward(30_100);
  assert.equal(await idlePlayer.getAttribute("data-backlight"), "false");
  await idlePlayer.getByRole("button", { name: "Next menu item" }).click();
  assert.equal(await idlePlayer.getAttribute("data-backlight"), "true");
  await idle.clock.fastForward(30_100);
  await idle.mouse.click(30, 800);
  assert.equal(await idlePlayer.isVisible(), false);
  await idle.getByRole("button", { name: "Open music player" }).focus();
  await idle.keyboard.press("Enter");
  assert.equal(await idlePlayer.getAttribute("data-backlight"), "true", "Keyboard opening wakes the display");
  await idle.keyboard.press("ArrowDown");
  await idle.keyboard.press("Enter");
  await idle.waitForFunction(() => { const el = document.querySelector("audio"); return !el.paused && el.currentTime > 0.2; });
  assert.equal(await idlePlayer.getAttribute("data-view"), "playing", "Opening focus supports keyboard selection");
  await idle.close();
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ result: "passed", widths: [320, 375, 768, 1440], themes: ["light", "dark"], actualAudioDurations: durations, checks: ["boot", "no autoplay or initial audio download", "menu hierarchy", "independent highlight", "drag wheel", "keyboard select", "artists", "actual MP3 playback", "pause", "previous/next", "wheel seek", "slider seek", "volume/mute", "playback survives close and browsing", "automatic next", "shuffle", "repeat one/all", "backlight", "LCD filter", "network error/retry", "keyboard/Escape/focus", "outside dismissal", "reduced motion", "touch", "no overflow"], screenshots: output }, null, 2));
} finally {
  // Keep the last rendered state available if an interaction assertion fails.
  for (const [index, page] of context.pages().entries()) {
    await page.screenshot({ path: path.join(output, `last-state-${index}.png`) }).catch(() => {});
  }
  await context.close();
  await browser.close();
}
