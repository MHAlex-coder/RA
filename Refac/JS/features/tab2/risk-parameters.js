/**
 * Risk Parameters Management
 * Handles S, F, P, A parameters for risk assessment (IN and OUT)
 */

import { getRiskById, updateRisk } from './risk-crud.js';
import { t } from '../../i18n/index.js';
import { getProjectRepository } from '../../data/index.js';
import { getCurrentProject } from '../../state.js';

/**
 * Get risk parameter levels from RiskMatrix or fallback
 * @returns {Object} Parameter levels
 */
function getParameterLevels() {
    if (typeof RiskMatrix !== 'undefined' && RiskMatrix) {
        return {
            S: RiskMatrix.severityLevels || {},
            F: RiskMatrix.frequencyLevels || {},
            P: RiskMatrix.probabilityLevels || {},
            A: RiskMatrix.avoidanceLevels || {}
        };
    }
    
    // Fallback levels
    return {
        S: {
            0: 'No injury',
            1: 'Slight injury',
            2: 'Serious injury',
            3: 'Death or catastrophic injury'
        },
        F: {
            1: 'Rare to infrequent',
            2: 'Frequent to continuous'
        },
        P: {
            1: 'Low probability',
            2: 'Possible',
            3: 'Probable'
        },
        A: {
            1: 'Possible under certain conditions',
            2: 'Scarcely possible'
        }
    };
}

/**
 * Update risk parameter value
 * @param {string} riskId - Risk ID
 * @param {string} type - 'IN' or 'OUT'
 * @param {string} param - 'S', 'F', 'P', or 'A'
 * @param {number} value - Parameter value
 * @returns {boolean} Success status
 */
