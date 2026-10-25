import re

with open('public/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace MapLogic.searchEquipment dropdown rendering to use DOM elements to prevent XSS and quote breakage.
search_html_old = """          if (available.length === 0 && term) {
            dropdown.innerHTML = `<div class="autocomplete-item" onclick="MapLogic.createHighlightEquipment('${term}')"><i class="material-icons" style="font-size:16px; opacity:0.6;">add</i> Criar equipamento "${term}"</div>`;
            dropdown.style.display = "flex";
            return;
          } else if (available.length === 0) {
            dropdown.style.display = "none";
            this.highlightedEquipmentId = null;
            this.renderPins();
            return;
          }

          dropdown.innerHTML = available
            .map((e) => `<div class="autocomplete-item" onclick="MapLogic.selectHighlightEquipment('${e.id}', '${e.name}')"><i class="material-icons" style="font-size:16px; opacity:0.6;">devices</i> ${e.name}</div>`)
            .join("");

          if (term && !available.some((e) => e.name.toLowerCase() === term)) {
            dropdown.innerHTML += `<div class="autocomplete-item" onclick="MapLogic.createHighlightEquipment('${term}')" style="border-top: 1px solid var(--surface-variant);"><i class="material-icons" style="font-size:16px; opacity:0.6;">add</i> Criar "${term}"</div>`;
          }
          dropdown.style.display = "flex";"""

search_html_new = """          dropdown.innerHTML = "";

          if (available.length === 0 && term) {
            const item = document.createElement("div");
            item.className = "autocomplete-item";
            item.onclick = () => MapLogic.createHighlightEquipment(term);
            item.innerHTML = `<i class="material-icons" style="font-size:16px; opacity:0.6;">add</i> Criar equipamento "${AppUtils.escapeHTML(term)}"`;
            dropdown.appendChild(item);
            dropdown.style.display = "flex";
            return;
          } else if (available.length === 0) {
            dropdown.style.display = "none";
            this.highlightedEquipmentId = null;
            this.renderPins();
            return;
          }

          available.forEach((e) => {
            const item = document.createElement("div");
            item.className = "autocomplete-item";
            item.onclick = () => MapLogic.selectHighlightEquipment(e.id, e.name);
            item.innerHTML = `<i class="material-icons" style="font-size:16px; opacity:0.6;">devices</i> ${AppUtils.escapeHTML(e.name)}`;
            dropdown.appendChild(item);
          });

          if (term && !available.some((e) => e.name.toLowerCase() === term)) {
            const createItem = document.createElement("div");
            createItem.className = "autocomplete-item";
            createItem.style.borderTop = "1px solid var(--surface-variant)";
            createItem.onclick = () => MapLogic.createHighlightEquipment(term);
            createItem.innerHTML = `<i class="material-icons" style="font-size:16px; opacity:0.6;">add</i> Criar "${AppUtils.escapeHTML(term)}"`;
            dropdown.appendChild(createItem);
          }

          dropdown.style.display = "flex";"""

content = content.replace(search_html_old, search_html_new)

# Add document click listener to hide dropdown when clicking outside
init_old = """        init: function () {
          this.initZoom();"""

init_new = """        init: function () {
          this.initZoom();

          document.addEventListener('click', (e) => {
            const dropdown = document.getElementById("mapSearchAutocomplete");
            const input = document.getElementById("mapSearchInput");
            if (dropdown && dropdown.style.display !== "none" && e.target !== input && !dropdown.contains(e.target)) {
              dropdown.style.display = "none";
            }
          });"""

content = content.replace(init_old, init_new)

with open('public/index.html', 'w', encoding='utf-8') as f:
    f.write(content)
