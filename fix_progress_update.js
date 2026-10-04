const fs = require('fs');
let code = fs.readFileSync('public/index.html', 'utf-8');

// The onProgress callback updates ID video-progress-text.
// If there are multiple placeholders with the same ID, getElementById only gets the first.
// Let's change querySelectorAll to update all elements with id "video-progress-text".

code = code.replace(
`        await processMultipleMedia(files, (pct) => {
            const progressText = document.getElementById('video-progress-text');
            if(progressText) progressText.innerText = \`A processar: \${pct}%\`;
        }, (newMedia) => {`,
`        await processMultipleMedia(files, (pct) => {
            const texts = document.querySelectorAll('#video-progress-text');
            texts.forEach(t => t.innerText = \`A processar: \${pct}%\`);
        }, (newMedia) => {`
);

fs.writeFileSync('public/index.html', code);
console.log('Fixed progress text updater');
