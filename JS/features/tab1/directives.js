/**
 * Directives Management
 * Handles CE marking directives selection and management in Tab 1
 */

import { getCurrentProject } from '../../state.js';
import { getProjectRepository } from '../../data/index.js';
import { t } from '../../i18n/index.js';
import { DIRECTIVE_OPTIONS } from '../../config/constants.js';
import { getListForDropdown } from '../../config/risk-data.js';

/**
 * Initialize directives management
 */
export function initializeDirectives() {
    // Populate dropdown with additional directives
    populateDirectivesDropdown();
    
    // Render fixed directive options
    renderDirectivesList();
    
    // Add directive button
    const addDirectiveBtn = document.getElementById('addDirectiveBtn');
    if (addDirectiveBtn) {
        addDirectiveBtn.addEventListener('click', addDirective);
    }
    
    console.log('✓ Directives management initialized');
}

/**
 * Load directives from project
 * @param {Object} project - Project object
 */
export function loadDirectives(project) {
    if (!project) return;
    
    // Render main directives list
    renderDirectivesList();
    
    // Render additional directives
    renderAdditionalDirectivesList();
}

/**
 * Populate directives dropdown for additional directives
 */
function populateDirectivesDropdown() {
    const select = document.getElementById('directiveSelect');
    if (!select) return;

    const directives = getListForDropdown('directives')
        .filter(dir => !DIRECTIVE_OPTIONS.some(opt => opt.name === dir));
    
    // Map directive names to translation keys
    const directiveTranslations = {
        'Maskindirektivet 2006/42/EG': 'directive.machinery2006',
        'Maskinförordningen (EU) 2023/1230': 'directive.regulation2023',
        'Lågspänningsdirektivet 2014/35/EU': 'directive.lowvoltage',
        'EMC-direktivet 2014/30/EU': 'directive.emc',
        'ATEX-direktivet 2014/34/EU (explosiv miljö)': 'directive.atex',
        'Tryckutrustningsdirektivet 2014/68/EU': 'directive.pressure',
        'Radio Equipment Directive (RED) 2014/53/EU': 'directive.red',
        'RoHS-direktivet 2011/65/EU (farliga ämnen)': 'directive.rohs',
        'REACH-förordningen (EG) 1907/2006 (kemikalier)': 'directive.reach'
    };

    select.innerHTML = `<option value="">${t('doc.directives.select')}</option>` +
        directives.map(dir => `<option value="${dir}">${t(directiveTranslations[dir], {}, dir)}</option>`).join('');
}

/**
 * Render fixed directive options (mutual exclusive selection)
 */
function renderDirectivesList() {
    const list = document.getElementById('directivesList');
    if (!list) return;

    const project = getCurrentProject();
    const selected = project?.selectedDirective || '';
    const directives = project?.directives || [];
    
    // Map directive names to translation keys
    const directiveTranslations = {
        'Maskindirektivet 2006/42/EG': 'directive.machinery2006',
        'Maskinförordningen (EU) 2023/1230': 'directive.regulation2023',
        'Lågspänningsdirektivet 2014/35/EU': 'directive.lowvoltage'
    };

    list.innerHTML = DIRECTIVE_OPTIONS.map(option => {
        // Check if this directive is selected (either as primary or in directives array)
        const isChecked = selected === option.name || 
                         directives.some(d => d.name === option.name);
        
        return `
            <label class="checkbox-group" style="margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                <input type="checkbox" 
                       class="form-checkbox" 
                       id="${option.id}" 
                       ${isChecked ? 'checked' : ''}
                       data-directive-name="${option.name}" />
                <span>${t(directiveTranslations[option.name], {}, option.name)}</span>
            </label>
        `;
    }).join('');
    
    // Add event listeners
    DIRECTIVE_OPTIONS.forEach(option => {
        const checkbox = document.getElementById(option.id);
        if (checkbox) {
            checkbox.addEventListener('change', (e) => {
                handleDirectiveSelection(option.id, e.target.checked);
            });
        }
    });

    if (!selected) {
        list.insertAdjacentHTML('beforeend', 
            `<p style="color: var(--text-secondary); font-size: 0.875rem; margin-top: 0.25rem;">${t('directive.selectmessage')}</p>`);
    }

    renderAdditionalDirectivesList();
}

