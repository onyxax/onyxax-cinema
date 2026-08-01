import fs from 'fs';

const png256 = fs.readFileSync('public/AppIcon256.png');
const png32 = fs.readFileSync('public/AppIcon32.png');

function createIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);     // reserved
  header.writeUInt16LE(1, 2);     // ICO type
  header.writeUInt16LE(images.length, 4); // count

  const dirSize = 16 * images.length;
  const entries = [];
  let offset = 6 + dirSize;

  for (const img of images) {
    const dir = Buffer.alloc(16);
    const size = img.width || 256;
    dir.writeUInt8(size >= 256 ? 0 : size, 0);
    dir.writeUInt8(size >= 256 ? 0 : size, 1);
    dir.writeUInt8(0, 2); // color palette
    dir.writeUInt8(0, 3); // reserved
    dir.writeUInt16LE(1, 4); // color planes
    dir.writeUInt16LE(32, 6); // bits per pixel
    dir.writeUInt32LE(img.data.length, 8); // size
    dir.writeUInt32LE(offset, 12); // offset
    entries.push(dir);
    offset += img.data.length;
  }

  return Buffer.concat([header, ...entries, ...images.map(i => i.data)]);
}

const ico = createIco([
  { data: png256, width: 256 },
  { data: png32, width: 32 }
]);

fs.writeFileSync('public/AppIcon.ico', ico);
console.log('AppIcon.ico generated: ' + ico.length + ' bytes');
