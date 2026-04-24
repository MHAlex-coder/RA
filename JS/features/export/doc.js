/**
 * EU Declaration of Conformity / Incorporation
 * Handles DoC/DoI data loading, saving, and generation
 */

import { getCurrentProject } from '../../state.js';
import { getProjectRepository } from '../../data/index.js';
import { t } from '../../i18n/index.js';

/**
 * Load DoC data from project into form fields
 */
export function loadDoCData() {
    const project = getCurrentProject();
    if (!project) return;
    
    if (!project.declarationOfConformity) {
        project.declarationOfConformity = {
            manufacturer: '',
            machineType: '',
            model: '',
            serialNumber: '',
            notifiedBody: '',
            place: '',
            date: '',
            signatoryName: '',
            signatoryTitle: '',
            digitalDeclarationLink: ''
        };
    }
    
    const doc = project.declarationOfConformity;
    
    if (document.getElementById('doc-manufacturer')) {
        document.getElementById('doc-manufacturer').value = doc.manufacturer || 
            `${project.manufacturer.companyName}\n${project.manufacturer.address}`;
    }
    if (document.getElementById('doc-machine-type')) document.getElementById('doc-machine-type').value = doc.machineType || project.productData.productType || '';
    if (document.getElementById('doc-model')) document.getElementById('doc-model').value = doc.model || project.productData.model || '';
    if (document.getElementById('doc-serial')) document.getElementById('doc-serial').value = doc.serialNumber || project.productData.serialNumber || '';
    if (document.getElementById('doc-notified-body')) document.getElementById('doc-notified-body').value = doc.notifiedBody || '';
    if (document.getElementById('doc-digital-link')) document.getElementById('doc-digital-link').value = doc.digitalDeclarationLink || '';
    if (document.getElementById('doc-place')) document.getElementById('doc-place').value = doc.place || '';
    if (document.getElementById('doc-date')) document.getElementById('doc-date').value = doc.date || new Date().toISOString().split('T')[0];
    if (document.getElementById('doc-signatory-name')) document.getElementById('doc-signatory-name').value = doc.signatoryName || project.manufacturer.docSignatory || '';
    if (document.getElementById('doc-signatory-title')) document.getElementById('doc-signatory-title').value = doc.signatoryTitle || '';
    
    if (document.getElementById('doc-manufacturer')) {
        const manufacturerInfo = [];
        if (project.manufacturer?.companyName) manufacturerInfo.push(project.manufacturer.companyName);
        if (project.manufacturer?.address) manufacturerInfo.push(project.manufacturer.address);
        document.getElementById('doc-manufacturer').value = manufacturerInfo.join('\n');
    }
    if (document.getElementById('doc-email')) {
        document.getElementById('doc-email').value = project.manufacturer?.email || '';
    }
    if (document.getElementById('doc-phone')) {
        document.getElementById('doc-phone').value = project.manufacturer?.phone || '';
    }
}

/**
 * Render directives list in DoC
 */
export function renderDoCDirectives() {
    const container = document.getElementById('doc-directives-list');
    if (!container) return;

    const project = getCurrentProject();
    const primary = project?.selectedDirective || '';
    const extras = (project?.directives || []).map(d => d.name).filter(Boolean);
    const directives = [];

    if (primary) directives.push(primary);
    extras.forEach(name => {
        if (name && !directives.includes(name)) directives.push(name);
    });

    if (directives.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.875rem;">Inget direktiv valt än. Gå till Teknisk dokumentation för att välja.</p>';
        return;
    }

    container.innerHTML = directives.map(name => `
        <div style="padding: 0.75rem; background: var(--bg-secondary); border-radius: var(--border-radius); border: 1px solid var(--border-color); margin-bottom: 0.5rem;">
            ${name}
        </div>
    `).join('');
}

/**
 * Render standards in DoC
 */
