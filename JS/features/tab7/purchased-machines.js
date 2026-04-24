/**
 * Purchased Machines Management
 * Handles CRUD operations for purchased/integrated machines
 */

import { getCurrentProject } from '../../state.js';
import { t } from '../../i18n/index.js';

/**
 * Open purchased machine modal
 * @param {number|null} editIndex - Index of machine to edit, or null for new
 */
export function openPurchasedMachineModal(editIndex = null) {
    const modal = document.getElementById('purchased-machine-modal');
    const container = document.getElementById('purchased-machine-form-container');
    
    if (!modal || !container) {
        console.warn('Purchased machine modal elements not found');
        return;
    }
    
    // Store edit index in modal for later use
    modal.dataset.editIndex = editIndex !== null ? editIndex : '';
    
    container.innerHTML = renderPurchasedMachineForm(editIndex);
    modal.style.display = 'flex';
    
    // If editing, populate form with existing data
    if (editIndex !== null) {
        populatePurchasedMachineForm(editIndex);
    }
    
    // Update CE status initially
    updateCEStatus();
}

/**
 * Close purchased machine modal
 */
export function closePurchasedMachineModal() {
    const modal = document.getElementById('purchased-machine-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Render purchased machine form
 * @param {number|null} editIndex - Index for editing, or null for new
 * @returns {string} HTML string
 */
function renderPurchasedMachineForm(editIndex = null) {
    const isEdit = editIndex !== null;
    
    return `
        <form id="purchased-machine-form" onsubmit="savePurchasedMachine(event);">
            <div class="form-section">
                <h3 style="margin-top: 0;">${isEdit ? t('purchased.edit_title', {}, 'Redigera maskin') : t('purchased.title', {}, 'Ny inköpt maskin')}</h3>
                
                <div class="form-group">
                    <label class="form-label">${t('purchased.machinename', {}, 'Maskinnamn')} *</label>
                    <input type="text" class="form-input" id="pm-name" 
                           placeholder="${t('purchased.machinename_placeholder', {}, 'T.ex. Transportband A')}" required />
                </div>
                
                <div class="form-group">
                    <label class="form-label">${t('purchased.supplier', {}, 'Leverantör/Tillverkare')} *</label>
                    <input type="text" class="form-input" id="pm-supplier" 
                           placeholder="${t('purchased.supplier_placeholder', {}, 'Företagsnamn')}" required />
                </div>
                
                <div class="form-group">
                    <label class="form-label">${t('purchased.machinetype', {}, 'Typ av maskin')}</label>
                    <input type="text" class="form-input" id="pm-type" 
                           placeholder="${t('purchased.machinetype_placeholder', {}, 'T.ex. Transportör, Robot, etc.')}" />
                </div>
                
                <div class="form-group">
                    <label class="form-label">${t('purchased.legaltype', {}, 'Juridisk status')} *</label>
                    <select class="form-select" id="pm-legaltype" required onchange="updateCEStatus()">
                        <option value="">${t('purchased.choose', {}, 'Välj...')}</option>
                        <option value="complete">${t('purchased.complete', {}, 'Fullständig maskin (CE-märkt)')}</option>
                        <option value="partial">${t('purchased.partial', {}, 'Delmaskin (Declaration of Incorporation)')}</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">${t('purchased.integration', {}, 'Integration')}</label>
                    <select class="form-select" id="pm-integration">
                        <option value="">${t('purchased.choose', {}, 'Välj...')}</option>
                        <option value="integrated">${t('purchased.integrated', {}, 'Integrerad i vår maskin')}</option>
                        <option value="standalone">${t('purchased.standalone', {}, 'Fristående (bredvid vår maskin)')}</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <div class="checkbox-group">
                        <input type="checkbox" id="pm-ceincluded" class="form-checkbox" />
                        <label for="pm-ceincluded" class="form-label">
                            ${t('purchased.ceincluded', {}, 'Ingår i vår CE-märkning')}
                        </label>
                    </div>
                    <small style="display: block; margin-top: 0.5rem; color: var(--text-secondary);">
                        ${t('purchased.ceincluded_help', {}, 'Kryssa i om denna maskin ska inkluderas i vår riskbedömning och CE-märkning')}
                    </small>
                </div>
                
                <div class="form-group">
                    <label class="form-label">${t('purchased.comment', {}, 'Kommentar/Noteringar')}</label>
                    <textarea class="form-textarea" id="pm-comment" rows="3" 
                              placeholder="${t('purchased.comment_placeholder', {}, 'Ytterligare information...')}"></textarea>
                </div>
            </div>
            
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
                <button type="button" class="btn btn-secondary" onclick="closePurchasedMachineModal()">
                    ${t('action.cancel', {}, 'Avbryt')}
                </button>
                <button type="submit" class="btn btn-primary">
                    ${isEdit ? t('action.save', {}, 'Spara') : t('action.add', {}, 'Lägg till')}
                </button>
            </div>
        </form>
    `;
}

/**
 * Populate form with existing machine data
 * @param {number} index - Machine index
 */
function populatePurchasedMachineForm(index) {
    const project = getCurrentProject();
    if (!project?.purchasedMachines || !project.purchasedMachines[index]) return;
    
    const machine = project.purchasedMachines[index];
    
    const nameEl = document.getElementById('pm-name');
    if (nameEl) nameEl.value = machine.name || '';
    
    const supplierEl = document.getElementById('pm-supplier');
    if (supplierEl) supplierEl.value = machine.supplier || '';
    
    const typeEl = document.getElementById('pm-type');
    if (typeEl) typeEl.value = machine.type || '';
    
    const legalTypeEl = document.getElementById('pm-legaltype');
    if (legalTypeEl) legalTypeEl.value = machine.legalType || '';
    
    const integrationEl = document.getElementById('pm-integration');
    if (integrationEl) integrationEl.value = machine.integration || '';
    
    const ceIncludedEl = document.getElementById('pm-ceincluded');
    if (ceIncludedEl) ceIncludedEl.checked = machine.ceIncluded || false;
    
    const commentEl = document.getElementById('pm-comment');
    if (commentEl) commentEl.value = machine.comment || '';
}

/**
 * Update CE status helper text based on legal type
 */
export function updateCEStatus() {
    const legalType = document.getElementById('pm-legaltype')?.value;
    const ceCheckbox = document.getElementById('pm-ceincluded');
    
    if (!ceCheckbox) return;
    
    // Auto-suggest CE inclusion based on legal type
    if (legalType === 'partial') {
        ceCheckbox.checked = true; // Delmaskiner bör oftast inkluderas
    }
}

/**
 * Save purchased machine
 * @param {Event} event - Form submit event
 */
export function savePurchasedMachine(event) {
    event.preventDefault();
    
    const project = getCurrentProject();
    if (!project) return;
    
    const modal = document.getElementById('purchased-machine-modal');
    const editIndex = modal?.dataset.editIndex !== '' ? parseInt(modal.dataset.editIndex) : null;
    
    // Collect form data
    const machine = {
        id: editIndex !== null ? project.purchasedMachines[editIndex].id : Date.now(),
        name: document.getElementById('pm-name')?.value || '',
        supplier: document.getElementById('pm-supplier')?.value || '',
        type: document.getElementById('pm-type')?.value || '',
        legalType: document.getElementById('pm-legaltype')?.value || '',
        integration: document.getElementById('pm-integration')?.value || '',
        ceIncluded: document.getElementById('pm-ceincluded')?.checked || false,
        comment: document.getElementById('pm-comment')?.value || ''
    };
    
    // Initialize purchasedMachines array if it doesn't exist
    if (!project.purchasedMachines) {
        project.purchasedMachines = [];
    }
    
    // Add or update machine
    if (editIndex !== null) {
        project.purchasedMachines[editIndex] = machine;
    } else {
        project.purchasedMachines.push(machine);
    }
    
    // Save project
    (async () => {
        try {
            const repo = getProjectRepository();
            await repo.saveProject(project);
        } catch (error) {
            console.error('Error saving purchased machine:', error);
        }
    })();
    
    // Close modal and update UI
    closePurchasedMachineModal();
    renderObjectsList();
}

/**
 * Edit purchased machine
 * @param {number} index - Machine index
 */
export function editPurchasedMachine(index) {
    openPurchasedMachineModal(index);
}

/**
 * Remove purchased machine
 * @param {number} index - Machine index
 */
export function removePurchasedMachine(index) {
    const project = getCurrentProject();
    if (!project?.purchasedMachines) return;
    
    const machine = project.purchasedMachines[index];
    if (!confirm(t('message.confirm', {}, 'Är du säker?') + `: ${machine.name}?`)) return;
    
    project.purchasedMachines.splice(index, 1);
    
    // Save project
    (async () => {
        try {
            const repo = getProjectRepository();
            await repo.saveProject(project);
        } catch (error) {
            console.error('Error deleting purchased machine:', error);
        }
    })();
    
    // Update UI
    renderObjectsList();
}

/**
 * Render objects list (imported modules + purchased machines)
 */
export function renderObjectsList() {
    const list = document.getElementById('object-list');
    if (!list) return;
    
    const project = getCurrentProject();
    const hasModules = project?.modules?.length > 0;
    const hasPurchased = project?.purchasedMachines?.length > 0;
    
    if (!hasModules && !hasPurchased) {
        list.innerHTML = `
            <div style="text-align: center; padding: 2rem 1rem; color: var(--text-secondary);">
                <div style="font-size: 2rem; margin-bottom: 0.5rem; opacity: 0.5;">📦</div>
                <p style="font-size: 0.85rem; margin: 0;">${t('objects.noobjects', {}, 'Inga objekt tillagda')}</p>
                <p style="font-size: 0.75rem; margin: 0.5rem 0 0 0;">Klicka på 🏭 eller 📥 för att lägga till</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    // Render purchased machines
    if (hasPurchased) {
        html += project.purchasedMachines.map((machine, index) => `
            <div class="module-item" style="border-left: 3px solid ${machine.ceIncluded ? 'var(--success-color)' : 'var(--warning-color)'};">
                <div class="module-header">
                    <div class="module-icon">🏭</div>
                    <div class="module-info">
                        <div class="module-name">${machine.name}</div>
                        <div class="module-detail">${machine.supplier} | ${machine.legalType === 'partial' ? t('purchased.partial', {}, 'Delmaskin') : t('purchased.complete', {}, 'Fullständig')}</div>
                        <div style="font-size: 0.7rem; color: ${machine.ceIncluded ? 'var(--success-color)' : 'var(--text-secondary)'};">
                            ${machine.ceIncluded ? '✓ ' + t('purchased.included_in_ce', {}, 'Ingår i CE') : '− ' + t('purchased.not_in_ce', {}, 'Ej i CE')}
                        </div>
                    </div>
                </div>
                <div class="module-actions">
                    <button class="module-btn" onclick="editPurchasedMachine(${index})" 
                            title="${t('purchased.edit_btn', {}, 'Redigera')}" 
                            style="background: var(--primary-color); color: white;">
                        📝 ${t('purchased.edit_btn', {}, 'Redigera')}
                    </button>
                    <button class="module-btn module-btn-remove" onclick="removePurchasedMachine(${index})" 
                            title="${t('objects.delete', {}, 'Ta bort')}">
                        ${t('objects.delete', {}, 'Ta bort')}
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // Render imported modules
    if (hasModules) {
        html += project.modules.map((module, index) => {
            const isViewing = project.moduleDataLoaded?.moduleIndex === index;
            const viewBtnLabel = isViewing ? '👁️ ' + t('objects.close_view', {}, 'Stäng visning') : '👁️ ' + t('objects.view_data', {}, 'Visa data');
            const viewBtnStyle = isViewing
                ? 'background: #dc2626; color: white;'
                : 'background: var(--primary-color); color: white;';
            const deleteDisabled = isViewing ? 'disabled' : '';
            const deleteStyle = isViewing
                ? 'background: #d1d5db; color: #6b7280; cursor: not-allowed;'
                : '';
            const deleteHandler = isViewing ? 'return false;' : `removeModule(${index})`;

            return `
            <div class="module-item">
                <div class="module-header">
                    <div class="module-icon">📦</div>
                    <div class="module-info">
                        <div class="module-name">${module.productName}</div>
                        <div class="module-detail">${module.model || t('objects.no_model', {}, 'Ingen modell')} | Rev ${module.revision}</div>
                    </div>
                </div>
                <div class="module-actions">
                    <button class="module-btn" onclick="toggleModuleView(${index})" 
                            title="${t('objects.view_module', {}, 'Visa/avsluta modulvisning')}" 
                            style="${viewBtnStyle}">
                        ${viewBtnLabel}
                    </button>
                    <button class="module-btn module-btn-remove" ${deleteDisabled} 
                            onclick="${deleteHandler}" 
                            title="${t('objects.delete', {}, 'Ta bort')}" 
                            style="${deleteStyle}">
                        ${t('objects.delete', {}, 'Ta bort')}
                    </button>
                </div>
            </div>
            `;
        }).join('');
    }
    
    list.innerHTML = html;
}

// Expose functions globally
if (typeof window !== 'undefined') {
    window.openPurchasedMachineModal = openPurchasedMachineModal;
    window.closePurchasedMachineModal = closePurchasedMachineModal;
    window.savePurchasedMachine = savePurchasedMachine;
    window.editPurchasedMachine = editPurchasedMachine;
    window.removePurchasedMachine = removePurchasedMachine;
    window.updateCEStatus = updateCEStatus;
}
