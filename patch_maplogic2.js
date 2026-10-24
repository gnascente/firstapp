const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

const mapLogicAdd = `
    openLogModalForPin: function() {
        if (!this.selectedPinId) return;
        const pin = this.pins.find(p => p.id === this.selectedPinId);

        let extraEntities = [];
        if (pin && pin.linkedEntityId) {
            extraEntities.push({ id: pin.linkedEntityId, type: 'equipamento' });
        }

        LogModal.open(null, this.selectedPinId, null, extraEntities);
    },
`;

html = html.replace('addPinFromContext: function() {', mapLogicAdd + '\n    addPinFromContext: function() {');

fs.writeFileSync('public/index.html', html);
