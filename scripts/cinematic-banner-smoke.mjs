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
const baseUrl = process.env.BASE_URL || "http://localhost:3100";
const output = path.join(tmpdir(), "portfolio-v2-cinematic-banner");
await mkdir(output, { recursive: true });

async function findScene(page) {
  const scene = page.locator("section[aria-label='A quiet drive'] > div");
  await scene.evaluate((element) => {
    window.scrollTo({ top: window.scrollY + element.getBoundingClientRect().top - 120, behavior: "instant" });
  });
  await scene.locator("img").evaluateAll(async (images) => {
    await Promise.all(images.filter((image) => getComputedStyle(image).visibility === "visible").map((image) => image.decode()));
  });
  return scene;
}

async function assertTheme(page, scene, theme) {
  await page.waitForFunction((expected) => (
    (document.documentElement.dataset.theme || "light") === expected
    && !document.documentElement.dataset.themeTransition
  ), theme);
  const light = scene.locator("[data-car-scene='light']");
  const dark = scene.locator("[data-car-scene='dark']");
  assert.equal(await light.isVisible(), theme === "light", `Orange scene visibility in ${theme} mode`);
  assert.equal(await dark.isVisible(), theme === "dark", `White car visibility in ${theme} mode`);
  const photo = (theme === "light" ? light : dark).locator("img").first();
  const image = await photo.evaluate((element) => ({
    src: decodeURIComponent(element.currentSrc || element.src),
    loaded: element.complete && element.naturalWidth > 0,
    alt: element.alt,
    fit: getComputedStyle(element).objectFit,
  }));
  assert.equal(image.loaded, true, `${theme} image loaded`);
  assert.ok(image.alt.length > 0);
  assert.equal(image.fit, "cover");
  assert.ok(image.src.includes(theme === "light" ? "Bmw orange.png" : "White Supercar in a Blossom Meadow.png"), `${theme} uses the requested car image`);
}

async function clickTheme(page, scene, theme) {
  const toggle = page.getByRole("switch", { name: "Dark mode" });
  await toggle.click();
  await assertTheme(page, scene, theme);
  assert.equal(await toggle.getAttribute("aria-checked"), String(theme === "dark"));
  assert.equal(await page.evaluate(() => localStorage.getItem("portfolio-theme")), theme);
}

async function assertPetals(scene, width, reducedMotion) {
  const overlay = scene.locator("[data-petals]");
  assert.equal(await overlay.isVisible(), reducedMotion !== "reduce", "Petals hidden with reduced motion");
  const state = await scene.evaluate((element) => {
    const overlay = element.querySelector("[data-petals]");
    const sceneBounds = element.getBoundingClientRect();
    const bounds = overlay.getBoundingClientRect();
    const petals = [...overlay.querySelectorAll("[data-petal]")];
    return {
      hiddenFromAssistiveTech: overlay.getAttribute("aria-hidden"),
      pointerEvents: getComputedStyle(overlay).pointerEvents,
      overflow: getComputedStyle(element).overflow,
      aligned: Math.abs(bounds.left - sceneBounds.left) < 1
        && Math.abs(bounds.top - sceneBounds.top) < 1
        && Math.abs(bounds.width - sceneBounds.width) < 1
        && Math.abs(bounds.height - sceneBounds.height) < 1,
      count: petals.length,
      animations: petals.map((petal) => getComputedStyle(petal).animationName),
      descendantAnimations: [...overlay.querySelectorAll("*")].map((petal) => getComputedStyle(petal).animationName),
      documentWidth: document.documentElement.scrollWidth,
    };
  });
  assert.equal(state.hiddenFromAssistiveTech, "true");
  assert.equal(state.pointerEvents, "none");
  assert.equal(state.overflow, "hidden", "Petals clipped to photo");
  assert.ok(state.count > 22 && state.count <= 80, "Denser decorative petal set");
  assert.ok(state.documentWidth <= width, `Petals do not cause overflow at ${width}px`);
  if (reducedMotion === "reduce") {
    assert.ok(state.descendantAnimations.every((name) => name === "none"), "All petal movement disabled with reduced motion");
  } else {
    assert.equal(state.aligned, true, "Petal overlay stays inside photo bounds");
    assert.ok(state.animations.some((name) => name !== "none"), "Falling petals animate");
    const fall = await scene.locator("[data-petal]").first().evaluate(async (petal) => {
      const animations = petal.getAnimations();
      await Promise.all(animations.map((animation) => animation.ready));
      const animation = animations[0];
      if (!animation) return null;
      animation.pause();
      const duration = Number(animation.effect.getTiming().duration);
      const delay = Number(animation.effect.getTiming().delay);
      animation.currentTime = delay + duration * 0.2;
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const start = petal.getBoundingClientRect().top;
      animation.currentTime = delay + duration * 0.6;
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const end = petal.getBoundingClientRect().top;
      animation.play();
      return { start, end };
    });
    assert.ok(fall && fall.end > fall.start + 10, "Petals visibly fall down the photo");
  }
}

