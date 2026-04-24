/**
 * List Editor Modal
 * Handles editing of risk lists (risk groups, hazard sources, zones, injuries, standards, directives)
 */

import { riskGroupsData } from '../../config/risk-data.js';
import { buildCSV, parseCSV } from '../../utils/csv.js';
import { t } from '../../i18n/index.js';

let currentListKey = 'riskGroups';
const defaultLists = JSON.parse(JSON.stringify(riskGroupsData));

export function openEditListsModal() {
    const modal = document.getElementById('edit-lists-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    switchListTab(currentListKey);
}

export function closeEditListsModal() {
    const modal = document.getElementById('edit-lists-modal');
    if (modal) modal.classList.add('hidden');
}

/**
 * Open project settings modal (placeholder for future)
 */
export function openProjectSettings() {
    // TODO: Implement project settings modal
    alert('Projektinställningar kommer snart');
}

export function switchListTab(listKey) {
    currentListKey = listKey;

    const modal = document.getElementById('edit-lists-modal');
    if (!modal) return;

    modal.querySelectorAll('.tab-btn[data-list]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-list') === listKey);
    });

    renderListEditor();

    const csvButtons = document.getElementById('csv-buttons-container');
    if (csvButtons) {
        csvButtons.style.display = (listKey === 'standards') ? 'flex' : 'none';
    }
}

export function renderListEditor() {
    const container = document.getElementById('list-editor-content');
    if (!container) return;

    const list = riskGroupsData[currentListKey] || [];

    if (list.length === 0) {
        container.innerHTML = `<p class="placeholder">${t('modal.empty_list', {}, 'Listan är tom')}</p>`;
        return;
    }

    container.innerHTML = `
        <div class="list-editor-items">
            ${list.map((item, index) => `
                <div class="list-editor-item">
                    <span>${item}</span>
                    <button class="btn btn-secondary" onclick="removeListItem(${index})">✕</button>
                </div>
            `).join('')}
        </div>
    `;
}

export function addListItem() {
    const input = document.getElementById('new-list-item');
    if (!input) return;

    const value = input.value.trim();
    if (!value) return;

    const list = riskGroupsData[currentListKey] || [];
    list.push(value);
    riskGroupsData[currentListKey] = list;

    input.value = '';
    renderListEditor();
}

export function removeListItem(index) {
    const list = riskGroupsData[currentListKey] || [];
    list.splice(index, 1);
    renderListEditor();
}

export function resetListsToDefault() {
    riskGroupsData[currentListKey] = [...(defaultLists[currentListKey] || [])];
    renderListEditor();
}

export function exportStandardsToCSV() {
    const list = riskGroupsData[currentListKey] || [];
    const csv = buildCSV(list.map(item => [item]));

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentListKey}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

export function importStandardsFromCSV(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target.result || '';
        const rows = parseCSV(String(text));
        const items = rows.map(row => (row[0] || '').trim()).filter(Boolean);
        riskGroupsData[currentListKey] = items;
        renderListEditor();
    };
    reader.readAsText(file);
}

if (typeof window !== 'undefined') {
    window.openEditListsModal = openEditListsModal;
    window.closeEditListsModal = closeEditListsModal;
    window.switchListTab = switchListTab;
    window.renderListEditor = renderListEditor;
    window.addListItem = addListItem;
    window.removeListItem = removeListItem;
    window.resetListsToDefault = resetListsToDefault;
    window.exportStandardsToCSV = exportStandardsToCSV;
    window.importStandardsFromCSV = importStandardsFromCSV;
}
