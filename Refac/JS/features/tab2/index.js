/**
 * Tab 2 - Risk Assessment
 * Main module that coordinates all Tab 2 features
 */

import { createNewRisk, deleteRisk } from './risk-crud.js';
import { updateRiskParameter } from './risk-parameters.js';
import { addProtectiveMeasure, updateProtectiveMeasure, removeProtectiveMeasure } from './risk-measures.js';
import { addEvidenceLink, removeEvidenceLink } from './risk-validation.js';
import { renderRiskCards } from './risk-cards.js';
import { getCurrentProject, getCurrentTab, setSelectedRiskId } from '../../state.js';
import { riskGroupsData } from '../../config/risk-data.js';
import { getProjectRepository } from '../../data/index.js';

/**
 * Initialize Tab 2 - Risk Assessment
 */
export function initializeTab2() {
    console.log('Initializing Tab 2 - Risk Assessment...');
    
    // Add risk button
    const addRiskBtn = document.getElementById('addRiskBtn');
    if (addRiskBtn) {
        addRiskBtn.addEventListener('click', handleCreateNewRisk);
        console.log('✓ Add risk button event listener added');
    } else {
        console.warn('addRiskBtn not found');
    }
    
    // Wait for risk data to load before rendering
    if (typeof riskGroupsData !== 'undefined' && riskGroupsData) {
        renderRiskCards();
    } else {
        console.log('Waiting for risk data to load...');
        setTimeout(() => {
            if (typeof riskGroupsData !== 'undefined' && riskGroupsData && 
                getCurrentTab() === 'tab2') {
                renderRiskCards();
            }
        }, 500);
    }
    
    // Expose functions to window for onclick handlers
    exposeGlobalFunctions();
    
    console.log('✓ Tab 2 fully initialized');
}

/**
 * Handle create new risk
 */
