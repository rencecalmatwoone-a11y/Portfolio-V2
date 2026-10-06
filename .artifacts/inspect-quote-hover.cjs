const { chromium } = require(require('node:path').join(require('node:os').tmpdir(), 'portfolio-v2-browser-tools/node_modules/playwright'));
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  try {
    const width = Number(process.env.VIEWPORT_WIDTH || 1440);
    const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: process.env.REDUCED_MOTION || 'reduce' });
    await page.goto(process.env.BASE_URL || 'http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => { document.documentElement.dataset.theme = 'dark'; });
    const section = page.locator('section[aria-label="A personal quote"]');
    await section.evaluate(el => window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - 120, behavior: 'instant' }));
    const band = section.locator('[data-hover-area]');
    await band.hover({ position: { x: 20, y: 40 } });
    await page.waitForTimeout(1600);
    console.log(JSON.stringify(await section.evaluate(el => {
      const describe = node => {
        const style = getComputedStyle(node), rect = node.getBoundingClientRect();
        return { tag: node.tagName, class: node.className, rect: rect.toJSON(), padding: style.padding, margin: style.margin, background: style.backgroundColor, hover: node.matches(':hover'), before: getComputedStyle(node, '::before').borderTop, after: getComputedStyle(node, '::after').borderTop };
      };
      return { section: describe(el), previous: describe(el.previousElementSibling), band: describe(el.querySelector('[data-hover-area]')), main: describe(el.parentElement), viewport: { width: innerWidth, scrollWidth: document.documentElement.scrollWidth } };
    }), null, 2));
    const screenshot = await page.screenshot({ path: `.artifacts/quote-hover-before-${width}.png` });
    const bounds = await band.boundingBox();
    const sharp = require('sharp');
    await sharp(screenshot).extract({ left: Math.round(bounds.x - 8), top: Math.floor(bounds.y - 24), width: 190, height: 190 }).resize(760, 760, { kernel: 'nearest' }).toFile('.artifacts/quote-hover-before-detail.png');
    const { data, info } = await sharp(screenshot).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const pixel = (x, y) => [...data.subarray((y * info.width + x) * info.channels, (y * info.width + x + 1) * info.channels)];
    console.log('top edge', JSON.stringify(Array.from({ length: 5 }, (_, i) => ({ y: Math.floor(bounds.y) + i, colors: Array.from({ length: 10 }, (_, x) => pixel(Math.round(bounds.x) + x, Math.floor(bounds.y) + i)) }))));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