async function assertCornerBlossoms(scene, width, reducedMotion) {
  const corners = await scene.locator("[data-corner-blossoms]").evaluateAll((elements) => elements.map((element) => {
    const image = element.querySelector("img");
    const style = getComputedStyle(element);
    return {
      side: element.dataset.cornerBlossoms,
      hiddenFromAssistiveTech: element.getAttribute("aria-hidden"),
      pointerEvents: style.pointerEvents,
      mask: style.maskImage,
      origin: style.transformOrigin,
      animation: style.animationName,
      overflow: getComputedStyle(element.parentElement).overflow,
      imageAlt: image.alt,
      imageLoaded: image.complete && image.naturalWidth > 0,
      documentWidth: document.documentElement.scrollWidth,
    };
  }));
  assert.deepEqual(corners.map((corner) => corner.side), ["left", "right"], "Both corner blossom layers are present");
  for (const corner of corners) {
    assert.equal(corner.hiddenFromAssistiveTech, "true");
    assert.equal(corner.pointerEvents, "none");
    assert.equal(corner.imageAlt, "");
    assert.equal(corner.imageLoaded, true);
    assert.equal(corner.overflow, "hidden", "Corner blossoms remain clipped inside their captured scene");
    assert.ok(corner.documentWidth <= width, `Corner blossoms do not cause overflow at ${width}px`);
    assert.match(corner.mask, /radial-gradient/);
    assert.match(corner.mask, corner.side === "left" ? /at (?:0%|0px) 105%/ : /at 100% 108%/, "Blossom mask stays in the lower corner");
    assert.equal(corner.animation === "none", reducedMotion === "reduce", "Corner motion respects reduced motion");
  }
  if (reducedMotion !== "reduce") {
    const transforms = await scene.locator("[data-corner-blossoms]").evaluateAll(async (elements) => Promise.all(elements.map(async (element) => {
      const [animation] = element.getAnimations();
      if (!animation) return null;
      await animation.ready;
      const originalTime = animation.currentTime;
      const { duration, delay } = animation.effect.getTiming();
      animation.pause();
      animation.currentTime = Number(delay) + Number(duration) * 2.15;
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const start = getComputedStyle(element).transform;
      animation.currentTime = Number(delay) + Number(duration) * 2.6;
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const end = getComputedStyle(element).transform;
      animation.currentTime = originalTime;
      animation.play();
      return { start, end };
    })));
    assert.ok(transforms.every((transform) => transform && transform.start !== transform.end), `Both corner blossom layers visibly sway: ${JSON.stringify(transforms)}`);
  }
}

async function trackAnimations(scene) {
  return scene.evaluateHandle(async (element) => {
    const animations = element.getAnimations({ subtree: true });
    await Promise.all(animations.map((animation) => animation.ready));
    return animations.map((animation) => ({ animation, time: Number(animation.currentTime) }));
  });
}

async function assertAnimationContinuity(page, tracked) {
  const continuous = await page.evaluate((entries) => entries.length > 0 && entries.every(({ animation, time }) => (
    animation.playState === "running"
    && Number(animation.currentTime) > time
    && animation.effect.target.getAnimations().includes(animation)
  )), tracked);
  assert.equal(continuous, true, "Both scenes keep their original animation timelines through theme switches");
}

