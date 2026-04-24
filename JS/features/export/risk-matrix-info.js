/**
 * Risk Matrix Info and Display
 * Handles rendering of the risk matrix information in modal
 */

import { t } from '../../i18n/index.js';

export function renderRiskMatrixInfo() {
    const getClassColor = (cls) => {
        if (cls === 'high') return '#dc2626';
        if (cls === 'medium') return '#f59e0b';
        if (cls === 'lowMedium') return '#facc15';
        if (cls === 'low') return '#22c55e';
        return '#d1d5db';
    };

    const getSeverityLabel = (S) => {
        const key = `risk.level.severity.${S}`;
        const translated = t(key);
        if (translated && translated !== key) return translated;
        return RiskMatrix?.severityLevels?.[S] || `S${S}`;
    };

    const createMatrixTable = () => {
        const severityKeys = Object.keys(RiskMatrix?.severityLevels || {0:'',1:'',2:'',3:''})
            .map(Number)
            .sort((a, b) => a - b);
        const frequencyKeys = [1, 2];
        const avoidanceKeys = [1, 2];
        const probKeys = [1, 2, 3];

        const cell = (S, F, A, P) => {
            const entry = RiskMatrix?.getLookupEntry ? RiskMatrix.getLookupEntry(S, F, P, A) : null;
            const value = entry?.value ?? 0;
            const cls = entry?.cls || 'low';
            const color = getClassColor(cls);
            return `<div style="padding: 6px; text-align: center; border-radius: 3px; background: ${color}; color: #fff; font-weight: 700; min-width: 32px; font-size: 0.75rem;">${value}</div>`;
        };

        const rows = [];
        severityKeys.forEach((S) => {
            let severityRowStarted = false;
            frequencyKeys.forEach((F) => {
                let freqRowStarted = false;
                avoidanceKeys.forEach((A) => {
                    const severityCell = !severityRowStarted
                        ? `<td rowspan="${frequencyKeys.length * avoidanceKeys.length}" style="position: relative; text-align: center; vertical-align: middle; font-weight: 600; background: #f8fafc; border-right: 2px solid #475569; color: #0f172a; font-size: 0.7rem;">${getSeverityLabel(S)}</td>`
                        : '';
                    severityRowStarted = true;

                    const freqLabel = t(`risk.level.frequency.${F}`) || `F${F}`;
                    const freqCell = !freqRowStarted
                        ? `<td rowspan="${avoidanceKeys.length}" style="position: relative; text-align: center; vertical-align: middle; padding: 6px; border-left: 1px solid #92400e; border-right: 1px solid #92400e; font-size: 0.65rem;">${freqLabel}</td>`
                        : '';
                    freqRowStarted = true;

                    const avoidShort = A === 1 ? 'P' : 'H';
                    const avoidLabel = `A${A} (${avoidShort})`;

                    rows.push(`
                        <tr>
                            ${severityCell}
                            ${freqCell}
                            <td style="position: relative; text-align: center; padding: 6px; font-weight: 600; border-left: 1px solid #0369a1; font-size: 0.65rem;">${avoidLabel}</td>
                            ${probKeys.map(P => `<td style="padding: 3px;">${cell(S, F, A, P)}</td>`).join('')}
                        </tr>
                    `);
                });
            });
        });

        return `
            <table style="width: 100%; border-collapse: collapse; font-size: 0.7rem;">
                <thead>
                    <tr style="background: #f8fafc;">
                        <th colspan="3" style="padding: 6px; text-align: center; font-weight: 700; border-bottom: 1px solid #e2e8f0;">${t('risk.matrix_header')}</th>
                        <th style="padding: 6px; text-align: center; font-weight: 700; color: #10b981; border-bottom: 1px solid #e2e8f0;">SM</th>
                        <th style="padding: 6px; text-align: center; font-weight: 700; color: #10b981; border-bottom: 1px solid #e2e8f0;">MI</th>
                        <th style="padding: 6px; text-align: center; font-weight: 700; color: #10b981; border-bottom: 1px solid #e2e8f0;">HI</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows.join('')}
                </tbody>
            </table>
        `;
    };

    return `
        <div style="display: flex; gap: 24px; align-items: flex-start;">
            <!-- IN MATRIS -->
            <div style="flex: 1; min-width: 400px;">
                <div style="overflow-x: auto; padding: 8px; background: #f9f9f9; border-radius: 6px; border: 1px solid #e5e7eb;">
                    ${createMatrixTable()}
                </div>
            </div>

            <!-- PILAR & KLASSIFICERING -->
            <div style="display: flex; flex-direction: column; gap: 20px; justify-content: flex-start; min-width: 200px;">
                <div style="text-align: center;">
                    <div style="font-size: 2rem; color: #9ca3af;">→</div>
                </div>

                <!-- RISK KLASSIFICERING -->
                <div style="padding: 12px; background: #dcfce7; border-left: 4px solid #22c55e; border-radius: 6px;">
                    <div style="font-weight: 700; color: #166534; font-size: 0.9rem; text-align: center;">● 0–1</div>
                    <div style="color: #15803d; font-size: 0.75rem; text-align: center; margin-top: 4px;"><strong>${t('risk.matrix_low')}</strong></div>
                </div>

                <div style="padding: 12px; background: #fef9c3; border-left: 4px solid #facc15; border-radius: 6px;">
                    <div style="font-weight: 700; color: #a16207; font-size: 0.9rem; text-align: center;">● 2–3</div>
                    <div style="color: #92400e; font-size: 0.75rem; text-align: center; margin-top: 4px;"><strong>${t('risk.matrix_lowmedium')}</strong></div>
                </div>

                <div style="padding: 12px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px;">
                    <div style="font-weight: 700; color: #b45309; font-size: 0.9rem; text-align: center;">● 4–5</div>
                    <div style="color: #92400e; font-size: 0.75rem; text-align: center; margin-top: 4px;"><strong>${t('risk.matrix_medium')}</strong></div>
                </div>

                <div style="padding: 12px; background: #fee2e2; border-left: 4px solid #dc2626; border-radius: 6px;">
                    <div style="font-weight: 700; color: #991b1b; font-size: 0.9rem; text-align: center;">● 6–10</div>
                    <div style="color: #7f1d1d; font-size: 0.75rem; text-align: center; margin-top: 4px;"><strong>${t('risk.matrix_high')}</strong></div>
                </div>
            </div>
        </div>

        <!-- ALARP & CHECKLISTA -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px;">
            <div style="padding: 12px; background: #ede9fe; border-left: 4px solid #a855f7; border-radius: 6px;">
                <h4 style="margin: 0 0 8px 0; color: #6b21a8; font-size: 0.9rem;">${t('risk.alarp_title')}</h4>
                <div style="font-size: 0.75rem; color: #581c87; line-height: 1.4;">
                    ${t('risk.alarp_description')}
                    <ol style="margin: 6px 0; padding-left: 16px;">
                        <li>${t('risk.alarp_step1')}</li>
                        <li>${t('risk.alarp_step2')}</li>
                        <li>${t('risk.alarp_step3')}</li>
                        <li>${t('risk.alarp_step4')}</li>
                    </ol>
                </div>
            </div>

            <div style="padding: 12px; background: #f0fdf4; border-left: 4px solid #10b981; border-radius: 6px;">
                <h4 style="margin: 0 0 8px 0; color: #065f46; font-size: 0.9rem;">${t('risk.assessment_complete')}</h4>
                <div style="font-size: 0.75rem; color: #047857; line-height: 1.6;">
                    ${t('risk.complete_all_hazards')}<br/>
                    ${t('risk.complete_risk_values')}<br/>
                    ${t('risk.complete_actions_implemented')}<br/>
                    ${t('risk.complete_actions_verified')}<br/>
                    ${t('risk.complete_documentation')}
                </div>
            </div>
        </div>
    `;
}

if (typeof window !== 'undefined') {
    window.renderRiskMatrixInfo = renderRiskMatrixInfo;
}
