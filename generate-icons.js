const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function createIcon(size, text) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#1a202c'; // Same dark blue background as site
    ctx.fillRect(0, 0, size, size);

    // Border
    ctx.strokeStyle = '#f38020'; // Cloudflare orange
    ctx.lineWidth = size * 0.05;
    ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, size - ctx.lineWidth, size - ctx.lineWidth);

    // Text
    ctx.fillStyle = '#f38020';
    ctx.font = `bold ${size * 0.4}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, size / 2, size / 2);

    const buffer = canvas.toBuffer('image/png');
    const filename = path.join(__dirname, 'public', 'icons', `icon-${size}x${size}.png`);
    fs.writeFileSync(filename, buffer);
    console.log(`Created ${filename}`);
}

createIcon(192, 'FA');
createIcon(512, 'FA');
createIcon(144, 'FA');
createIcon(256, 'FA');
