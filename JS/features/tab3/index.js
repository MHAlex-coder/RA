/**
 * Tab 3 - Interface Risks
 * Main coordinator for interface risk management
 */

import { getCurrentProject } from '../../state.js';
import { t } from '../../i18n/index.js';

// CRUD operations
import { 
    createNewInterfaceRisk, 
    getAllInterfaceRisks,
    getInterfaceRiskById,
    updateInterfaceRisk,
    updateInterfaceRiskParameter,
    deleteInterfaceRisk,
    addInterfaceProtectiveMeasure,
    updateInterfaceProtectiveMeasure,
    removeInterfaceProtectiveMeasure,
    addInterfaceEvidenceLink,
    removeInterfaceEvidenceLink
} from './interface-crud.js';

// UI Rendering
import { 
    renderInterfaceRisks,
    toggleInterfaceRiskDetails,
    toggleInterfaceActionPanel,
    toggleInterfaceValidationPanel
} from './interface-risks.js';

/**
 * Initialize Tab 3 - Interface Risks
 */
export function initializeTab3() {
    console.log('Initializing Tab 3 - Interface Risks');
    
    const project = getCurrentProject();
    if (!project) {
        console.warn('No project loaded for Tab 3');
        return;
    }
    
    // Initialize interface risks array if not exists
    if (!project.interfaceRisks) {
        project.interfaceRisks = [];
    }
    
    // Setup event listeners
    setupTab3EventListeners();
    
    // Render interface risks
    renderInterfaceRisks();
    
    // Expose functions globally for onclick handlers
    exposeTab3GlobalFunctions();
}

/**
 * Setup event listeners for Tab 3
 */
function setupTab3EventListeners() {
    const addBtn = document.getElementById('add-interface-risk-btn');
    if (addBtn) {
        addBtn.onclick = () => {
            createNewInterfaceRisk();
            renderInterfaceRisks();
        };
    }
}

/**
 * Expose Tab 3 functions globally for onclick handlers
 */
function exposeTab3GlobalFunctions() {
    if (typeof window !== 'undefined') {
        // CRUD operations
        window.createNewInterfaceRisk = () => {
            createNewInterfaceRisk();
            renderInterfaceRisks();
        };
        
        window.updateInterfaceRisk = (riskId, field, value) => {
            updateInterfaceRisk(riskId, field, value);
            renderInterfaceRisks();
        };
        
        window.updateInterfaceRiskParameter = (riskId, direction, param, value) => {
            updateInterfaceRiskParameter(riskId, direction, param, value);
            renderInterfaceRisks();
        };
        
        window.deleteInterfaceRisk = (riskId) => {
            if (confirm(t('risk.delete_confirm', {}, 'Är du säker på att du vill ta bort denna interface-risk?'))) {
                deleteInterfaceRisk(riskId);
                renderInterfaceRisks();
            }
        };
        
        // Protective measures
        window.addInterfaceProtectiveMeasure = (riskId, measure) => {
            if (!measure || measure.trim() === '') {
                alert(t('risk.enter_measure', {}, 'Ange en skyddsåtgärd'));
                return;
            }
            addInterfaceProtectiveMeasure(riskId, measure);
            renderInterfaceRisks();
        };
        
        window.updateInterfaceProtectiveMeasure = (riskId, index, field, value) => {
            updateInterfaceProtectiveMeasure(riskId, index, field, value);
            renderInterfaceRisks();
        };
        
        window.removeInterfaceProtectiveMeasure = (riskId, index) => {
            removeInterfaceProtectiveMeasure(riskId, index);
            renderInterfaceRisks();
        };
        
        // Evidence links
        window.addInterfaceEvidenceLink = (riskId, link) => {
            if (!link || link.trim() === '') {
                alert(t('risk.enter_link', {}, 'Ange en länk eller referens'));
                return;
            }
            addInterfaceEvidenceLink(riskId, link);
            renderInterfaceRisks();
        };
        
        window.removeInterfaceEvidenceLink = (riskId, index) => {
            removeInterfaceEvidenceLink(riskId, index);
            renderInterfaceRisks();
        };
        
        // UI toggles (already exposed in interface-risks.js but ensuring they're available)
        window.toggleInterfaceRiskDetails = toggleInterfaceRiskDetails;
        window.toggleInterfaceActionPanel = toggleInterfaceActionPanel;
        window.toggleInterfaceValidationPanel = toggleInterfaceValidationPanel;
    }
}

/**
 * Load Tab 3 data
 */
export function loadTab3Data() {
    const project = getCurrentProject();
    if (!project) return;
    
    console.log('Loading Tab 3 data:', project.interfaceRisks?.length || 0, 'interface risks');
    renderInterfaceRisks();
}

/**
 * Validate Tab 3 data
 * @returns {boolean} - True if valid
 */
export function validateTab3() {
    const project = getCurrentProject();
    if (!project) return false;
    
    // Interface risks are optional, so always valid
    // Could add specific validation logic here if needed
    return true;
}

// Export all functions
export {
    // CRUD
    createNewInterfaceRisk,
    getAllInterfaceRisks,
    getInterfaceRiskById,
    updateInterfaceRisk,
    updateInterfaceRiskParameter,
    deleteInterfaceRisk,
    addInterfaceProtectiveMeasure,
    updateInterfaceProtectiveMeasure,
    removeInterfaceProtectiveMeasure,
    addInterfaceEvidenceLink,
    removeInterfaceEvidenceLink,
    
    // UI
    renderInterfaceRisks,
    toggleInterfaceRiskDetails,
    toggleInterfaceActionPanel,
    toggleInterfaceValidationPanel
};
