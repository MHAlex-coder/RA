/**
 * Interface Risk CRUD Operations
 * Handles Create, Read, Update, Delete operations for interface risk objects
 */

import { getCurrentProject } from '../../state.js';
import { getProjectRepository } from '../../data/index.js';
import { t } from '../../i18n/index.js';
import { riskGroupsData } from '../../config/risk-data.js';

/**
 * Create new interface risk object
 * @returns {Object} New interface risk object
 */
export function createNewInterfaceRisk() {
    const project = getCurrentProject();
    if (!project) {
        console.warn('No project loaded');
        return null;
    }
    
    if (typeof riskGroupsData === 'undefined' || !riskGroupsData) {
        alert(t('error.riskdatanotloaded', {}, 'Riskdata är inte laddad ännu. Vänligen försök igen.'));
        return null;
    }
    
    const risk = {
        id: Date.now().toString(),
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        
        // Interface-specific
        interfaceWith: '',
        
        // Risk description
        riskGroup: '',
        area: '',
        hazardSource: '',
        cause: '',
        injury: '',
        description: '',
        
        // Risk IN
        parametersIN: {
            S: 0,
            F: 1,
            P: 1,
            A: 1
        },
        
        // Risk OUT
        protectiveMeasures: [],
        measureValuationReason: '',
        isSafetyFunction: false,
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
    
    if (!project.interfaceRisks) {
        project.interfaceRisks = [];
    }
    
    project.interfaceRisks.push(risk);
    project.meta.lastModified = new Date().toISOString();
    (async () => {
        try {
            const repo = getProjectRepository();
            await repo.saveProject(project);
        } catch (error) {
            console.error('Error creating interface risk:', error);
        }
    })();
    
    return risk;
}

/**
 * Get interface risk by ID
 * @param {string} riskId - Risk ID
 * @returns {Object|null} Interface risk object or null
 */
export function getInterfaceRiskById(riskId) {
    const project = getCurrentProject();
    if (!project || !project.interfaceRisks) return null;
    
    return project.interfaceRisks.find(r => r.id === riskId) || null;
}

/**
 * Get all interface risks from current project
 * @returns {Array} Array of interface risk objects
 */
export function getAllInterfaceRisks() {
    const project = getCurrentProject();
    if (!project) return [];
    
    return project.interfaceRisks || [];
}

/**
 * Update interface risk field
 * @param {string} riskId - Risk ID
 * @param {string} field - Field name to update
 * @param {*} value - New value
 * @returns {boolean} Success status
 */
export function updateInterfaceRisk(riskId, field, value) {
    const risk = getInterfaceRiskById(riskId);
    if (!risk) {
        console.warn(`Interface risk ${riskId} not found`);
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
                console.error('Error updating interface risk field:', error);
            }
        })();
    }
    
    return true;
}

/**
 * Update interface risk parameter
 * @param {string} riskId - Risk ID
 * @param {string} type - 'IN' or 'OUT'
 * @param {string} param - 'S', 'F', 'P', or 'A'
 * @param {number} value - Parameter value
 * @returns {boolean} Success status
 */
export function updateInterfaceRiskParameter(riskId, type, param, value) {
    const risk = getInterfaceRiskById(riskId);
    if (!risk) {
        console.warn(`Interface risk ${riskId} not found`);
        return false;
    }
    
    const numValue = Number(value);
    
    if (type === 'IN') {
        risk.parametersIN[param] = numValue;
    } else if (type === 'OUT') {
        risk.parametersOUT[param] = numValue;
    } else {
        console.warn(`Invalid parameter type: ${type}`);
        return false;
    }
    
    risk.lastModified = new Date().toISOString();
    
    const project = getCurrentProject();
    if (project) {
        project.meta.lastModified = new Date().toISOString();
        (async () => {
            try {
                const repo = getProjectRepository();
                await repo.saveProject(project);
            } catch (error) {
                console.error('Error updating interface risk parameter:', error);
            }
        })();
    }
    
    return true;
}

/**
 * Delete interface risk by ID
 * @param {string} riskId - Risk ID
 * @returns {boolean} Success status
 */
export function deleteInterfaceRisk(riskId) {
    const project = getCurrentProject();
    if (!project || !project.interfaceRisks) return false;
    
    if (!confirm(t('message.confirm', {}, 'Bekräfta') + ': ' + t('interface.deleterisk', {}, 'Ta bort interface-risk') + '?')) {
        return false;
    }
    
    const index = project.interfaceRisks.findIndex(r => r.id === riskId);
    if (index === -1) {
        console.warn(`Interface risk ${riskId} not found`);
        return false;
    }
    
    project.interfaceRisks.splice(index, 1);
    project.meta.lastModified = new Date().toISOString();
    (async () => {
        try {
            const repo = getProjectRepository();
            await repo.saveProject(project);
        } catch (error) {
            console.error('Error deleting interface risk:', error);
        }
    })();
    
    return true;
}

/**
 * Add protective measure to interface risk
 * @param {string} riskId - Risk ID
 * @param {string} measure - Measure description
 * @returns {boolean} Success status
 */
