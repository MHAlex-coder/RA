/**
 * Risk CRUD Operations
 * Handles Create, Read, Update, Delete operations for risk objects
 */

import { getCurrentProject } from '../../state.js';
import { getProjectRepository } from '../../data/index.js';
import { t } from '../../i18n/index.js';

/**
 * Create new risk object
 * @returns {Object} New risk object
 */
export function createNewRisk() {
    const project = getCurrentProject();
    if (!project) {
        console.warn('No project loaded');
        return null;
    }
    
    const risk = {
        id: Date.now().toString(),
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        
        // Risk IN - Initial risk assessment
        riskGroup: '',
        zone: '',
        area: '',
        hazardSource: '',
        cause: '',
        injury: '',
        description: '',
        parametersIN: {
            S: 0,  // Severity
            F: 1,  // Frequency
            P: 1,  // Probability
            A: 1   // Avoidance
        },
        
        // Risk OUT - Residual risk after measures
        protectiveMeasures: [], // Array of {measure: string, type: string}
        measureValuationReason: '',
        isSafetyFunction: false,
        selectedPL: '',  // Performance Level if safety function
        plDeviation: '',  // Reason for PL deviation
        parametersOUT: {
            S: 0,
            F: 1,
            P: 1,
            A: 1
        },
        
        // Verification
        implemented: false,
        verified: false,
        plCalculation: false,
        comment: '',
        evidenceLinks: []
    };
    
    project.risks.push(risk);
    project.meta.lastModified = new Date().toISOString();
    
    return risk;
}

/**
 * Get risk by ID
 * @param {string} riskId - Risk ID
 * @returns {Object|null} Risk object or null
 */
export function getRiskById(riskId) {
    const project = getCurrentProject();
    if (!project) return null;
    
    return project.risks.find(r => r.id === riskId) || null;
}

/**
 * Get all risks from current project
 * @returns {Array} Array of risk objects
 */
export function getAllRisks() {
    const project = getCurrentProject();
    if (!project) return [];
    
    return project.risks || [];
}

/**
 * Update risk field
 * @param {string} riskId - Risk ID
 * @param {string} field - Field name to update
 * @param {*} value - New value
 * @returns {boolean} Success status
 */
export function updateRisk(riskId, field, value) {
    const risk = getRiskById(riskId);
    if (!risk) {
        console.warn(`Risk ${riskId} not found`);
        return false;
    }
    
    risk[field] = value;
    risk.lastModified = new Date().toISOString();
    
    const project = getCurrentProject();
    if (project) {
        project.meta.lastModified = new Date().toISOString();
        (async () => {
            try {
                const repo = getProjectRepository();
                await repo.saveProject(project);
            } catch (error) {
                console.error('Error updating risk field:', error);
            }
        })();
    }
    
    return true;
}

/**
 * Delete risk by ID
 * @param {string} riskId - Risk ID
 * @returns {boolean} Success status
 */
export function deleteRisk(riskId) {
    const project = getCurrentProject();
    if (!project) return false;
    
    if (!confirm(t('message.confirm', {}, 'Bekräfta') + ': ' + t('risk.delete', {}, 'Ta bort risk') + '?')) {
        return false;
    }
    
    const index = project.risks.findIndex(r => r.id === riskId);
    if (index === -1) {
        console.warn(`Risk ${riskId} not found`);
        return false;
    }
    
    project.risks.splice(index, 1);
    project.meta.lastModified = new Date().toISOString();
    (async () => {
        try {
            const repo = getProjectRepository();
            await repo.saveProject(project);
        } catch (error) {
            console.error('Error deleting risk:', error);
        }
    })();
    
    return true;
}

/**
 * Duplicate risk
 * @param {string} riskId - Risk ID to duplicate
 * @returns {Object|null} New duplicated risk object
 */
