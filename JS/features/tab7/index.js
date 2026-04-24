/**
 * Tab 7 - Module/Interface and Purchased Machines
 * Main coordinator for module designation and purchased machines
 */

import { getCurrentProject } from '../../state.js';
import { t } from '../../i18n/index.js';
import { getProjectRepository } from '../../data/index.js';
import { loadProjectDataToForm } from '../project/project-load.js';
import { loadTab1Data } from '../tab1/index.js';
import { loadTab2Data } from '../tab2/index.js';
import { loadTab3Data } from '../tab3/index.js';
import { loadTab4Data } from '../tab4/index.js';
import { loadTab5Data } from '../tab5/index.js';
import { loadTab6Data } from '../tab6/index.js';

// Import module/interface management
import {
    initializeModuleInterface,
    loadModuleInterfaceData,
    updateModuleInterface,
    updateModuleInterfaceVisibility,
    getModuleInterfaceStatus
} from './module-interface.js';

// Import purchased machines management
import {
    openPurchasedMachineModal,
    closePurchasedMachineModal,
    savePurchasedMachine,
    editPurchasedMachine,
    removePurchasedMachine,
    renderObjectsList,
    updateCEStatus
} from './purchased-machines.js';

/**
 * Initialize Tab 7 - Module/Interface and Purchased Machines
 */
export function initializeTab7() {
    console.log('Initializing Tab 7 - Module/Interface and Purchased Machines');
    
    const project = getCurrentProject();
    if (!project) {
        console.warn('No project loaded for Tab 7');
        return;
    }
    
    // Initialize module/interface
    initializeModuleInterface();
    
    // Initialize objects list
    initializeObjectsList();
    
    // Render objects list
    renderObjectsList();
}

// Store handler references to prevent duplicates
const importModuleHandler = () => importModule();
const openPurchasedHandler = () => openPurchasedMachineModal();

// Track if already initialized
let objectsListInitialized = false;

/**
 * Initialize objects list
 */
function initializeObjectsList() {
    if (objectsListInitialized) {
        console.log('⚠️ initializeObjectsList already called, skipping');
        return;
    }
    
    console.log('🔧 initializeObjectsList() called');
    const addObjectBtn = document.getElementById('add-object-btn');
    const addPurchasedBtn = document.getElementById('add-purchased-machine-btn');
    
    console.log('add-object-btn element:', addObjectBtn);
    
    if (addObjectBtn) {
        addObjectBtn.addEventListener('click', importModuleHandler);
        console.log('✅ Event listener attached to add-object-btn');
    }
    
    if (addPurchasedBtn) {
        addPurchasedBtn.addEventListener('click', openPurchasedHandler);
    }
    
    objectsListInitialized = true;
}

// Prevent double-invocation of module import
let isImportingModule = false;

/**
 * Import module from saved risk assessment (.hra file)
 */
