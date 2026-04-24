/**
 * Risk Cards UI Rendering
 * Handles the visual rendering of risk assessment UI
 */

import { getAllRisks, getRiskIndex, getSortedRisks } from './risk-crud.js';
import { getRiskDescription, renderParameterSelectCompact } from './risk-parameters.js';
import { renderProtectiveMeasuresList, renderPLSection, renderRiskReductionGuidance } from './risk-measures.js';
import { renderValidationPanelContent } from './risk-validation.js';
import { getState, getCurrentProject, getSelectedRiskId, setSelectedRiskId, setRiskSortOrder } from '../../state.js';
import { t as translate } from '../../i18n/index.js';
import { riskGroupsData, riskListLabels } from '../../config/risk-data.js';

const t = (...args) => {
    if (typeof translate === 'function') return translate(...args);
    if (typeof window !== 'undefined' && typeof window.t === 'function') return window.t(...args);
    return args[2] ?? args[0];
};

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
 * Render risk cards layout
 */
export function renderRiskCards() {
    const container = document.getElementById('riskCardsList');
    if (!container) {
        console.warn('riskCardsList container not found');
        return;
    }
    
    const project = getCurrentProject();
    
    try {
        if (!project || !project.risks) {
            console.warn('No project or risks array');
            container.innerHTML = `<p class="placeholder">${t('message.noproject')}</p>`;
            return;
        }
        
        const risks = project.risks;
        if (risks.length === 0) {
            container.innerHTML = `<p class="placeholder">${t('risk.norisks', {}, 'Inga risker tillagda ännu')}</p>`;
            return;
        }
        
        if (!riskGroupsData) {
            console.warn('Risk data not loaded yet');
            container.innerHTML = `<p class="placeholder">${t('message.loading', {}, 'Laddar...')}</p>`;
            return;
        }
        
        // Select first risk if none selected or selected risk doesn't exist
        const state = getState();
        if (!state.selectedRiskId || !risks.find(r => r.id === state.selectedRiskId)) {
            setSelectedRiskId(risks[0].id);
        }
        
        container.innerHTML = `
            <div class="risk-layout">
                <div class="risk-sidebar">
                    <div class="risk-sidebar-header">
                        <h3>${t('risk.title', {}, 'Riskbedömning')}</h3>
                        <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem; align-items: center;">
                            <label style="font-size: 0.8rem; color: var(--text-secondary);">
                                ${t('risk.sort', {}, 'Sortera')}:
                            </label>
                            <select id="risk-sort-order" class="form-select" 
                                    style="font-size: 0.8rem; padding: 0.25rem 0.5rem;" 
                                    onchange="changeRiskSortOrder(this.value)">
                                <option value="index">${t('risk.sort.standard', {}, 'Standard')}</option>
                                <option value="zone">${t('risk.sort.zone', {}, 'Hazard zone')}</option>
                                <option value="riskGroup">${t('risk.sort.group', {}, 'Riskgrupp')}</option>
                            </select>
                        </div>
                    </div>
                    <div id="risk-list" class="risk-list"></div>
                </div>
                <div class="risk-detail" id="risk-detail-container"></div>
            </div>
        `;
        
        renderRiskList();
        renderRiskDetail(getSelectedRiskId());
    } catch (error) {
        console.warn('Error rendering risk cards:', error.message);
        container.innerHTML = `<p class="placeholder">${t('message.loading', {}, 'Laddar...')}</p>`;
    }
}

/**
 * Render risk list sidebar
 */
export function renderRiskList() {
    const listEl = document.getElementById('risk-list');
    if (!listEl) return;
    
    const state = getState();
    const sortOrder = state.riskSortOrder || 'index';
    const risks = getSortedRisks(sortOrder);
    
    listEl.innerHTML = risks.map((risk, index) => {
        const riskIN = getRiskDescription(
            risk.parametersIN.S,
            risk.parametersIN.F,
            risk.parametersIN.P,
            risk.parametersIN.A
        );
        
        const zoneLabel = risk.zone ? getLocalizedListLabel('hazardZones', risk.zone) : '-';
        const groupLabel = risk.riskGroup ? getLocalizedListLabel('riskGroups', risk.riskGroup) : '';
        
        return `
            <button class="risk-list-item ${risk.id === getSelectedRiskId() ? 'active' : ''}" 
                    onclick="selectRisk('${risk.id}')">
                <div class="risk-list-title">
                    <span class="risk-number">#${index + 1}</span>
                    <span class="risk-level-badge ${riskIN.classification}">${riskIN.classification.toUpperCase()}</span>
                    <span class="risk-name">${t('risk.zone_short', {}, 'Zon')}: ${zoneLabel}</span>
                </div>
                <div class="risk-list-meta" style="display: flex; flex-direction: column; gap: 0.15rem; font-size: 0.95rem; padding-left: 84px;">
                    ${groupLabel ? `<span style="font-weight: 700;">${t('risk.group_short', {}, 'Grupp')}: ${groupLabel}</span>` : ''}
                    ${risk.area ? `<span style="color: var(--text-secondary); font-size: 0.85rem;">${risk.area}</span>` : ''}
                </div>
            </button>
        `;
    }).join('');
}