export function addInterfaceProtectiveMeasure(riskId, measure) {
    const risk = getInterfaceRiskById(riskId);
    if (!risk || !measure || !measure.trim()) {
        return false;
    }
    
    if (!risk.protectiveMeasures) {
        risk.protectiveMeasures = [];
    }
    
    risk.protectiveMeasures.push({
        measure: measure.trim(),
        type: ''
    });
    
    risk.lastModified = new Date().toISOString();
    
    const project = getCurrentProject();
    if (project) {
        project.meta.lastModified = new Date().toISOString();
        (async () => {
            try {
                const repo = getProjectRepository();
                await repo.saveProject(project);
            } catch (error) {
                console.error('Error adding protective measure:', error);
            }
        })();
    }
    
    return true;
}

/**
 * Update interface protective measure
 * @param {string} riskId - Risk ID
 * @param {number} index - Measure index
 * @param {string} field - Field to update ('measure' or 'type')
 * @param {string} newValue - New value
 * @returns {boolean} Success status
 */
export function updateInterfaceProtectiveMeasure(riskId, index, field, newValue) {
    const risk = getInterfaceRiskById(riskId);
    if (!risk || !risk.protectiveMeasures || index >= risk.protectiveMeasures.length) {
        return false;
    }
    
    // Convert old string format to object if necessary
    if (typeof risk.protectiveMeasures[index] === 'string') {
        risk.protectiveMeasures[index] = {
            measure: risk.protectiveMeasures[index],
            type: ''
        };
    }
    
    risk.protectiveMeasures[index][field] = newValue;
    risk.lastModified = new Date().toISOString();
    
    const project = getCurrentProject();
    if (project) {
        project.meta.lastModified = new Date().toISOString();
        (async () => {
            try {
                const repo = getProjectRepository();
                await repo.saveProject(project);
            } catch (error) {
                console.error('Error updating protective measure:', error);
            }
        })();
    }
    
    return true;
}

/**
 * Remove interface protective measure
 * @param {string} riskId - Risk ID
 * @param {number} index - Measure index
 * @returns {boolean} Success status
 */
export function removeInterfaceProtectiveMeasure(riskId, index) {
    const risk = getInterfaceRiskById(riskId);
    if (!risk || !risk.protectiveMeasures || index >= risk.protectiveMeasures.length) {
        return false;
    }
    
    risk.protectiveMeasures.splice(index, 1);
    risk.lastModified = new Date().toISOString();
    
    const project = getCurrentProject();
    if (project) {
        project.meta.lastModified = new Date().toISOString();
        (async () => {
            try {
                const repo = getProjectRepository();
                await repo.saveProject(project);
            } catch (error) {
                console.error('Error removing protective measure:', error);
            }
        })();
    }
    
    return true;
}

/**
 * Add evidence link to interface risk
 * @param {string} riskId - Risk ID
 * @param {string} link - Evidence link
 * @returns {boolean} Success status
 */
export function addInterfaceEvidenceLink(riskId, link) {
    if (!link || !link.trim()) {
        return false;
    }
    
    const risk = getInterfaceRiskById(riskId);
    if (!risk) return false;
    
    if (!risk.evidenceLinks) {
        risk.evidenceLinks = [];
    }
    
    risk.evidenceLinks.push(link.trim());
    risk.lastModified = new Date().toISOString();
    
    const project = getCurrentProject();
    if (project) {
        project.meta.lastModified = new Date().toISOString();
        (async () => {
            try {
                const repo = getProjectRepository();
                await repo.saveProject(project);
            } catch (error) {
                console.error('Error adding evidence link:', error);
            }
        })();
    }
    
    return true;
}

/**
 * Remove evidence link from interface risk
 * @param {string} riskId - Risk ID
 * @param {number} index - Link index
 * @returns {boolean} Success status
 */
export function removeInterfaceEvidenceLink(riskId, index) {
    const risk = getInterfaceRiskById(riskId);
    if (!risk || !risk.evidenceLinks || index >= risk.evidenceLinks.length) {
        return false;
    }
    
    risk.evidenceLinks.splice(index, 1);
    risk.lastModified = new Date().toISOString();
    
    const project = getCurrentProject();
    if (project) {
        project.meta.lastModified = new Date().toISOString();
        (async () => {
            try {
                const repo = getProjectRepository();
                await repo.saveProject(project);
            } catch (error) {
                console.error('Error removing evidence link:', error);
            }
        })();
    }
    
    return true;
}

/**
 * Get interface risk statistics
 * @returns {Object} Statistics object
 */
export function getInterfaceRiskStatistics() {
    const risks = getAllInterfaceRisks();
    
    const stats = {
        total: risks.length,
        high: 0,
        medium: 0,
        lowMedium: 0,
        low: 0,
        withMeasures: 0,
        verified: 0,
        implemented: 0
    };
    
    risks.forEach(risk => {
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
        if (risk.verified) stats.verified++;
        if (risk.implemented) stats.implemented++;
    });
    
    return stats;
}

/**
 * Find interface risk index in project array
 * @param {string} riskId - Risk ID
 * @returns {number} Index or -1 if not found
 */
export function getInterfaceRiskIndex(riskId) {
    const project = getCurrentProject();
    if (!project || !project.interfaceRisks) return -1;
    
    return project.interfaceRisks.findIndex(r => r.id === riskId);
}
