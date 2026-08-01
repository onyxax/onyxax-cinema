import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svg = fs.readFileSync('public/app-icon.svg', 'utf8');
const sizes = [32, 64, 128, 256, 512, 1024];

async function generate() {
  for (const size of sizes) {
    await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toFile(`public/AppIcon${size}.png`);
    console.log(`Generated AppIcon${size}.png`);
  }

  fs.copyFileSync('public/AppIcon256.png', 'public/AppIcon1024(13).ico');
  console.log('Copied AppIcon256.png -> AppIcon1024(13).ico (placeholder)');

  console.log('Done!');
}

generate().catch(console.error);