/**
 * Select a risk (update active state)
 * @param {string} riskId - Risk ID
 */
export function selectRisk(riskId) {
    setSelectedRiskId(riskId);
    renderRiskList();
    renderRiskDetail(riskId);
}

/**
 * Change risk sort order
 * @param {string} sortOrder - Sort order ('index', 'zone', 'riskGroup')
 */
export function changeRiskSortOrder(sortOrder) {
    setRiskSortOrder(sortOrder);
    renderRiskList();
}

/**
 * Render risk detail view
 * @param {string} riskId - Risk ID
 */
export function renderRiskDetail(riskId) {
    const container = document.getElementById('risk-detail-container');
    if (!container) return;
    
    const risks = getAllRisks();
    const risk = risks.find(r => r.id === riskId);
    
    if (!risk) {
        container.innerHTML = `<p class="placeholder">${t('risk.norisks', {}, 'Inga risker tillagda')}</p>`;
        return;
    }
    
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
    
    // Get parameter levels from RiskMatrix or fallback
    const sLevel = (typeof RiskMatrix !== 'undefined' && RiskMatrix) ? 
        RiskMatrix.severityLevels : window.RiskLevelsFallback?.severityLevels || {};
    const fLevel = (typeof RiskMatrix !== 'undefined' && RiskMatrix) ? 
        RiskMatrix.frequencyLevels : window.RiskLevelsFallback?.frequencyLevels || {};
    const pLevel = (typeof RiskMatrix !== 'undefined' && RiskMatrix) ? 
        RiskMatrix.probabilityLevels : window.RiskLevelsFallback?.probabilityLevels || {};
    const aLevel = (typeof RiskMatrix !== 'undefined' && RiskMatrix) ? 
        RiskMatrix.avoidanceLevels : window.RiskLevelsFallback?.avoidanceLevels || {};
    
    const riskIndex = getRiskIndex(riskId);
    
    container.innerHTML = `
        <div class="risk-detail-card" data-risk-id="${risk.id}">
            <div class="risk-detail-header ${riskIN.classification}-risk">
                <div class="risk-detail-title">
                    <span class="risk-number">#${riskIndex + 1}</span>
                    <span class="risk-level-badge ${riskIN.classification}">${riskIN.classification.toUpperCase()}</span>
                    <div class="risk-header-text">
                        <strong>${risk.area || t('risk.description', {}, 'Riskbeskrivning')}</strong>
                        ${risk.zone ? `<span class="muted">${risk.zone}</span>` : ''}
                    </div>
                </div>
                <div class="risk-header-actions">
                    ${risk.protectiveMeasures && risk.protectiveMeasures.length > 0 ? 
                        `<span class="risk-out-pill">→ ${riskOUT.classification.toUpperCase()}</span>` : ''}
                    <button class="btn btn-danger" onclick="deleteRisk('${risk.id}')">✕</button>
                </div>
            </div>
            
            <!-- RISK IN Section -->
            <div class="risk-section">
                <h3>⚠️ ${t('risk.risk_in', {}, 'Risk IN (Före åtgärder)')}</h3>
                <div class="form-group">
                    <label class="form-label">${t('risk.description', {}, 'Riskbeskrivning')}</label>
                    <textarea class="form-textarea" rows="3" style="font-size: 0.95rem;" 
                              placeholder="${t('risk.describe_risk', {}, 'Beskriv risken...')}" 
                              onchange="updateRisk('${risk.id}', 'description', this.value)">${risk.description || ''}</textarea>
                    <small style="color: var(--text-secondary); font-size: 0.8rem;">
                        ${t('risk.describe_short', {}, 'Vad kan hända, hur kan det hända, vilka konsekvenser?')}
                    </small>
                </div>
                
                <div class="grid grid-2" style="gap: 0.75rem;">
                    <div class="form-group">
                        <label class="form-label">${t('risk.machine_part', {}, 'Maskindel')}</label>
                        <input type="text" class="form-input" value="${risk.area || ''}" 
                               placeholder="${t('risk.machine_part_placeholder', {}, 't.ex. Matningsbord')}" 
                               onchange="updateRisk('${risk.id}', 'area', this.value)" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">${t('risk.zone_area', {}, 'Hazard zone')}</label>
                        <select class="form-select" onchange="updateRisk('${risk.id}', 'zone', this.value)">
                            <option value="">${t('risk.choose', {}, 'Välj...')}</option>
                            ${renderOptionsWithFallback('hazardZones', risk.zone)}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">${t('risk.group', {}, 'Riskgrupp')}</label>
                        <select class="form-select" onchange="updateRisk('${risk.id}', 'riskGroup', this.value)">
                            <option value="">${t('risk.choose', {}, 'Välj...')}</option>
                            ${renderOptionsWithFallback('riskGroups', risk.riskGroup)}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">${t('risk.hazard_source', {}, 'Farokälla')}</label>
                        <select class="form-select" onchange="updateRisk('${risk.id}', 'hazardSource', this.value)">
                            <option value="">${t('risk.choose', {}, 'Välj...')}</option>
                            ${renderOptionsWithFallback('hazardSources', risk.hazardSource)}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">${t('risk.injury_type', {}, 'Skadetyp')}</label>
                        <select class="form-select" onchange="updateRisk('${risk.id}', 'injury', this.value)">
                            <option value="">${t('risk.choose', {}, 'Välj...')}</option>
                            ${renderOptionsWithFallback('injuries', risk.injury)}
                        </select>
                    </div>
                </div>
                
                <div style="display: flex; justify-content: flex-end; margin: 0.5rem 0 0.75rem 0;">
                    <button class="btn btn-outline" 
                            style="padding: 0.4rem 0.6rem; font-size: 0.9rem; gap: 0.35rem; align-items: center; display: inline-flex;" 
                            onclick="openRiskMatrixModal(); event.preventDefault();">
                        ℹ️ ${t('risk.matrix.help_btn', {}, 'Visa riskmatris')}
                    </button>
                </div>
                
                <div class="risk-params-compact">
                    ${renderParameterSelectCompact('S', risk.id, 'IN', risk.parametersIN.S, sLevel)}
                    ${renderParameterSelectCompact('F', risk.id, 'IN', risk.parametersIN.F, fLevel)}
                    ${renderParameterSelectCompact('P', risk.id, 'IN', risk.parametersIN.P, pLevel)}
                    ${renderParameterSelectCompact('A', risk.id, 'IN', risk.parametersIN.A, aLevel)}
                </div>
                
                <div class="risk-summary-box" style="background: ${riskIN.classification === 'high' ? '#fee2e2' : riskIN.classification === 'medium' ? '#fef3c7' : riskIN.classification === 'lowMedium' ? '#fef9c3' : '#d1fae5'};">
                    <strong>${t('risk.risk_in', {}, 'Risk IN')}: ${riskIN.value}</strong> | ${riskIN.classificationText}
                </div>
            </div>
            
            <!-- Risk Reduction Section -->
            <div class="risk-section">
                <h3 style="cursor: pointer;" onclick="toggleRiskSection('${risk.id}', 'action')">
                    ⚡ ${t('risk.reduce_risk', {}, 'Riskminskning')}
                </h3>
                <div class="risk-action-panel" id="action-panel-${risk.id}">
                    ${renderActionPanelContent(risk, sLevel, fLevel, pLevel, aLevel, riskOUT)}
                </div>
            </div>
            
            <!-- Validation Section -->
            <div class="risk-section">
                <h3 style="cursor: pointer;" onclick="toggleRiskSection('${risk.id}', 'validation')">
                    ✓ ${t('risk.validation', {}, 'Validering')}
                </h3>
                <div class="risk-validation-panel" id="validation-panel-${risk.id}">
                    ${renderValidationPanelContent(risk)}
                </div>
            </div>
        </div>
    `;
}