export function duplicateRisk(riskId) {
    const originalRisk = getRiskById(riskId);
    if (!originalRisk) return null;
    
    const project = getCurrentProject();
    if (!project) return null;
    
    const newRisk = {
        ...JSON.parse(JSON.stringify(originalRisk)), // Deep clone
        id: Date.now().toString(),
        created: new Date().toISOString(),
        lastModified: new Date().toISOString()
    };
    
    project.risks.push(newRisk);
    project.meta.lastModified = new Date().toISOString();
    (async () => {
        try {
            const repo = getProjectRepository();
            await repo.saveProject(project);
        } catch (error) {
            console.error('Error duplicating risk:', error);
        }
    })();
    
    return newRisk;
    
    return newRisk;
}

/**
 * Get risk statistics
 * @returns {Object} Statistics object
 */
export function getRiskStatistics() {
    const risks = getAllRisks();
    
    const stats = {
        total: risks.length,
        high: 0,
        medium: 0,
        lowMedium: 0,
        low: 0,
        withMeasures: 0,
        safetyFunctions: 0,
        verified: 0,
        implemented: 0
    };
    
    risks.forEach(risk => {
        // Count risk levels (requires RiskMatrix to be loaded)
        if (typeof RiskMatrix !== 'undefined' && RiskMatrix?.getRiskDescription) {
            const riskIN = RiskMatrix.getRiskDescription(
                risk.parametersIN.S,
                risk.parametersIN.F,
                risk.parametersIN.P,
                risk.parametersIN.A
            );
            
            if (riskIN.classification === 'high') stats.high++;
            else if (riskIN.classification === 'medium') stats.medium++;
            else if (riskIN.classification === 'lowMedium') stats.lowMedium++;
            else stats.low++;
        }
        
        if (risk.protectiveMeasures?.length > 0) stats.withMeasures++;
        if (risk.isSafetyFunction) stats.safetyFunctions++;
        if (risk.verified) stats.verified++;
        if (risk.implemented) stats.implemented++;
    });
    
    return stats;
}

/**
 * Sort risks by specified field
 * @param {string} sortBy - Field to sort by ('index', 'zone', 'riskGroup', 'riskLevel')
 * @returns {Array} Sorted risk array
 */
export function getSortedRisks(sortBy = 'index') {
    const risks = getAllRisks();
    
    switch (sortBy) {
        case 'zone':
            return [...risks].sort((a, b) => {
                const zoneA = (a.zone || '').toLowerCase();
                const zoneB = (b.zone || '').toLowerCase();
                return zoneA.localeCompare(zoneB);
            });
            
        case 'riskGroup':
            return [...risks].sort((a, b) => {
                const groupA = (a.riskGroup || '').toLowerCase();
                const groupB = (b.riskGroup || '').toLowerCase();
                return groupA.localeCompare(groupB);
            });
            
        case 'riskLevel':
            return [...risks].sort((a, b) => {
                if (typeof RiskMatrix === 'undefined' || !RiskMatrix?.getRiskDescription) {
                    return 0;
                }
                
                const riskA = RiskMatrix.getRiskDescription(
                    a.parametersIN.S, a.parametersIN.F, a.parametersIN.P, a.parametersIN.A
                );
                const riskB = RiskMatrix.getRiskDescription(
                    b.parametersIN.S, b.parametersIN.F, b.parametersIN.P, b.parametersIN.A
                );
                
                // Sort high -> medium -> low
                const order = { high: 0, medium: 1, lowMedium: 2, low: 3 };
                return (order[riskA.classification] || 999) - (order[riskB.classification] || 999);
            });
            
        default:
            return risks; // Original order (by index)
    }
}

/**
 * Find risk index in project risks array
 * @param {string} riskId - Risk ID
 * @returns {number} Index or -1 if not found
 */
export function getRiskIndex(riskId) {
    const project = getCurrentProject();
    if (!project) return -1;
    
    return project.risks.findIndex(r => r.id === riskId);
}
