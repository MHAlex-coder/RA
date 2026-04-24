/**
 * Project Loading and UI Update
 * Handles loading project data into form fields and updating UI headers
 */

import { getCurrentProject } from '../../state.js';
import { LIFE_PHASE_OPTIONS } from '../../config/constants.js';

/**
 * Update project name in sidebar/header
 * @param {string} name - Project name
 */
export function updateProjectName(name) {
    const sidebarName = document.getElementById('sidebar-project-name');
    if (sidebarName) {
        sidebarName.textContent = name;
    }
}

/**
 * Update project revision in sidebar/header
 * @param {string} revision - Revision string
 */
export function updateProjectRevision(revision) {
    const sidebarRevision = document.getElementById('sidebar-project-revision');
    if (sidebarRevision) {
        sidebarRevision.textContent = `Rev: ${revision}`;
    }
}

/**
 * Load project data into all form fields
 */
export function loadProjectDataToForm() {
    const project = getCurrentProject();
    if (!project) return;
    
    // Product data
    if (document.getElementById('orderNumber')) document.getElementById('orderNumber').value = project.productData.orderNumber || '';
    if (document.getElementById('projectNumber')) document.getElementById('projectNumber').value = project.productData.projectNumber || '';
    if (document.getElementById('productType')) document.getElementById('productType').value = project.productData.productType || '';
    if (document.getElementById('productName')) document.getElementById('productName').value = project.productData.productName || '';
    if (document.getElementById('model')) document.getElementById('model').value = project.productData.model || '';
    if (document.getElementById('serialNumber')) document.getElementById('serialNumber').value = project.productData.serialNumber || '';
    if (document.getElementById('batchNumber')) document.getElementById('batchNumber').value = project.productData.batchNumber || '';
    if (document.getElementById('machineNumber')) document.getElementById('machineNumber').value = project.productData.machineNumber || '';
    if (document.getElementById('functionDescription')) document.getElementById('functionDescription').value = project.productData.functionDescription || '';
    if (document.getElementById('isPartlyCompleted')) document.getElementById('isPartlyCompleted').checked = project.productData.isPartlyCompleted || false;
    
    // Manufacturer data
    if (document.getElementById('companyName')) document.getElementById('companyName').value = project.manufacturer.companyName || '';
    if (document.getElementById('address')) document.getElementById('address').value = project.manufacturer.address || '';
    if (document.getElementById('contactInfo')) document.getElementById('contactInfo').value = project.manufacturer.contactInfo || '';
    if (document.getElementById('docSignatory')) document.getElementById('docSignatory').value = project.manufacturer.docSignatory || '';
    if (document.getElementById('technicalFileResponsible')) document.getElementById('technicalFileResponsible').value = project.manufacturer.technicalFileResponsible || '';
    if (document.getElementById('manufacturerEmail')) document.getElementById('manufacturerEmail').value = project.manufacturer.email || '';
    if (document.getElementById('manufacturerPhone')) document.getElementById('manufacturerPhone').value = project.manufacturer.phone || '';
    
    // Risk framework
    if (document.getElementById('intendedUse')) document.getElementById('intendedUse').value = project.riskFramework.intendedUse || '';
    if (document.getElementById('foreseeableMisuse')) document.getElementById('foreseeableMisuse').value = project.riskFramework.foreseeableMisuse || '';
    if (document.getElementById('spaceLimitations')) document.getElementById('spaceLimitations').value = project.riskFramework.spaceLimitations || '';
    if (document.getElementById('timeLimitations')) document.getElementById('timeLimitations').value = project.riskFramework.timeLimitations || '';
    if (document.getElementById('otherLimitations')) document.getElementById('otherLimitations').value = project.riskFramework.otherLimitations || '';
    const lifePhases = project.riskFramework.lifePhases || [];
    LIFE_PHASE_OPTIONS.forEach(({ id, value }) => {
        const checkbox = document.getElementById(id);
        if (checkbox) checkbox.checked = lifePhases.includes(value);
    });
    
    // Machine categories
    if (document.getElementById('foodMachine')) document.getElementById('foodMachine').checked = project.machineCategories.foodMachine || false;
    if (document.getElementById('handheldMachine')) document.getElementById('handheldMachine').checked = project.machineCategories.handheldMachine || false;
    if (document.getElementById('mobileMachine')) document.getElementById('mobileMachine').checked = project.machineCategories.mobileMachine || false;
    if (document.getElementById('liftingFunction')) document.getElementById('liftingFunction').checked = project.machineCategories.liftingFunction || false;
    
    // Module/Interface
    if (document.getElementById('isModuleOrInterface')) {
        document.getElementById('isModuleOrInterface').checked = project.isModuleOrInterface || false;
        const motivationGroup = document.getElementById('moduleMotivationGroup');
        const separateGroup = document.getElementById('moduleSeparateGroup');
        if (motivationGroup) {
            motivationGroup.style.display = project.isModuleOrInterface ? 'block' : 'none';
        }
        if (separateGroup) {
            separateGroup.style.display = project.isModuleOrInterface ? 'block' : 'none';
        }
    }
    if (document.getElementById('showModuleSeparately')) document.getElementById('showModuleSeparately').checked = project.showModuleSeparately || false;
    if (document.getElementById('moduleMotivation')) document.getElementById('moduleMotivation').value = project.moduleMotivation || '';

    // Compliance / high risk
    const compliance = project.compliance || {};
    if (typeof window.renderHighRiskOptions === 'function') {
        window.renderHighRiskOptions();
    }
    if (document.getElementById('highRiskCategory')) {
        const select = document.getElementById('highRiskCategory');
        const options = (typeof window.getHighRiskOptions === 'function') ? window.getHighRiskOptions() : [];
        select.value = compliance.highRiskCategory && options.includes(compliance.highRiskCategory)
            ? compliance.highRiskCategory
            : (compliance.highRiskCategory ? 'custom' : '');
    }
    if (document.getElementById('highRiskCustom')) document.getElementById('highRiskCustom').value = compliance.highRiskCustom || '';
    if (document.getElementById('highRiskNotes')) document.getElementById('highRiskNotes').value = compliance.highRiskNotes || '';
    const conformityPath = compliance.conformityPath || 'self';
    const selfRadio = document.getElementById('conformity-self');
    const nbRadio = document.getElementById('conformity-notified');
    if (selfRadio) selfRadio.checked = conformityPath === 'self';
    if (nbRadio) nbRadio.checked = conformityPath === 'notified';
    if (document.getElementById('complianceNotifiedBody')) document.getElementById('complianceNotifiedBody').value = compliance.notifiedBody || '';
    if (typeof window.toggleCustomHighRiskField === 'function') {
        window.toggleCustomHighRiskField();
    }
    if (typeof window.updateControlReportDirective === 'function') {
        window.updateControlReportDirective();
    }

    // Digital/cyber fields
    const digital = project.digitalSafety || {};
    if (document.getElementById('softwareVersion')) document.getElementById('softwareVersion').value = digital.softwareVersion || '';
    if (document.getElementById('updatePolicy')) document.getElementById('updatePolicy').value = digital.updatePolicy || '';
    if (document.getElementById('cybersecurityMeasures')) document.getElementById('cybersecurityMeasures').value = digital.cybersecurityMeasures || '';
    if (document.getElementById('aiSafetyFunctions')) document.getElementById('aiSafetyFunctions').value = digital.aiSafetyFunctions || '';
    if (document.getElementById('digitalInstructions')) document.getElementById('digitalInstructions').value = digital.digitalInstructions || '';
    if (document.getElementById('loggingTraceability')) document.getElementById('loggingTraceability').value = digital.loggingTraceability || '';

    if (typeof window.updateCybersecurityVisibility === 'function') {
        window.updateCybersecurityVisibility();
    }

    // Ensure selected directive for older projects
    if (!project.selectedDirective && project.directives?.length) {
        project.selectedDirective = project.directives[0].name || '';
    }
    if (project.directives && project.selectedDirective) {
        project.directives = project.directives.filter(d => d.name && d.name !== project.selectedDirective);
    }
    
    // Render lists
    if (typeof window.populateDirectivesDropdown === 'function') {
        window.populateDirectivesDropdown();
    }
    if (typeof window.renderStandardsList === 'function') {
        window.renderStandardsList();
    }
    if (typeof window.renderDirectivesList === 'function') {
        window.renderDirectivesList();
    }
    if (typeof window.renderAdditionalDirectivesList === 'function') {
        window.renderAdditionalDirectivesList();
    }
    if (typeof window.loadDoCData === 'function') {
        window.loadDoCData();
    }
    if (typeof window.renderDoCDirectives === 'function') {
        window.renderDoCDirectives();
    }
    if (typeof window.renderDoCStandards === 'function') {
        window.renderDoCStandards();
    }
    if (typeof window.updateControlReportDirective === 'function') {
        window.updateControlReportDirective();
    }
    
    // Show logo preview if exists
    if (project.media?.logoImage) {
        const preview = document.getElementById('logoPreview');
        if (preview) {
            preview.innerHTML = `
                <img src="${project.media.logoImage}" alt="Logotyp" style="max-width: 200px; max-height: 100px; border: 1px solid var(--border-color); border-radius: var(--border-radius);" />
            `;
        }
        const removeLogoBtn = document.getElementById('removeLogoBtn');
        if (removeLogoBtn) removeLogoBtn.style.display = 'inline-block';
    } else {
        const removeLogoBtn = document.getElementById('removeLogoBtn');
        if (removeLogoBtn) removeLogoBtn.style.display = 'none';
    }
    
    // Update header with project name
    updateProjectName(project.productData.projectNumber || 'Namnlöst projekt');

    // Update declaration mode
    if (typeof window.updateDeclarationModeUI === 'function') {
        window.updateDeclarationModeUI();
    }
    
    // Update tab colors based on status
    if (typeof window.updateRiskAssessmentTabColor === 'function') {
        window.updateRiskAssessmentTabColor();
    }
    if (typeof window.updateInterfaceRisksTabColor === 'function') {
        window.updateInterfaceRisksTabColor();
    }
    if (typeof window.updateControlReportTabColor === 'function') {
        window.updateControlReportTabColor();
    }
}

// Expose globally for legacy access
if (typeof window !== 'undefined') {
    window.updateProjectName = updateProjectName;
    window.updateProjectRevision = updateProjectRevision;
    window.loadProjectDataToForm = loadProjectDataToForm;
}
