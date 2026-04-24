/**
 * Standards Management
 * Handles harmonized standards selection and management in Tab 1
 */

import { getCurrentProject } from '../../state.js';
import { t } from '../../i18n/index.js';
import { getListForDropdown } from '../../config/risk-data.js';

/**
 * Initialize standards management
 */
export function initializeStandards() {
    // Populate standards dropdown
    populateStandardsDropdown();
    
    // Add standard button
    const addStandardBtn = document.getElementById('addStandardBtn');
    if (addStandardBtn) {
        addStandardBtn.addEventListener('click', addStandard);
    }
    
    console.log('✓ Standards management initialized');
}

/**
 * Load standards from project
 * @param {Object} project - Project object
 */
export function loadStandards(project) {
    if (!project) return;
    renderStandardsList();
}

/**
 * Populate standards dropdown
 */
function populateStandardsDropdown() {
    const select = document.getElementById('standardSelect');
    if (!select) return;
    
    const standards = getListForDropdown('standards');
    
    // Clear existing options (except first)
    select.innerHTML = `<option value="">${t('standards.selectfromlist', {}, '-- Välj standard från listan --')}</option>`;
    
    // Add all standards
    standards.forEach(std => {
        const option = document.createElement('option');
        option.value = std;
        option.textContent = std;
        select.appendChild(option);
    });
}

/**
 * Add standard to project
 */
function addStandard() {
    const select = document.getElementById('standardSelect');
    const project = getCurrentProject();
    if (!select || !project) return;
    
    const selectedValue = select.value;
    
    if (!selectedValue) {
        alert(t('standards.selectone', {}, 'Välj en standard från listan'));
        return;
    }
    
    // Extract number and title
    const parts = selectedValue.split(' - ');
    const number = parts[0];
    const title = parts.slice(1).join(' - ') || '';
    
    // Check if already added
    const exists = project.standards.some(s => s.number === number);
    if (exists) {
        alert(t('standards.alreadyadded', {}, 'Denna standard är redan tillagd'));
        return;
    }
    
    const standard = {
        id: Date.now().toString(),
        number: number,
        title: title,
        partiallyApplied: false,
        motivation: ''
    };
    
    project.standards.push(standard);
    project.meta.lastModified = new Date().toISOString();
    
    renderStandardsList();
    
    // Reset dropdown
    select.value = '';
}

/**
 * Render list of added standards
 */
function renderStandardsList() {
    const list = document.getElementById('standardsList');
    if (!list) return;
    
    const project = getCurrentProject();
    if (!project || !project.standards || project.standards.length === 0) {
        list.innerHTML = `<p style="color: var(--text-secondary);">${t('standards.none', {}, 'Inga standarder tillagda')}</p>`;
        return;
    }
    
    list.innerHTML = project.standards.map((std, index) => `
        <div class="card" style="margin-bottom: 0.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1;">
                    <strong>${std.number}</strong><br>
                    <span style="color: var(--text-secondary);">${std.title}</span>
                    <div style="margin-top: 0.5rem;">
                        <label class="checkbox-group">
                            <input type="checkbox" 
                                   class="form-checkbox" 
                                   ${std.partiallyApplied ? 'checked' : ''} 
                                   data-standard-index="${index}" 
                                   data-action="toggle-partial" />
                            <span>${t('standards.partiallyapplied', {}, 'Delvis tillämpad')}</span>
                        </label>
                    </div>
                    ${std.partiallyApplied ? `
                        <div style="margin-top: 0.5rem;">
                            <textarea class="form-textarea" 
                                      placeholder="${t('standards.motivation', {}, 'Motivering...')}" 
                                      data-standard-index="${index}"
                                      data-action="update-motivation">${std.motivation || ''}</textarea>
                        </div>
                    ` : ''}
                </div>
                <button class="btn btn-danger" 
                        data-standard-index="${index}"
                        data-action="remove"
                        style="margin-left: 1rem;">
                    ${t('action.remove', {}, 'Ta bort')}
                </button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners
    list.querySelectorAll('[data-action="toggle-partial"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const index = parseInt(e.target.getAttribute('data-standard-index'), 10);
            togglePartialStandard(index, e.target.checked);
        });
    });
    
    list.querySelectorAll('[data-action="update-motivation"]').forEach(textarea => {
        textarea.addEventListener('change', (e) => {
            const index = parseInt(e.target.getAttribute('data-standard-index'), 10);
            updateStandardMotivation(index, e.target.value);
        });
    });
    
    list.querySelectorAll('[data-action="remove"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.getAttribute('data-standard-index'), 10);
            removeStandard(index);
        });
    });
}

/**
 * Toggle partially applied status
 * @param {number} index - Standard index
 * @param {boolean} checked - Checkbox state
 */
function togglePartialStandard(index, checked) {
    const project = getCurrentProject();
    if (!project) return;
    
    project.standards[index].partiallyApplied = checked;
    if (!checked) {
        project.standards[index].motivation = '';
    }
    
    project.meta.lastModified = new Date().toISOString();
    renderStandardsList();
}

/**
 * Update standard motivation text
 * @param {number} index - Standard index
 * @param {string} value - Motivation text
 */
function updateStandardMotivation(index, value) {
    const project = getCurrentProject();
    if (!project) return;
    
    project.standards[index].motivation = value;
    project.meta.lastModified = new Date().toISOString();
}

/**
 * Remove standard by index
 * @param {number} index - Standard index
 */
function removeStandard(index) {
    if (!confirm(t('message.confirm', {}, 'Bekräfta') + '?')) {
        return;
    }
    
    const project = getCurrentProject();
    if (!project) return;
    
    project.standards.splice(index, 1);
    project.meta.lastModified = new Date().toISOString();
    
    renderStandardsList();
}

/**
 * Get standards summary for reports
 * @returns {Array} Array of standard objects
 */
export function getStandardsSummary() {
    const project = getCurrentProject();
    if (!project) return [];
    
    return (project.standards || []).map(std => ({
        number: std.number,
        title: std.title,
        partiallyApplied: std.partiallyApplied || false,
        motivation: std.motivation || ''
    }));
}

/**
 * Validate standards
 * @returns {Object} Validation result
 */
export function validateStandards() {
    const project = getCurrentProject();
    if (!project) {
        return { isValid: false, errors: ['No project loaded'] };
    }
    
    const errors = [];
    
    // Check if partially applied standards have motivations
    project.standards?.forEach((std, index) => {
        if (std.partiallyApplied && !std.motivation?.trim()) {
            errors.push(t('validation.motivationrequired', { number: std.number }, 
                `Motivering krävs för delvis tillämpad standard ${std.number}`));
        }
    });
    
    return {
        isValid: errors.length === 0,
        errors
    };
}