/**
 * Handle directive checkbox selection
 * Machinery directives (2006/42 and 2023/1230) are mutually exclusive
 * Low Voltage Directive can be combined with machinery directives
 * @param {string} optionId - Directive option ID
 * @param {boolean} checked - Whether checkbox is checked
 */
function handleDirectiveSelection(optionId, checked) {
    const option = DIRECTIVE_OPTIONS.find(opt => opt.id === optionId);
    const project = getCurrentProject();
    if (!option || !project) return;

    // Initialize directives array if needed
    if (!project.directives) {
        project.directives = [];
    }

    const isMachineryDirective = option.name.includes('2006/42') || option.name.includes('2023/1230');
    const isLowVoltageDirective = option.name.includes('2014/35');

    if (checked) {
        if (isMachineryDirective) {
            // Uncheck other machinery directives (mutually exclusive)
            DIRECTIVE_OPTIONS.forEach(opt => {
                const isOtherMachinery = opt.id !== optionId && 
                                        (opt.name.includes('2006/42') || opt.name.includes('2023/1230'));
                if (isOtherMachinery) {
                    const cb = document.getElementById(opt.id);
                    if (cb) cb.checked = false;
                    // Remove from directives array
                    project.directives = project.directives.filter(d => d.name !== opt.name);
                }
            });
            
            // Set as primary directive
            project.selectedDirective = option.name;
            // Ensure it's not also in directives array
            project.directives = project.directives.filter(d => d.name !== option.name);
        } else if (isLowVoltageDirective) {
            // Add to directives array if not already there
            if (!project.directives.some(d => d.name === option.name)) {
                project.directives.push({ name: option.name });
            }
        }
    } else {
        if (isMachineryDirective && project.selectedDirective === option.name) {
            project.selectedDirective = '';
        } else if (isLowVoltageDirective) {
            // Remove from directives array
            project.directives = project.directives.filter(d => d.name !== option.name);
        }
    }

    project.meta.lastModified = new Date().toISOString();
    
    // Migrate to new data layer
    (async () => {
        try {
            const repo = getProjectRepository();
            await repo.saveProject(project);
        } catch (error) {
            console.error('Error saving directive selection:', error);
        }
    })();
    
    console.log(`✅ Directive changed to: ${option.name}`);
    
    // Update UI
    renderAdditionalDirectivesList();
    updateCybersecurityVisibility();
    
    // Notify other components
    if (window.renderHighRiskOptions) window.renderHighRiskOptions();
    if (window.renderDoCDirectives) window.renderDoCDirectives();
    if (window.updateControlReportDirective) window.updateControlReportDirective();
    if (window.renderControlChecklist) {
        console.log('📋 Calling renderControlChecklist...');
        window.renderControlChecklist();
    }
}

/**
 * Add additional directive
 */
function addDirective() {
    const select = document.getElementById('directiveSelect');
    const project = getCurrentProject();
    if (!select || !project) return;
    
    const selectedDirective = select.value;
    if (!selectedDirective) return;

    if (!project.directives) {
        project.directives = [];
    }

    const exists = project.directives.some(d => d.name === selectedDirective);
    if (!exists) {
        project.directives.push({ name: selectedDirective });
        project.meta.lastModified = new Date().toISOString();
        
        // Migrate to new data layer
        (async () => {
            try {
                const repo = getProjectRepository();
                await repo.saveProject(project);
            } catch (error) {
                console.error('Error adding directive:', error);
            }
        })();
    }

    select.value = '';
    renderAdditionalDirectivesList();
    
    // Notify other components
    if (window.renderDoCDirectives) window.renderDoCDirectives();
    if (window.updateControlReportDirective) window.updateControlReportDirective();
}

