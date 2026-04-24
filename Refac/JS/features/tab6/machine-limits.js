/**
 * Machine Categories and Limits Management
 * Handles machine category checkboxes and machine limits documentation
 */

import { getCurrentProject } from '../../state.js';
import { getProjectRepository } from '../../data/index.js';
import { t } from '../../i18n/index.js';

/**
 * Initialize machine categories form
 */
export function initializeMachineCategories() {
    const project = getCurrentProject();
    if (!project) return;
    
    // Initialize machine categories if not exists
    if (!project.machineCategories) {
        project.machineCategories = {
            foodMachine: false,
            handheldMachine: false,
            mobileMachine: false,
            liftingFunction: false
        };
    }
    
    loadMachineCategoriesData();
    setupMachineCategoriesEventListeners();
}

/**
 * Load machine categories data into form
 */
export function loadMachineCategoriesData() {
    const project = getCurrentProject();
    if (!project?.machineCategories) return;
    
    const mc = project.machineCategories;
    
    const foodMachineEl = document.getElementById('foodMachine');
    if (foodMachineEl) foodMachineEl.checked = mc.foodMachine || false;
    
    const handheldMachineEl = document.getElementById('handheldMachine');
    if (handheldMachineEl) handheldMachineEl.checked = mc.handheldMachine || false;
    
    const mobileMachineEl = document.getElementById('mobileMachine');
    if (mobileMachineEl) mobileMachineEl.checked = mc.mobileMachine || false;
    
    const liftingFunctionEl = document.getElementById('liftingFunction');
    if (liftingFunctionEl) liftingFunctionEl.checked = mc.liftingFunction || false;
}

/**
 * Setup event listeners for machine categories
 */
function setupMachineCategoriesEventListeners() {
    const categories = [
        'foodMachine',
        'handheldMachine',
        'mobileMachine',
        'liftingFunction'
    ];
    
    categories.forEach(categoryId => {
        const checkbox = document.getElementById(categoryId);
        if (checkbox) {
            checkbox.addEventListener('change', () => {
                updateMachineCategory(categoryId, checkbox.checked);
            });
        }
    });
}

/**
 * Update machine category
 * @param {string} category - Category name
 * @param {boolean} value - Checkbox value
 */
export function updateMachineCategory(category, value) {
    const project = getCurrentProject();
    if (!project) return;
    
    if (!project.machineCategories) {
        project.machineCategories = {
            foodMachine: false,
            handheldMachine: false,
            mobileMachine: false,
            liftingFunction: false
        };
    }
    
    project.machineCategories[category] = value;
    
    // Migrate: Use new data layer
    (async () => {
        try {
            const repo = getProjectRepository();
            await repo.saveProject(project);
        } catch (error) {
            console.error('Error updating machine category:', error);
        }
    })();
}

/**
 * Get selected machine categories
 * @returns {Array} Array of selected category names
 */
export function getSelectedMachineCategories() {
    const project = getCurrentProject();
    if (!project?.machineCategories) {
        return [];
    }
    
    const mc = project.machineCategories;
    const selected = [];
    
    if (mc.foodMachine) selected.push('foodMachine');
    if (mc.handheldMachine) selected.push('handheldMachine');
    if (mc.mobileMachine) selected.push('mobileMachine');
    if (mc.liftingFunction) selected.push('liftingFunction');
    
    return selected;
}

/**
 * Initialize machine limits form
 */
export function initializeMachineLimits() {
    const project = getCurrentProject();
    if (!project) return;
    
    // Machine limits are part of riskFramework
    // Already initialized in life-phases.js
    
    setupMachineLimitsEventListeners();
}

/**
 * Setup event listeners for machine limits
 */
function setupMachineLimitsEventListeners() {
    const limitFields = [
        'spaceLimitations',
        'timeLimitations',
        'otherLimitations'
    ];
    
    limitFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.addEventListener('change', () => {
                updateMachineLimit(fieldId, element.value);
            });
        }
    });
}

/**
 * Update machine limit field
 * @param {string} field - Field name
 * @param {string} value - New value
 */
export function updateMachineLimit(field, value) {
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
            console.error('Error updating machine limit:', error);
        }
    })();
}

/**
 * Get machine categories summary
 * @returns {Object} Summary object
 */
export function getMachineCategoriesSummary() {
    const project = getCurrentProject();
    if (!project?.machineCategories) {
        return {
            categories: [],
            count: 0
        };
    }
    
    const selected = getSelectedMachineCategories();
    
    return {
        categories: selected,
        count: selected.length
    };
}

// Expose functions globally if needed
if (typeof window !== 'undefined') {
    window.updateMachineCategory = updateMachineCategory;
    window.updateMachineLimit = updateMachineLimit;
}
