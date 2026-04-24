/**
 * Life Phases and Risk Framework Management
 * Handles life phase selection and risk framework documentation
 */

import { getCurrentProject } from '../../state.js';
import { getProjectRepository } from '../../data/index.js';
import { t } from '../../i18n/index.js';
import { LIFE_PHASE_OPTIONS } from '../../config/constants.js';

/**
 * Initialize risk framework form
 */
export function initializeRiskFramework() {
    const project = getCurrentProject();
    if (!project) return;
    
    // Initialize risk framework if not exists
    if (!project.riskFramework) {
        project.riskFramework = {
            intendedUse: '',
            foreseeableMisuse: '',
            spaceLimitations: '',
            timeLimitations: '',
            otherLimitations: '',
            lifePhases: []
        };
    }
    
    loadRiskFrameworkData();
    setupRiskFrameworkEventListeners();
}

/**
 * Load risk framework data into form
 */
export function loadRiskFrameworkData() {
    const project = getCurrentProject();
    if (!project?.riskFramework) return;
    
    const rf = project.riskFramework;
    
    // Load text fields
    const intendedUseEl = document.getElementById('intendedUse');
    if (intendedUseEl) intendedUseEl.value = rf.intendedUse || '';
    
    const foreseeableMisuseEl = document.getElementById('foreseeableMisuse');
    if (foreseeableMisuseEl) foreseeableMisuseEl.value = rf.foreseeableMisuse || '';
    
    const spaceLimitationsEl = document.getElementById('spaceLimitations');
    if (spaceLimitationsEl) spaceLimitationsEl.value = rf.spaceLimitations || '';
    
    const timeLimitationsEl = document.getElementById('timeLimitations');
    if (timeLimitationsEl) timeLimitationsEl.value = rf.timeLimitations || '';
    
    const otherLimitationsEl = document.getElementById('otherLimitations');
    if (otherLimitationsEl) otherLimitationsEl.value = rf.otherLimitations || '';
    
    // Load life phase checkboxes
    const lifePhases = rf.lifePhases || [];
    LIFE_PHASE_OPTIONS.forEach(({ id, value }) => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.checked = lifePhases.includes(value);
        }
    });
}

/**
 * Setup event listeners for risk framework form
 */
function setupRiskFrameworkEventListeners() {
    // Text field listeners
    const fields = [
        'intendedUse',
        'foreseeableMisuse',
        'spaceLimitations',
        'timeLimitations',
        'otherLimitations'
    ];
    
    fields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.addEventListener('change', () => {
                updateRiskFrameworkField(fieldId, element.value);
            });
        }
    });
    
    // Life phase checkbox listeners
    LIFE_PHASE_OPTIONS.forEach(({ id, value }) => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.addEventListener('change', () => {
                updateLifePhase(value, checkbox.checked);
            });
        }
    });
}

/**
 * Update risk framework text field
 * @param {string} field - Field name
 * @param {string} value - New value
 */
export function updateRiskFrameworkField(field, value) {
    const project = getCurrentProject();
    if (!project) return;
    
    if (!project.riskFramework) {
        project.riskFramework = {
            intendedUse: '',
            foreseeableMisuse: '',
            spaceLimitations: '',
            timeLimitations: '',
            otherLimitations: '',
            lifePhases: []
        };
    }
    
    project.riskFramework[field] = value;
    
    // Migrate: Use new data layer
    (async () => {
        try {
            const repo = getProjectRepository();
            await repo.saveProject(project);
        } catch (error) {
            console.error('Error updating risk framework:', error);
        }
    })();
}

/**
 * Update life phase selection
 * @param {string} phase - Phase value
 * @param {boolean} checked - Whether checked
 */
export function updateLifePhase(phase, checked) {
    const project = getCurrentProject();
    if (!project) return;
    
    if (!project.riskFramework) {
        project.riskFramework = {
            intendedUse: '',
            foreseeableMisuse: '',
            spaceLimitations: '',
            timeLimitations: '',
            otherLimitations: '',
            lifePhases: []
        };
    }
    
    if (!project.riskFramework.lifePhases) {
        project.riskFramework.lifePhases = [];
    }
    
    const lifePhases = project.riskFramework.lifePhases;
    
    if (checked) {
        // Add phase if not already included
        if (!lifePhases.includes(phase)) {
            lifePhases.push(phase);
        }
    } else {
        // Remove phase
        const index = lifePhases.indexOf(phase);
        if (index > -1) {
            lifePhases.splice(index, 1);
        }
    }
    
    // Migrate: Use new data layer
    (async () => {
        try {
            const repo = getProjectRepository();
            await repo.saveProject(project);
        } catch (error) {
            console.error('Error updating life phases:', error);
        }
    })();
}

/**
 * Get selected life phases
 * @returns {Array} Array of selected life phase values
 */
export function getSelectedLifePhases() {
    const project = getCurrentProject();
    if (!project?.riskFramework?.lifePhases) {
        return [];
    }
    return project.riskFramework.lifePhases;
}

/**
 * Validate risk framework
 * @returns {boolean} True if valid
 */
export function validateRiskFramework() {
    const project = getCurrentProject();
    if (!project?.riskFramework) return false;
    
    const rf = project.riskFramework;
    
    // At minimum, intended use should be filled
    if (!rf.intendedUse || rf.intendedUse.trim() === '') {
        return false;
    }
    
    // At least one life phase should be selected
    if (!rf.lifePhases || rf.lifePhases.length === 0) {
        return false;
    }
    
    return true;
}

/**
 * Get risk framework summary
 * @returns {Object} Summary object
 */
export function getRiskFrameworkSummary() {
    const project = getCurrentProject();
    if (!project?.riskFramework) {
        return {
            hasIntendedUse: false,
            hasMisuse: false,
            hasLimitations: false,
            lifePhasesCount: 0,
            isComplete: false
        };
    }
    
    const rf = project.riskFramework;
    
    const hasIntendedUse = !!(rf.intendedUse && rf.intendedUse.trim());
    const hasMisuse = !!(rf.foreseeableMisuse && rf.foreseeableMisuse.trim());
    const hasLimitations = !!(
        (rf.spaceLimitations && rf.spaceLimitations.trim()) ||
        (rf.timeLimitations && rf.timeLimitations.trim()) ||
        (rf.otherLimitations && rf.otherLimitations.trim())
    );
    const lifePhasesCount = rf.lifePhases?.length || 0;
    const isComplete = hasIntendedUse && lifePhasesCount > 0;
    
    return {
        hasIntendedUse,
        hasMisuse,
        hasLimitations,
        lifePhasesCount,
        isComplete
    };
}

// Expose functions globally if needed
if (typeof window !== 'undefined') {
    window.updateRiskFrameworkField = updateRiskFrameworkField;
    window.updateLifePhase = updateLifePhase;
}
