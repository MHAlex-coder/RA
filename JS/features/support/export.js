/**
 * Export Features
 * Handles project export and AI-bridge export
 */

import { getCurrentProject } from '../../state.js';
import { t } from '../../i18n/index.js';

/**
 * Export project to .hra file
 */
export function exportProject() {
    const project = getCurrentProject();
    if (!project) {
        alert('Inget projekt laddat');
        return;
    }
    
    const projectData = JSON.stringify(project, null, 2);
    const blob = new Blob([projectData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    
    // Create filename: projectname_version_date_time
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    const projectName = (project.productData?.projectNumber || 
                        project.productName || 
                        'projekt').replace(/\s+/g, '_');
    const version = project.revision || project.meta?.revision || '1.0';
    
    const filename = `${projectName}_v${version}_${dateStr}_${timeStr}.hra`;
    a.download = filename;
    a.click();
    
    URL.revokeObjectURL(url);
    
    alert(`Projekt exporterat till: ${filename}`);
}

/**
 * Collect translation entries for AI-bridge
 * @param {Object} project - Project object
 * @returns {Array} Translation entries
 */
export function collectTranslationEntries(project) {
    const entries = [];
    const add = (key, value) => {
        const str = (value === undefined || value === null) ? '' : String(value);
        entries.push({ key, value: str });
    };

    const pd = project.productData || {};
    add('productData.orderNumber', pd.orderNumber);
    add('productData.projectNumber', pd.projectNumber);
    add('productData.productType', pd.productType);
    add('productData.productName', pd.productName);
    add('productData.model', pd.model);
    add('productData.serialNumber', pd.serialNumber);
    add('productData.batchNumber', pd.batchNumber);
    add('productData.machineNumber', pd.machineNumber);
    add('productData.functionDescription', pd.functionDescription);

    const mf = project.manufacturer || {};
    add('manufacturer.companyName', mf.companyName);
    add('manufacturer.address', mf.address);
    add('manufacturer.contactInfo', mf.contactInfo);
    add('manufacturer.docSignatory', mf.docSignatory);
    add('manufacturer.technicalFileResponsible', mf.technicalFileResponsible);

    const rf = project.riskFramework || {};
    add('riskFramework.intendedUse', rf.intendedUse);
    add('riskFramework.foreseeableMisuse', rf.foreseeableMisuse);
    add('riskFramework.spaceLimitations', rf.spaceLimitations);
    add('riskFramework.timeLimitations', rf.timeLimitations);
    add('riskFramework.otherLimitations', rf.otherLimitations);

    add('moduleMotivation', project.moduleMotivation);
    add('meta.projectName', project.meta?.projectName);
    add('meta.revision', project.revision || project.meta?.revision);

    (project.risks || []).forEach(risk => {
        const base = `risks.${risk.id}`;
        add(`${base}.machine_part`, risk.area);
        add(`${base}.zone_area`, risk.zone);
        add(`${base}.description`, risk.description);
        add(`${base}.comment`, risk.comment);

        if (risk.protectiveMeasures) {
            risk.protectiveMeasures.forEach((item, i) => {
                const measureText = typeof item === 'object' ? (item.measure || '') : (item || '');
                add(`${base}.measures[${i}].text`, measureText);
            });
        }

        if (risk.evidenceLinks) {
            risk.evidenceLinks.forEach((link, i) => add(`${base}.evidence[${i}]`, link));
        }
    });

    (project.interfaceRisks || []).forEach(risk => {
        const base = `interfaceRisks.${risk.id}`;
        add(`${base}.interface_with`, risk.interfaceWith);
        add(`${base}.zone_area`, risk.area);
        add(`${base}.description`, risk.description);
        add(`${base}.comment`, risk.comment);

        if (risk.protectiveMeasures) {
            risk.protectiveMeasures.forEach((item, i) => {
                const measureText = typeof item === 'object' ? (item.measure || '') : (item || '');
                add(`${base}.measures[${i}].text`, measureText);
            });
        }

        if (risk.evidenceLinks) {
            risk.evidenceLinks.forEach((link, i) => add(`${base}.evidence[${i}]`, link));
        }
    });

    return entries;
}

/**
 * Escape CSV values
 * @param {string} value - Value to escape
 * @returns {string} Escaped value
 */
function csvEscape(value) {
    const str = value === undefined || value === null ? '' : String(value);
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
}

/**
 * Build translation CSV
 * @param {Object} project - Project object
 * @param {Array} entries - Translation entries
 * @returns {string} CSV content
 */
export function buildTranslationCSV(project, entries) {
    const header = ['projectId', 'projectNumber', 'key', 'value'];
    const rows = [header];
    const projId = project.id ?? '';
    const projNumber = project.productData?.projectNumber ?? '';

    entries.forEach(entry => {
        rows.push([
            projId,
            projNumber,
            entry.key,
            entry.value
        ]);
    });

    return rows.map(row => row.map(csvEscape).join(',')).join('\n');
}

/**
 * Export translation CSV for AI-bridge
 */
export function exportTranslationCSV() {
    const project = getCurrentProject();
    if (!project) {
        alert('Inget projekt laddat');
        return;
    }

    const entries = collectTranslationEntries(project);
    const csv = buildTranslationCSV(project, entries);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    const filename = `${project.productData?.projectNumber || 'translation'}-ai-bridge.csv`;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    alert(t('aibridge.export_success'));
}

// Expose functions globally
if (typeof window !== 'undefined') {
    window.exportProject = exportProject;
    window.exportTranslationCSV = exportTranslationCSV;
}
