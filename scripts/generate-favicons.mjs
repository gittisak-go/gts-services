import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

// Blue cat SVG (extracted from provided image concept)
const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#4ADE80" rx="64"/>
  <g transform="translate(256,256) scale(2.2)">
    <ellipse cx="0" cy="10" rx="45" ry="55" fill="#3B82F6"/>
    <circle cx="-15" cy="-5" r="12" fill="#FFFFFF"/>
    <circle cx="15" cy="-5" r="12" fill="#FFFFFF"/>
    <circle cx="-15" cy="-5" r="6" fill="#000000"/>
    <circle cx="15" cy="-5" r="6" fill="#000000"/>
    <ellipse cx="0" cy="5" rx="4" ry="6" fill="#000000"/>
    <path d="M -25,-25 L -35,-35 L -25,-30 Z" fill="#3B82F6"/>
    <path d="M 25,-25 L 35,-35 L 25,-30 Z" fill="#3B82F6"/>
    <ellipse cx="-5" cy="50" rx="8" ry="15" fill="#3B82F6"/>
    <path d="M -30,5 L -50,0 M -30,10 L -50,10 M -30,15 L -50,15" stroke="#000000" stroke-width="2"/>
    <path d="M 30,5 L 50,0 M 30,10 L 50,10 M 30,15 L 50,15" stroke="#000000" stroke-width="2"/>
  </g>
</svg>`;

async function generateFavicons() {
  console.log('Generating favicons...');
  
  // Write source SVG
  const svgPath = join(publicDir, 'logo.svg');
  writeFileSync(svgPath, logoSvg);
  console.log('✓ Created logo.svg');

  const sizes = [
    { size: 16, name: 'favicon-16x16.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 48, name: 'favicon-48x48.png' },
    { size: 192, name: 'favicon-192x192.png' },
    { size: 512, name: 'favicon-512x512.png' }
  ];

  for (const { size, name } of sizes) {
    await sharp(Buffer.from(logoSvg))
      .resize(size, size)
      .png()
      .toFile(join(publicDir, name));
    console.log(`✓ Created ${name}`);
  }

  // Generate ICO (using 32x32 as base)
  await sharp(Buffer.from(logoSvg))
    .resize(32, 32)
    .png()
    .toFile(join(publicDir, 'favicon.ico'));
  console.log('✓ Created favicon.ico');

  console.log('\n✅ All favicons generated successfully!');
}

generateFavicons().catch(console.error);
