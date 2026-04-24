/**
 * Control Report Export
 */

import { getCurrentProject } from '../../state.js';
import { t } from '../../i18n/index.js';
import { getActiveControlTemplate, getActiveControlItems, getCheckpointKey } from '../tab4/control-list.js';

export function exportControlReport() {
    const project = getCurrentProject() || {};
    const report = project.controlReport || {};
    const template = getActiveControlTemplate();
    const statuses = report.checkpointStatus || {};

    const items = [];
    template.levels.forEach(level => {
        level.sections.forEach(section => {
            section.items.forEach(item => {
                const key = getCheckpointKey(item.id);
                items.push({
                    level: t(level.titleKey),
                    section: t(section.titleKey),
                    text: t(item.textKey),
                    status: statuses[key] || ''
                });
            });
        });
    });

    const total = items.length;
    const yesCount = items.filter(i => i.status === 'ja').length;
    const noCount = items.filter(i => i.status === 'nej').length;
    const naCount = items.filter(i => i.status === 'ejakt').length;
    const unsetCount = total - yesCount - noCount - naCount;

    const statusLabel = (s) => {
        if (s === 'ja') return t('output.control_yes');
        if (s === 'nej') return t('output.control_no');
        if (s === 'ejakt') return t('output.control_na');
        return t('output.control_unset');
    };

    const statusColor = (s) => {
        if (s === 'ja') return '#16a34a';
        if (s === 'nej') return '#dc2626';
        if (s === 'ejakt') return '#6b7280';
        return '#cbd5e1';
    };

    const lang = (typeof currentLang !== 'undefined' && currentLang) ? currentLang : 'sv';
    const today = new Date().toLocaleDateString(lang === 'en' ? 'en-GB' : 'sv-SE');
    const directiveLabel = project.selectedDirective || t('output.control_no_directive');

    const reportHTML = `
<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${t('output.control_title')}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0 auto; padding: 24px; max-width: 960px; background: #f8fafc; color: #0f172a; }
        h1 { margin: 0 0 0.5rem 0; color: #0ea5e9; }
        h2 { margin: 2rem 0 0.5rem 0; color: #0f172a; }
        h3 { margin: 1rem 0 0.5rem 0; color: #0f172a; }
        .card { background: white; border-radius: 10px; padding: 1.25rem; box-shadow: 0 1px 4px rgba(0,0,0,0.06); margin-bottom: 1rem; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; }
        .chip { display: inline-block; padding: 6px 10px; border-radius: 999px; font-size: 0.9rem; font-weight: 600; color: white; }
        table { width: 100%; border-collapse: collapse; margin-top: 1rem; font-size: 0.95rem; }
        th, td { border: 1px solid #e2e8f0; padding: 0.75rem; text-align: left; vertical-align: top; }
        th { background: #f1f5f9; font-weight: 700; }
        .muted { color: #64748b; }
        .print-button { position: fixed; top: 16px; right: 16px; background: #0ea5e9; color: white; border: none; padding: 10px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; }
        @media print { .print-button { display: none; } body { background: white; } .card { box-shadow: none; } }
    </style>
</head>
<body>
    <button class="print-button" onclick="window.print()">🖨️ ${t('output.print_save')}</button>
    <div class="card" style="border-left: 4px solid #0ea5e9;">
        <h1>📑 ${t('output.control_title')}</h1>
        <p class="muted" style="margin: 0;">${today}</p>
        <div class="grid" style="margin-top: 0.75rem;">
            <div><strong>${t('output.control_project')}:</strong> ${project.productData?.productName || 'N/A'}</div>
            <div><strong>${t('output.control_model')}:</strong> ${project.productData?.model || 'N/A'}</div>
            <div><strong>${t('output.control_directive')}:</strong> ${directiveLabel}</div>
            <div><strong>${t('output.control_reviewer')}:</strong> ${report.reviewer || '—'}</div>
            <div><strong>${t('output.control_approver')}:</strong> ${report.approver || '—'}</div>
            <div><strong>${t('output.control_date')}:</strong> ${report.date || today}</div>
            <div><strong>${t('output.control_approval_date')}:</strong> ${report.approvalDate || '—'}</div>
        </div>
        ${report.summary ? `<div style="margin-top: 1rem; padding: 0.75rem 0; color: #0f172a;"><strong>${t('output.control_summary')}:</strong><br>${report.summary}</div>` : ''}
    </div>

    <div class="card">
        <h3 style="margin-top: 0;">${t('output.control_status_overview')}</h3>
        <div class="grid">
            <div><span class="chip" style="background: #16a34a;">${t('output.control_yes')}</span> ${yesCount}</div>
            <div><span class="chip" style="background: #dc2626;">${t('output.control_no')}</span> ${noCount}</div>
            <div><span class="chip" style="background: #6b7280;">${t('output.control_na')}</span> ${naCount}</div>
            <div><span class="chip" style="background: #cbd5e1; color: #0f172a;">${t('output.control_unset')}</span> ${unsetCount}</div>
            <div><strong>${t('output.control_total')}:</strong> ${total}</div>
        </div>
    </div>

    <div class="card">
        <h3 style="margin-top: 0;">${t('output.control_checkpoints_title')}</h3>
        ${items.length === 0 ? `<p class="muted">${t('output.control_none')}</p>` : `
        <table>
            <thead>
                <tr>
                    <th>${t('output.control_section')}</th>
                    <th>${t('output.control_item')}</th>
                    <th style="width: 120px;">${t('output.control_status')}</th>
                </tr>
            </thead>
            <tbody>
                ${items.map(it => `
                    <tr>
                        <td>${it.section}</td>
                        <td>${it.text}</td>
                        <td>
                            <span class="chip" style="background: ${statusColor(it.status)}; ${it.status ? '' : 'color: #0f172a;'}">${statusLabel(it.status)}</span>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        `}
    </div>
</body>
</html>
    `;

    const win = window.open('', '_blank');
    win.document.write(reportHTML);
    win.document.close();
}

if (typeof window !== 'undefined') {
    window.exportControlReport = exportControlReport;
}
