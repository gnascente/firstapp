const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

html = html.replace(
    '<button class="fab" id="mapPinFab" style="display:none;" onclick="LogModal.open(null, MapLogic.selectedPinId)">',
    '<button class="fab" id="mapPinFab" style="display:none;" onclick="MapLogic.openLogModalForPin()">');

fs.writeFileSync('public/index.html', html);
