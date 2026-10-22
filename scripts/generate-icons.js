import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function createPng(width, height, getPixelRgba) {
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c >>> 0;
  }

  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function createChunk(type, data) {
    const typeBuf = Buffer.from(type, 'ascii');
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length, 0);

    const crcBuf = Buffer.alloc(4);
    const toCrc = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(toCrc), 0);

    return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
  }

  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdrChunk = createChunk('IHDR', ihdrData);

  const rowBytes = 1 + width * 4;
  const rawData = Buffer.alloc(rowBytes * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixelRgba(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

// 24x24 pixel grid matching the user's sleek silhouette cat
const CAT_GRID_24 = [
  '........................',
  '....##..................',
  '....##..................',
  '....##..................',
  '....##......##....##....',
  '....##.....###...####...',
  '....##.....##########...',
  '....###...###########...',
  '....###...##WW##WW###...',
  '....###...##WW##WW###...',
  '....#################...',
  '....#################...',
  '....#################...',
  '....#################...',
  '....#################...',
  '.....###############....',
  '.....###############....',
  '....###.###...###.###...',
  '....###.###...###.###...',
  '....##..###...###..##...',
  '....##..###...###..##...',
  '........................',
  '........................',
  '........................'
];

const COLOR_MAP = {
  '.': [254, 243, 199, 255], // warm amber-100 bg
  '#': [24, 24, 27, 255],     // sleek black silhouette
  'W': [255, 255, 255, 255],  // white vertical slit eyes
};

function getCatPixel(x, y, size) {
  const margin = Math.floor(size * 0.12);
  const innerSize = size - margin * 2;
  const gridX = Math.floor(((x - margin) / innerSize) * 24);
  const gridY = Math.floor(((y - margin) / innerSize) * 24);

  if (gridX >= 0 && gridX < 24 && gridY >= 0 && gridY < 24) {
    const char = CAT_GRID_24[gridY][gridX];
    return COLOR_MAP[char] || [254, 243, 199, 255];
  }
  return [254, 243, 199, 255];
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const sizes = [
  { file: 'pwa-192x192.png', size: 192 },
  { file: 'pwa-512x512.png', size: 512 },
  { file: 'pwa-maskable-512x512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 }
];

for (const { file, size } of sizes) {
  const pngBuf = createPng(size, size, (x, y, w, h) => getCatPixel(x, y, size));
  fs.writeFileSync(path.join(publicDir, file), pngBuf);
  console.log(`Generated ${file} (${size}x${size})`);
}

// Generate icon.svg
const svgRows = [];
for (let y = 0; y < 24; y++) {
  for (let x = 0; x < 24; x++) {
    const char = CAT_GRID_24[y][x];
    const [r, g, b, a] = COLOR_MAP[char];
    svgRows.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="rgba(${r},${g},${b},${a / 255})" />`);
  }
}
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="96" height="96" shape-rendering="crispEdges">
  <rect width="24" height="24" fill="#fef3c7" />
  ${svgRows.join('\n  ')}
</svg>`;
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);
console.log('Generated icon.svg matching new sleek silhouette cat');
