const fs = require('fs');
const { createCanvas } = require('canvas');

const canvas = createCanvas(512, 512);
const ctx = canvas.getContext('2d');

ctx.fillStyle = '#a8c7fa';
ctx.fillRect(0, 0, 512, 512);

ctx.fillStyle = '#062e6f';
ctx.font = 'bold 200px Roboto';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('TL', 256, 256);

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

console.log('Icons generated.');