/**
 * Render list of additional directives
 */
function renderAdditionalDirectivesList() {
    const list = document.getElementById('additionalDirectivesList');
    if (!list) return;

    const project = getCurrentProject();
    const directives = (project?.directives || [])
        .filter(d => d.name !== (project?.selectedDirective || ''))
        .map((dir, idx) => ({ dir, idx }));

    const directiveTranslations = {
        'Maskindirektivet 2006/42/EG': 'directive.machinery2006',
        'Maskinförordningen (EU) 2023/1230': 'directive.regulation2023',
        'Lågspänningsdirektivet 2014/35/EU': 'directive.lowvoltage',
        'EMC-direktivet 2014/30/EU': 'directive.emc',
        'ATEX-direktivet 2014/34/EU (explosiv miljö)': 'directive.atex',
        'Tryckutrustningsdirektivet 2014/68/EU': 'directive.pressure',
        'Radio Equipment Directive (RED) 2014/53/EU': 'directive.red',
        'RoHS-direktivet 2011/65/EU (farliga ämnen)': 'directive.rohs',
        'REACH-förordningen (EG) 1907/2006 (kemikalier)': 'directive.reach'
    };

    if (directives.length === 0) {
        list.innerHTML = `<p style="color: var(--text-secondary); font-size: 0.9rem;">${t('message.nodirectives')}</p>`;
        return;
    }

    list.innerHTML = directives.map(({ dir, idx }) => `
        <div class="card" style="margin-bottom: 0.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="flex: 1;">
                    <strong>${t(directiveTranslations[dir.name], {}, dir.name)}</strong>
                </div>
                <button class="btn btn-danger" 
                        data-directive-index="${idx}" 
                        style="margin-left: 1rem;">
                    ${t('action.remove', {}, 'Ta bort')}
                </button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to remove buttons
    list.querySelectorAll('.btn-danger').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.getAttribute('data-directive-index'), 10);
            removeAdditionalDirective(index);
        });
    });
}

/**
 * Remove additional directive by index
 * @param {number} index - Index of directive to remove
 */
function removeAdditionalDirective(index) {
    const project = getCurrentProject();
    if (!project?.directives) return;
    if (!confirm(t('message.confirm', {}, 'Bekräfta') + '?')) return;

    project.directives.splice(index, 1);
    project.meta.lastModified = new Date().toISOString();
    (async () => {
        try {
            const repo = getProjectRepository();
            await repo.saveProject(project);
        } catch (error) {
            console.error('Error saving directive removal:', error);
        }
    })();
    
    renderAdditionalDirectivesList();
    
    // Notify other components
    if (window.renderDoCDirectives) window.renderDoCDirectives();
    if (window.updateControlReportDirective) window.updateControlReportDirective();
}

/**
 * Check if regulation 2023/1230 is selected
 * @returns {boolean} True if regulation is selected
 */
export function isRegulationSelected() {
    const project = getCurrentProject();
    const selected = project?.selectedDirective || project?.directives?.[0]?.name || '';
    return selected.includes('2023/1230');
}

/**
 * Update cybersecurity section visibility based on directive
 */
function updateCybersecurityVisibility() {
    const cyberSection = document.getElementById('softwareCyberSection');
    if (cyberSection) {
        cyberSection.style.display = isRegulationSelected() ? 'block' : 'none';
    }
}

/**
 * Get selected directive name from UI
 * @returns {string} Selected directive name
 */
export function getSelectedDirective() {
    const project = getCurrentProject();
    return project?.selectedDirective || '';
}

/**
 * Get directive ID by name
 * @param {string} name - Directive name
 * @returns {string} Directive ID
 */
export function getDirectiveIdByName(name) {
    const option = DIRECTIVE_OPTIONS.find(opt => opt.name === name);
    return option ? option.id : Date.now().toString();
}