export function renderDoCStandards() {
    const container = document.getElementById('doc-standards-list');
    if (!container) return;
    
    const project = getCurrentProject();
    const standards = project?.standards || [];
    
    if (standards.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.875rem;">Inga standarder tillagda än. Gå till Teknisk dokumentation för att lägga till.</p>';
        return;
    }
    
    container.innerHTML = standards.map((std, index) => `
        <label class="checkbox-group" style="margin-bottom: 0.5rem;">
            <input type="checkbox" class="form-checkbox" checked />
            <span>${std.number} - ${std.title}</span>
        </label>
    `).join('');
}

/**
 * Save DoC data from form fields
 */
export function saveDoCData() {
    const project = getCurrentProject();
    if (!project?.declarationOfConformity) return;
    
    const doc = project.declarationOfConformity;
    
    doc.manufacturer = document.getElementById('doc-manufacturer')?.value || '';
    doc.machineType = document.getElementById('doc-machine-type')?.value || '';
    doc.model = document.getElementById('doc-model')?.value || '';
    doc.serialNumber = document.getElementById('doc-serial')?.value || '';
    doc.notifiedBody = document.getElementById('doc-notified-body')?.value || '';
    doc.digitalDeclarationLink = document.getElementById('doc-digital-link')?.value || '';
    doc.place = document.getElementById('doc-place')?.value || '';
    doc.date = document.getElementById('doc-date')?.value || '';
    doc.signatoryName = document.getElementById('doc-signatory-name')?.value || '';
    doc.signatoryTitle = document.getElementById('doc-signatory-title')?.value || '';
    
    // Migrate: Use new data layer
    (async () => {
        try {
            const repo = getProjectRepository();
            await repo.saveProject(project);
        } catch (error) {
            console.error('Error saving DoC data:', error);
        }
    })();
}

function generatePurchasedMachinesSection(project) {
    const purchasedMachines = project.purchasedMachines || [];
    const includedMachines = purchasedMachines.filter(m => m.ceIncluded);
    
    if (includedMachines.length === 0) {
        return '';
    }
    
    const isPartly = !!project.productData?.isPartlyCompleted;
    const title = t('purchased.doc_section_title');
    const subtitle = isPartly
        ? t('purchased.doc_section_subtitle_partial')
        : t('purchased.doc_section_subtitle_complete');
    
    const machinesList = includedMachines.map(machine => {
        const legalTypeText = machine.legalType === 'partial' 
            ? t('purchased.doc_legal_partial') 
            : t('purchased.doc_legal_complete');
        const integrationText = machine.integration === 'integrated' 
            ? t('purchased.doc_integration_integrated') 
            : t('purchased.doc_integration_standalone');
        
        return `
            <div style="padding: 12px; background: #f9fafb; border-radius: 4px; margin-bottom: 10px; border-left: 3px solid #10b981;">
                <div style="font-weight: 600; color: #1f2937; font-size: 15px; margin-bottom: 4px;">
                    ${machine.name}
                </div>
                <div style="color: #4b5563; font-size: 14px; margin-bottom: 2px;">
                    <strong>${t('purchased.doc_manufacturer')}:</strong> ${machine.supplier}
                </div>
                <div style="color: #4b5563; font-size: 14px;">
                    <strong>${t('purchased.doc_status')}:</strong> ${legalTypeText} | ${integrationText}
                </div>
                ${machine.comment ? `
                <div style="color: #6b7280; font-size: 13px; margin-top: 4px; font-style: italic;">
                    ${machine.comment}
                </div>
                ` : ''}
            </div>
        `;
    }).join('');
    
    return `
        <div class="section">
            <div class="label">${title}</div>
            <div class="content">
                <p style="margin-bottom: 15px; color: #4b5563;">${subtitle}</p>
                ${machinesList}
            </div>
        </div>
    `;
}

