/**
 * Risk Assessment Export
 */

import { getCurrentProject } from '../../state.js';
import { t } from '../../i18n/index.js';

function getRiskDescriptionFallback(S, F, P, A) {
    const s = Number(S) || 0;
    const f = Number(F) || 0;
    const p = Number(P) || 0;
    const a = Number(A) || 0;
    const riskValue = s * f * p * a;
    let classification = 'low';
    if (riskValue >= 70) classification = 'high';
    else if (riskValue >= 20) classification = 'medium';
    return { value: riskValue, classification, classificationText: classification.toUpperCase() };
}

export function setExportSortOrder(order) {
    if (typeof window !== 'undefined' && window.AppState) {
        window.AppState.exportSortOrder = order;
    }
    const boxes = document.querySelectorAll('input[name="export-sort-order"]');
    boxes.forEach(box => { box.checked = box.value === order; });
}

export function exportRiskAssessment() {
    const project = getCurrentProject();
    if (!project) return;
    
    const includeModules = document.getElementById('include-module-risks')?.checked || false;
    const sortOrder = (typeof window !== 'undefined' && window.AppState?.exportSortOrder) || 'level';

    const RM = (typeof RiskMatrix !== 'undefined' && RiskMatrix) ? RiskMatrix : {
        calculateRisk: (S, F, P, A) => getRiskDescriptionFallback(Number(S || 0), Number(F || 0), Number(P || 0), Number(A || 0)).value,
        classifyRisk: (S, F, P, A) => getRiskDescriptionFallback(Number(S || 0), Number(F || 0), Number(P || 0), Number(A || 0)).classification,
        calculatePL: (S, F, P) => '—',
        getRiskDescription: (S, F, P, A) => getRiskDescriptionFallback(Number(S || 0), Number(F || 0), Number(P || 0), Number(A || 0))
    };
    
    let allRisks = [...(project.risks || [])];
    let allInterfaceRisks = [...(project.interfaceRisks || [])];
    
    if (includeModules && project.modules && project.modules.length > 0) {
        project.modules.forEach(module => {
            const moduleRisks = module.risks || module.fullData?.risks || [];
            const moduleInterfaceRisks = module.interfaceRisks || module.fullData?.interfaceRisks || [];
            if (moduleRisks.length > 0) {
                allRisks = allRisks.concat(moduleRisks.map(r => ({...r, _moduleSource: module.productName})));
            }
            if (moduleInterfaceRisks.length > 0) {
                allInterfaceRisks = allInterfaceRisks.concat(moduleInterfaceRisks.map(r => ({...r, _moduleSource: module.productName})));
            }
        });
    }

    const sortBy = (a, b) => {
        const getOut = (r) => RM.calculateRisk(r.parametersOUT.S, r.parametersOUT.F, r.parametersOUT.P, r.parametersOUT.A);
        if (sortOrder === 'level') return getOut(b) - getOut(a);
        if (sortOrder === 'zone') return (a.zone || '').localeCompare(b.zone || '');
        if (sortOrder === 'group') return (a.riskGroup || '').localeCompare(b.riskGroup || '');
        if (sortOrder === 'module') return (a._moduleSource || '').localeCompare(b._moduleSource || '');
        return 0;
    };

    allRisks.sort(sortBy);
    allInterfaceRisks.sort(sortBy);
    
    const allCombinedRisks = [...allRisks, ...allInterfaceRisks];
    const totalRisks = allCombinedRisks.length;
    const highRisks = allCombinedRisks.filter(r => RM.classifyRisk(r.parametersOUT.S, r.parametersOUT.F, r.parametersOUT.P, r.parametersOUT.A) === 'high').length;
    const mediumRisks = allCombinedRisks.filter(r => RM.classifyRisk(r.parametersOUT.S, r.parametersOUT.F, r.parametersOUT.P, r.parametersOUT.A) === 'medium').length;
    const lowMediumRisks = allCombinedRisks.filter(r => RM.classifyRisk(r.parametersOUT.S, r.parametersOUT.F, r.parametersOUT.P, r.parametersOUT.A) === 'lowMedium').length;
    const lowRisks = totalRisks - highRisks - mediumRisks - lowMediumRisks;

    const mapRiskColor = (classification) => {
        if (classification === 'high') return '#ef4444';
        if (classification === 'medium') return '#fbbf24';
        if (classification === 'lowMedium') return '#fde047';
        return '#22c55e';
    };
    const mapRiskLabel = (classification) => {
        if (classification === 'high') return t('output.risk_high');
        if (classification === 'medium') return t('output.risk_medium');
        if (classification === 'lowMedium') return t('output.risk_lowmedium');
        return t('output.risk_low');
    };

    const generateRiskHTML = (risk, isInterface = false) => {
        const riskIN = RM.calculateRisk(risk.parametersIN.S, risk.parametersIN.F, risk.parametersIN.P, risk.parametersIN.A);
        const riskOUT = RM.calculateRisk(risk.parametersOUT.S, risk.parametersOUT.F, risk.parametersOUT.P, risk.parametersOUT.A);
        const riskInClass = RM.classifyRisk(risk.parametersIN.S, risk.parametersIN.F, risk.parametersIN.P, risk.parametersIN.A);
        const riskOutClass = RM.classifyRisk(risk.parametersOUT.S, risk.parametersOUT.F, risk.parametersOUT.P, risk.parametersOUT.A);
        const sourceTag = risk._moduleSource 
            ? `<div style="background: #3b82f6; color: white; padding: 4px 12px; border-radius: 6px; font-size: 0.85rem; font-weight: 600; display: inline-block; margin-bottom: 0.5rem;">📦 ${t('output.risk_module')} ${risk._moduleSource}</div>`
            : `<div style="background: #10b981; color: white; padding: 4px 12px; border-radius: 6px; font-size: 0.85rem; font-weight: 600; display: inline-block; margin-bottom: 0.5rem;">🏠 ${t('output.risk_main_project')}</div>`;
        const hasRemainingRisk = risk.parametersUT && (risk.parametersUT.S || risk.parametersUT.F || risk.parametersUT.P || risk.parametersUT.A);
        const riskUT = hasRemainingRisk ? RM.calculateRisk(risk.parametersUT.S, risk.parametersUT.F, risk.parametersUT.P, risk.parametersUT.A) : null;
        return `
        <div style="border: 2px solid ${risk._moduleSource ? '#3b82f6' : '#10b981'}; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; background: white; page-break-inside: avoid;">
            ${sourceTag}
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem; border-bottom: 2px solid #f3f4f6; padding-bottom: 1rem;">
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 0.5rem 0; color: #1f2937; font-size: 1.2rem; font-weight: 600;">${risk.hazardSource || 'Farokälla'}</h4>
                    <div style="display: grid; grid-template-columns: auto 1fr; gap: 0.5rem 1rem; font-size: 0.9rem; color: #6b7280;">
                        ${isInterface ? `
                        <span style="font-weight: 600;">${t('output.risk_interface_with')}</span>
                        <span>${risk.interfaceWith || 'N/A'}</span>
                        <span style="font-weight: 600;">${t('output.risk_area_zone')}</span>
                        <span>${risk.area || 'N/A'}</span>
                        ` : `
                        <span style="font-weight: 600;">${t('output.risk_area_zone')}</span>
                        <span>${risk.zone || 'N/A'}</span>
                        <span style="font-weight: 600;">${t('output.risk_machine_part')}</span>
                        <span>${risk.area || 'N/A'}</span>
                        `}
                        <span style="font-weight: 600;">${t('output.risk_group_label')}</span>
                        <span>${risk.riskGroup || 'N/A'}</span>
                        <span style="font-weight: 600;">${t('output.risk_source_label')}</span>
                        <span>${risk.hazardSource || 'N/A'}</span>
                        <span style="font-weight: 600;">${t('output.risk_injury_label')}</span>
                        <span>${risk.injury || 'N/A'}</span>
                    </div>
                </div>
                <div style="text-align: right; margin-left: 1rem;">
                    <div style="display: inline-block; background: ${mapRiskColor(riskInClass)}; color: white; padding: 6px 14px; border-radius: 6px; font-weight: bold; margin-bottom: 6px; min-width: 120px;">IN: ${riskIN} - ${mapRiskLabel(riskInClass)}</div>
                    <br>
                    <div style="display: inline-block; background: ${mapRiskColor(riskOutClass)}; color: white; padding: 6px 14px; border-radius: 6px; font-weight: bold; min-width: 120px;">OUT: ${riskOUT} - ${mapRiskLabel(riskOutClass)}</div>
                    ${riskUT !== null ? (() => {
                                const utClass = RM.classifyRisk(risk.parametersUT.S || 0, risk.parametersUT.F || 0, risk.parametersUT.P || 0, risk.parametersUT.A || 0);
                        return `<br><div style="display: inline-block; background: ${mapRiskColor(utClass)}; color: white; padding: 6px 14px; border-radius: 6px; font-weight: bold; margin-top: 6px; min-width: 120px;">UT: ${riskUT} - ${mapRiskLabel(utClass)}</div>`;
                    })() : ''}
                </div>
            </div>
            <div style="background: #f9fafb; padding: 1rem; border-radius: 6px; margin-bottom: 1rem; border-left: 4px solid #3b82f6;">
                <p style="margin: 0; color: #374151; line-height: 1.6;"><strong style="color: #1f2937;">${t('output.risk_description_label')}</strong><br>${risk.description || t('output.risk_no_description')}</p>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1rem;">
                <div style="background: ${mapRiskColor(riskInClass)}1a; padding: 1rem; border-radius: 6px;">
                    <p style="margin: 0 0 0.5rem 0; font-weight: 600; color: ${mapRiskColor(riskInClass)}; font-size: 0.85rem;">${riskIN >= 5 ? '🔴' : riskIN >= 2 ? '🟡' : '🟢'} ${t('output.risk_in_before')}</p>
                    <div style="font-size: 0.85rem; color: #4b5563; line-height: 1.8;">
                        <div><strong>S:</strong> ${risk.parametersIN.S}</div>
                        <div><strong>F:</strong> ${risk.parametersIN.F}</div>
                        <div><strong>P:</strong> ${risk.parametersIN.P}</div>
                        <div><strong>A:</strong> ${risk.parametersIN.A}</div>
                    </div>
                </div>
                <div style="background: ${mapRiskColor(riskOutClass)}1a; padding: 1rem; border-radius: 6px;">
                    <p style="margin: 0 0 0.5rem 0; font-weight: 600; color: ${mapRiskColor(riskOutClass)}; font-size: 0.85rem;">${riskOUT >= 5 ? '🔴' : riskOUT >= 2 ? '🟡' : '🟢'} ${t('output.risk_out_after')}</p>
                    <div style="font-size: 0.85rem; color: #4b5563; line-height: 1.8;">
                        <div><strong>S:</strong> ${risk.parametersOUT.S}</div>
                        <div><strong>F:</strong> ${risk.parametersOUT.F}</div>
                        <div><strong>P:</strong> ${risk.parametersOUT.P}</div>
                        <div><strong>A:</strong> ${risk.parametersOUT.A}</div>
                    </div>
                </div>
                ${hasRemainingRisk ? `
                <div style="background: ${(() => { const c = RM.classifyRisk(risk.parametersUT.S || 0, risk.parametersUT.F || 0, risk.parametersUT.P || 0, risk.parametersUT.A || 0); return mapRiskColor(c) + '1a'; })()}; padding: 1rem; border-radius: 6px;">
                    <p style="margin: 0 0 0.5rem 0; font-weight: 600; color: ${(() => { const c = RM.classifyRisk(risk.parametersUT.S || 0, risk.parametersUT.F || 0, risk.parametersUT.P || 0, risk.parametersUT.A || 0); return mapRiskColor(c); })()}; font-size: 0.85rem;">${riskUT >= 5 ? '🔴' : riskUT >= 2 ? '🟡' : '🟢'} ${t('output.risk_ut_remaining')}</p>
                    <div style="font-size: 0.85rem; color: #4b5563; line-height: 1.8;">
                        <div><strong>S:</strong> ${risk.parametersUT.S || 0}</div>
                        <div><strong>F:</strong> ${risk.parametersUT.F || 0}</div>
                        <div><strong>P:</strong> ${risk.parametersUT.P || 0}</div>
                        <div><strong>A:</strong> ${risk.parametersUT.A || 0}</div>
                    </div>
                </div>
                ` : '<div></div>'}
            </div>
            ${risk.protectiveMeasures && risk.protectiveMeasures.length > 0 ? `
            <div style="margin-bottom: 1rem; background: #f9fafb; padding: 1rem; border-radius: 6px;">
                <p style="margin: 0 0 0.75rem 0; font-weight: 600; color: #1f2937; font-size: 1rem;">⚡ ${t('output.risk_measures_title')}</p>
                <div style="display: grid; gap: 0.5rem;">
                    ${risk.protectiveMeasures.map((m, idx) => `
                        <div style="background: white; padding: 0.75rem; border-radius: 4px; border-left: 3px solid #3b82f6;">
                            <div style="font-weight: 500; color: #1f2937; margin-bottom: 0.25rem;">${idx + 1}. ${m.measure || m.description || t('output.risk_no_description')}</div>
                            <div style="font-size: 0.8rem; color: #6b7280;"><strong>${t('output.risk_measure_type')}</strong> ${m.type || m.category || 'N/A'}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            ${risk.measureValuationReason ? `
            <div style="margin-bottom: 1rem; background: #f0fdf4; padding: 1rem; border-radius: 6px; border-left: 4px solid #10b981;">
                <p style="margin: 0 0 0.5rem 0; font-weight: 600; color: #1f2937; font-size: 0.95rem;">📝 ${t('risk.measure_valuation')}</p>
                <div style="color: #4b5563; font-size: 0.9rem; white-space: pre-wrap; line-height: 1.6;">${risk.measureValuationReason}</div>
            </div>
            ` : ''}
            ${risk.safetyFunction ? `
            <div style="margin-bottom: 1rem; background: #fef3c7; padding: 1rem; border-radius: 6px; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; color: #92400e;"><strong>⚙️ ${t('output.risk_safety_function')}</strong><br>${risk.safetyFunction}${risk.plCalculation ? '<br><span style="font-size: 0.85rem;">✓ ' + t('output.risk_pl_required') + '</span>' : ''}</p>
            </div>
            ` : ''}
            ${(risk.isSafetyFunction || risk.safetyFunction) ? (() => {
                const plResult = RM.calculatePL ? RM.calculatePL(risk.parametersIN.S, risk.parametersIN.F, risk.parametersIN.A) : { level: risk.selectedPL || '—', description: '' };
                const chosenPL = risk.selectedPL || plResult.level;
                return `
                <div style="margin-bottom: 1rem; background: #eef2ff; padding: 1rem; border-radius: 6px; border-left: 4px solid #6366f1;">
                    <p style="margin: 0; color: #4338ca;"><strong>🔒 ${t('output.risk_plr_title')}</strong><br>${t('output.risk_plr_value')} ${String(chosenPL).toUpperCase()}${plResult.description ? `<br><span style=\"font-size: 0.85rem;\">${plResult.description}</span>` : ''}</p>
                </div>`;
            })() : ''}
            ${risk.validation || risk.validationStatus ? `
            <div style="margin-bottom: 1rem;">
                <p style="margin: 0 0 0.5rem 0; font-weight: 600; color: #1f2937; font-size: 1rem;">✅ ${t('output.risk_validation_title')}</p>
                <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 1rem; border-radius: 4px;">
                    ${risk.validationStatus ? `
                    <div style="margin-bottom: 0.75rem;">
                        ${risk.validationStatus.implemented ? '<div style="color: #065f46; margin-bottom: 0.25rem;">✓ ' + t('output.risk_implemented') + '</div>' : ''}
                        ${risk.validationStatus.verified ? '<div style="color: #065f46; margin-bottom: 0.25rem;">✓ ' + t('output.risk_verified') + '</div>' : ''}
                        ${risk.validationStatus.plCalculationExists ? '<div style="color: #065f46; margin-bottom: 0.25rem;">✓ ' + t('output.risk_pl_exists') + '</div>' : ''}
                    </div>
                    ` : ''}
                    ${risk.validation ? `<p style="margin: 0; color: #065f46;"><strong>${t('output.risk_comment')}</strong> ${risk.validation}</p>` : ''}
                </div>
            </div>
            ` : ''}
            ${risk.documentation || risk.evidenceLink ? `
            <div style="background: #f3f4f6; padding: 1rem; border-radius: 6px; font-size: 0.85rem;">
                <p style="margin: 0 0 0.5rem 0; font-weight: 600; color: #1f2937;">📎 ${t('output.risk_documentation_title')}</p>
                ${risk.documentation ? `<p style="margin: 0; color: #4b5563;">${risk.documentation}</p>` : ''}
                ${risk.evidenceLink ? `<p style="margin: 0.5rem 0 0 0; color: #3b82f6;"><strong>${t('output.risk_link')}</strong> ${risk.evidenceLink}</p>` : ''}
            </div>
            ` : ''}
        </div>`;
    };

    const lang = (typeof currentLang !== 'undefined' && currentLang) ? currentLang : 'sv';
    const reportHTML = `
<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${t('output.risk_title')} - ${project.productData.productName || 'N/A'}</title>
    <style>
        @media print { body { margin: 0; padding: 10mm 15mm; max-width: 100%; width: 210mm; } .no-print { display: none; } .page-break { page-break-before: always; } }
        * { box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; width: 210mm; max-width: 210mm; margin: 0 auto; padding: 15mm; background: #f5f5f5; color: #1a1a1a; line-height: 1.5; font-size: 11pt; }
        .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 2rem; border-radius: 8px; margin-bottom: 2rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header h1 { margin: 0 0 0.5rem 0; font-size: 2rem; }
        .header p { margin: 0; opacity: 0.9; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin: 2rem 0; }
        .stat-card { background: white; padding: 1.5rem; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .stat-number { font-size: 2.5rem; font-weight: bold; margin: 0; }
        .stat-label { color: #6b7280; font-size: 0.875rem; margin-top: 0.5rem; }
        .section-title { background: #1e40af; color: white; padding: 1rem 1.5rem; border-radius: 8px; margin: 2rem 0 1rem 0; font-size: 1.5rem; font-weight: 600; }
        .print-button { position: fixed; top: 20px; right: 20px; background: #1e40af; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; box-shadow: 0 2px 8px rgba(30, 64, 175, 0.3); transition: all 0.2s; z-index: 1000; }
        .print-button:hover { background: #1e3a8a; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(30, 64, 175, 0.4); }
    </style>
</head>
<body>
    <button class="print-button no-print" onclick="window.print()">🖨️ ${t('output.print_save')}</button>
    <div class="header">
        <h1>📋 ${t('output.risk_title')}</h1>
        <p><strong>${t('output.risk_project')}</strong> ${project.productData.projectNumber || 'N/A'}</p>
        <p><strong>${t('output.risk_model')}</strong> ${project.productData.model || 'N/A'} | <strong>${t('output.risk_revision')}</strong> ${project.revision || '1.0'}</p>
        <p><strong>${t('output.risk_date')}</strong> ${new Date().toLocaleDateString(lang === 'en' ? 'en-GB' : 'sv-SE')}</p>
        ${includeModules && project.modules.length > 0 ? `<p style="margin-top: 0.5rem; background: rgba(255,255,255,0.2); padding: 0.5rem; border-radius: 4px;">✓ ${t('output.risk_includes_modules', {count: project.modules.length})}</p>` : ''}
    </div>
    <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.08); margin-bottom: 1.5rem;">
        <h3 style="margin-top: 0; color: #1e40af;">📊 ${t('output.risk_matrix_info_title')}</h3>
        <p style="margin-top: 0; color: #475569;">${t('output.risk_matrix_info_text')}</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px,1fr)); gap: 0.75rem;">
            <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 0.75rem; border-radius: 6px;"><strong style="color:#b91c1c;">${t('output.risk_high')}</strong><br><span style="color:#7f1d1d;">${t('output.risk_high_desc')}</span></div>
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 0.75rem; border-radius: 6px;"><strong style="color:#b45309;">${t('output.risk_medium')}</strong><br><span style="color:#92400e;">${t('output.risk_medium_desc')}</span></div>
            <div style="background: #d1fae5; border-left: 4px solid #22c55e; padding: 0.75rem; border-radius: 6px;"><strong style="color:#047857;">${t('output.risk_low')}</strong><br><span style="color:#065f46;">${t('output.risk_low_desc')}</span></div>
        </div>
        <div style="margin-top: 1rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px,1fr)); gap: 0.75rem; color: #475569;">
            <div><strong>S</strong> – ${t('output.risk_param_s')}</div>
            <div><strong>F</strong> – ${t('output.risk_param_f')}</div>
            <div><strong>P</strong> – ${t('output.risk_param_p')}</div>
            <div><strong>A</strong> – ${t('output.risk_param_a')}</div>
        </div>
    </div>
    <div class="stats-grid">
        <div class="stat-card"><div class="stat-number" style="color: #dc2626;">${highRisks}</div><div class="stat-label">${t('output.risk_high')}</div></div>
        <div class="stat-card"><div class="stat-number" style="color: #f59e0b;">${mediumRisks}</div><div class="stat-label">${t('output.risk_medium')}</div></div>
        <div class="stat-card"><div class="stat-number" style="color: #facc15;">${lowMediumRisks}</div><div class="stat-label">${t('output.risk_lowmedium')}</div></div>
        <div class="stat-card"><div class="stat-number" style="color: #10b981;">${lowRisks}</div><div class="stat-label">${t('output.risk_low')}</div></div>
    </div>
    ${allRisks.length > 0 ? `
    <div class="page-break"></div>
    <h2 class="section-title">🎯 ${t('output.risk_assessment_title', {count: allRisks.length})}</h2>
    ${allRisks.map(risk => generateRiskHTML(risk)).join('')}
    ` : `<p style="text-align: center; color: #6b7280; padding: 2rem;">${t('output.risk_no_risks')}</p>`}
    ${allInterfaceRisks.length > 0 ? `
    <div class="page-break"></div>
    <h2 class="section-title">🔗 ${t('output.risk_interface_title', {count: allInterfaceRisks.length})}</h2>
    ${allInterfaceRisks.map(risk => generateRiskHTML(risk, true)).join('')}
    ` : ''}
    <div class="page-break"></div>
    <div style="background: white; padding: 2rem; border-radius: 8px; margin-top: 2rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h3 style="color: #1e40af; margin-top: 0;">📝 ${t('output.risk_summary_title')}</h3>
        <p><strong>${t('output.risk_total')}</strong> ${totalRisks} (${allRisks.length} ${lang === 'en' ? 'standard' : 'standard'} + ${allInterfaceRisks.length} ${lang === 'en' ? 'interface' : 'interface'})</p>
        <p><strong>${t('output.risk_assessed_according')}</strong> EN ISO 12100</p>
        <p><strong>${t('output.risk_report_date')}</strong> ${new Date().toLocaleDateString(lang === 'en' ? 'en-GB' : 'sv-SE')}</p>
        <p style="margin-top: 1.5rem; padding: 1rem; background: #f0fdf4; border-left: 4px solid #10b981; border-radius: 4px;">✓ ${t('output.risk_summary_text')}</p>
    </div>
</body>
</html>
    `;
    
    const win = window.open('', '_blank');
    win.document.write(reportHTML);
    win.document.close();
}

if (typeof window !== 'undefined') {
    window.setExportSortOrder = setExportSortOrder;
    window.exportRiskAssessment = exportRiskAssessment;
}
