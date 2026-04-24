/**
 * Auto-save and Project Update Management
 * Handles auto-save setup and project updates from form fields
 */

import { getCurrentProject } from '../../state.js';
import { getProjectRepository } from '../../data/index.js';
import { LIFE_PHASE_OPTIONS, DIRECTIVE_OPTIONS } from '../../config/constants.js';
import { t } from '../../i18n/index.js';

/**
 * Setup auto-save for key form fields
 */
export function setupAutoSave() {
    const fields = [
        'orderNumber', 'projectNumber', 'productType', 'productName', 'model', 'serialNumber',
        'batchNumber', 'machineNumber', 'functionDescription',
        'companyName', 'address', 'contactInfo', 'docSignatory', 'technicalFileResponsible',
        'intendedUse', 'foreseeableMisuse', 'spaceLimitations', 'timeLimitations', 'otherLimitations',
        'moduleMotivation',
        'highRiskCustom', 'highRiskNotes', 'complianceNotifiedBody',
        'softwareVersion', 'updatePolicy', 'cybersecurityMeasures', 'aiSafetyFunctions',
        'digitalInstructions', 'loggingTraceability'
    ];
    
    fields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.addEventListener('change', () => updateProjectFromForm());
        }
    });
    
    const checkboxes = [
        'machineryDirective2006', 'machineryRegulation2023', 'lvd', 'rohs',
        'foodMachine', 'handheldMachine', 'mobileMachine', 'liftingFunction',
        'isModuleOrInterface', 'isPartlyCompleted', 'showModuleSeparately',
        'lifephase-manufacturing', 'lifephase-transport', 'lifephase-commissioning',
        'lifephase-setup', 'lifephase-operation', 'lifephase-cleaning',
        'lifephase-troubleshooting', 'lifephase-maintenance', 'lifephase-decommissioning'
    ];
    
    checkboxes.forEach(checkboxId => {
        const element = document.getElementById(checkboxId);
        if (element) {
            element.addEventListener('change', () => updateProjectFromForm());
        }
    });
}

/**
 * Update project data from form fields
 */