function handleCreateNewRisk() {
    const project = getCurrentProject();
    if (!project) {
        alert('Inget projekt laddat');
        return;
    }
    
    if (typeof riskGroupsData === 'undefined' || !riskGroupsData) {
        alert('Riskdata är inte laddad ännu. Vänligen försök igen.');
        return;
    }
    
    const risk = createNewRisk();
    if (risk) {
        setSelectedRiskId(risk.id);
        renderRiskCards();
        
        // Update tab colors
        if (typeof window.updateRiskAssessmentTabColor === 'function') {
            window.updateRiskAssessmentTabColor();
        }
        if (typeof window.updateInterfaceRisksTabColor === 'function') {
            window.updateInterfaceRisksTabColor();
        }
        
        // Scroll to new risk card
        setTimeout(() => {
            const newCard = document.querySelector(`[data-risk-id="${risk.id}"]`);
            if (newCard) {
                newCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    }
}

/**
 * Update risk field wrapper
 * @param {string} riskId - Risk ID
 * @param {string} field - Field name
 * @param {*} value - New value
 */
function updateRisk(riskId, field, value) {
    const risk = getCurrentProject()?.risks?.find(r => r.id === riskId);
    if (!risk) return;
    
    risk[field] = value;
    risk.lastModified = new Date().toISOString();
    
    // Save project
    const project = getCurrentProject();
    if (project) {
        project.meta.lastModified = new Date().toISOString();
        (async () => {
            try {
                const repo = getProjectRepository();
                await repo.saveProject(project);
            } catch (error) {
                console.error('Error saving risk field:', error);
            }
        })();
    }
    
    // Update tab colors
    if (typeof window.updateRiskAssessmentTabColor === 'function') {
        window.updateRiskAssessmentTabColor();
    }
    if (typeof window.updateInterfaceRisksTabColor === 'function') {
        window.updateInterfaceRisksTabColor();
    }
    
    // Re-render to update UI
    rerenderRiskDetailPreservePanels(riskId);
}

/**
 * Re-render risk detail while preserving open panels
 * @param {string} riskId - Risk ID
 */
async function rerenderRiskDetailPreservePanels(riskId) {
    const actionOpen = document.getElementById(`action-panel-${riskId}`)?.classList.contains('open');
    const validationOpen = document.getElementById(`validation-panel-${riskId}`)?.classList.contains('open');
    
    // Import renderRiskDetail from risk-cards
    const riskCardsModule = await import('./risk-cards.js');
    riskCardsModule.renderRiskDetail(riskId);
    
    // Restore panel states
    if (actionOpen) {
        const panel = document.getElementById(`action-panel-${riskId}`);
        if (panel) panel.classList.add('open');
    }
    if (validationOpen) {
        const panel = document.getElementById(`validation-panel-${riskId}`);
        if (panel) panel.classList.add('open');
    }
    
    // Also update list
    riskCardsModule.renderRiskList();
}

/**
 * Expose functions to window object - handled by window-exports.js
 * Keeping function skeleton to avoid breaking internal calls to exposeGlobalFunctions()
 */
function exposeGlobalFunctions() {
    // CRUD operations
    window.updateRisk = updateRisk;
    window.deleteRisk = (riskId) => {
        if (deleteRisk(riskId)) {
            renderRiskCards();
            
            // Update tab colors
            if (typeof window.updateRiskAssessmentTabColor === 'function') {
                window.updateRiskAssessmentTabColor();
            }
            if (typeof window.updateInterfaceRisksTabColor === 'function') {
                window.updateInterfaceRisksTabColor();
            }
        }
    };
    
    // Parameter updates
    window.updateRiskParameter = (riskId, type, param, value) => {
        if (updateRiskParameter(riskId, type, param, value)) {
            setSelectedRiskId(riskId);
            rerenderRiskDetailPreservePanels(riskId);
        }
    };
    
    // Protective measures
    window.addProtectiveMeasure = (riskId, measure) => {
        if (addProtectiveMeasure(riskId, measure)) {
            rerenderRiskDetailPreservePanels(riskId);
        }
    };
    
    window.updateProtectiveMeasure = (riskId, index, field, value) => {
        if (updateProtectiveMeasure(riskId, index, field, value)) {
            // No need to re-render for measure updates
        }
    };
    
    window.removeProtectiveMeasure = (riskId, index) => {
        if (removeProtectiveMeasure(riskId, index)) {
            rerenderRiskDetailPreservePanels(riskId);
        }
    };
    
    // Evidence links
    window.addEvidenceLink = (riskId, link) => {
        if (addEvidenceLink(riskId, link)) {
            rerenderRiskDetailPreservePanels(riskId);
        }
    };
    
    window.removeEvidenceLink = (riskId, index) => {
        if (removeEvidenceLink(riskId, index)) {
            rerenderRiskDetailPreservePanels(riskId);
        }
    };
    
    // Risk cards rendering
    window.renderRiskCards = renderRiskCards;
}

/**
 * Load Tab 2 data (called when switching to tab)
 */
export function loadTab2Data() {
    const project = getCurrentProject();
    if (!project) return;
    
    renderRiskCards();
}

/**
 * Validate Tab 2 completeness
 * @returns {Object} Validation result
 */
export function validateTab2() {
    const project = getCurrentProject();
    if (!project) {
        return { isValid: false, errors: ['No project loaded'] };
    }
    
    const errors = [];
    const warnings = [];
    
    if (!project.risks || project.risks.length === 0) {
        warnings.push('Inga risker har skapats ännu');
        return { isValid: true, errors, warnings };
    }
    
    // Import validation module
    import('./risk-validation.js').then(module => {
        const assessment = module.checkAssessmentReadiness(project.risks);
        errors.push(...assessment.criticalErrors);
        warnings.push(...assessment.warnings);
    });
    
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Get Tab 2 statistics
 * @returns {Object} Risk assessment statistics
 */
export function getTab2Statistics() {
    const project = getCurrentProject();
    if (!project || !project.risks) {
        return {
            total: 0,
            high: 0,
            medium: 0,
            low: 0,
            withMeasures: 0,
            verified: 0
        };
    }
    
    // Import statistics from risk-crud
    import('./risk-crud.js').then(module => {
        return module.getRiskStatistics();
    });
}
