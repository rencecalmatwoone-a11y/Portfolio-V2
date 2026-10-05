const sharp = require('sharp');

async function main() {
  const source = 'public/images/hero/Super Happy Pixel Dungeon.gif';
  console.log(JSON.stringify(await sharp(source, { animated: true }).metadata(), null, 2));
  await sharp(source).png().toFile('.artifacts/super-happy-pixel-dungeon-preview.png');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