async function assertBlockThemeWipe(page, scene, theme) {
  const tracked = await trackAnimations(scene);
  const clip = await scene.boundingBox();
  const outgoingCapture = await page.evaluateHandle(() => {
    const layers = [];
    const original = document.startViewTransition;
    document.startViewTransition = function (update) {
      document.startViewTransition = original;
      layers.push(...[...document.querySelectorAll("[data-car-scene]")].map((layer) => ({
        theme: layer.dataset.carScene,
        visibility: getComputedStyle(layer).visibility,
      })));
      return original.call(document, update);
    };
    return layers;
  });
  await page.getByRole("switch", { name: "Dark mode" }).click();
  await page.waitForFunction((incomingTheme) => ["root", `car-scene-${incomingTheme}`].every((name) => (
    document.getAnimations().some((animation) => animation.effect?.pseudoElement === `::view-transition-new(${name})` && animation.playState === "running")
  )), theme);
  const capturedLayers = await page.evaluate((layers) => layers, outgoingCapture);
  assert.equal(capturedLayers.find((layer) => layer.theme === theme).visibility, "hidden", "Incoming car stays hidden before the outgoing capture");
  assert.equal(capturedLayers.find((layer) => layer.theme !== theme).visibility, "visible", "Outgoing car remains visible before the capture");
  const startTimes = await page.evaluate((incomingTheme) => ["root", `car-scene-${incomingTheme}`].map((name) => (
    document.getAnimations().find((animation) => animation.effect?.pseudoElement === `::view-transition-new(${name})`).startTime
  )), theme);
  assert.equal(typeof startTimes[0], "number");
  assert.equal(startTimes[0], startTimes[1], "Page and car reveals start on the same animation clock");
  // Hold both reveals in place so changing screenshots prove the rendered scenes
  // remain live, independently of the block edge advancing over a frozen image.
  const wipes = await page.evaluateHandle(async (incomingTheme) => {
    const names = ["root", `car-scene-${incomingTheme}`];
    const animations = names.map((name) => document.getAnimations().find((animation) => (
      animation.effect?.pseudoElement === `::view-transition-new(${name})` && animation.playState === "running"
    )));
    animations.forEach((animation) => animation.pause());
    await Promise.all(animations.map((animation) => animation.ready));
    animations.forEach((animation) => { animation.currentTime = 0; });
    return animations;
  }, theme);
  assert.equal(await scene.evaluate((element) => getComputedStyle(element).viewTransitionName), "none",
    "Banner wrapper leaves each car scene independently live");
  const layers = await scene.evaluate((element) => [...element.querySelectorAll("[data-car-scene]")].map((layer) => ({
    name: getComputedStyle(layer).viewTransitionName,
    oldDisplay: getComputedStyle(document.documentElement, `::view-transition-old(car-scene-${layer.dataset.carScene})`).display,
  })));
  assert.deepEqual(layers.map((layer) => layer.name), ["car-scene-light", "car-scene-dark"]);
  assert.ok(layers.every((layer) => layer.oldDisplay === "none"), "Frozen old car captures are hidden");
  const frames = await page.evaluate((animations) => animations.map((animation) => ({
    frames: animation.effect.getKeyframes().map((frame) => frame.clipPath),
    duration: animation.effect.getTiming().duration,
  })), wipes);
  assert.ok(frames[0].frames.length > 10 && frames[0].frames.every((frame) => frame.startsWith("polygon(")), "Original stepped polygon wipe preserved");
  assert.equal(frames[0].duration, frames[1].duration, "Page and car reveals use the same duration");
  assert.equal(frames[0].frames.length, frames[1].frames.length);
  for (let index = 0; index < frames[0].frames.length; index++) {
    const viewportPoints = frames[0].frames[index].match(/-?\d+(?:\.\d+)?/g).map(Number);
    const localPoints = frames[1].frames[index].match(/-?\d+(?:\.\d+)?/g).map(Number);
    assert.equal(viewportPoints.length, localPoints.length);
    assert.ok(viewportPoints.every((point, coordinate) => Math.abs(point - localPoints[coordinate] - (coordinate % 2 === 0 ? clip.x : clip.y)) < 0.01),
      "Car reveal follows the viewport block edge at its local position");
  }
  let outgoing;
  for (const phase of [0, 0.5]) {
    await page.evaluate(({ animations, progress }) => {
      animations.forEach((animation) => { animation.currentTime = Number(animation.effect.getTiming().duration) * progress; });
    }, { animations: wipes, progress: phase });
    await page.waitForTimeout(80);
    const before = await page.screenshot({ clip });
    await page.waitForTimeout(240);
    const after = await page.screenshot({ clip });
    assert.ok(!before.equals(after), `Rendered car scene keeps moving toward ${theme} at fixed wipe phase ${phase}`);
    if (phase === 0) outgoing = before;
    else assert.ok(!outgoing.equals(before), `Block wipe reveals the ${theme} car scene`);
  }
  await assertAnimationContinuity(page, tracked);
  await page.evaluate((animations) => animations.forEach((animation) => animation.finish()), wipes);
  await assertTheme(page, scene, theme);
  assert.equal(await page.evaluate(() => Boolean(document.documentElement.dataset.themeScenesLive || document.documentElement.dataset.themeWipeReady)), false,
    "Live scene handoff attributes are cleaned up");
  assert.equal(await page.evaluate(() => document.getAnimations().filter((animation) => (
    ["::view-transition-new(root)", "::view-transition-new(car-scene-light)", "::view-transition-new(car-scene-dark)"].includes(animation.effect?.pseudoElement)
  )).length), 0, "Finished wipe effects cannot interfere with the next toggle");
  assert.ok(await scene.locator("[data-car-scene]").evaluateAll((elements) => elements.every((element) => getComputedStyle(element).viewTransitionName === "none")),
    "Temporary live capture names are cleaned up");
  await wipes.dispose();
  await outgoingCapture.dispose();
  await tracked.dispose();
}