/**
 * Render action panel content
 */
function renderActionPanelContent(risk, sLevel, fLevel, pLevel, aLevel, riskOUT) {
    return `
        <div class="form-group">
            <label class="form-label">${t('risk.protective_measures', {}, 'Skyddsåtgärder')}</label>
            <small style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.75rem;">
                ${t('risk.measures_info', {}, 'Ange skyddsåtgärder i prioritetsordning')}
            </small>
            
            ${renderProtectiveMeasuresList(risk)}
            
            <div style="display: flex; gap: 0.5rem;">
                <input type="text" id="new-measure-${risk.id}" class="form-input" 
                       placeholder="${t('risk.describe_new_measure', {}, 'Beskriv ny åtgärd...')}" />
                <button class="btn btn-primary" 
                        onclick="window.addProtectiveMeasure('${risk.id}', document.getElementById('new-measure-${risk.id}').value); document.getElementById('new-measure-${risk.id}').value='';">
                    ${t('risk.add_measure', {}, 'Lägg till')}
                </button>
            </div>
        </div>
        
        <div class="form-group">
            <label class="form-label">${t('risk.measure_valuation', {}, 'Värdering av åtgärder')}</label>
            <textarea class="form-textarea" rows="3" 
                      onchange="updateRisk('${risk.id}', 'measureValuationReason', this.value)" 
                      placeholder="${t('risk.measure_valuation_placeholder', {}, 'Motivera varför åtgärderna bedöms som tillräckliga...')}">${risk.measureValuationReason || ''}</textarea>
        </div>
        
        <div class="form-group">
            <div class="checkbox-group">
                <input type="checkbox" id="safety-func-${risk.id}" class="form-checkbox" 
                       ${risk.isSafetyFunction ? 'checked' : ''} 
                       onchange="updateRisk('${risk.id}', 'isSafetyFunction', this.checked);" />
                <label for="safety-func-${risk.id}" class="form-label">
                    ${t('risk.safety_function', {}, 'Säkerhetsfunktion krävs')}
                </label>
            </div>
            <small style="color: var(--text-secondary); font-size: 0.75rem;">
                ${t('risk.safety_function_info', {}, 'Markera om risken kräver en säkerhetsfunktion med PLr-beräkning')}
            </small>
        </div>
        
        ${renderPLSection(risk)}
        
        <hr style="margin: 1rem 0; border: none; border-top: 1px solid var(--border-color);" />
        
        <h4 style="margin-bottom: 0.75rem; color: var(--primary-color); font-size: 0.9rem;">
            ${t('risk.remaining_params', {}, 'Kvarstående riskparametrar (Risk OUT)')}
        </h4>
        
        <div class="risk-params-compact">
            ${renderParameterSelectCompact('S', risk.id, 'OUT', risk.parametersOUT.S, sLevel)}
            ${renderParameterSelectCompact('F', risk.id, 'OUT', risk.parametersOUT.F, fLevel)}
            ${renderParameterSelectCompact('P', risk.id, 'OUT', risk.parametersOUT.P, pLevel)}
            ${renderParameterSelectCompact('A', risk.id, 'OUT', risk.parametersOUT.A, aLevel)}
        </div>
        
        <div class="risk-summary-box" style="margin-top: 1rem; background: ${riskOUT.classification === 'high' ? '#fee2e2' : riskOUT.classification === 'medium' ? '#fef3c7' : riskOUT.classification === 'lowMedium' ? '#fef9c3' : '#d1fae5'};">
            <strong>${t('risk.risk_out', {}, 'Risk OUT')}: ${riskOUT.value}</strong> | ${riskOUT.classificationText}
        </div>
        
        ${renderRiskReductionGuidance()}
    `;
}

/**
 * Toggle risk section (expand/collapse)
 * @param {string} riskId - Risk ID
 * @param {string} section - Section name ('action' or 'validation')
 */
export function toggleRiskSection(riskId, section) {
    const panelId = section === 'validation' ? `validation-panel-${riskId}` : `action-panel-${riskId}`;
    const panel = document.getElementById(panelId);
    if (!panel) return;
    
    const isOpen = panel.classList.toggle('open');

    // If closing action panel, also close validation panel
    if (section === 'action' && !isOpen) {
        const valPanel = document.getElementById(`validation-panel-${riskId}`);
        if (valPanel) valPanel.classList.remove('open');
    }
}

// Make functions globally available
if (typeof window !== 'undefined') {
    window.selectRisk = selectRisk;
    window.changeRiskSortOrder = changeRiskSortOrder;
    window.toggleRiskSection = toggleRiskSection;
}
