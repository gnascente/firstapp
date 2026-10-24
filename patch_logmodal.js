const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

const regex = /open:\s*async\s*function\(\s*logId\s*=\s*null,\s*targetEntityId\s*=\s*null,\s*groupId\s*=\s*null\s*\)\s*\{[\s\S]*?document\.getElementById\('logModalTitle'\)\.innerText\s*=\s*'Registar\s*Evento';/;

const replacement = `open: async function(logId = null, targetEntityId = null, groupId = null, extraEntities = []) {
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
            this.tempRelations = [...(extraEntities || [])];
            document.getElementById('logModalTitle').innerText = 'Registar Evento';`;

html = html.replace(regex, replacement);
fs.writeFileSync('public/index.html', html);
