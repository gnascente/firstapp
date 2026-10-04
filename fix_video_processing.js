const fs = require('fs');

// We have two potential places for video processing getting stuck without UI update:
// 1. AppUtils.compressVideo resolves properly. Let's see:
// It has: resolve({ video: reader.result, thumb: thumbCanvas.toDataURL('image/jpeg'), size: blob.size });

// The problem is that when handleLogMedia completes its `await processMultipleMedia`, the placeholder is cleared and new media pushed inside the callback! But wait! `await processMultipleMedia` returns immediately because `processMultipleMedia` returns undefined (it's async but no return).
// However, the callback updates LogModal.tempMedia and calls LogModal.updateUI()!
// BUT the button "A processar" only goes away when `hasPlaceholder` is false inside updateUI.
// Wait, the user said: "Apenas clicando na galeria de imagens e depois voltando pra mesma tela, ou seja, forcando o render, que o botão da de a processar para guardar o registro."
// This implies the callback DID fire, LogModal.tempMedia DID get updated, but `LogModal.updateUI()` didn't correctly reflect the change in the button.
// Or maybe it did but the button text wasn't updated? Let's check updateUI.

let code = fs.readFileSync('public/index.html', 'utf-8');
const updateUI = code.match(/updateUI: function\(\) \{[\s\S]*?\}\n\}/)[0];
console.log(updateUI);