export function updateProjectFromForm() {
    const project = getCurrentProject();
    if (!project) return;
    
    // Product data
    if (!project.productData) project.productData = {};
    project.productData.orderNumber = document.getElementById('orderNumber')?.value || '';
    project.productData.projectNumber = document.getElementById('projectNumber')?.value || '';
    project.productData.productType = document.getElementById('productType')?.value || '';
    project.productData.productName = document.getElementById('productName')?.value || '';
    project.productData.isPartlyCompleted = document.getElementById('isPartlyCompleted')?.checked || false;
    
    // Update sidebar with Project Nr
    if (project.productData.projectNumber && typeof window.updateProjectName === 'function') {
        window.updateProjectName(project.productData.projectNumber);
    }
    
    project.productData.model = document.getElementById('model')?.value || '';
    project.productData.serialNumber = document.getElementById('serialNumber')?.value || '';
    project.productData.batchNumber = document.getElementById('batchNumber')?.value || '';
    project.productData.machineNumber = document.getElementById('machineNumber')?.value || '';
    project.productData.functionDescription = document.getElementById('functionDescription')?.value || '';
    
    // Manufacturer data
    if (!project.manufacturer) project.manufacturer = {};
    project.manufacturer.companyName = document.getElementById('companyName')?.value || '';
    project.manufacturer.address = document.getElementById('address')?.value || '';
    project.manufacturer.contactInfo = document.getElementById('contactInfo')?.value || '';
    project.manufacturer.docSignatory = document.getElementById('docSignatory')?.value || '';
    project.manufacturer.technicalFileResponsible = document.getElementById('technicalFileResponsible')?.value || '';
    project.manufacturer.email = document.getElementById('manufacturerEmail')?.value || '';
    project.manufacturer.phone = document.getElementById('manufacturerPhone')?.value || '';
    
    // Directives (exclusive selection)
    const selectedDirective = getSelectedDirectiveFromUI();
    project.selectedDirective = selectedDirective;
    if (!project.directives) {
        project.directives = [];
    }
    // Remove main directive from additional directives list
    project.directives = project.directives.filter(d => d.name && d.name !== selectedDirective);
    
    // Compliance / high risk
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
    const highRiskCategoryEl = document.getElementById('highRiskCategory');
    const highRiskCategory = highRiskCategoryEl ? highRiskCategoryEl.value : '';
    const highRiskCustom = document.getElementById('highRiskCustom')?.value || '';
    project.compliance.highRiskCategory = highRiskCategory === 'custom' ? highRiskCustom : highRiskCategory;
    project.compliance.highRiskCustom = highRiskCustom;
    project.compliance.isHighRisk = !!(project.compliance.highRiskCategory || project.compliance.highRiskCustom);
    project.compliance.highRiskNotes = document.getElementById('highRiskNotes')?.value || '';
    const selectedPath = document.querySelector('input[name="conformityPath"]:checked')?.value || 'self';
    project.compliance.conformityPath = selectedPath;
    project.compliance.notifiedBody = document.getElementById('complianceNotifiedBody')?.value || '';
    
    // Digital/cyber
    if (!project.digitalSafety) {
        project.digitalSafety = {
            softwareVersion: '',
            updatePolicy: '',
            cybersecurityMeasures: '',
            aiSafetyFunctions: '',
            digitalInstructions: '',
            loggingTraceability: ''
        };
    }
    project.digitalSafety.softwareVersion = document.getElementById('softwareVersion')?.value || '';
    project.digitalSafety.updatePolicy = document.getElementById('updatePolicy')?.value || '';
    project.digitalSafety.cybersecurityMeasures = document.getElementById('cybersecurityMeasures')?.value || '';
    project.digitalSafety.aiSafetyFunctions = document.getElementById('aiSafetyFunctions')?.value || '';
    project.digitalSafety.digitalInstructions = document.getElementById('digitalInstructions')?.value || '';
    project.digitalSafety.loggingTraceability = document.getElementById('loggingTraceability')?.value || '';
    
    // Risk framework
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
    project.riskFramework.intendedUse = document.getElementById('intendedUse')?.value || '';
    project.riskFramework.foreseeableMisuse = document.getElementById('foreseeableMisuse')?.value || '';
    project.riskFramework.spaceLimitations = document.getElementById('spaceLimitations')?.value || '';
    project.riskFramework.timeLimitations = document.getElementById('timeLimitations')?.value || '';
    project.riskFramework.otherLimitations = document.getElementById('otherLimitations')?.value || '';
    project.riskFramework.lifePhases = LIFE_PHASE_OPTIONS
        .filter(opt => document.getElementById(opt.id)?.checked)
        .map(opt => opt.value);
    
    // Machine categories
    if (!project.machineCategories) {
        project.machineCategories = {
            foodMachine: false,
            handheldMachine: false,
            mobileMachine: false,
            liftingFunction: false
        };
    }
    project.machineCategories.foodMachine = document.getElementById('foodMachine')?.checked || false;
    project.machineCategories.handheldMachine = document.getElementById('handheldMachine')?.checked || false;
    project.machineCategories.mobileMachine = document.getElementById('mobileMachine')?.checked || false;
    project.machineCategories.liftingFunction = document.getElementById('liftingFunction')?.checked || false;
    
    // Module/Interface
    project.isModuleOrInterface = document.getElementById('isModuleOrInterface')?.checked || false;
    project.showModuleSeparately = document.getElementById('showModuleSeparately')?.checked || false;
    project.moduleMotivation = document.getElementById('moduleMotivation')?.value || '';
    
    // Update timestamp
    if (!project.meta) project.meta = {};
    project.meta.lastModified = new Date().toISOString();
    
    // Update declaration mode UI
    if (typeof window.updateDeclarationModeUI === 'function') {
        window.updateDeclarationModeUI();
    }
}

/**
 * Save current project
 */
export async function saveCurrentProject() {
    try {
        const project = getCurrentProject();
        if (!project) {
            alert(t('error.noproject', {}, 'Inget projekt laddat'));
            return;
        }
        
        // Update from form first
        updateProjectFromForm();
        
        // Validate module motivation if required
        if (project.isModuleOrInterface && !project.moduleMotivation?.trim()) {
            alert(t('validation.motivationrequired', {}, 'Motivering krävs när "Modul eller interface" är vald!'));
            return;
        }
        
        // Save to storage - migrate to data layer
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
 * Get selected directive from UI
 * @returns {string} Selected directive name
 */
function getSelectedDirectiveFromUI() {
    const selectedOption = DIRECTIVE_OPTIONS.find(opt => {
        const checkbox = document.getElementById(opt.id);
        return checkbox && checkbox.checked;
    });
    return selectedOption ? selectedOption.name : '';
}

// Expose functions globally if needed
if (typeof window !== 'undefined') {
    window.setupAutoSave = setupAutoSave;
    window.updateProjectFromForm = updateProjectFromForm;
    window.saveCurrentProject = saveCurrentProject;
}
