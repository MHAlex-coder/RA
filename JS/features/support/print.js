/**
 * Print and Report Generation Features
 * Handles print/export of reports and summaries
 */

import { getCurrentProject } from '../../state.js';
import { t } from '../../i18n/index.js';

/**
 * Print risk assessment
 */
export function printRiskAssessment() {
    window.print();
}

/**
 * Export to PDF (placeholder)
 */
export function exportToPDF() {
    alert('PDF-export kräver ett PDF-bibliotek (t.ex. jsPDF).\n\nFör tillfället kan du använda "Skriv ut" och välja "Spara som PDF" i skrivardialogrutan.');
}

/**
 * Generate summary report
 */
export function generateSummaryReport() {
    const project = getCurrentProject();
    if (!project) return;
    
    const compliance = project.compliance || {};
    const highRiskText = compliance.isHighRisk
        ? (compliance.highRiskCategory || compliance.highRiskCustom || t('report.highrisk'))
        : t('report.nothighrisk');
    const pathText = compliance.conformityPath === 'notified'
        ? t('report.notifiedbody')
        : t('report.ownassessment');
    
    const RM = (typeof RiskMatrix !== 'undefined' && RiskMatrix) ? RiskMatrix : null;
    
    // Count risks including interface risks
    const allCombinedRisks = [...(project.risks || []), ...(project.interfaceRisks || [])];
    const totalRisks = allCombinedRisks.length;
    
    const highRisks = RM ? allCombinedRisks.filter(r => {
        const classification = RM.classifyRisk(r.parametersOUT.S, r.parametersOUT.F, r.parametersOUT.P, r.parametersOUT.A);
        return classification === 'high';
    }).length : 0;
    
    const mediumRisks = RM ? allCombinedRisks.filter(r => {
        const classification = RM.classifyRisk(r.parametersOUT.S, r.parametersOUT.F, r.parametersOUT.P, r.parametersOUT.A);
        return classification === 'medium';
    }).length : 0;

    const lowMediumRisks = RM ? allCombinedRisks.filter(r => {
        const classification = RM.classifyRisk(r.parametersOUT.S, r.parametersOUT.F, r.parametersOUT.P, r.parametersOUT.A);
        return classification === 'lowMedium';
    }).length : 0;
    
    const lowRisks = totalRisks - highRisks - mediumRisks - lowMediumRisks;
    
    const lang = (typeof currentLang !== 'undefined' && currentLang) ? currentLang : 'sv';
    
    const reportHTML = `
<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <title>${t('output.summary_title')} - ${project.productData.productName}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 900px; margin: 2rem auto; padding: 2rem; }
        h1 { color: #1e40af; border-bottom: 3px solid #3b82f6; padding-bottom: 0.5rem; }
        h2 { color: #1e40af; margin-top: 2rem; }
        .summary-box { background: #f3f4f6; padding: 1.5rem; border-radius: 8px; margin: 1rem 0; }
        .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin: 1rem 0; }
        .stat-card { background: white; padding: 1rem; border-radius: 8px; text-align: center; }
        .stat-number { font-size: 2rem; font-weight: bold; }
        .high { color: #dc2626; }
        .medium { color: #f59e0b; }
        .lowMedium { color: #facc15; }
        .low { color: #10b981; }
        table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
        th, td { border: 1px solid #e5e7eb; padding: 0.75rem; text-align: left; }
        th { background: #f3f4f6; font-weight: 600; }
    </style>
</head>
<body>
    <h1>${t('output.summary_title')}</h1>
    
    <div class="summary-box">
        <h3>${t('output.summary_product_info')}</h3>
        <p><strong>${t('output.summary_product_name')}</strong> ${project.productData.productName || 'N/A'}</p>
        <p><strong>${t('output.summary_model')}</strong> ${project.productData.model || 'N/A'}</p>
        <p><strong>${t('output.summary_revision')}</strong> ${project.revision || '1.0'}</p>
        <p><strong>${t('output.doc_directives_label')}</strong> ${project.selectedDirective || 'Ej valt'}</p>
        <p><strong>Högriskstatus</strong> ${highRiskText}</p>
        <p><strong>Bedömningsväg</strong> ${pathText}${compliance.notifiedBody ? ` (ANB: ${compliance.notifiedBody})` : ''}</p>
        <p><strong>${t('output.summary_date')}</strong> ${new Date().toLocaleDateString(lang === 'en' ? 'en-GB' : 'sv-SE')}</p>
    </div>
    
    <h2>${t('output.summary_risk_compilation')}</h2>
    <div class="stats">
        <div class="stat-card">
            <div class="stat-number high">${highRisks}</div>
            <div>${t('output.summary_high_risks')}</div>
        </div>
        <div class="stat-card">
            <div class="stat-number medium">${mediumRisks}</div>
            <div>${t('output.summary_medium_risks')}</div>
        </div>
        <div class="stat-card">
            <div class="stat-number lowMedium">${lowMediumRisks}</div>
            <div>${t('output.summary_lowmedium_risks')}</div>
        </div>
        <div class="stat-card">
            <div class="stat-number low">${lowRisks}</div>
            <div>${t('output.summary_low_risks')}</div>
        </div>
    </div>
    
    <p><strong>${t('output.summary_total_risks')}</strong> ${totalRisks} (${(project.risks || []).length} standard + ${(project.interfaceRisks || []).length} interface)</p>
    
    <h2>${t('output.summary_standards_title')}</h2>
    <ul>
        ${(project.standards || []).map(s => `<li>${s.number} - ${s.title}</li>`).join('')}
    </ul>
    
    <h2>${t('output.summary_control_report')}</h2>
    <p>${t('output.summary_control_text')}</p>
    
    <h2>${t('output.summary_conclusion')}</h2>
    <p>${t('output.summary_conclusion_text')}</p>
</body>
</html>
    `;
    
    const win = window.open('', '_blank');
    win.document.write(reportHTML);
    win.document.close();
}

/**
 * Generate risk matrix placeholder
 */
export function generateRiskMatrix() {
    alert('Riskmatris-visualisering kommer implementeras senare.\n\nVisar grafisk representation av alla risker i en matris.');
}

// Expose functions globally
if (typeof window !== 'undefined') {
    window.printRiskAssessment = printRiskAssessment;
    window.exportToPDF = exportToPDF;
    window.generateSummaryReport = generateSummaryReport;
    window.generateRiskMatrix = generateRiskMatrix;
}
