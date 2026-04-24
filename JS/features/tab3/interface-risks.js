/**
 * Interface Risks UI Rendering
 * Handles the visual rendering of interface risks UI for Tab 3
 */

import { getAllInterfaceRisks, getInterfaceRiskIndex } from './interface-crud.js';
import { getCurrentProject } from '../../state.js';
import { t } from '../../i18n/index.js';
import { riskGroupsData, riskListLabels } from '../../config/risk-data.js';

// Import parameter rendering from Tab 2
import { renderParameterSelectCompact, getRiskDescription } from '../tab2/risk-parameters.js';
import { renderProtectiveMeasuresList, getMeasureTypes } from '../tab2/risk-measures.js';

// Get localized labels from risk data
function getLocalizedListLabel(listType, value) {
    if (!riskGroupsData || !riskListLabels) return value;
    
    const currentLang = window.currentLanguage || 'sv';
    const labelObj = riskListLabels[listType];
    
    if (!labelObj) return value;
    
    const match = Object.keys(labelObj).find(key => key === value);
    if (!match) return value;
    
    return labelObj[match][currentLang] || value;
}

// Render options with fallback
function renderOptionsWithFallback(listType, selectedValue) {
    if (!riskGroupsData) return '';
    
    const list = riskGroupsData[listType] || [];
    return list.map(item => {
        const label = getLocalizedListLabel(listType, item);
        return `<option value="${item}" ${item === selectedValue ? 'selected' : ''}>${label}</option>`;
    }).join('');
}

/**
 * Render all interface risks
 */