function generateModulesDeclarationSection(project) {
    const modules = project.modules || [];
    const modulesToShow = modules.filter(m => m.fullData?.showModuleSeparately);
    
    if (modulesToShow.length === 0) return '';

    const isPartly = !!project.productData?.isPartlyCompleted;
    const subtitle = isPartly
        ? 'Följande moduler redovisas separat i denna DoI.'
        : 'Följande moduler redovisas separat i denna DoC.';

    const modulesList = modulesToShow.map(module => {
        const moduleName = module.productName || 'Modul';
        const moduleModel = module.model ? ` | Modell: ${module.model}` : '';
        const moduleRev = module.revision ? ` | Rev ${module.revision}` : '';
        const supplier = module.fullData?.manufacturer?.companyName || '';
        return `
            <div style="padding: 12px; background: #f9fafb; border-radius: 4px; margin-bottom: 10px; border-left: 3px solid #1e40af;">
                <div style="font-weight: 600; color: #1f2937; font-size: 15px; margin-bottom: 4px;">
                    ${moduleName}
                </div>
                <div style="color: #4b5563; font-size: 14px;">
                    <strong>Specifikation:</strong> ${moduleModel || ''}${moduleRev}
                </div>
                ${supplier ? `<div style="color: #4b5563; font-size: 14px; margin-top: 4px;"><strong>Tillverkare:</strong> ${supplier}</div>` : ''}
            </div>
        `;
    }).join('');

    return `
        <div class="section">
            <div class="label">Ingående moduler</div>
            <div class="content">
                <p style="margin-bottom: 15px; color: #4b5563;">${subtitle}</p>
                ${modulesList}
            </div>
        </div>
    `;
}

/**
 * Generate EU Declaration of Conformity / Incorporation
 */
