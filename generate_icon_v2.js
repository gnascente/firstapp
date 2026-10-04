const fs = require('fs');
const { createCanvas } = require('canvas');

const canvas = createCanvas(512, 512);
const ctx = canvas.getContext('2d');

// Background
ctx.fillStyle = '#062e6f';
ctx.fillRect(0, 0, 512, 512);

// Draw a timeline motif
ctx.strokeStyle = '#a8c7fa';
ctx.lineWidth = 24;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';

// Draw a curvy timeline line
ctx.beginPath();
ctx.moveTo(80, 432);
ctx.bezierCurveTo(150, 400, 150, 250, 256, 256);
ctx.bezierCurveTo(362, 262, 362, 100, 432, 80);
ctx.stroke();

// Draw nodes
ctx.fillStyle = '#ffb4ab'; // A contrasting color for dots
const drawDot = (x, y) => {
    ctx.beginPath();
    ctx.arc(x, y, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#062e6f';
    ctx.stroke();
};

drawDot(80, 432);
drawDot(256, 256);
drawDot(432, 80);

const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('public/icon.png', buffer);
fs.writeFileSync('public/icons/icon-512x512.png', buffer);

const resize = (size, path) => {
    const c = createCanvas(size, size);
    const cx = c.getContext('2d');
    cx.drawImage(canvas, 0, 0, size, size);
    fs.writeFileSync(path, c.toBuffer('image/png'));
};

resize(256, 'public/icons/icon-256x256.png');
resize(192, 'public/icons/icon-192x192.png');
resize(144, 'public/icons/icon-144x144.png');

console.log('Icons generated successfully.');