export function renderInterfaceRisks() {
    const container = document.getElementById('interface-risks-container');
    if (!container) {
        console.warn('interface-risks-container not found');
        return;
    }
    
    const project = getCurrentProject();
    
    try {
        if (!project || !project.interfaceRisks) {
            container.innerHTML = `<div class="card"><p>${t('message.loading', {}, 'Laddar...')}</p></div>`;
            return;
        }
        
        console.log('Rendering interface risks:', project.interfaceRisks.length);
        
        if (typeof riskGroupsData === 'undefined' || !riskGroupsData) {
            container.innerHTML = `<div class="card"><p>${t('message.loading', {}, 'Laddar...')}</p></div>`;
            return;
        }
        
        if (project.interfaceRisks.length === 0) {
            container.innerHTML = `
                <div class="card" style="text-align: center; padding: 2rem; background: var(--bg-secondary);">
                    <p style="color: var(--text-secondary); margin: 0;">
                        ${t('interface.norisks', {}, 'Inga interface-risker tillagda ännu')}
                    </p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = project.interfaceRisks.map(
            (risk, index) => renderInterfaceRiskCard(risk, index)
        ).join('');
    } catch (error) {
        console.warn('Error rendering interface risks:', error.message);
        container.innerHTML = `<div class="card"><p>${t('message.loading', {}, 'Laddar...')}</p></div>`;
    }
}

/**
 * Render single interface risk card
 * @param {Object} risk - Interface risk object
 * @param {number} index - Risk index
 * @returns {string} HTML string
 */
function renderInterfaceRiskCard(risk, index) {
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
    
    // Get parameter levels
    const sLevel = (typeof RiskMatrix !== 'undefined' && RiskMatrix) ? 
        RiskMatrix.severityLevels : window.RiskLevelsFallback?.severityLevels || {};
    const fLevel = (typeof RiskMatrix !== 'undefined' && RiskMatrix) ? 
        RiskMatrix.frequencyLevels : window.RiskLevelsFallback?.frequencyLevels || {};
    const pLevel = (typeof RiskMatrix !== 'undefined' && RiskMatrix) ? 
        RiskMatrix.probabilityLevels : window.RiskLevelsFallback?.probabilityLevels || {};
    const aLevel = (typeof RiskMatrix !== 'undefined' && RiskMatrix) ? 
        RiskMatrix.avoidanceLevels : window.RiskLevelsFallback?.avoidanceLevels || {};
    
    return `
        <div class="risk-card ${riskIN.classification}-risk" data-interface-risk-id="${risk.id}">
            <div class="risk-card-header" onclick="toggleInterfaceRiskDetails('${risk.id}')" style="cursor: pointer;">
                <div style="display: flex; flex-direction: column; flex: 1; gap: 0.25rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <strong>#${index + 1}</strong>
                        <span class="risk-level-badge ${riskIN.classification}">${riskIN.classification.toUpperCase()}</span>
                        ${risk.protectiveMeasures && risk.protectiveMeasures.length > 0 ? 
                            `<span style="font-size: 0.75rem; color: var(--success-color);">→ ${riskOUT.classification.toUpperCase()}</span>` : ''}
                        <span id="collapse-icon-interface-${risk.id}" style="margin-left: auto; font-size: 1.2rem; color: var(--text-secondary);">▼</span>
                    </div>
                    ${risk.interfaceWith || risk.riskGroup ? `
                        <div style="font-size: 0.75rem; color: var(--text-secondary); margin-left: 1.5rem;">
                            ${risk.interfaceWith ? `<span><strong>Interface med:</strong> ${risk.interfaceWith}</span>` : ''}
                            ${risk.interfaceWith && risk.riskGroup ? ' | ' : ''}
                            ${risk.riskGroup ? `<span><strong>Riskgrupp:</strong> ${risk.riskGroup}</span>` : ''}
                        </div>
                    ` : ''}
                </div>
                <button class="btn btn-danger" 
                        onclick="event.stopPropagation(); deleteInterfaceRisk('${risk.id}');" 
                        style="padding: 0.25rem 0.5rem; font-size: 0.875rem;">✕</button>
            </div>
            
            <div class="risk-card-content" id="interface-risk-content-${risk.id}">
                <div class="risk-in-section">
                    <div class="panel-header" style="background: var(--bg-secondary); padding: var(--spacing-sm); border-radius: var(--border-radius); margin-bottom: var(--spacing-md);">
                        <h4 style="margin: 0; color: var(--danger-color);">
                            ⚠️ ${t('risk.risk_in', {}, 'Risk IN')} - ${t('interface.description', {}, 'Interface-beskrivning')}
                        </h4>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" style="font-size: 0.8rem;">
                            ${t('interface.interfacewith', {}, 'Interface med')}
                        </label>
                        <input type="text" class="form-input" style="font-size: 0.85rem; padding: 0.4rem;" 
                               value="${risk.interfaceWith || ''}" 
                               placeholder="${t('interface.placeholder', {}, 'T.ex. Transportband A...')}" 
                               onchange="updateInterfaceRisk('${risk.id}', 'interfaceWith', this.value)" />
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" style="font-size: 0.8rem;">
                            ${t('risk.description', {}, 'Riskbeskrivning')}
                        </label>
                        <textarea class="form-textarea" rows="3" style="font-size: 0.85rem;" 
                                  placeholder="${t('interface.describe', {}, 'Beskriv interface-risken...')}" 
                                  onchange="updateInterfaceRisk('${risk.id}', 'description', this.value)">${risk.description || ''}</textarea>
                    </div>
                    
                    <div class="grid grid-2" style="gap: 0.5rem;">
                        <div class="form-group">
                            <label class="form-label" style="font-size: 0.8rem;">
                                ${t('risk.group', {}, 'Riskgrupp')}
                            </label>
                            <select class="form-select" style="font-size: 0.85rem; padding: 0.4rem;" 
                                    onchange="updateInterfaceRisk('${risk.id}', 'riskGroup', this.value)">
                                <option value="">${t('risk.choose', {}, 'Välj...')}</option>
                                ${renderOptionsWithFallback('riskGroups', risk.riskGroup)}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" style="font-size: 0.8rem;">
                                ${t('risk.zone_area', {}, 'Hazard zone')}
                            </label>
                            <select class="form-select" style="font-size: 0.85rem; padding: 0.4rem;" 
                                    onchange="updateInterfaceRisk('${risk.id}', 'area', this.value)">
                                <option value="">${t('risk.choose', {}, 'Välj...')}</option>
                                ${renderOptionsWithFallback('hazardZones', risk.area)}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" style="font-size: 0.8rem;">
                                ${t('risk.hazard_source', {}, 'Farokälla')}
                            </label>
                            <select class="form-select" style="font-size: 0.85rem; padding: 0.4rem;" 
                                    onchange="updateInterfaceRisk('${risk.id}', 'hazardSource', this.value)">
                                <option value="">${t('risk.choose', {}, 'Välj...')}</option>
                                ${renderOptionsWithFallback('hazardSources', risk.hazardSource)}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" style="font-size: 0.8rem;">
                                ${t('risk.injury_type', {}, 'Skadetyp')}
                            </label>
                            <select class="form-select" style="font-size: 0.85rem; padding: 0.4rem;" 
                                    onchange="updateInterfaceRisk('${risk.id}', 'injury', this.value)">
                                <option value="">${t('risk.choose', {}, 'Välj...')}</option>
                                ${renderOptionsWithFallback('injuries', risk.injury)}
                            </select>
                        </div>
                    </div>
                    
                    <div class="risk-params-compact">
                        ${renderParameterSelectCompact('S', risk.id, 'IN', risk.parametersIN.S, sLevel, true)}
                        ${renderParameterSelectCompact('F', risk.id, 'IN', risk.parametersIN.F, fLevel, true)}
                        ${renderParameterSelectCompact('P', risk.id, 'IN', risk.parametersIN.P, pLevel, true)}
                        ${renderParameterSelectCompact('A', risk.id, 'IN', risk.parametersIN.A, aLevel, true)}
                    </div>
                    
                    <div class="risk-summary-box">
                        <strong>${t('risk.risk_in', {}, 'Risk IN')}: ${riskIN.value}</strong> | ${riskIN.classificationText}
                    </div>
                </div>
                
                <!-- Sidebar med åtgärds- och valideringsknappar -->
                <div class="risk-actions-sidebar">
                    <button class="sidebar-toggle" id="interface-action-toggle-${risk.id}" 
                            onclick="toggleInterfaceActionPanel('${risk.id}')" 
                            title="${t('risk.open_actions', {}, 'Öppna åtgärder')}">
                        ⚡ ${t('risk.reduce_risk', {}, 'Riskminskning')}
                    </button>
                    <button class="sidebar-toggle" id="interface-validation-toggle-${risk.id}" 
                            onclick="toggleInterfaceValidationPanel('${risk.id}')" 
                            title="${t('risk.open_validation', {}, 'Öppna validering')}" disabled>
                        ✓ ${t('risk.validation', {}, 'Validering')}
                    </button>
                </div>
                
                <div class="risk-action-panel" id="interface-action-panel-${risk.id}">
                    ${renderInterfaceActionPanelContent(risk, sLevel, fLevel, pLevel, aLevel, riskOUT)}
                </div>
                
                <div class="risk-validation-panel" id="interface-validation-panel-${risk.id}">
                    ${renderInterfaceValidationPanelContent(risk)}
                </div>
            </div>
        </div>
    `;
}

/**
 * Render action panel content for interface risk
 */
function renderInterfaceActionPanelContent(risk, sLevel, fLevel, pLevel, aLevel, riskOUT) {
    return `
        <div class="panel-header" style="background: var(--bg-secondary); padding: var(--spacing-sm); border-radius: var(--border-radius); margin-bottom: var(--spacing-md);">
            <h4 style="margin: 0; color: var(--success-color);">
                ⚡ ${t('risk.reduce_risk', {}, 'Riskminskning')}
            </h4>
        </div>
        
        <div class="form-group">
            <label class="form-label">${t('risk.protective_measures', {}, 'Skyddsåtgärder')}</label>
            <small style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.75rem;">
                ${t('risk.measures_info', {}, 'Ange skyddsåtgärder i prioritetsordning')}
            </small>
            
            ${renderInterfaceProtectiveMeasuresList(risk)}
            
            <div style="display: flex; gap: 0.5rem;">
                <input type="text" id="new-interface-measure-${risk.id}" class="form-input" 
                       placeholder="${t('risk.describe_new_measure', {}, 'Beskriv ny åtgärd...')}" />
                <button class="btn btn-primary" 
                        onclick="window.addInterfaceProtectiveMeasure('${risk.id}', document.getElementById('new-interface-measure-${risk.id}').value); document.getElementById('new-interface-measure-${risk.id}').value='';">
                    ${t('risk.add_measure', {}, 'Lägg till')}
                </button>
            </div>
        </div>
        
        <div class="form-group">
            <label class="form-label">${t('risk.measure_valuation', {}, 'Värdering av åtgärder')}</label>
            <textarea class="form-textarea" rows="3" 
                      onchange="updateInterfaceRisk('${risk.id}', 'measureValuationReason', this.value)" 
                      placeholder="${t('risk.measure_valuation_placeholder', {}, 'Motivera varför åtgärderna bedöms som tillräckliga...')}">${risk.measureValuationReason || ''}</textarea>
        </div>
        
        <div class="form-group">
            <div class="checkbox-group">
                <input type="checkbox" id="interface-safety-func-${risk.id}" class="form-checkbox" 
                       ${risk.isSafetyFunction ? 'checked' : ''} 
                       onchange="updateInterfaceRisk('${risk.id}', 'isSafetyFunction', this.checked);" />
                <label for="interface-safety-func-${risk.id}" class="form-label">
                    ${t('risk.safety_function', {}, 'Säkerhetsfunktion krävs')}
                </label>
            </div>
        </div>
        
        <hr style="margin: 1rem 0; border: none; border-top: 1px solid var(--border-color);" />
        
        <h4 style="margin-bottom: 0.75rem; color: var(--primary-color); font-size: 0.9rem;">
            ${t('risk.remaining_params', {}, 'Kvarstående riskparametrar (Risk OUT)')}
        </h4>
        
        <div class="risk-params-compact">
            ${renderParameterSelectCompact('S', risk.id, 'OUT', risk.parametersOUT.S, sLevel, true)}
            ${renderParameterSelectCompact('F', risk.id, 'OUT', risk.parametersOUT.F, fLevel, true)}
            ${renderParameterSelectCompact('P', risk.id, 'OUT', risk.parametersOUT.P, pLevel, true)}
            ${renderParameterSelectCompact('A', risk.id, 'OUT', risk.parametersOUT.A, aLevel, true)}
        </div>
        
        <div class="risk-summary-box" style="margin-top: 1rem; background: ${riskOUT.classification === 'high' ? '#fee2e2' : riskOUT.classification === 'medium' ? '#fef3c7' : riskOUT.classification === 'lowMedium' ? '#fef9c3' : '#d1fae5'};">
            <strong>${t('risk.risk_out', {}, 'Risk OUT')}: ${riskOUT.value}</strong> | ${riskOUT.classificationText}
        </div>
    `;
}

/**
 * Render interface protective measures list
 */
function renderInterfaceProtectiveMeasuresList(risk) {
    if (!risk.protectiveMeasures || risk.protectiveMeasures.length === 0) {
        return `<p style="margin-bottom: 1rem; color: var(--text-secondary); font-size: 0.85rem; font-style: italic;">
            ${t('risk.no_measures', {}, 'Inga skyddsåtgärder tillagda')}
        </p>`;
    }
    
    const measureTypes = getMeasureTypes();
    
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
                                  onchange="window.updateInterfaceProtectiveMeasure('${risk.id}', ${i}, 'measure', this.value);">${measureText}</textarea>
                        <button class="btn btn-danger" 
                                onclick="window.removeInterfaceProtectiveMeasure('${risk.id}', ${i});" 
                                style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">✕</button>
                    </div>
                    <div style="margin-left: 28px;">
                        <label style="font-size: 0.75rem; color: var(--text-secondary); display: block; margin-bottom: 0.25rem;">
                            ${t('risk.measure_type', {}, 'Åtgärdstyp')}:
                        </label>
                        <select class="form-select" style="width: 100%; font-size: 0.875rem;" 
                                onchange="window.updateInterfaceProtectiveMeasure('${risk.id}', ${i}, 'type', this.value);">
                            <option value="" ${measureType === '' ? 'selected' : ''}>${t('risk.measure_type', {}, 'Åtgärdstyp')}...</option>
                            ${measureTypes.map(type => 
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
 * Render validation panel content for interface risk
 */
function renderInterfaceValidationPanelContent(risk) {
    return `
        <div class="panel-header" style="background: var(--bg-secondary); padding: var(--spacing-sm); border-radius: var(--border-radius); margin-bottom: var(--spacing-md);">
            <h4 style="margin: 0; color: var(--success-color);">
                ✓ ${t('risk.validation', {}, 'Validering')}
            </h4>
        </div>
        
        <h4 style="margin-bottom: 0.75rem; font-size: 0.9rem;">
            ${t('risk.validation_status', {}, 'Valideringsstatus')}
        </h4>
        
        <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem;">
            <div class="checkbox-group">
                <input type="checkbox" id="interface-impl-${risk.id}" class="form-checkbox" 
                       ${risk.implemented ? 'checked' : ''} 
                       onchange="updateInterfaceRisk('${risk.id}', 'implemented', this.checked);" />
                <label for="interface-impl-${risk.id}" class="form-label">
                    ${t('risk.implemented', {}, 'Åtgärder implementerade')}
                </label>
            </div>
            
            <div class="checkbox-group">
                <input type="checkbox" id="interface-verif-${risk.id}" class="form-checkbox" 
                       ${risk.verified ? 'checked' : ''} 
                       onchange="updateInterfaceRisk('${risk.id}', 'verified', this.checked);" />
                <label for="interface-verif-${risk.id}" class="form-label">
                    ${t('risk.verified', {}, 'Riskreducering verifierad')}
                </label>
            </div>
            
            <div class="checkbox-group">
                <input type="checkbox" id="interface-pl-${risk.id}" class="form-checkbox" 
                       ${risk.plCalculation ? 'checked' : ''} 
                       onchange="updateInterfaceRisk('${risk.id}', 'plCalculation', this.checked);" />
                <label for="interface-pl-${risk.id}" class="form-label">
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
                      onchange="updateInterfaceRisk('${risk.id}', 'comment', this.value)" 
                      placeholder="${t('risk.comment_placeholder', {}, 'Kommentarer, noteringar...')}">${risk.comment || ''}</textarea>
        </div>
        
        <div class="form-group">
            <label class="form-label">${t('risk.evidence_link', {}, 'Evidens/Bevis')}</label>
            <div style="display: flex; gap: 0.5rem;">
                <input type="text" id="interface-evidence-input-${risk.id}" class="form-input" 
                       placeholder="${t('risk.evidence_placeholder', {}, 'URL eller referens...')}" />
                <button class="btn btn-primary" 
                        onclick="addInterfaceEvidenceLink('${risk.id}', document.getElementById('interface-evidence-input-${risk.id}').value); document.getElementById('interface-evidence-input-${risk.id}').value='';">
                    ${t('risk.evidence_add', {}, 'Lägg till')}
                </button>
            </div>
            
            ${risk.evidenceLinks && risk.evidenceLinks.length > 0 ? `
                <div style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem;">
                    ${risk.evidenceLinks.map((link, i) => `
                        <div style="display: flex; gap: 0.5rem; align-items: center; padding: 0.5rem; background: var(--bg-secondary); border-radius: var(--border-radius);">
                            <span style="flex: 1; color: var(--primary-color); font-size: 0.875rem; word-break: break-all;">🔗 ${link}</span>
                            <button class="btn btn-danger" 
                                    onclick="removeInterfaceEvidenceLink('${risk.id}', ${i}); renderInterfaceRisks();" 
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
    `;
}

/**
 * Toggle interface risk details (collapse/expand)
 */
export function toggleInterfaceRiskDetails(riskId) {
    const content = document.getElementById(`interface-risk-content-${riskId}`);
    const icon = document.getElementById(`collapse-icon-interface-${riskId}`);
    
    if (!content || !icon) return;
    
    if (content.classList.contains('collapsed')) {
        content.classList.remove('collapsed');
        icon.textContent = '▼';
    } else {
        content.classList.add('collapsed');
        icon.textContent = '▶';
    }
}

/**
 * Toggle interface action panel
 */
export function toggleInterfaceActionPanel(riskId) {
    const panel = document.getElementById(`interface-action-panel-${riskId}`);
    const toggle = document.getElementById(`interface-action-toggle-${riskId}`);
    const validationToggle = document.getElementById(`interface-validation-toggle-${riskId}`);
    
    if (!panel || !toggle) return;
    
    if (panel.classList.contains('open')) {
        panel.classList.remove('open');
        toggle.classList.remove('active');
        
        const validationPanel = document.getElementById(`interface-validation-panel-${riskId}`);
        if (validationPanel && validationPanel.classList.contains('open')) {
            validationPanel.classList.remove('open');
            const valToggle = document.getElementById(`interface-validation-toggle-${riskId}`);
            if (valToggle) valToggle.classList.remove('active');
        }
        
        if (validationToggle) validationToggle.disabled = true;
    } else {
        panel.classList.add('open');
        toggle.classList.add('active');
        if (validationToggle) validationToggle.disabled = false;
    }
}

/**
 * Toggle interface validation panel
 */
export function toggleInterfaceValidationPanel(riskId) {
    const panel = document.getElementById(`interface-validation-panel-${riskId}`);
    const toggle = document.getElementById(`interface-validation-toggle-${riskId}`);
    
    if (!panel || !toggle) return;
    
    if (panel.classList.contains('open')) {
        panel.classList.remove('open');
        toggle.classList.remove('active');
    } else {
        panel.classList.add('open');
        toggle.classList.add('active');
    }
}

// Expose to window for onclick handlers
if (typeof window !== 'undefined') {
    window.toggleInterfaceRiskDetails = toggleInterfaceRiskDetails;
    window.toggleInterfaceActionPanel = toggleInterfaceActionPanel;
    window.toggleInterfaceValidationPanel = toggleInterfaceValidationPanel;
}
