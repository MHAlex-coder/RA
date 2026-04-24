/**
 * Tab 1 - Technical Documentation
 * Main module that coordinates all Tab 1 features
 */

import { initializeProductDataForm, loadProductData } from './product-data.js';
import { initializeManufacturerForm, loadManufacturerData } from './manufacturer.js';
import { initializeDirectives, loadDirectives } from './directives.js';
import { initializeStandards, loadStandards } from './standards.js';
import { initializeCompliance, loadComplianceData } from './compliance.js';
import { initializeDigitalSafety, loadDigitalSafetyData, updateCybersecurityVisibility } from './digital-safety.js';
import { getCurrentProject } from '../../state.js';
import { getProjectRepository } from '../../data/index.js';
import { t } from '../../i18n/index.js';

/**
 * Initialize all Tab 1 forms and event listeners
 */
export function initializeTab1() {
    console.log('Initializing Tab 1...');
    
    // Initialize all submodules
    initializeProductDataForm();
    initializeManufacturerForm();
    initializeDirectives();
    initializeStandards();
    
    console.log('About to initialize compliance...');
    try {
        console.log('Calling initializeCompliance...');
        initializeCompliance();
        console.log('initializeCompliance returned successfully');
    } catch (error) {
        console.error('❌ Error initializing compliance:', error);
        console.error('Error stack:', error.stack);
    }
    
    initializeDigitalSafety();
    
    // Initialize module/interface checkbox
    initializeModuleInterface();
    
    // Save project button
    const saveProjectBtn = document.getElementById('saveProjectBtn');
    if (saveProjectBtn) {
        saveProjectBtn.addEventListener('click', saveCurrentProject);
    }
    
    console.log('✓ Tab 1 fully initialized');
}

/**
 * Load Tab 1 data from project
 * @param {Object} project - Project object
 */
export function loadTab1Data(project) {
    if (!project) return;
    
    loadProductData(project);
    loadManufacturerData(project);
    loadDirectives(project);
    loadStandards(project);
    loadComplianceData(project);
    loadDigitalSafetyData(project);
    loadModuleInterfaceData(project);
    
    // Update UI states
    updateCybersecurityVisibility();
}

/**
 * Initialize module/interface checkbox handling
 */
function initializeModuleInterface() {
    const isModuleCheckbox = document.getElementById('isModuleOrInterface');
    const motivationGroup = document.getElementById('moduleMotivationGroup');
    const separateGroup = document.getElementById('moduleSeparateGroup');
    const showModuleSeparately = document.getElementById('showModuleSeparately');
    
    if (isModuleCheckbox) {
        isModuleCheckbox.addEventListener('change', (e) => {
            if (motivationGroup) {
                motivationGroup.style.display = e.target.checked ? 'block' : 'none';
            }
            if (separateGroup) {
                separateGroup.style.display = e.target.checked ? 'block' : 'none';
            }
            if (!e.target.checked) {
                const motivationInput = document.getElementById('moduleMotivation');
                if (motivationInput) motivationInput.value = '';
                if (showModuleSeparately) showModuleSeparately.checked = false;
            }
            updateModuleInterfaceData();
        });
    }
    
    const motivationInput = document.getElementById('moduleMotivation');
    if (motivationInput) {
        motivationInput.addEventListener('change', updateModuleInterfaceData);
    }
    
    if (showModuleSeparately) {
        showModuleSeparately.addEventListener('change', updateModuleInterfaceData);
    }
}

/**
 * Load module/interface data
 * @param {Object} project - Project object
 */
function loadModuleInterfaceData(project) {
    if (!project) return;
    
    const isModuleCheckbox = document.getElementById('isModuleOrInterface');
    const showModuleSeparately = document.getElementById('showModuleSeparately');
    const motivationInput = document.getElementById('moduleMotivation');
    const motivationGroup = document.getElementById('moduleMotivationGroup');
    const separateGroup = document.getElementById('moduleSeparateGroup');
    
    if (isModuleCheckbox) {
        isModuleCheckbox.checked = project.isModuleOrInterface || false;
    }
    
    if (showModuleSeparately) {
        showModuleSeparately.checked = project.showModuleSeparately || false;
    }
    
    if (motivationInput) {
        motivationInput.value = project.moduleMotivation || '';
    }
    
    // Update visibility
    const isModule = project.isModuleOrInterface || false;
    if (motivationGroup) {
        motivationGroup.style.display = isModule ? 'block' : 'none';
    }
    if (separateGroup) {
        separateGroup.style.display = isModule ? 'block' : 'none';
    }
}

/**
 * Update module/interface data from form
 */
function updateModuleInterfaceData() {
    const project = getCurrentProject();
    if (!project) return;
    
    project.isModuleOrInterface = document.getElementById('isModuleOrInterface')?.checked || false;
    project.showModuleSeparately = document.getElementById('showModuleSeparately')?.checked || false;
    project.moduleMotivation = document.getElementById('moduleMotivation')?.value || '';
    
    project.meta.lastModified = new Date().toISOString();
}

/**
 * Save current project
 */
async function saveCurrentProject() {
    try {
        const project = getCurrentProject();
        if (!project) {
            alert(t('error.noproject', {}, 'Inget projekt laddat'));
            return;
        }
        
        // Validate module motivation if required
        if (project.isModuleOrInterface && !project.moduleMotivation?.trim()) {
            alert(t('validation.motivationrequired', {}, 
                'Motivering krävs när "Modul eller interface" är vald!'));
            return;
        }
        
        // Save to storage
        const repo = getProjectRepository();
        await repo.saveProject(project);
        
        alert(t('message.projectsaved', {}, '✓ Projektet har sparats!'));
        console.log('Project saved:', project);
        
    } catch (error) {
        console.error('Error saving project:', error);
        alert(t('error.savefailed', {}, '✗ Fel vid sparande av projekt: ') + error.message);
    }
}

/**
 * Validate all Tab 1 data
 * @returns {Object} Validation result with isValid and errors array
 */
export function validateTab1() {
    const project = getCurrentProject();
    if (!project) {
        return { isValid: false, errors: ['No project loaded'] };
    }
    
    const errors = [];
    
    // Validate product data
    if (!project.productData?.productName?.trim()) {
        errors.push(t('validation.productnamerequired', {}, 'Produktnamn måste anges'));
    }
    
    if (!project.productData?.projectNumber?.trim()) {
        errors.push(t('validation.projectnumberrequired', {}, 'Projektnummer måste anges'));
    }
    
    // Validate manufacturer data
    if (!project.manufacturer?.companyName?.trim()) {
        errors.push(t('validation.companynamerequired', {}, 'Företagsnamn måste anges'));
    }
    
    if (!project.manufacturer?.address?.trim()) {
        errors.push(t('validation.addressrequired', {}, 'Adress måste anges'));
    }
    
    // Validate directive selection
    if (!project.selectedDirective?.trim()) {
        errors.push(t('validation.directiverequired', {}, 'Minst ett huvudregelverket måste väljas'));
    }
    
    // Validate module motivation
    if (project.isModuleOrInterface && !project.moduleMotivation?.trim()) {
        errors.push(t('validation.modulemotivationrequired', {}, 
            'Motivering krävs när "Modul eller interface" är vald'));
    }
    
    // Validate partially applied standards
    project.standards?.forEach((std, index) => {
        if (std.partiallyApplied && !std.motivation?.trim()) {
            errors.push(t('validation.standardmotivationrequired', { number: std.number }, 
                `Motivering krävs för delvis tillämpad standard ${std.number}`));
        }
    });
    
    // Validate compliance if notified body path
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