export function importModule() {
    console.log('🔴 importModule() called - isImportingModule:', isImportingModule);
    
    if (isImportingModule) {
        console.warn('⚠️ Module import already in progress, BLOCKED');
        return;
    }
    
    isImportingModule = true;
    console.log('✅ Setting isImportingModule = true');
    console.log('importModule() called');
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.hra,application/json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            isImportingModule = false;
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const projectData = JSON.parse(event.target.result);
                
                // Validate that it's a valid project
                if (!projectData.productData || !projectData.productData.productName) {
                    alert(t('module.invalid_file', {}, 'Ogiltig modulfil - saknar produktnamn'));
                    return;
                }
                
                const project = getCurrentProject();
                
                // Initialize modules array if it doesn't exist
                if (!project.modules) {
                    project.modules = [];
                }
                
                // Check if module already imported
                const moduleKey = `${projectData.productData.productName}_${projectData.productData.model || 'nomodel'}`;
                const exists = project.modules.some(m => {
                    const existingKey = `${m.productName}_${m.model || 'nomodel'}`;
                    if (projectData.id && m.id && m.id === projectData.id) return true;
                    return existingKey === moduleKey;
                });
                
                if (exists) {
                    const confirmReplace = confirm(t('module.replace_confirm', {}, 'En modul med samma namn är redan importerad. Vill du ersätta den?'));
                    if (!confirmReplace) return;
                    
                    // Remove old module
                    const indexToRemove = project.modules.findIndex(m => {
                        const existingKey = `${m.productName}_${m.model || 'nomodel'}`;
                        return existingKey === moduleKey;
                    });
                    if (indexToRemove >= 0) {
                        project.modules.splice(indexToRemove, 1);
                    }
                }
                
                // Add module
                const module = {
                    id: projectData.id || Date.now().toString(),
                    productName: projectData.productData.productName,
                    model: projectData.productData.model,
                    revision: projectData.revision || '1.0',
                    importedDate: new Date().toISOString(),
                    fullData: projectData // Save entire project for later reference
                };
                
                project.modules.push(module);
                
                // Save project
                (async () => {
                    try {
                        const repo = getProjectRepository();
                        await repo.saveProject(project);
                    } catch (error) {
                        console.error('Error saving imported module:', error);
                    }
                })();
                
                // Render objects list
                renderObjectsList();
                
                alert(`✓ ${t('module.import_success', {name: module.productName}, 'Modul importerad!')}`);
                console.log('Module imported:', module);
                
            } catch (error) {
                console.error('Import error:', error);
                alert(t('module.import_error', {}, 'Fel vid import av modul: ') + error.message);
            } finally {
                isImportingModule = false;
            }
        };
        
        reader.readAsText(file);
    };
    
    input.oncancel = () => {
        isImportingModule = false;
    };
    
    input.click();
}

/**
 * Toggle module view
 * @param {number} index - Module index
 */
export function toggleModuleView(index) {
    const project = getCurrentProject();
    if (!project?.modules) return;
    
    const module = project.modules[index];
    if (!module) return;
    
    // Toggle viewing state
    if (!project.moduleDataLoaded) {
        project.moduleDataLoaded = {};
    }
    
    if (project.moduleDataLoaded.moduleIndex === index) {
        // Close view - restore main project data
        closeModuleDataView();
    } else {
        // Open view - save main project state and show module data
        // Store a copy of current project state for later restoration
        if (!project.moduleDataLoaded.savedProjectState) {
            project.moduleDataLoaded.savedProjectState = JSON.parse(JSON.stringify(project));
        }
        
        project.moduleDataLoaded.moduleIndex = index;
        project.moduleDataLoaded.moduleData = module;
        
        // Show module data in all tabs (don't switch tab)
        displayModuleData(module, index);
    }
    
    // Update UI
    renderObjectsList();
}

/**
 * Fill form fields with module data and make them readonly
 * @param {Object} module - Module data
 */
function fillFormWithModuleData(module) {
    // Use fullData if available, otherwise use module properties
    const moduleData = module.fullData || module;
    
    // Helper function to set field value and make readonly
    const setFieldValue = (selector, value) => {
        const elem = document.querySelector(selector);
        if (elem) {
            elem.value = value || '';
            elem.readOnly = true;
            elem.disabled = false;
            elem.style.backgroundColor = '#f0f0f0';
        }
    };
    
    // Fill produktdata
    if (moduleData.productData) {
        setFieldValue('#orderNumber', moduleData.productData.orderNumber || '');
        setFieldValue('#projectNumber', moduleData.productData.projectNumber || '');
        setFieldValue('#productType', moduleData.productData.productType || '');
        setFieldValue('#productName', moduleData.productData.productName || '');
        setFieldValue('#model', moduleData.productData.model || '');
        setFieldValue('#serialNumber', moduleData.productData.serialNumber || '');
        setFieldValue('#productionYear', moduleData.productData.productionYear || '');
        setFieldValue('#description', moduleData.productData.description || '');
    }
    
    // Fill manufacturer data
    if (moduleData.manufacturer) {
        setFieldValue('#companyName', moduleData.manufacturer.companyName || '');
        setFieldValue('#address', moduleData.manufacturer.address || '');
        setFieldValue('#postalCode', moduleData.manufacturer.postalCode || '');
        setFieldValue('#city', moduleData.manufacturer.city || '');
        setFieldValue('#country', moduleData.manufacturer.country || '');
        setFieldValue('#email', moduleData.manufacturer.email || '');
        setFieldValue('#phone', moduleData.manufacturer.phone || '');
        setFieldValue('#responsible', moduleData.manufacturer.responsible || '');
        setFieldValue('#responsibleFunction', moduleData.manufacturer.responsibleFunction || '');
    }
    
    // Set directive (if it's a select dropdown)
    const directiveSelect = document.querySelector('[name="directive"], #directive');
    if (directiveSelect && moduleData.selectedDirective) {
        directiveSelect.value = moduleData.selectedDirective;
        directiveSelect.readOnly = true;
        directiveSelect.disabled = true;
        directiveSelect.style.backgroundColor = '#f0f0f0';
    }
}

