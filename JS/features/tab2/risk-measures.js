/**
 * Risk Safety Measures Management
 * Handles protective measures, PL calculations, and residual risk
 */

import { getRiskById } from './risk-crud.js';
import { calculatePL, getPLInfo } from './risk-parameters.js';
import { t } from '../../i18n/index.js';
import { getProjectRepository } from '../../data/index.js';
import { getCurrentProject } from '../../state.js';

/**
 * Add protective measure to risk
 * @param {string} riskId - Risk ID
 * @param {string} measure - Measure description
 * @returns {boolean} Success status
 */
export function addProtectiveMeasure(riskId, measure) {
    const risk = getRiskById(riskId);
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
                console.error('Error saving protective measure:', error);
            }
        })();
    }
    
    return true;
}

/**
 * Update protective measure
 * @param {string} riskId - Risk ID
 * @param {number} index - Measure index
 * @param {string} field - Field to update ('measure' or 'type')
 * @param {string} newValue - New value
 * @returns {boolean} Success status
 */
export function updateProtectiveMeasure(riskId, index, field, newValue) {
    const risk = getRiskById(riskId);
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
 * Remove protective measure
 * @param {string} riskId - Risk ID
 * @param {number} index - Measure index
 * @returns {boolean} Success status
 */
export function removeProtectiveMeasure(riskId, index) {
    const risk = getRiskById(riskId);
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
 * Get measure type categories
 * @returns {Array} Array of measure types
 */
export function getMeasureTypes() {
    return [
        { value: 'inherent', label: t('risk.measure_type_inherent', {}, 'Inherent safe design') },
        { value: 'technical', label: t('risk.measure_type_technical', {}, 'Technical protective measures') },
        { value: 'complementary', label: t('risk.measure_type_complementary', {}, 'Complementary protective measures') },
        { value: 'warning', label: t('risk.measure_type_warning', {}, 'Warning signs and markings') },
        { value: 'manual', label: t('risk.measure_type_manual', {}, 'Information in manual') },
        { value: 'organizational', label: t('risk.measure_type_organizational', {}, 'Organizational measures') },
        { value: 'ppe', label: t('risk.measure_type_ppe', {}, 'Personal protective equipment') }
    ];
}

/**
 * Render protective measures list
 * @param {Object} risk - Risk object
 * @returns {string} HTML string
 */
export function renderProtectiveMeasuresList(risk) {
    if (!risk.protectiveMeasures || risk.protectiveMeasures.length === 0) {
        return `<p style="margin-bottom: 1rem; color: var(--text-secondary); font-size: 0.85rem; font-style: italic;">
            ${t('risk.no_measures', {}, 'Inga skyddsåtgärder tillagda')}
        </p>`;
    }
    
    return `
        <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem;">
            ${risk.protectiveMeasures.map((item, i) => {
                const measureText = typeof item === 'string' ? item : (item.measure || '');
                const measureType = typeof item === 'object' ? (item.type || '') : '';
                return `
                <div style="padding: 0.75rem; background: white; border: 1px solid var(--border-color); border-radius: var(--border-radius);">
                    <div style="display: flex; gap: 0.5rem; align-items: start; margin-bottom: 0.5rem;">
                        <span style="font-weight: bold; color: var(--primary-color); min-width: 20px;">${i + 1}.</span>
                        <textarea class="form-textarea" rows="2" style="flex: 1; margin: 0;" 
                                  onchange="window.updateProtectiveMeasure('${risk.id}', ${i}, 'measure', this.value);">${measureText}</textarea>
                        <button class="btn btn-danger" 
                                onclick="window.removeProtectiveMeasure('${risk.id}', ${i});" 
                                style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">✕</button>
                    </div>
                    <div style="margin-left: 28px;">
                        <label style="font-size: 0.75rem; color: var(--text-secondary); display: block; margin-bottom: 0.25rem;">
                            ${t('risk.measure_type', {}, 'Åtgärdstyp')}:
                        </label>
                        <select class="form-select" style="width: 100%; font-size: 0.875rem;" 
                                onchange="window.updateProtectiveMeasure('${risk.id}', ${i}, 'type', this.value);">
                            <option value="" ${measureType === '' ? 'selected' : ''}>${t('risk.measure_type', {}, 'Åtgärdstyp')}...</option>
                            ${getMeasureTypes().map(type => 
                                `<option value="${type.value}" ${measureType === type.value ? 'selected' : ''}>${type.label}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
            `}).join('')}
        </div>
    `;
}

/**
 * Render PL (Performance Level) section for safety functions
 * @param {Object} risk - Risk object
 * @returns {string} HTML string
 */
export function renderPLSection(risk) {
    if (!risk.isSafetyFunction) {
        return '';
    }
    
    const recommendedPL = calculatePL(risk.parametersIN.S, risk.parametersIN.F, risk.parametersIN.A);
    const selectedPL = risk.selectedPL || recommendedPL.level;
    const hasDeviation = selectedPL !== recommendedPL.level;
    
    return `
        <div style="margin: 1rem 0; padding: 1rem; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #0ea5e9; border-radius: var(--border-radius);">
            <h4 style="margin: 0 0 0.75rem 0; color: #0284c7; font-size: 0.95rem;">
                ${t('risk.pl_title', {}, 'Performance Level (PLr)')}
            </h4>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <!-- Recommended PLr -->
                <div style="padding: 0.75rem; background: white; border-radius: 6px; border: 2px solid #dbeafe;">
                    <div style="font-size: 0.8rem; color: #64748b; font-weight: 600; margin-bottom: 0.5rem;">
                        ${t('risk.pl_recommended', {}, 'REKOMMENDERAD PLr')}
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div style="width: 50px; height: 50px; background: ${recommendedPL.color}; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px;">
                            ${recommendedPL.level.toUpperCase()}
                        </div>
                        <div style="font-size: 0.85rem; color: #1e293b;">
                            <div style="font-weight: 600;">${recommendedPL.description}</div>
                            <div style="color: #64748b; font-size: 0.75rem; margin-top: 0.25rem;">
                                S${risk.parametersIN.S} | F${risk.parametersIN.F} | P${risk.parametersIN.P}
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Selected PLr -->
                <div style="padding: 0.75rem; background: white; border-radius: 6px; border: 2px solid ${hasDeviation ? '#fed7aa' : '#dbeafe'};">
                    <div style="font-size: 0.8rem; color: #64748b; font-weight: 600; margin-bottom: 0.5rem;">
                        ${t('risk.pl_selected', {}, 'VALD PLr')}
                    </div>
                    <select class="form-select" 
                            onchange="updateRisk('${risk.id}', 'selectedPL', this.value); document.getElementById('pl-justification-${risk.id}').style.display = (this.value !== '${recommendedPL.level}') ? 'block' : 'none';" 
                            style="width: 100%;">
                        ${['a', 'b', 'c', 'd', 'e'].map(level => {
                            const info = getPLInfo(level);
                            return `<option value="${level}" ${selectedPL === level ? 'selected' : ''}>
                                PL ${level.toUpperCase()} - ${info.description}
                            </option>`;
                        }).join('')}
                    </select>
                    ${hasDeviation ? `
                        <div style="color: #d97706; font-size: 0.75rem; margin-top: 0.5rem; font-weight: 600;">
                            ⚠️ ${t('risk.pl_deviation_warning', {}, 'Ändrat från rekommenderat värde')}
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- PL Deviation justification -->
            ${hasDeviation ? `
                <div class="form-group" id="pl-justification-${risk.id}" 
                     style="display: block; background: #fffbeb; padding: 0.75rem; border-radius: 6px; border-left: 3px solid #f59e0b;">
                    <label class="form-label" style="color: #92400e; font-weight: 600;">
                        🔴 ${t('risk.pl_justification_required', {}, 'OBLIGATORISK KOMMENTAR')}
                    </label>
                    <small style="color: #b45309; display: block; margin-bottom: 0.5rem;">
                        ${t('risk.pl_justification_help', {}, 'Du måste förklara varför du avviker från rekommenderat PLr')}
                    </small>
                    <textarea class="form-textarea" rows="3" 
                              onchange="updateRisk('${risk.id}', 'plDeviation', this.value);" 
                              placeholder="${t('risk.pl_justification_placeholder', {}, 'Förklara avvikelsen från rekommenderat PLr...')}" 
                              style="border: 2px solid #f59e0b;">${risk.plDeviation || ''}</textarea>
                    <div style="color: #dc2626; font-size: 0.8rem; margin-top: 0.5rem; display: ${!risk.plDeviation ? 'block' : 'none'};">
                        <strong>⚠️ ${t('risk.pl_justification_mandatory', {}, 'Kommentaren är obligatorisk!')}</strong>
                    </div>
                </div>
            ` : `<div id="pl-justification-${risk.id}" style="display: none;"></div>`}
        </div>
    `;
}

/**
 * Validate PL deviation
 * @param {Object} risk - Risk object
 * @returns {Object} Validation result
 */
export function validatePLDeviation(risk) {
    if (!risk.isSafetyFunction) {
        return { isValid: true, errors: [] };
    }
    
    const recommendedPL = calculatePL(risk.parametersIN.S, risk.parametersIN.F, risk.parametersIN.A);
    const selectedPL = risk.selectedPL || recommendedPL.level;
    
    // If PL is changed but no deviation reason provided
    if (selectedPL !== recommendedPL.level && (!risk.plDeviation || !risk.plDeviation.trim())) {
        return {
            isValid: false,
            errors: [t('validation.pldeviationrequired', {}, 
                'Motivering krävs när PLr avviker från rekommenderat värde')]
        };
    }
    
    return { isValid: true, errors: [] };
}

/**
 * Get safety function statistics
 * @param {Array} risks - Array of risk objects
 * @returns {Object} Statistics
 */
export function getSafetyFunctionStats(risks) {
    const safetyFunctions = risks.filter(r => r.isSafetyFunction);
    
    const plDistribution = {
        a: 0,
        b: 0,
        c: 0,
        d: 0,
        e: 0
    };
    
    safetyFunctions.forEach(risk => {
        const pl = risk.selectedPL || 'a';
        if (plDistribution[pl] !== undefined) {
            plDistribution[pl]++;
        }
    });
    
    return {
        total: safetyFunctions.length,
        plDistribution,
        withDeviations: safetyFunctions.filter(r => {
            const recommended = calculatePL(r.parametersIN.S, r.parametersIN.F, r.parametersIN.A);
            return (r.selectedPL || recommended.level) !== recommended.level;
        }).length
    };
}

/**
 * Render guidance for risk reduction
 * @returns {string} HTML string
 */
export function renderRiskReductionGuidance() {
    return `
        <div style="margin-top: 1.5rem; padding: 1rem; background: var(--bg-secondary); border-radius: var(--border-radius); border-left: 3px solid var(--primary-color);">
            <strong style="display: block; margin-bottom: 0.5rem;">
                ${t('risk.guidance', {}, 'Vägledning för riskminskring')}
            </strong>
            <ul style="margin: 0; padding-left: 1.5rem; font-size: 0.85rem; color: var(--text-secondary);">
                <li>${t('risk.guidance_1', {}, 'Tillämpa konstruktivt säker utformning först (inherent safety)')}</li>
                <li>${t('risk.guidance_2', {}, 'Använd tekniska skyddsåtgärder (guards, interlocks)')}</li>
                <li>${t('risk.guidance_3', {}, 'Komplettera med varnings-/informationsåtgärder')}</li>
                <li>${t('risk.guidance_4', {}, 'Dokumentera restrisk och motivera eventuella avvikelser')}</li>
            </ul>
        </div>
    `;
}
