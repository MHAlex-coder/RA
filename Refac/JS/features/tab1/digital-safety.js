/**
 * Digital Safety Management
 * Handles digital safety and cybersecurity fields for Regulation 2023/1230 in Tab 1
 */

import { getCurrentProject } from '../../state.js';
import { t } from '../../i18n/index.js';
import { isRegulationSelected } from './directives.js';

/**
 * Initialize digital safety management
 */
export function initializeDigitalSafety() {
    // Add event listeners to digital safety fields
    const digitalFields = [
        'softwareVersion', 'updatePolicy', 'cybersecurityMeasures',
        'aiSafetyFunctions', 'digitalInstructions', 'loggingTraceability'
    ];
    
    digitalFields.forEach(fieldId => {
        const el = document.getElementById(fieldId);
        if (el) {
            el.addEventListener('change', () => updateDigitalSafetyData());
        }
    });
    
    // Update visibility based on directive
    updateCybersecurityVisibility();
    
    console.log('✓ Digital safety management initialized');
}

/**
 * Load digital safety data from project
 * @param {Object} project - Project object
 */
export function loadDigitalSafetyData(project) {
    if (!project || !project.digitalSafety) return;
    
    const fields = {
        'softwareVersion': project.digitalSafety.softwareVersion || '',
        'updatePolicy': project.digitalSafety.updatePolicy || '',
        'cybersecurityMeasures': project.digitalSafety.cybersecurityMeasures || '',
        'aiSafetyFunctions': project.digitalSafety.aiSafetyFunctions || '',
        'digitalInstructions': project.digitalSafety.digitalInstructions || '',
        'loggingTraceability': project.digitalSafety.loggingTraceability || ''
    };
    
    Object.entries(fields).forEach(([fieldId, value]) => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.value = value;
        }
    });
    
    updateCybersecurityVisibility();
}

/**
 * Update digital safety data from form
 */
function updateDigitalSafetyData() {
    const project = getCurrentProject();
    if (!project) return;
    
    // Initialize digitalSafety object if needed
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
    
    // Update timestamp
    project.meta.lastModified = new Date().toISOString();
}

/**
 * Update cybersecurity section visibility
 * Shows only when Regulation 2023/1230 is selected
 */
export function updateCybersecurityVisibility() {
    const cyberSection = document.getElementById('softwareCyberSection');
    if (cyberSection) {
        cyberSection.style.display = isRegulationSelected() ? 'block' : 'none';
    }
}

/**
 * Get digital safety summary
 * @returns {Object} Digital safety data summary
 */
export function getDigitalSafetySummary() {
    const project = getCurrentProject();
    if (!project) return {};
    
    return {
        softwareVersion: project.digitalSafety?.softwareVersion || '-',
        updatePolicy: project.digitalSafety?.updatePolicy || '-',
        cybersecurityMeasures: project.digitalSafety?.cybersecurityMeasures || '-',
        aiSafetyFunctions: project.digitalSafety?.aiSafetyFunctions || '-',
        digitalInstructions: project.digitalSafety?.digitalInstructions || '-',
        loggingTraceability: project.digitalSafety?.loggingTraceability || '-',
        isApplicable: isRegulationSelected()
    };
}

/**
 * Validate digital safety data
 * @returns {Object} Validation result
 */
export function validateDigitalSafety() {
    const project = getCurrentProject();
    if (!project) {
        return { isValid: false, errors: ['No project loaded'] };
    }
    
    const errors = [];
    
    // Only validate if regulation 2023/1230 is selected
    if (!isRegulationSelected()) {
        return { isValid: true, errors: [] };
    }
    
    // Check if machine has software/digital components
    const hasSoftware = project.digitalSafety?.softwareVersion?.trim() || 
                       project.digitalSafety?.updatePolicy?.trim() ||
                       project.digitalSafety?.cybersecurityMeasures?.trim();
    
    // If software is present, certain fields should be filled
    if (hasSoftware) {
        if (!project.digitalSafety?.softwareVersion?.trim()) {
            errors.push(t('validation.softwareversionrequired', {}, 
                'Programvaruversion bör anges för maskiner med digitala komponenter'));
        }
        
        if (!project.digitalSafety?.cybersecurityMeasures?.trim()) {
            errors.push(t('validation.cybersecurityrequired', {}, 
                'Cybersäkerhetsåtgärder bör beskrivas för maskiner med digitala komponenter'));
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        warnings: errors // Treat as warnings, not blocking errors
    };
}

/**
 * Check if digital safety data is applicable (Regulation 2023/1230 selected)
 * @returns {boolean} True if digital safety is applicable
 */
export function isDigitalSafetyApplicable() {
    return isRegulationSelected();
}

/**
 * Clear digital safety data
 */
export function clearDigitalSafetyData() {
    const project = getCurrentProject();
    if (!project) return;
    
    project.digitalSafety = {
        softwareVersion: '',
        updatePolicy: '',
        cybersecurityMeasures: '',
        aiSafetyFunctions: '',
        digitalInstructions: '',
        loggingTraceability: ''
    };
    
    // Clear form fields
    const fields = [
        'softwareVersion', 'updatePolicy', 'cybersecurityMeasures',
        'aiSafetyFunctions', 'digitalInstructions', 'loggingTraceability'
    ];
    
    fields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.value = '';
        }
    });
    
    project.meta.lastModified = new Date().toISOString();
}
