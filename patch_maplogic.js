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

const logModalOpenReplace = `
    open: async function(logId = null, targetEntityId = null, groupId = null, extraEntities = []) {
        this.editLogId = logId;
        this.tempMedia = [];
        this.groupId = groupId || null;
        const textInput = document.getElementById('logText');

        if (logId) {
            const log = await AppDB.logs.get(logId);
            this.originId = log.originEntityId;
            this.groupId = log.groupId || log.id;
            textInput.value = log.text;
            this.tempMedia = [...(log.images || [])];
            let rels = log.relatedEntities || [];
            this.tempRelations = rels.filter(rel => rel.id !== this.originId).map(rel => ({ id: rel.id, type: rel.type }));
            document.getElementById('logModalTitle').innerText = 'Editar Registo';
            document.getElementById('logModalDeleteBtn').style.display = 'block';
        } else {
            this.originId = targetEntityId;
            textInput.value = '';
            this.tempRelations = extraEntities || [];
            document.getElementById('logModalTitle').innerText = 'Registar Evento';
`;

// we need to carefully replace the logModal Open
// let's grab it by line
