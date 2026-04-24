/**
 * Risk Validation
 * Handles verification, evidence links, and validation status
 */

import { getRiskById } from './risk-crud.js';
import { t } from '../../i18n/index.js';
import { getProjectRepository } from '../../data/index.js';
import { getCurrentProject } from '../../state.js';

/**
 * Add evidence link to risk
 * @param {string} riskId - Risk ID
 * @param {string} link - Evidence link URL or reference
 * @returns {boolean} Success status
 */
export function addEvidenceLink(riskId, link) {
    if (!link || !link.trim()) {
        return false;
    }
    
    const risk = getRiskById(riskId);
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
 * Remove evidence link from risk
 * @param {string} riskId - Risk ID
 * @param {number} index - Link index
 * @returns {boolean} Success status
 */
export function removeEvidenceLink(riskId, index) {
    const risk = getRiskById(riskId);
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
 * Render validation panel content
 * @param {Object} risk - Risk object
 * @returns {string} HTML string
 */
export function renderValidationPanelContent(risk) {
    return `
        <h4 style="margin-bottom: 0.75rem; font-size: 0.95rem;">
            ${t('risk.validation_status', {}, 'Valideringsstatus')}
        </h4>
        
        <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem;">
            <div class="checkbox-group">
                <input type="checkbox" id="impl-${risk.id}" class="form-checkbox" 
                       ${risk.implemented ? 'checked' : ''} 
                       onchange="updateRisk('${risk.id}', 'implemented', this.checked);" />
                <label for="impl-${risk.id}" class="form-label">
                    ${t('risk.implemented', {}, 'Åtgärder implementerade')}
                </label>
            </div>
            
            <div class="checkbox-group">
                <input type="checkbox" id="verif-${risk.id}" class="form-checkbox" 
                       ${risk.verified ? 'checked' : ''} 
                       onchange="updateRisk('${risk.id}', 'verified', this.checked);" />
                <label for="verif-${risk.id}" class="form-label">
                    ${t('risk.verified', {}, 'Riskreducering verifierad')}
                </label>
            </div>
            
            <div class="checkbox-group">
                <input type="checkbox" id="pl-${risk.id}" class="form-checkbox" 
                       ${risk.plCalculation ? 'checked' : ''} 
                       onchange="updateRisk('${risk.id}', 'plCalculation', this.checked);" />
                <label for="pl-${risk.id}" class="form-label">
                    ${t('risk.pl_calculation', {}, 'PL-beräkning utförd')}
                </label>
            </div>
        </div>
        
        <hr style="margin: 1rem 0; border: none; border-top: 1px solid var(--border-color);" />
        
        <h4 style="margin-bottom: 0.75rem; font-size: 0.9rem;">
            ${t('risk.documentation', {}, 'Dokumentation')}
        </h4>
        
        <div class="form-group">
            <label class="form-label">${t('risk.comment', {}, 'Kommentar')}</label>
            <textarea class="form-textarea" rows="3" 
                      onchange="updateRisk('${risk.id}', 'comment', this.value)" 
                      placeholder="${t('risk.comment_placeholder', {}, 'Kommentarer, noteringar...')}">${risk.comment || ''}</textarea>
        </div>
        
        <div class="form-group">
            <label class="form-label">${t('risk.evidence_link', {}, 'Evidens/Bevis')}</label>
            <small style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.75rem;">
                ${t('risk.evidence_info', {}, 'Lägg till länkar till testprotokoll, beräkningar, certifikat etc.')}
            </small>
            <div style="display: flex; gap: 0.5rem;">
                <input type="text" id="evidence-input-${risk.id}" class="form-input" 
                       placeholder="${t('risk.evidence_placeholder', {}, 'URL eller referens...')}" />
                <button class="btn btn-primary" 
                        onclick="addEvidenceLink('${risk.id}', document.getElementById('evidence-input-${risk.id}').value); document.getElementById('evidence-input-${risk.id}').value='';">
                    ${t('risk.evidence_add', {}, 'Lägg till')}
                </button>
            </div>
            
            ${risk.evidenceLinks && risk.evidenceLinks.length > 0 ? `
                <div style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem;">
                    ${risk.evidenceLinks.map((link, i) => `
                        <div style="display: flex; gap: 0.5rem; align-items: center; padding: 0.5rem; background: var(--bg-secondary); border-radius: var(--border-radius);">
                            <span style="flex: 1; color: var(--primary-color); font-size: 0.875rem; word-break: break-all;">🔗 ${link}</span>
                            <button class="btn btn-danger" 
                                    onclick="removeEvidenceLink('${risk.id}', ${i}); renderRiskCards();" 
                                    style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">
                                ${t('dialog.close', {}, 'Stäng')}
                            </button>
                        </div>
                    `).join('')}
                </div>
            ` : `
                <p style="margin-top: 0.5rem; color: var(--text-secondary); font-size: 0.85rem; font-style: italic;">
                    ${t('risk.no_evidence', {}, 'Ingen evidens tillagd')}
                </p>
            `}
        </div>
        
        <div style="margin-top: 1.5rem; padding: 1rem; background: var(--bg-secondary); border-radius: var(--border-radius); border-left: 3px solid var(--success-color);">
            <strong style="display: block; margin-bottom: 0.5rem;">
                ${t('risk.validation_requirements', {}, 'Valideringskrav')}
            </strong>
            <ul style="margin: 0; padding-left: 1.5rem; font-size: 0.85rem; color: var(--text-secondary);">
                <li>${t('risk.validation_req_1', {}, 'Verifiera att skyddsåtgärder är korrekt implementerade')}</li>
                <li>${t('risk.validation_req_2', {}, 'Bekräfta att restrisken är acceptabel')}</li>
                <li>${t('risk.validation_req_3', {}, 'Dokumentera all evidens (tester, beräkningar)')}</li>
                <li>${t('risk.validation_req_4', {}, 'För säkerhetsfunktioner: Verifiera att PLr uppnås')}</li>
            </ul>
        </div>
    `;
}

/**
 * Validate risk completeness
 * @param {Object} risk - Risk object
 * @returns {Object} Validation result with errors and warnings
 */
export function validateRiskCompleteness(risk) {
    const errors = [];
    const warnings = [];
    
    // Basic risk information
    if (!risk.description?.trim()) {
        errors.push(t('validation.descriptionrequired', {}, 'Riskbeskrivning måste anges'));
    }
    
    if (!risk.zone?.trim()) {
        warnings.push(t('validation.zonemissing', {}, 'Hazard zone bör anges'));
    }
    
    if (!risk.riskGroup?.trim()) {
        warnings.push(t('validation.riskgroupmissing', {}, 'Riskgrupp bör anges'));
    }
    
    // Protective measures
    if (!risk.protectiveMeasures || risk.protectiveMeasures.length === 0) {
        warnings.push(t('validation.nomeasures', {}, 'Inga skyddsåtgärder angivna'));
    } else {
        // Check if measure types are specified
        const measuresWithoutType = risk.protectiveMeasures.filter(m => 
            typeof m === 'object' && (!m.type || !m.type.trim())
        );
        
        if (measuresWithoutType.length > 0) {
            warnings.push(t('validation.measuretypemissing', {}, 
                `${measuresWithoutType.length} åtgärder saknar åtgärdstyp`));
        }
    }
    
    // Measure valuation
    if (risk.protectiveMeasures?.length > 0 && !risk.measureValuationReason?.trim()) {
        warnings.push(t('validation.measurevaluationmissing', {}, 
            'Motivering av åtgärdsvärdering saknas'));
    }
    
    // Safety function validation
    if (risk.isSafetyFunction) {
        const recommendedPL = typeof RiskMatrix !== 'undefined' && RiskMatrix?.calculatePL ?
                RiskMatrix.calculatePL(risk.parametersIN.S, risk.parametersIN.F, risk.parametersIN.A) :
            { level: 'c' };
        
        const selectedPL = risk.selectedPL || recommendedPL.level;
        
        if (selectedPL !== recommendedPL.level && (!risk.plDeviation || !risk.plDeviation.trim())) {
            errors.push(t('validation.pldeviationrequired', {}, 
                'Motivering krävs när PLr avviker från rekommenderat värde'));
        }
        
        if (!risk.plCalculation) {
            warnings.push(t('validation.plcalculationmissing', {}, 
                'PL-beräkning bör markeras som utförd'));
        }
    }
    
    // Verification status
    if (!risk.implemented && risk.verified) {
        warnings.push(t('validation.verifiedbutnotimplemented', {}, 
            'Risk markerad som verifierad men inte implementerad'));
    }
    
    // Evidence
    if (risk.verified && (!risk.evidenceLinks || risk.evidenceLinks.length === 0)) {
        warnings.push(t('validation.noevidenceforverified', {}, 
            'Verifierade risker bör ha evidens/bevis dokumenterad'));
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Get validation statistics for all risks
 * @param {Array} risks - Array of risk objects
 * @returns {Object} Validation statistics
 */
export function getValidationStatistics(risks) {
    const stats = {
        total: risks.length,
        complete: 0,
        withErrors: 0,
        withWarnings: 0,
        implemented: 0,
        verified: 0,
        plCalculated: 0,
        withEvidence: 0
    };
    
    risks.forEach(risk => {
        const validation = validateRiskCompleteness(risk);
        
        if (validation.isValid && validation.warnings.length === 0) {
            stats.complete++;
        }
        
        if (!validation.isValid) {
            stats.withErrors++;
        }
        
        if (validation.warnings.length > 0) {
            stats.withWarnings++;
        }
        
        if (risk.implemented) stats.implemented++;
        if (risk.verified) stats.verified++;
        if (risk.plCalculation) stats.plCalculated++;
        if (risk.evidenceLinks?.length > 0) stats.withEvidence++;
    });
    
    return stats;
}

/**
 * Check if risk assessment is ready for export/reporting
 * @param {Array} risks - Array of risk objects
 * @returns {Object} Readiness assessment
 */
export function checkAssessmentReadiness(risks) {
    const criticalErrors = [];
    const warnings = [];
    
    if (risks.length === 0) {
        criticalErrors.push(t('validation.norisks', {}, 'Inga risker har skapats'));
        return {
            isReady: false,
            criticalErrors,
            warnings
        };
    }
    
    risks.forEach((risk, index) => {
        const validation = validateRiskCompleteness(risk);
        
        if (!validation.isValid) {
            validation.errors.forEach(error => {
                criticalErrors.push(`Risk #${index + 1}: ${error}`);
            });
        }
        
        validation.warnings.forEach(warning => {
            warnings.push(`Risk #${index + 1}: ${warning}`);
        });
    });
    
    // Check for high residual risks
    const highResidualRisks = risks.filter(risk => {
        if (typeof RiskMatrix === 'undefined' || !RiskMatrix?.getRiskDescription) {
            return false;
        }
        
        const riskOUT = RiskMatrix.getRiskDescription(
            risk.parametersOUT.S,
            risk.parametersOUT.F,
            risk.parametersOUT.P,
            risk.parametersOUT.A
        );
        
        return riskOUT.classification === 'high';
    });
    
    if (highResidualRisks.length > 0) {
        warnings.push(t('validation.highresidualrisks', 
            { count: highResidualRisks.length }, 
            `${highResidualRisks.length} risker har kvarstående hög risk efter åtgärder`));
    }
    
    return {
        isReady: criticalErrors.length === 0,
        criticalErrors,
        warnings
    };
}