/**
 * Make all form fields readonly
 */
function makeAllFieldsReadonly() {
    // Only make fields in tab-content areas readonly, not navigation
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tabContent => {
        const inputs = tabContent.querySelectorAll('input, select, textarea, button');
        inputs.forEach(elem => {
            if (elem.tagName === 'BUTTON') {
                elem.disabled = true;
            } else if (elem.type === 'checkbox' || elem.type === 'radio') {
                // Disable checkboxes and radio buttons
                elem.disabled = true;
                elem.style.opacity = '0.6';
                elem.style.cursor = 'not-allowed';
            } else {
                elem.readOnly = true;
                if (elem.tagName === 'SELECT') {
                    elem.disabled = true;
                }
                elem.style.backgroundColor = '#f0f0f0';
            }
        });
    });
    
    // Add a flag to prevent event handlers from changing fields
    document.body.setAttribute('data-module-viewing', 'true');
}

/**
 * Make all form fields editable
 */
function makeAllFieldsEditable() {
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tabContent => {
        const inputs = tabContent.querySelectorAll('input, select, textarea, button');
        inputs.forEach(elem => {
            elem.readOnly = false;
            elem.disabled = false;
            elem.style.backgroundColor = '';
            elem.style.opacity = '';
            elem.style.cursor = '';
        });
    });
    
    // Remove the viewing flag
    document.body.removeAttribute('data-module-viewing');
}

/**
 * Display module data by loading full module project
 * @param {Object} module - Module data to display
 * @param {number} index - Module index
 */
export function displayModuleData(module, index) {
    const project = getCurrentProject();
    const moduleData = module.fullData || module;
    
    // Temporarily replace project data with module data
    Object.keys(moduleData).forEach(key => {
        if (key !== 'modules' && key !== 'moduleDataLoaded') {
            project[key] = JSON.parse(JSON.stringify(moduleData[key]));
        }
    });
    
    // Reload all tabs with module data
    loadProjectDataToForm();
    loadTab1Data(project);
    loadTab2Data();
    loadTab3Data();
    loadTab4Data();
    loadTab5Data();
    loadTab6Data();
    loadTab7Data();
    
    // Make all form fields readonly
    makeAllFieldsReadonly();
}

/**
 * Close module data view and restore main project data
 */
export function closeModuleDataView() {
    const project = getCurrentProject();
    
    // Restore main project state from saved copy
    if (project && project.moduleDataLoaded?.savedProjectState) {
        const savedState = project.moduleDataLoaded.savedProjectState;
        
        // Copy back all data from saved state
        Object.keys(savedState).forEach(key => {
            if (key !== 'modules' && key !== 'moduleDataLoaded') {
                project[key] = JSON.parse(JSON.stringify(savedState[key]));
            }
        });
    }
    
    // Clear module viewing state
    if (project) {
        project.moduleDataLoaded = {
            moduleIndex: null,
            moduleData: null,
            savedProjectState: null
        };
    }
    
    // Reload all tabs with main project data
    loadProjectDataToForm();
    loadTab1Data(project);
    loadTab2Data();
    loadTab3Data();
    loadTab4Data();
    loadTab5Data();
    loadTab6Data();
    loadTab7Data();
    
    // Make all form fields editable again
    makeAllFieldsEditable();
    
    // Update UI
    renderObjectsList();
}

