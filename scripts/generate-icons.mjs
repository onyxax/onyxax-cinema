import sharp from 'sharp';
import fs from 'fs';

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

  console.log('Done!');
}

generate().catch(console.error);
