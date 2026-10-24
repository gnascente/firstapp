const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

const demarcationModalHtml = `
<div class="modal-overlay" id="demarcationModal">
    <div class="modal-content">
        <h2 style="margin-bottom: 24px;">Selecionar Equipamento</h2>

        <div class="input-group">
            <label style="font-size: 13px; font-weight: 500; color: var(--on-surface-variant); margin-bottom: 8px; display: block;">Buscar Equipamento:</label>
            <input type="text" id="demarcationSearchInput" class="input-field" placeholder="Digite o nome do equipamento..." autocomplete="off" oninput="DemarcationModal.search()">
            <div id="demarcationAutocomplete" class="autocomplete-dropdown"></div>
        </div>

        <div class="modal-actions" style="margin-top: 32px;">
            <button class="btn btn-text" onclick="DemarcationModal.closeUI()">Cancelar</button>
        </div>
    </div>
</div>
`;

html = html.replace('<div class="modal-overlay" id="entityModal">', demarcationModalHtml + '\n<div class="modal-overlay" id="entityModal">');

fs.writeFileSync('public/index.html', html);
