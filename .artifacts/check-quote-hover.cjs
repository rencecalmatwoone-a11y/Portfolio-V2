const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require(path.join(require('node:os').tmpdir(), 'portfolio-v2-browser-tools/node_modules/playwright'));
const sharp = require('sharp');

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  const failures = [];
  let checks = 0;
  try {
    for (const reducedMotion of ['reduce', 'no-preference']) {
      for (const width of [320, 375, 768, 1440]) {
        const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion });
        page.on('pageerror', error => failures.push(error.message));
        await page.goto(process.env.BASE_URL || 'http://localhost:3000', { waitUntil: 'domcontentloaded' });
        await page.evaluate(() => document.fonts.ready);
        const section = page.locator('section[aria-label="A personal quote"]');
        const band = section.locator('[data-hover-area]');
        // The shared section rule must not reintroduce padding if its stylesheet loads last.
        await page.addStyleTag({ content: '.page-section { padding-block: var(--space-8) var(--space-12); }' });
        const placeBand = async () => {
          await band.evaluate(el => window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - 180, behavior: 'instant' }));
          await page.waitForTimeout(1500);
          await band.evaluate(el => window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - 180, behavior: 'instant' }));
        };
        await placeBand();
        assert.equal(await section.evaluate(el => getComputedStyle(el).paddingBlock), '0px', `No section padding at ${width}`);
        const sectionBox = await section.boundingBox();
        const bandBox = await band.boundingBox();
        assert.ok(Math.abs(bandBox.y - sectionBox.y) < 1, `Highlight starts at section boundary at ${width}`);
        const mainBox = await page.locator('main').boundingBox();
        assert.ok(Math.abs(bandBox.x - mainBox.x) < 1 && Math.abs(bandBox.width - mainBox.width) < 1, `Band spans both dotted guides at ${width}`);
        for (const theme of ['light', 'dark']) {
          await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme);
          await page.mouse.move(0, 0);
          await page.waitForTimeout(250);
          assert.equal(await band.evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)', `Hover resets in ${theme} at ${width}`);
          const current = await band.boundingBox();
          await page.mouse.move(current.x + current.width - 12, current.y + 3);
          await page.waitForTimeout(250);
          const expected = theme === 'dark' ? 13 : 250;
          assert.equal(await band.evaluate(el => getComputedStyle(el).backgroundColor), `rgb(${expected}, ${expected}, ${expected})`, `Highlight in ${theme} at ${width}`);
          assert.equal(await section.getByRole('button', { name: 'Reveal quote', exact: true }).isVisible(), true, 'Hover preserves reveal button');
          const screenshot = await page.screenshot({ path: `.artifacts/quote-hover-${theme}-${width}-${reducedMotion}.png` });
          const box = await band.boundingBox();
          const { data, info } = await sharp(screenshot).removeAlpha().raw().toBuffer({ resolveWithObject: true });
          const pixel = (x, y) => [...data.subarray((y * info.width + x) * info.channels, (y * info.width + x + 1) * info.channels)];
          const x = Math.floor(box.x + box.width - 12);
          assert.deepEqual(pixel(x, Math.ceil(box.y) + 3), [expected, expected, expected], 'Highlight reaches top inside boundary');
          assert.deepEqual(pixel(x, Math.floor(box.y + box.height) - 3), [expected, expected, expected], 'Highlight reaches bottom inside boundary');
          assert.deepEqual(pixel(Math.floor(box.x + box.width) + 2, Math.ceil(box.y) + 12), theme === 'dark' ? [0, 0, 0] : [255, 255, 255], 'Fill stays inside side guide');
          checks++;
        }
        await page.mouse.move(0, 0);
        const button = section.getByRole('button', { name: 'Reveal quote', exact: true });
        await button.focus();
        await page.keyboard.press('Enter');
        const quote = section.locator('blockquote');
        await quote.waitFor({ state: 'visible' });
        assert.equal(await quote.evaluate(el => document.activeElement === el), true, 'Keyboard reveal transfers focus to quote');
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width, `No horizontal overflow at ${width}`);
        await placeBand();
        const revealedBox = await band.boundingBox();
        await page.mouse.move(revealedBox.x + 12, revealedBox.y + 3);
        await page.waitForTimeout(250);
        assert.equal(await band.evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(13, 13, 13)', 'Hover works after reveal');
        await page.close();
      }
    }
    const page = await browser.newPage({ viewport: { width: 375, height: 900 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
    await page.goto(process.env.BASE_URL || 'http://localhost:3000', { waitUntil: 'domcontentloaded' });
    const band = page.locator('section[aria-label="A personal quote"] [data-hover-area]');
    await band.scrollIntoViewIfNeeded();
    await band.tap({ position: { x: 12, y: 12 } });
    assert.equal(await band.evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)', 'Touch does not leave sticky hover');
    await page.getByRole('button', { name: 'Reveal quote', exact: true }).tap();
    await page.locator('section[aria-label="A personal quote"] blockquote').waitFor({ state: 'visible' });
    assert.deepEqual(failures, [], 'No browser page errors');
    console.log(JSON.stringify({ passed: true, hoverChecks: checks, widths: [320, 375, 768, 1440], themes: ['light', 'dark'], motion: ['reduce', 'no-preference'], keyboard: true, touch: true, cssLoadOrder: true }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