export function generateDoC() {
    saveDoCData();
    
    const project = getCurrentProject();
    if (!project) return;
    
    const doc = project.declarationOfConformity;
    const logo = project.media?.logoImage || '';
    const isPartly = !!project.productData?.isPartlyCompleted;
    const compliance = project.compliance || {};

    const titleText = t(isPartly ? 'output.doi_title' : 'output.doc_title');
    const selectedDirective = project.selectedDirective || project.directives?.[0]?.name || '';
    const subtitleText = isPartly
        ? t('output.doi_subtitle')
        : selectedDirective
            ? `${t('output.doc_subtitle_prefix')} ${selectedDirective}`
            : t('output.doc_subtitle_fallback');
    const directivesLabel = t(isPartly ? 'output.doi_directives_label' : 'output.doc_directives_label');
    const standardsLabel = t(isPartly ? 'output.doi_standards_label' : 'output.doc_standards_label');
    const signatureLabel = t(isPartly ? 'output.doi_signature' : 'output.doc_signature');
    const footerText = t(isPartly ? 'output.doi_footer' : 'output.doc_footer');
    const ceMark = isPartly ? '' : `<div class="ce-logo">CE</div>`;
    const directiveList = [];
    if (project.selectedDirective) {
        directiveList.push(project.selectedDirective);
    }
    (project.directives || []).forEach(d => {
        if (d?.name && !directiveList.includes(d.name)) {
            directiveList.push(d.name);
        }
    });
    const highRiskText = compliance.isHighRisk
        ? (compliance.highRiskCategory || compliance.highRiskCustom || t('report.highrisk'))
        : t('report.nothighrisk');
    const pathText = compliance.conformityPath === 'notified'
        ? t('report.notifiedbody')
        : t('report.ownassessment');
    
    let annexSection = '';
    const isRegulation2023 = selectedDirective?.includes('2023/1230');
    if (selectedDirective) {
        if (isRegulation2023) {
            annexSection = isPartly 
                ? '<div class="section"><div class="label">Tillämplig bilaga</div><div class="content"><strong>Bilaga VI</strong> - Deklaration av överensstämmelse för delmaskiner</div></div>'
                : '<div class="section"><div class="label">Tillämplig bilaga</div><div class="content"><strong>Bilaga V</strong> - Deklaration av överensstämmelse för maskiner</div></div>';
        } else {
            annexSection = isPartly
                ? '<div class="section"><div class="label">Tillämplig bilaga</div><div class="content"><strong>Bilaga II 1 B</strong> - Försäkran om överensstämmelse för delmaskiner</div></div>'
                : '<div class="section"><div class="label">Tillämplig bilaga</div><div class="content"><strong>Bilaga II 1 A</strong> - Försäkran om överensstämmelse för maskiner</div></div>';
        }
    }
    
    const lang = (typeof currentLang !== 'undefined' && currentLang) ? currentLang : 'sv';

    const docHTML = `
<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${titleText} - ${doc.machineType || 'Maskin'}</title>
    <style>
        @media print {
            body { margin: 0; padding: 20mm; }
            .no-print { display: none; }
        }
        * { box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 210mm;
            margin: 0 auto;
            padding: 15mm;
            background: #f5f5f5;
            color: #1a1a1a;
            line-height: 1.4;
            font-size: 13px;
        }
        .doc-container {
            background: white;
            padding: 25px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border-radius: 8px;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 12px;
            border-bottom: 2px solid #1e40af;
        }
        .logo { max-width: 180px; max-height: 80px; object-fit: contain; }
        .ce-mark { text-align: right; }
        .ce-logo { font-size: 48px; font-weight: bold; color: #1e40af; font-family: Arial, sans-serif; letter-spacing: -3px; }
        h1 { 
            text-align: center;
            font-size: 18px;
            color: #1e40af;
            margin: 15px 0 20px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
        }
        .section { 
            margin-bottom: 12px;
            padding: 10px 12px;
            background: #f9fafb;
            border-left: 3px solid #3b82f6;
            border-radius: 3px;
        }
        .label { 
            font-weight: 600;
            color: #1e40af;
            margin-bottom: 4px;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        .content { color: #374151; font-size: 13px; margin-top: 3px; }
        .machine-details { display: grid; grid-template-columns: auto 1fr; gap: 8px 15px; margin-top: 10px; }
        .machine-details .detail-label { font-weight: 600; color: #4b5563; }
        .machine-details .detail-value { color: #1f2937; }
        ul { margin: 5px 0; padding-left: 20px; }
        li { margin: 3px 0; color: #374151; font-size: 12px; }
        .signature-section { margin-top: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 25px; align-items: start; }
        .signature-box { padding: 12px; background: #f9fafb; border-radius: 4px; display: flex; flex-direction: column; }
        .signature-content { margin-top: 8px; flex: 1; display: flex; flex-direction: column; justify-content: flex-end; min-height: 70px; }
        .place-date-text { color: #374151; font-size: 12px; margin-top: auto; margin-bottom: 5px; }
        .signature-line { border-top: 1px dashed #1e40af; padding-top: 6px; text-align: center; }
        .signatory-name { font-weight: 600; color: #1f2937; font-size: 13px; }
        .signatory-title { font-size: 11px; color: #6b7280; margin-top: 2px; }
        .footer { margin-top: 25px; padding-top: 12px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 11px; color: #6b7280; }
        .print-button { position: fixed; top: 20px; right: 20px; background: #1e40af; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; box-shadow: 0 2px 8px rgba(30, 64, 175, 0.3); transition: all 0.2s; }
        .print-button:hover { background: #1e3a8a; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(30, 64, 175, 0.4); }
    </style>
</head>
<body>
    <button class="print-button no-print" onclick="window.print()">🖨️ ${t('output.print_save')}</button>
    
    <div class="doc-container">
        <div class="header">
            ${logo ? `<img src="${logo}" alt="Company Logo" class="logo" />` : '<div></div>'}
            <div class="ce-mark">
                ${ceMark}
            </div>
        </div>
        
        <h1>${titleText}</h1>
        <div style="text-align: center; color: #6b7280; font-size: 13px; margin-top: -30px; margin-bottom: 30px;">
            ${subtitleText}
        </div>
        
        <div class="section">
            <div class="label">${t('output.doc_manufacturer_label')}</div>
            <div class="content">${doc.manufacturer.replace(/\n/g, '<br>')}</div>
        </div>
        
        ${(project.manufacturer?.email || project.manufacturer?.phone) ? `
        <div class="section">
            <div class="label">Kontaktuppgifter</div>
            <div class="machine-details">
                ${project.manufacturer?.email ? `
                <span class="detail-label">E-post</span>
                <span class="detail-value"><a href="mailto:${project.manufacturer.email}">${project.manufacturer.email}</a></span>
                ` : ''}
                ${project.manufacturer?.phone ? `
                <span class="detail-label">Telefon</span>
                <span class="detail-value"><a href="tel:${project.manufacturer.phone}">${project.manufacturer.phone}</a></span>
                ` : ''}
            </div>
        </div>
        ` : ''}
        
        <div class="section">
            <div class="label">${t('output.doc_machine_label')}</div>
            <div class="machine-details">
                <span class="detail-label">${t('output.doc_machine_type')}</span>
                <span class="detail-value">${doc.machineType}</span>
                <span class="detail-label">${t('output.doc_model')}</span>
                <span class="detail-value">${doc.model}</span>
                <span class="detail-label">${t('output.doc_serial')}</span>
                <span class="detail-value">${doc.serialNumber}</span>
            </div>
        </div>
        
        <div class="section">
            <div class="label">${directivesLabel}</div>
            <ul>
                ${directiveList.length ? directiveList.map(name => `<li>${name}</li>`).join('') : '<li>Inget direktiv valt</li>'}
            </ul>
        </div>
        
        ${annexSection}

        <div class="section">
            <div class="label">${standardsLabel}</div>
            <ul>
                ${project.standards.map(s => `<li><strong>${s.number}</strong> - ${s.title}</li>`).join('')}
            </ul>
        </div>

        <div class="section">
            <div class="label">Bedömningsväg</div>
            <div class="content">
                <p><strong>Status högrisk:</strong> ${highRiskText}</p>
                <p><strong>Bedömningsväg:</strong> ${pathText}${compliance.notifiedBody ? ` (Anmält organ: ${compliance.notifiedBody})` : ''}</p>
                ${compliance.highRiskNotes ? `<p style="margin-top: 0.25rem; color: #4b5563;">${compliance.highRiskNotes}</p>` : ''}
            </div>
        </div>

        ${doc.digitalDeclarationLink ? `
        <div class="section">
            <div class="label">Digital försäkran</div>
            <div class="content"><a href="${doc.digitalDeclarationLink}" target="_blank" rel="noopener">${doc.digitalDeclarationLink}</a></div>
        </div>
        ` : ''}
        
        ${generateModulesDeclarationSection(project)}
        
        ${generatePurchasedMachinesSection(project)}
        
        ${isPartly ? `
        <div class="section">
            <div class="label">${t('output.doi_clauses_title')}</div>
            <ul>
                <li>${t('output.doi_clause1')}</li>
                <li>${t('output.doi_clause2')}</li>
                <li>${t('output.doi_clause3')}</li>
                <li>${t('output.doi_clause4')}</li>
            </ul>
        </div>
        ` : ''}
        
        ${doc.notifiedBody ? `
        <div class="section">
            <div class="label">${t('output.doc_notified_body')}</div>
            <div class="content">${doc.notifiedBody}</div>
        </div>
        ` : ''}
        
        <div class="signature-section">
            <div class="signature-box">
                <div class="label">${t('output.doc_place_date')}</div>
                <div class="signature-content">
                    <div class="place-date-text">
                        <strong>${doc.place || '_____________'}</strong><br>
                        ${doc.date || '_____________'}
                    </div>
                </div>
            </div>
            
            <div class="signature-box">
                <div class="label">${signatureLabel}</div>
                <div class="signature-content">
                    <div class="signature-line">
                        <div class="signatory-name">${doc.signatoryName || '_____________'}</div>
                        <div class="signatory-title">${doc.signatoryTitle || '_____________'}</div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            ${footerText}<br>
            ${t('output.doc_document_date')} ${new Date().toLocaleDateString(lang === 'en' ? 'en-GB' : 'sv-SE')}
        </div>
    </div>
</body>
</html>
    `;
    
    const win = window.open('', '_blank');
    win.document.write(docHTML);
    win.document.close();
}

/**
 * Preview DoC
 */
export function previewDoC() {
    generateDoC();
}

// Expose globally
if (typeof window !== 'undefined') {
    window.generateDoC = generateDoC;
    window.previewDoC = previewDoC;
    window.loadDoCData = loadDoCData;
    window.renderDoCDirectives = renderDoCDirectives;
    window.renderDoCStandards = renderDoCStandards;
}
