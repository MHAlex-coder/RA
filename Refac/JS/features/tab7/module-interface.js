/**
 * Module and Interface Management
 * Handles module/interface designation and purchased machines
 */

import { getCurrentProject } from '../../state.js';
import { t } from '../../i18n/index.js';

/**
 * Initialize module/interface form
 */
export function initializeModuleInterface() {
    const project = getCurrentProject();
    if (!project) return;
    
    loadModuleInterfaceData();
    setupModuleInterfaceEventListeners();
}

/**
 * Load module/interface data into form
 */
export function loadModuleInterfaceData() {
    const project = getCurrentProject();
    if (!project) return;
    
    const isModuleEl = document.getElementById('isModuleOrInterface');
    if (isModuleEl) {
        isModuleEl.checked = project.isModuleOrInterface || false;
    }
    
    const showSeparatelyEl = document.getElementById('showModuleSeparately');
    if (showSeparatelyEl) {
        showSeparatelyEl.checked = project.showModuleSeparately || false;
    }
    
    const motivationEl = document.getElementById('moduleMotivation');
    if (motivationEl) {
        motivationEl.value = project.moduleMotivation || '';
    }
    
    // Show/hide conditional fields
    updateModuleInterfaceVisibility();
}

/**
 * Setup event listeners for module/interface form
 */
function setupModuleInterfaceEventListeners() {
    const isModuleEl = document.getElementById('isModuleOrInterface');
    if (isModuleEl) {
        isModuleEl.addEventListener('change', () => {
            updateModuleInterface('isModuleOrInterface', isModuleEl.checked);
            updateModuleInterfaceVisibility();
        });
    }
    
    const showSeparatelyEl = document.getElementById('showModuleSeparately');
    if (showSeparatelyEl) {
        showSeparatelyEl.addEventListener('change', () => {
            updateModuleInterface('showModuleSeparately', showSeparatelyEl.checked);
        });
    }
    
    const motivationEl = document.getElementById('moduleMotivation');
    if (motivationEl) {
        motivationEl.addEventListener('change', () => {
            updateModuleInterface('moduleMotivation', motivationEl.value);
        });
    }
}

/**
 * Update module/interface field
 * @param {string} field - Field name
 * @param {any} value - New value
 */
export function updateModuleInterface(field, value) {
    const project = getCurrentProject();
    if (!project) return;
    
    project[field] = value;
    
    // Save project
    (async () => {
        try {
            const repo = getProjectRepository();
            await repo.saveProject(project);
        } catch (error) {
            console.error('Error updating module/interface field:', error);
        }
    })();
}

/**
 * Update visibility of conditional module/interface fields
 */
export function updateModuleInterfaceVisibility() {
    const project = getCurrentProject();
    const isModule = project?.isModuleOrInterface || false;
    
    const motivationGroup = document.getElementById('moduleMotivationGroup');
    const separateGroup = document.getElementById('moduleSeparateGroup');
    
    if (motivationGroup) {
        motivationGroup.style.display = isModule ? 'block' : 'none';
    }
    
    if (separateGroup) {
        separateGroup.style.display = isModule ? 'block' : 'none';
    }
}

/**
 * Get module/interface status
 * @returns {Object} Status object
 */
export function getModuleInterfaceStatus() {
    const project = getCurrentProject();
    
    return {
        isModule: project?.isModuleOrInterface || false,
        showSeparately: project?.showModuleSeparately || false,
        hasMotivation: !!(project?.moduleMotivation && project.moduleMotivation.trim())
    };
}

// Expose functions globally if needed
if (typeof window !== 'undefined') {
    window.updateModuleInterface = updateModuleInterface;
}
