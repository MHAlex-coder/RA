/**
 * Compliance Management
 * Handles high-risk categories and conformity assessment path in Tab 1
 */

import { getCurrentProject } from '../../state.js';
import { t } from '../../i18n/index.js';
import { HIGH_RISK_DIRECTIVE, HIGH_RISK_REGULATION } from '../../config/constants.js';
import { isRegulationSelected } from './directives.js';

/**
 * Initialize compliance management
 */
export function initializeCompliance() {
    console.log('🔧 initializeCompliance() called');
    
    // Render high-risk options
    renderHighRiskOptions();
    
    // High-risk category select
    const highRiskSelect = document.getElementById('highRiskCategory');
    if (highRiskSelect) {
        highRiskSelect.addEventListener('change', () => {
            toggleCustomHighRiskField();
            updateComplianceData();
        });
    }
    
    // Conformity path radio buttons
    const conformityRadios = document.querySelectorAll('input[name="conformityPath"]');
    conformityRadios.forEach(r => r.addEventListener('change', () => updateComplianceData()));
    
    // Other compliance fields
    const complianceFields = [
        'highRiskCustom', 'highRiskNotes', 'complianceNotifiedBody'
    ];
    
    complianceFields.forEach(fieldId => {
        const el = document.getElementById(fieldId);
        if (el) el.addEventListener('change', () => updateComplianceData());
    });
    
    console.log('✓ Compliance management initialized');
}

/**
 * Load compliance data from project
 * @param {Object} project - Project object
 */
export function loadComplianceData(project) {
    if (!project || !project.compliance) return;
    
    // Load high-risk category
    const highRiskSelect = document.getElementById('highRiskCategory');
    const highRiskCustomInput = document.getElementById('highRiskCustom');
    const highRiskNotesInput = document.getElementById('highRiskNotes');
    const notifiedBodyInput = document.getElementById('complianceNotifiedBody');
    
    if (highRiskSelect) {
        const options = getHighRiskOptions();
        const category = project.compliance.highRiskCategory || '';
        
        if (category && options.includes(category)) {
            highRiskSelect.value = category;
        } else if (category) {
            highRiskSelect.value = 'custom';
            if (highRiskCustomInput) {
                highRiskCustomInput.value = category;
            }
        } else {
            highRiskSelect.value = '';
        }
    }
    
    if (highRiskNotesInput) {
        highRiskNotesInput.value = project.compliance.highRiskNotes || '';
    }
    
    if (notifiedBodyInput) {
        notifiedBodyInput.value = project.compliance.notifiedBody || '';
    }
    
    // Load conformity path
    const conformityPath = project.compliance.conformityPath || 'self';
    const pathRadio = document.querySelector(`input[name="conformityPath"][value="${conformityPath}"]`);
    if (pathRadio) {
        pathRadio.checked = true;
    }
    
    toggleCustomHighRiskField();
}

/**
 * Render high-risk category options
 */
export function renderHighRiskOptions() {
    console.log('🔧 renderHighRiskOptions() called');
    const select = document.getElementById('highRiskCategory');
    const hint = document.getElementById('highRiskHint');
    
    console.log('highRiskCategory element:', select);
    console.log('highRiskHint element:', hint);
    
    if (!select) {
        console.warn('⚠️ highRiskCategory select not found!');
        return;
    }

    const options = getHighRiskOptions();
    console.log('High risk options:', options);
    
    const project = getCurrentProject();
    const current = project?.compliance?.highRiskCategory || '';
    
    console.log('Current category:', current);

    select.innerHTML = `<option value="">${t('report.nothighrisk', {}, 'Ej högrisk')}</option>` +
        options.map(opt => `<option value="${opt}">${opt}</option>`).join('') +
        `<option value="custom">${t('report.custom', {}, 'Annat/anpassat')}</option>`;

    select.value = current && options.includes(current) ? current : (current ? 'custom' : '');
    
    console.log('✅ Select populated with', select.options.length, 'options');

    if (hint) {
        hint.textContent = isRegulationSelected()
            ? t('report.hint.regulation', {}, 'Enligt bilaga I i förordning 2023/1230')
            : t('report.hint.directive', {}, 'Enligt bilaga IV i direktiv 2006/42/EG');
    }

    toggleCustomHighRiskField();
}

/**
 * Get high-risk options based on selected directive
 * @returns {Array} Array of high-risk categories
 */
export function getHighRiskOptions() {
    return isRegulationSelected() ? HIGH_RISK_REGULATION : HIGH_RISK_DIRECTIVE;
}

/**
 * Toggle custom high-risk field visibility
 */
function toggleCustomHighRiskField() {
    const select = document.getElementById('highRiskCategory');
    const custom = document.getElementById('highRiskCustomWrapper');
    if (!select || !custom) return;
    
    custom.style.display = select.value === 'custom' ? 'block' : 'none';
}

/**
 * Update compliance data from form
 */
function updateComplianceData() {
    const project = getCurrentProject();
    if (!project) return;
    
    // Initialize compliance object if needed
    if (!project.compliance) {
        project.compliance = {
            isHighRisk: false,
            highRiskCategory: '',
            highRiskCustom: '',
            highRiskNotes: '',
            conformityPath: 'self',
            notifiedBody: ''
        };
    }
    
    // Get high-risk category
    const highRiskCategoryEl = document.getElementById('highRiskCategory');
    const highRiskCategory = highRiskCategoryEl ? highRiskCategoryEl.value : '';
    const highRiskCustom = document.getElementById('highRiskCustom')?.value || '';
    
    project.compliance.highRiskCategory = highRiskCategory === 'custom' ? highRiskCustom : highRiskCategory;
    project.compliance.highRiskCustom = highRiskCustom;
    project.compliance.isHighRisk = !!(project.compliance.highRiskCategory || project.compliance.highRiskCustom);
    project.compliance.highRiskNotes = document.getElementById('highRiskNotes')?.value || '';
    
    // Get conformity path
    const selectedPath = document.querySelector('input[name="conformityPath"]:checked')?.value || 'self';
    project.compliance.conformityPath = selectedPath;
    project.compliance.notifiedBody = document.getElementById('complianceNotifiedBody')?.value || '';
    
    // Update timestamp
    project.meta.lastModified = new Date().toISOString();
}

/**
 * Check if product is high-risk
 * @returns {boolean} True if product is high-risk
 */
export function isHighRisk() {
    const project = getCurrentProject();
    return project?.compliance?.isHighRisk || false;
}

/**
 * Get compliance data summary
 * @returns {Object} Compliance data summary
 */
export function getComplianceSummary() {
    const project = getCurrentProject();
    if (!project) return {};
    
    return {
        isHighRisk: project.compliance?.isHighRisk || false,
        highRiskCategory: project.compliance?.highRiskCategory || '-',
        highRiskNotes: project.compliance?.highRiskNotes || '',
        conformityPath: project.compliance?.conformityPath || 'self',
        notifiedBody: project.compliance?.notifiedBody || '',
        requiresNotifiedBody: project.compliance?.conformityPath === 'notified'
    };
}

/**
 * Validate compliance data
 * @returns {Object} Validation result
 */
export function validateCompliance() {
    const project = getCurrentProject();
    if (!project) {
        return { isValid: false, errors: ['No project loaded'] };
    }
    
    const errors = [];
    
    // If notified body path is selected, notified body must be specified
    if (project.compliance?.conformityPath === 'notified' && 
        !project.compliance?.notifiedBody?.trim()) {
        errors.push(t('validation.notifiedbodyrequired', {}, 
            'Anmält organ måste anges när tredjepartsbedömning valts'));
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}
