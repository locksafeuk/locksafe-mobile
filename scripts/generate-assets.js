/**
 * LockSafe Mobile App - Asset Generator
 *
 * This script generates all required app icons and splash screens
 * with proper LockSafe branding.
 *
 * Usage:
 *   npm install canvas
 *   node scripts/generate-assets.js
 *
 * Or run the HTML version in a browser:
 *   open scripts/generate-assets.html
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// LockSafe brand colors
const ORANGE = '#f97316';
const ORANGE_DARK = '#c2410c';
const WHITE = '#ffffff';

// Asset configurations
const assets = [
  { file: 'icon.png', size: 1024, type: 'icon' },
  { file: 'adaptive-icon.png', size: 1024, type: 'adaptive-foreground' },
  { file: 'android-icon-foreground.png', size: 1024, type: 'adaptive-foreground' },
  { file: 'android-icon-background.png', size: 1024, type: 'adaptive-background' },
  { file: 'android-icon-monochrome.png', size: 1024, type: 'monochrome' },
  { file: 'favicon.png', size: 48, type: 'icon' },
  { file: 'splash-icon.png', size: 288, type: 'splash-icon' },
];

// Helper to draw rounded rectangle
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// Draw lock icon
function drawLockIcon(ctx, cx, cy, size, color = WHITE, keyholeColor = ORANGE) {
  const scale = size / 100;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  // Lock body (rounded rectangle)
  ctx.fillStyle = color;
  roundRect(ctx, -30, -10, 60, 50, 8);
  ctx.fill();

  // Lock shackle (arc)
  ctx.strokeStyle = color;
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, -10, 20, Math.PI, 0);
  ctx.stroke();

  // Keyhole
  ctx.fillStyle = keyholeColor;
  ctx.beginPath();
  ctx.arc(0, 12, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-5, 18);
  ctx.lineTo(5, 18);
  ctx.lineTo(3, 32);
  ctx.lineTo(-3, 32);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// Draw app icon (square with rounded corners)
function drawAppIcon(ctx, size) {
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, ORANGE);
  gradient.addColorStop(1, ORANGE_DARK);

  // Rounded rectangle background
  const radius = size * 0.22;
  ctx.fillStyle = gradient;
  roundRect(ctx, 0, 0, size, size, radius);
  ctx.fill();

  // Inner glow
  const glowGradient = ctx.createRadialGradient(
    size * 0.3, size * 0.3, 0,
    size * 0.5, size * 0.5, size * 0.6
  );
  glowGradient.addColorStop(0, 'rgba(255,255,255,0.15)');
  glowGradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glowGradient;
  roundRect(ctx, 0, 0, size, size, radius);
  ctx.fill();

  // Lock icon
  drawLockIcon(ctx, size / 2, size * 0.42, size * 0.45);

  // "SAFE" text
  ctx.fillStyle = WHITE;
  ctx.font = `bold ${size * 0.12}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SAFE', size / 2, size * 0.78);

  // Subtle border
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = size * 0.01;
  roundRect(ctx, size * 0.005, size * 0.005, size * 0.99, size * 0.99, radius);
  ctx.stroke();
}

// Draw adaptive icon foreground
function drawAdaptiveForeground(ctx, size) {
  // Lock icon (centered with safe zone padding)
  const iconSize = size * 0.35;
  drawLockIcon(ctx, size / 2, size * 0.42, iconSize);

  // "SAFE" text
  ctx.fillStyle = WHITE;
  ctx.font = `bold ${size * 0.08}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SAFE', size / 2, size * 0.68);
}

// Draw adaptive icon background
function drawAdaptiveBackground(ctx, size) {
  // Solid orange background
  ctx.fillStyle = ORANGE;
  ctx.fillRect(0, 0, size, size);

  // Subtle gradient overlay
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, 'rgba(255,255,255,0.1)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.1)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
}

// Draw monochrome icon (white only)
function drawMonochrome(ctx, size) {
  const scale = size * 0.003;
  ctx.save();
  ctx.translate(size / 2, size * 0.42);
  ctx.scale(scale, scale);

  // Lock body
  ctx.fillStyle = WHITE;
  roundRect(ctx, -30, -10, 60, 50, 8);
  ctx.fill();

  // Lock shackle
  ctx.strokeStyle = WHITE;
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, -10, 20, Math.PI, 0);
  ctx.stroke();

  ctx.restore();

  // "SAFE" text
  ctx.fillStyle = WHITE;
  ctx.font = `bold ${size * 0.08}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SAFE', size / 2, size * 0.68);
}

// Draw splash icon
function drawSplashIcon(ctx, size) {
  drawLockIcon(ctx, size / 2, size * 0.4, size * 0.5);

  ctx.fillStyle = WHITE;
  ctx.font = `bold ${size * 0.15}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SAFE', size / 2, size * 0.78);
}

// Generate an asset
function generateAsset(asset) {
  const canvas = createCanvas(asset.size, asset.size);
  const ctx = canvas.getContext('2d');

  // Clear canvas (transparent)
  ctx.clearRect(0, 0, asset.size, asset.size);

  switch (asset.type) {
    case 'icon':
      drawAppIcon(ctx, asset.size);
      break;
    case 'adaptive-foreground':
      drawAdaptiveForeground(ctx, asset.size);
      break;
    case 'adaptive-background':
      drawAdaptiveBackground(ctx, asset.size);
      break;
    case 'monochrome':
      drawMonochrome(ctx, asset.size);
      break;
    case 'splash-icon':
      drawSplashIcon(ctx, asset.size);
      break;
  }

  return canvas;
}

// Main function
async function main() {
  const assetsDir = path.join(__dirname, '..', 'assets');

  // Ensure assets directory exists
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  console.log('🎨 Generating LockSafe app assets...\n');

  for (const asset of assets) {
    const canvas = generateAsset(asset);
    const buffer = canvas.toBuffer('image/png');
    const filePath = path.join(assetsDir, asset.file);

    fs.writeFileSync(filePath, buffer);
    console.log(`✅ Generated: ${asset.file} (${asset.size}x${asset.size})`);
  }

  console.log('\n🎉 All assets generated successfully!');
  console.log(`📁 Assets saved to: ${assetsDir}`);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateAsset, assets };