try {
  for (const width of [375, 768, 1440]) {
    for (const reducedMotion of ["no-preference", "reduce"]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion });
      const page = await context.newPage();
      await page.goto(baseUrl, { waitUntil: "networkidle" });
      const scene = await findScene(page);
      await assertTheme(page, scene, "light");
      const state = await scene.evaluate((element) => {
        const light = element.querySelector("[data-car-scene='light']");
        const [base, mid, foreground] = light.querySelectorAll("img");
        const darkPhoto = element.querySelector("[data-car-scene='dark'] img");
        const [dim, glow] = light.querySelector("span").querySelectorAll("span");
        const section = element.parentElement;
        const sceneBounds = element.getBoundingClientRect();
        const sectionBounds = section.getBoundingClientRect();
        return {
          height: sceneBounds.height,
          left: sceneBounds.left,
          right: sceneBounds.right,
          styleLoaded: getComputedStyle(document.documentElement).getPropertyValue("--content-width").trim(),
          imagesLoaded: [base, mid, foreground, darkPhoto].every((image) => image.complete && image.naturalWidth > 0),
          darkEager: darkPhoto.loading === "eager",
          basePosition: getComputedStyle(base).objectPosition,
          grassMask: getComputedStyle(mid.parentElement).maskImage,
          wind: getComputedStyle(mid.parentElement).animationName,
          dim: getComputedStyle(dim).animationName,
          glow: getComputedStyle(glow).animationName,
          guidelineAligned: Math.abs(Number.parseFloat(getComputedStyle(section, "::after").top)
            - (sceneBounds.bottom - sectionBounds.top)) < 1,
          cornerBlend: [...element.querySelectorAll("[data-car-scene]")].map((layer) => getComputedStyle(layer, "::after").backgroundImage),
          sunsetRays: getComputedStyle(light.lastElementChild).backgroundImage,
          rayMask: getComputedStyle(light.lastElementChild).maskImage,
          rayAnimation: getComputedStyle(light.lastElementChild).animationName,
          heroFirst: document.querySelector("main > section:first-child")?.getAttribute("aria-labelledby") === "hero-heading",
          quoteLast: section.parentElement === document.querySelector("main > section:last-child"),
          betweenQuoteAndDots: section.previousElementSibling?.querySelector("blockquote") !== null
            && section.nextElementSibling?.getAttribute("data-slot") === "dot-grid-pattern",
        };
      });
      assert.equal(state.styleLoaded, "46rem");
      assert.ok(state.left >= 0 && state.right <= width, `Banner outside viewport at ${width}px`);
      assert.equal(state.imagesLoaded, true, "Both themes' images decode before first toggle");
      assert.equal(state.darkEager, true);
      assert.equal(state.basePosition, "50% 50%");
      assert.match(state.grassMask, /radial-gradient/);
      assert.equal(state.height >= (width <= 600 ? 155 : 200), true);
      assert.equal(state.height <= (width <= 600 ? 190 : 260), true);
      assert.equal(state.wind === "none", reducedMotion === "reduce");
      assert.equal(state.dim === "none", reducedMotion === "reduce");
      assert.equal(state.glow === "none", reducedMotion === "reduce");
      assert.equal(state.guidelineAligned, true);
      assert.ok(state.cornerBlend.every((blend) => /radial-gradient/.test(blend)), "Both live scenes preserve their corner blend");
      assert.match(state.sunsetRays, /conic-gradient/);
      assert.match(state.rayMask, /radial-gradient/);
      assert.equal(state.rayAnimation === "none", reducedMotion === "reduce" || width <= 600);
      assert.equal(state.heroFirst, true);
      assert.equal(state.quoteLast, true);
      assert.equal(state.betweenQuoteAndDots, true);

      const tracked = reducedMotion === "no-preference" ? await trackAnimations(scene) : null;
      await scene.screenshot({ path: path.join(output, `${width}-${reducedMotion}-light.png`) });
      await clickTheme(page, scene, "dark");
      await assertPetals(scene, width, reducedMotion);
      await assertCornerBlossoms(scene, width, reducedMotion);
      await scene.screenshot({ path: path.join(output, `${width}-${reducedMotion}-dark.png`) });
      await clickTheme(page, scene, "light");
      await clickTheme(page, scene, "dark");
      await clickTheme(page, scene, "light");
      if (tracked) {
        await assertAnimationContinuity(page, tracked);
        await tracked.dispose();
      }

      if (width === 1440 && reducedMotion === "no-preference") {
        await assertBlockThemeWipe(page, scene, "dark");
        await assertBlockThemeWipe(page, scene, "light");
        const brightness = await scene.locator("[data-car-scene='light']").evaluate(async (element) => {
          const [dim, glow] = element.querySelector("span").querySelectorAll("span");
          const animations = [...dim.getAnimations(), ...glow.getAnimations()];
          await Promise.all(animations.map((animation) => animation.ready));
          animations.forEach((animation) => { animation.currentTime = 0; animation.pause(); });
          await new Promise((resolve) => requestAnimationFrame(resolve));
          const bright = { dim: Number(getComputedStyle(dim).opacity), glow: Number(getComputedStyle(glow).opacity) };
          animations.forEach((animation) => { animation.currentTime = 1700; });
          await new Promise((resolve) => requestAnimationFrame(resolve));
          const dark = { dim: Number(getComputedStyle(dim).opacity), glow: Number(getComputedStyle(glow).opacity) };
          return { bright, dark };
        });
        assert.ok(brightness.dark.dim > brightness.bright.dim + 0.5);
        assert.ok(brightness.bright.glow > brightness.dark.glow + 0.4);
      }

      if (width === 375 && reducedMotion === "reduce") {
        await page.evaluate(() => localStorage.setItem("portfolio-theme", "dark"));
        await page.reload({ waitUntil: "networkidle" });
        const reloadedScene = await findScene(page);
        await assertTheme(page, reloadedScene, "dark");
        assert.equal(await page.getByRole("switch", { name: "Dark mode" }).getAttribute("aria-checked"), "true");
        await clickTheme(page, reloadedScene, "light");
      }
      await context.close();
    }
  }

  // Inject an initial root theme into the HTML to verify CSS chooses the scene even without JS.
  const noJs = await browser.newContext({ viewport: { width: 375, height: 900 }, reducedMotion: "reduce", javaScriptEnabled: false });
  await noJs.route("**/*", async (route) => {
    if (route.request().resourceType() !== "document") return route.continue();
    const response = await route.fetch();
    await route.fulfill({ response, body: (await response.text()).replace(/<html(?=\s|>)/, '<html data-theme="dark"') });
  });
  const noJsPage = await noJs.newPage();
  await noJsPage.goto(baseUrl, { waitUntil: "networkidle" });
  const noJsScene = await findScene(noJsPage);
  await assertTheme(noJsPage, noJsScene, "dark");
  await assertPetals(noJsScene, 375, "reduce");
  await assertCornerBlossoms(noJsScene, 375, "reduce");
  await noJsScene.screenshot({ path: path.join(output, "375-dark-no-js.png") });
  await noJs.close();
  console.log(`Banner smoke passed: preserved block theme wipe, visible motion at held wipe phases, continuous animation timelines, animated corner blossoms, repeated theme toggles, stored dark reload, no-JS root theme, responsive layout and reduced motion; screenshots: ${output}`);
} finally {
  await browser.close();
}
