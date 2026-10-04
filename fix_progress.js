const fs = require('fs');
let code = fs.readFileSync('public/index.html', 'utf-8');

// There are multiple places where img.isPlaceholder is checked inside renderStackedDeckHTML
// We must add id="video-progress-text" to ALL of them to ensure it targets it, or use class and update all.
// Let's replace the id with a class or keep id but make sure it exists on all variants.

code = code.replace(
    `if (img.isPlaceholder) return \`<div class="pdf-preview deck-photo" style="background:#111;"><i class="material-icons" style="font-size:24px; color:var(--primary); animation: spin 1s linear infinite;">sync</i></div>\`;`,
    `if (img.isPlaceholder) return \`<div class="pdf-preview deck-photo" style="background:#111;"><i class="material-icons" style="font-size:24px; color:var(--primary); animation: spin 1s linear infinite;">sync</i><span id="video-progress-text" style="font-size: 9px; margin-top: 4px; color:var(--primary); font-weight:bold;">0%</span></div>\`;`
);

code = code.replace(
    `if (img.isPlaceholder) { media = \`<div class="carousel-pdf" style="background:#111;"><i class="material-icons" style="font-size:48px; color:var(--primary); animation: spin 1s linear infinite;">sync</i><span style="color:var(--primary); font-size:14px; margin-top:12px; text-align:center;">A processar...</span></div>\`; }`,
    `if (img.isPlaceholder) { media = \`<div class="carousel-pdf" style="background:#111;"><i class="material-icons" style="font-size:48px; color:var(--primary); animation: spin 1s linear infinite;">sync</i><span id="video-progress-text" style="color:var(--primary); font-size:14px; margin-top:12px; text-align:center;">A processar: 0%</span></div>\`; }`
);

fs.writeFileSync('public/index.html', code);
console.log('Fixed progress text placeholders');