/**
 * Restore main project data to form fields
 */
function restoreMainProjectData() {
    const project = getCurrentProject();
    
    // Helper function to set field value and make editable
    const setFieldValue = (selector, value) => {
        const elem = document.querySelector(selector);
        if (elem) {
            elem.value = value || '';
            elem.readOnly = false;
            elem.disabled = false;
            elem.style.backgroundColor = '';
        }
    };
    
    // Restore produktdata
    if (project.productData) {
        setFieldValue('#orderNumber', project.productData.orderNumber || '');
        setFieldValue('#projectNumber', project.productData.projectNumber || '');
        setFieldValue('#productType', project.productData.productType || '');
        setFieldValue('#productName', project.productData.productName || '');
        setFieldValue('#model', project.productData.model || '');
        setFieldValue('#serialNumber', project.productData.serialNumber || '');
        setFieldValue('#productionYear', project.productData.productionYear || '');
        setFieldValue('#description', project.productData.description || '');
    }
    
    // Restore manufacturer data
    if (project.manufacturer) {
        setFieldValue('#companyName', project.manufacturer.companyName || '');
        setFieldValue('#address', project.manufacturer.address || '');
        setFieldValue('#postalCode', project.manufacturer.postalCode || '');
        setFieldValue('#city', project.manufacturer.city || '');
        setFieldValue('#country', project.manufacturer.country || '');
        setFieldValue('#email', project.manufacturer.email || '');
        setFieldValue('#phone', project.manufacturer.phone || '');
        setFieldValue('#responsible', project.manufacturer.responsible || '');
        setFieldValue('#responsibleFunction', project.manufacturer.responsibleFunction || '');
    }
    
    // Restore directive
    const directiveSelect = document.querySelector('[name="directive"], #directive');
    if (directiveSelect && project.selectedDirective) {
        directiveSelect.value = project.selectedDirective;
        directiveSelect.readOnly = false;
        directiveSelect.disabled = false;
        directiveSelect.style.backgroundColor = '';
    }
}

/**
 * Remove module
 * @param {number} index - Module index
 */
export function removeModule(index) {
    const project = getCurrentProject();
    if (!project?.modules) return;
    
    if (!confirm(t('message.confirm', {}, 'Är du säker?'))) return;
    
    project.modules.splice(index, 1);
    
    // Save project
    (async () => {
        try {
            const repo = getProjectRepository();
            await repo.saveProject(project);
        } catch (error) {
            console.error('Error deleting module:', error);
        }
    })();
    
    // Update UI
    renderObjectsList();
}

/**
 * Load Tab 7 data
 */
export function loadTab7Data() {
    const project = getCurrentProject();
    if (!project) return;
    
    console.log('Loading Tab 7 data');
    loadModuleInterfaceData();
    renderObjectsList();
}

/**
 * Validate Tab 7 data
 * @returns {boolean} - True if valid
 */
export function validateTab7() {
    // Tab 7 is optional, so always valid
    return true;
}

// Export all functions
export {
    // Module/Interface
    initializeModuleInterface,
    loadModuleInterfaceData,
    updateModuleInterface,
    updateModuleInterfaceVisibility,
    getModuleInterfaceStatus,
    
    // Purchased machines
    openPurchasedMachineModal,
    closePurchasedMachineModal,
    savePurchasedMachine,
    editPurchasedMachine,
    removePurchasedMachine,
    renderObjectsList,
    updateCEStatus,
    
    // Modules (exported above as named exports)
};

// Window exports handled by event listeners in main.js