export function updateRiskParameter(riskId, type, param, value) {
    const risk = getRiskById(riskId);
    if (!risk) {
        console.warn(`Risk ${riskId} not found`);
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
    
    // Save project
    const project = getCurrentProject();
    if (project) {
        project.meta.lastModified = new Date().toISOString();
        (async () => {
            try {
                const repo = getProjectRepository();
                await repo.saveProject(project);
            } catch (error) {
                console.error('Error saving risk parameters:', error);
            }
        })();
    }
    
    return true;
}

/**
 * Get risk assessment from parameters
 * @param {number} S - Severity
 * @param {number} F - Frequency
 * @param {number} P - Probability
 * @param {number} A - Avoidance
 * @returns {Object} Risk description with value and classification
 */
export function getRiskDescription(S, F, P, A) {
    if (typeof RiskMatrix !== 'undefined' && RiskMatrix?.getRiskDescription) {
        return RiskMatrix.getRiskDescription(S, F, P, A);
    }
    
    // Fallback calculation
    const riskValue = S * F * P * A;
    
    let classification = 'low';
    let classificationText = 'LOW';
    
    if (riskValue >= 8) {
        classification = 'high';
        classificationText = 'HIGH';
    } else if (riskValue >= 4) {
        classification = 'medium';
        classificationText = 'MEDIUM';
    }
    
    return {
        value: riskValue,
        classification,
        classificationText
    };
}

/**
 * Calculate Performance Level (PL) requirement
 * @param {number} S - Severity
 * @param {number} F - Frequency
 * @param {number} P - Probability
 * @returns {Object} PL information
 */
export function calculatePL(S, F, A) {
    if (typeof RiskMatrix !== 'undefined' && RiskMatrix?.calculatePL) {
        return RiskMatrix.calculatePL(S, F, A);
    }
    
    // Fallback PL calculation
    const riskValue = S * F * A;
    
    let level = 'a';
    let description = 'Low';
    let color = '#10b981';
    
    if (riskValue >= 12) {
        level = 'e';
        description = 'Very High';
        color = '#dc2626';
    } else if (riskValue >= 8) {
        level = 'd';
        description = 'High';
        color = '#f59e0b';
    } else if (riskValue >= 4) {
        level = 'c';
        description = 'Medium';
        color = '#fbbf24';
    } else if (riskValue >= 2) {
        level = 'b';
        description = 'Low';
        color = '#84cc16';
    }
    
    return {
        level,
        description,
        color
    };
}

/**
 * Get PL information by level
 * @param {string} level - PL level (a-e)
 * @returns {Object} PL info
 */
export function getPLInfo(level) {
    if (typeof RiskMatrix !== 'undefined' && RiskMatrix?.getPLInfo) {
        return RiskMatrix.getPLInfo(level);
    }
    
    // Fallback PL info
    const plInfo = {
        'a': { description: 'Low', color: '#10b981' },
        'b': { description: 'Low', color: '#84cc16' },
        'c': { description: 'Medium', color: '#fbbf24' },
        'd': { description: 'High', color: '#f59e0b' },
        'e': { description: 'Very High', color: '#dc2626' }
    };
    
    return plInfo[level] || plInfo['a'];
}

/**
 * Render parameter select dropdown (compact version)
 * @param {string} param - Parameter name (S, F, P, A)
 * @param {string} riskId - Risk ID
 * @param {string} type - 'IN' or 'OUT'
 * @param {number} currentValue - Current parameter value
 * @param {Object} levels - Parameter level definitions
 * @param {boolean} isInterface - Is interface risk
 * @returns {string} HTML string for parameter select
 */
export function renderParameterSelectCompact(param, riskId, type, currentValue, levels, isInterface = false) {
    const paramNames = {
        'S': 'S',
        'F': 'F',
        'P': 'P',
        'A': 'A'
    };
    
    const paramTranslationKeys = {
        'S': 'risk.param.severity',
        'F': 'risk.param.frequency',
        'P': 'risk.param.probability',
        'A': 'risk.param.avoidance'
    };

    const paramLevelKeys = {
        'S': {0: 'risk.level.severity.0', 1: 'risk.level.severity.1', 2: 'risk.level.severity.2', 3: 'risk.level.severity.3'},
        'F': {1: 'risk.level.frequency.1', 2: 'risk.level.frequency.2'},
        'P': {1: 'risk.level.probability.1', 2: 'risk.level.probability.2', 3: 'risk.level.probability.3'},
        'A': {1: 'risk.level.avoidance.1', 2: 'risk.level.avoidance.2'}
    };

    const getLevelLabel = (p, level) => {
        const key = paramLevelKeys[p]?.[level];
        if (key) {
            const translated = t(key);
            if (translated && translated !== key) return translated;
        }
        return levels[level] || `${p}${level}`;
    };

    const tooltipContent = Object.keys(levels).map(level =>
        `<span class="param-tooltip-item">${getLevelLabel(param, Number(level))}</span>`
    ).join('');
    
    const updateFunction = isInterface ? 'updateInterfaceRiskParameter' : 'updateRiskParameter';
    
    const normalizedValue = (param === 'S' && Number(currentValue) === 4) ? 3 : currentValue;

    return `
        <div class="form-group">
            <label class="form-label">
                ${paramNames[param]}
                <button type="button" class="param-info-btn" title="${t(paramTranslationKeys[param])}">
                    ℹ
                    <div class="param-tooltip">
                        <strong style="display: block; margin-bottom: 0.5rem;">${t(paramTranslationKeys[param])}</strong>
                        ${tooltipContent}
                    </div>
                </button>
            </label>
            <select class="form-select" onchange="${updateFunction}('${riskId}', '${type}', '${param}', Number(this.value))">
                ${Object.keys(levels).map(level => {
                    const displayLabel = getLevelLabel(param, Number(level));
                    return `<option value="${level}" ${normalizedValue == level ? 'selected' : ''}>${displayLabel}</option>`;
                }).join('')}
            </select>
        </div>
    `;
}

/**
 * Validate risk parameters
 * @param {Object} risk - Risk object
 * @param {string} type - 'IN' or 'OUT'
 * @returns {Object} Validation result
 */
export function validateRiskParameters(risk, type = 'IN') {
    const errors = [];
    const params = type === 'IN' ? risk.parametersIN : risk.parametersOUT;
    
    // Check if all parameters are set
    ['S', 'F', 'P', 'A'].forEach(param => {
        if (!params[param] || params[param] < 1) {
            errors.push(t('validation.parameterrequired', { param }, 
                `Parameter ${param} måste anges`));
        }
    });
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Check if residual risk is acceptable
 * @param {Object} risk - Risk object
 * @returns {Object} Acceptability assessment
 */
export function checkResidualRiskAcceptable(risk) {
    const riskIN = getRiskDescription(
        risk.parametersIN.S,
        risk.parametersIN.F,
        risk.parametersIN.P,
        risk.parametersIN.A
    );
    
    const riskOUT = getRiskDescription(
        risk.parametersOUT.S,
        risk.parametersOUT.F,
        risk.parametersOUT.P,
        risk.parametersOUT.A
    );
    
    const hasReduction = riskOUT.value < riskIN.value;
    const isAcceptable = riskOUT.classification !== 'high';
    
    return {
        hasReduction,
        isAcceptable,
        riskIN,
        riskOUT,
        reductionPercent: hasReduction ? 
            Math.round(((riskIN.value - riskOUT.value) / riskIN.value) * 100) : 0
    };
}

/**
 * Get parameter level descriptions
 * @returns {Object} Parameter descriptions for all levels
 */
export function getParameterDescriptions() {
    const levels = getParameterLevels();
    
    return {
        S: {
            name: t('risk.param.severity', {}, 'Severity (S)'),
            levels: levels.S,
            description: t('risk.param.severity.desc', {}, 
                'Severity of potential injury')
        },
        F: {
            name: t('risk.param.frequency', {}, 'Frequency (F)'),
            levels: levels.F,
            description: t('risk.param.frequency.desc', {}, 
                'Frequency and duration of exposure to hazard')
        },
        P: {
            name: t('risk.param.probability', {}, 'Probability (P)'),
            levels: levels.P,
            description: t('risk.param.probability.desc', {}, 
                'Probability of occurrence of hazardous event')
        },
        A: {
            name: t('risk.param.avoidance', {}, 'Avoidance (A)'),
            levels: levels.A,
            description: t('risk.param.avoidance.desc', {}, 
                'Possibility of avoiding or limiting the harm')
        }
    };
}
