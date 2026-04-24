/**
 * TCF Checklist Export
 */

import { getCurrentProject } from '../../state.js';
import { t, getCurrentLang } from '../../i18n/index.js';

export function renderTCFChecklist() {
    const container = document.getElementById('tcf-checklist');
    if (!container) return;
    
    const tcfItems = [
        'Ritningar och konstruktionsdokumentation',
        'Riskbedömning enligt EN ISO 12100',
        'Lista över tillämpade standarder',
        'EU-försäkran om överensstämmelse (DoC)',
        'Bruksanvisning (på svenska och andra relevanta språk)',
        'Installationsanvisningar',
        'Underhållsinstruktioner',
        'Säkerhetsdatablad för farliga ämnen (om tillämpligt)',
        'Resultat från tester och mätningar',
        'CE-märkningsdokumentation',
        'Monteringsplan och stycklista (BOM)',
        'Elektrisk schema och säkerhetskrets',
        'Pneumatiska/hydrauliska schema',
        'Styrsystemdokumentation (PLC-program)',
        'Kvalitetssäkringsdokumentation'
    ];
    
    container.innerHTML = tcfItems.map((item, index) => `
        <label class="checkbox-group" style="margin-bottom: 0.75rem;">
            <input type="checkbox" class="form-checkbox" id="tcf-${index}" />
            <span>${item}</span>
        </label>
    `).join('');
}

export function generateTCFChecklist() {
    const currentLang = getCurrentLang();
    const project = getCurrentProject();
    const productName = project?.productData?.productName || 'N/A';
    
    const tcfHTML = `
<!DOCTYPE html>
<html lang="${currentLang}">
<head>
    <meta charset="UTF-8">
    <title>${t('output.tcf_title')}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 2rem auto; padding: 2rem; }
        h1 { color: #1e40af; }
        .checklist-item { margin: 1rem 0; padding: 0.75rem; background: #f9fafb; border-left: 4px solid #3b82f6; }
        .checkbox { width: 20px; height: 20px; margin-right: 0.5rem; }
    </style>
</head>
<body>
    <h1>${t('output.tcf_title')}</h1>
    <p>${t('output.tcf_product')} ${productName}</p>
    <p>${t('output.tcf_date')} ${new Date().toLocaleDateString(currentLang === 'en' ? 'en-GB' : 'sv-SE')}</p>
    
    <h2>${t('output.tcf_mandatory_docs')}</h2>
    ${Array.from(document.querySelectorAll('#tcf-checklist .checkbox-group')).map(item => {
        const checkbox = item.querySelector('input');
        const text = item.querySelector('span').textContent;
        return `
        <div class="checklist-item">
            <input type="checkbox" class="checkbox" ${checkbox.checked ? 'checked' : ''} />
            ${text}
        </div>`;
    }).join('')}
</body>
</html>
    `;
    
    const win = window.open('', '_blank');
    win.document.write(tcfHTML);
    win.document.close();
}

if (typeof window !== 'undefined') {
    window.renderTCFChecklist = renderTCFChecklist;
    window.generateTCFChecklist = generateTCFChecklist;
}
