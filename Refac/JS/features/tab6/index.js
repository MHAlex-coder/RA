/**
 * Tab 6 - Machine Categories and Limits
 * Main coordinator for machine categories and limitations
 */

import { getCurrentProject } from '../../state.js';
import { t } from '../../i18n/index.js';

// Import machine categories and limits management
import {
    initializeMachineCategories,
    loadMachineCategoriesData,
    updateMachineCategory,
    getSelectedMachineCategories,
    getMachineCategoriesSummary,
    initializeMachineLimits,
    updateMachineLimit
} from './machine-limits.js';

/**
 * Initialize Tab 6 - Machine Categories and Limits
 */
export function initializeTab6() {
    console.log('Initializing Tab 6 - Machine Categories and Limits');
    
    const project = getCurrentProject();
    if (!project) {
        console.warn('No project loaded for Tab 6');
        return;
    }
    
    // Initialize machine categories
    initializeMachineCategories();
    
    // Initialize machine limits
    initializeMachineLimits();
}

/**
 * Load Tab 6 data
 */
export function loadTab6Data() {
    const project = getCurrentProject();
    if (!project) return;
    
    console.log('Loading Tab 6 data');
    loadMachineCategoriesData();
}

/**
 * Validate Tab 6 data
 * @returns {boolean} - True if valid
 */
export function validateTab6() {
    // Machine categories and limits are optional, so always valid
    return true;
}

// Export all functions
export {
    // Machine categories
    initializeMachineCategories,
    loadMachineCategoriesData,
    updateMachineCategory,
    getSelectedMachineCategories,
    getMachineCategoriesSummary,
    
    // Machine limits
    initializeMachineLimits,
    updateMachineLimit
};
