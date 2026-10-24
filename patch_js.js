const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

const demarcationJS = `
var DemarcationModal = {
    el: null,
    init: function() {
        if(!this.el) this.el = document.getElementById('demarcationModal');
    },
    open: function() {
        this.init();
        document.getElementById('demarcationSearchInput').value = '';
        document.getElementById('demarcationAutocomplete').style.display = 'none';
        AppState.openModal(this);
        setTimeout(() => document.getElementById('demarcationSearchInput').focus(), 300);
    },
    closeUI: function() {
        AppState.closeModalUI();
    },
    search: async function() {
        const term = document.getElementById('demarcationSearchInput').value.toLowerCase().trim();
        const dropdown = document.getElementById('demarcationAutocomplete');

        let allEntities = await AppDB.entities.toArray();
        let available = allEntities.filter(e => !e.isDeleted && e.type !== 'tarefa');

        if (term) available = available.filter(e => e.name.toLowerCase().includes(term));

        if (available.length === 0 && term) {
            dropdown.innerHTML = \`<div class="autocomplete-item" onclick="DemarcationModal.createNew('\${term}')"><i class="material-icons" style="font-size:16px; opacity:0.6;">add</i> Criar equipamento "\${term}"</div>\`;
            dropdown.style.display = 'flex';
            return;
        } else if (available.length === 0) {
            dropdown.style.display = 'none';
            return;
        }

        dropdown.innerHTML = available.slice(0, 5).map(e => \`<div class="autocomplete-item" onclick="DemarcationModal.selectEntity('\${e.id}')"><i class="material-icons" style="font-size:16px; opacity:0.6;">devices</i> \${e.name}</div>\`).join('');

        if (term && !available.some(e => e.name.toLowerCase() === term)) {
            dropdown.innerHTML += \`<div class="autocomplete-item" onclick="DemarcationModal.createNew('\${term}')" style="border-top: 1px solid var(--surface-variant);"><i class="material-icons" style="font-size:16px; opacity:0.6;">add</i> Criar "\${term}"</div>\`;
        }

        dropdown.style.display = 'flex';
    },
    selectEntity: function(id) {
        this.closeUI();
        MapLogic.startDemarcation(id);
    },
    createNew: async function(name) {
        let entity = {
            id: AppUtils.generateId(),
            name: AppUtils.capitalizeMentions(name),
            type: 'equipamento',
            observations: '',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isDeleted: 0,
            syncStatus: 0
        };
        await AppDB.entities.put(entity);
        window.cachedEntitiesMap.set(entity.id, entity.name);
        App.scheduleSync();
        this.closeUI();
        MapLogic.startDemarcation(entity.id);
    }
};
`;

html = html.replace('var LogModal = {', demarcationJS + '\nvar LogModal = {');

html = html.replace(
    'const entityId = prompt("Digite o ID do equipamento (isso seria um autocomplete):");\n        if (entityId) {\n            this.demarcationMode = true;\n            this.demarcationEntityId = entityId;\n            this.initDemarcationCanvas();\n        }',
    'DemarcationModal.open();'
);

html = html.replace(
    'initDemarcationCanvas: function() {',
    `startDemarcation: function(entityId) {
        this.demarcationMode = true;
        this.demarcationEntityId = entityId;
        this.initDemarcationCanvas();
    },
    initDemarcationCanvas: function() {`
);

fs.writeFileSync('public/index.html', html);
