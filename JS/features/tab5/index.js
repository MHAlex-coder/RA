/**
 * Tab 5 - Risk Framework
 * Main coordinator for risk framework and life phases
 */

import { getCurrentProject } from '../../state.js';
import { t } from '../../i18n/index.js';

// Import life phases management
import {
    initializeRiskFramework,
    loadRiskFrameworkData,
    updateRiskFrameworkField,
    updateLifePhase,
    getSelectedLifePhases,
    validateRiskFramework,
    getRiskFrameworkSummary
} from './life-phases.js';

/**
 * Initialize Tab 5 - Risk Framework
 */
export function initializeTab5() {
    console.log('Initializing Tab 5 - Risk Framework');
    
    const project = getCurrentProject();
    if (!project) {
        console.warn('No project loaded for Tab 5');
        return;
    }
    
    // Initialize risk framework
    initializeRiskFramework();
}

/**
 * Load Tab 5 data
 */
export function loadTab5Data() {
    const project = getCurrentProject();
    if (!project) return;
    
    console.log('Loading Tab 5 data');
    loadRiskFrameworkData();
}

/**
 * Validate Tab 5 data
 * @returns {boolean} - True if valid
 */
export function validateTab5() {
    return validateRiskFramework();
}

// Export all functions
export {
    // Life phases
    initializeRiskFramework,
    loadRiskFrameworkData,
    updateRiskFrameworkField,
    updateLifePhase,
    getSelectedLifePhases,
    validateRiskFramework,
    getRiskFrameworkSummary
};
