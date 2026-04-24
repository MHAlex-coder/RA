/**
 * Import Features
 * Handles project import and AI-bridge import
 */

import { getCurrentProject, setCurrentProject } from '../../state.js';
import { getProjectRepository } from '../../data/index.js';
import { t } from '../../i18n/index.js';
import { controlQuestions } from '../../config/control-questions.js';

// Prevent double-invocation
let isImporting = false;

/**
 * Import project from .hra file
 */
export function importProject() {
    console.log('🔴 importProject() START - Entry point reached');
    
    if (isImporting) {
        console.warn('Import already in progress, ignoring duplicate call');
        return;
    }
    
    isImporting = true;
    console.log('importProject() called');
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.hra,.json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            isImporting = false;
            return;
        }
        
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const projectData = JSON.parse(event.target.result);

                // Fallback for older files
                if (!projectData.productData && (projectData.productName || projectData.orderNumber)) {
                    const base = getEmptyProject();
                    projectData.productData = {
                        ...base.productData,
                        productName: projectData.productName || '',
                        orderNumber: projectData.orderNumber || ''
                    };
                }

                const hasProductData = projectData.productData && (
                    projectData.productData.productName ||
                    projectData.productData.orderNumber ||
                    projectData.productData.projectNumber
                );

                if (!hasProductData) {
                    throw new Error('Ogiltig projektfil');
                }

                const confirmImport = window.confirm(
                    `Importera projekt:\n\n` +
                    `Produkt: ${projectData.productData.productName || 'Okänd'}\n` +
                    `Order: ${projectData.productData.orderNumber || 'Okänd'}\n` +
                    `Project Nr: ${projectData.productData.projectNumber || 'Okänd'}\n` +
                    `Revision: ${(projectData.meta && projectData.meta.revision) || projectData.revision || '1.0'}\n\n` +
                    `Detta kommer att ersätta nuvarande projekt. Fortsätt?`
                );
                if (!confirmImport) return;

                const base = getEmptyProject();
                const merged = {
                    ...base,
                    ...projectData,
                    meta: { ...base.meta, ...(projectData.meta || {}) },
                    productData: { ...base.productData, ...(projectData.productData || {}) },
                    manufacturer: { ...base.manufacturer, ...(projectData.manufacturer || {}) },
                    compliance: { ...base.compliance, ...(projectData.compliance || {}) },
                    digitalSafety: { ...base.digitalSafety, ...(projectData.digitalSafety || {}) },
                    riskFramework: { ...base.riskFramework, ...(projectData.riskFramework || {}) },
                    machineCategories: { ...base.machineCategories, ...(projectData.machineCategories || {}) },
                    media: { ...base.media, ...(projectData.media || {}) },
                    controlReport: { ...base.controlReport, ...(projectData.controlReport || {}) }
                };

                merged.risks = projectData.risks || [];
                merged.interfaceRisks = projectData.interfaceRisks || [];
                merged.objects = projectData.objects || [];
                merged.modules = projectData.modules || [];
                merged.standards = projectData.standards || [];
                merged.directives = projectData.directives || [];
                merged.selectedDirective = projectData.selectedDirective || '';
                merged.customLists = projectData.customLists || {};
                merged.customControlQuestions = projectData.customControlQuestions || JSON.parse(JSON.stringify(controlQuestions));
                merged.meta.lastModified = new Date().toISOString();

                setCurrentProject(merged);

                // Migrate to new data layer
                const repo = getProjectRepository();
                await repo.saveProject(merged);
                        if (typeof window.loadProjectDataToForm === 'function') {
                            window.loadProjectDataToForm();
                        }
                        if (typeof window.updateProjectName === 'function') {
                            window.updateProjectName(merged.productData.projectNumber || merged.productData.productName || 'Importerat projekt');
                        }
                        if (typeof window.updateProjectRevision === 'function') {
                            window.updateProjectRevision((merged.meta && merged.meta.revision) || '1.0');
                        }
                        if (typeof window.switchTab === 'function') {
                            window.switchTab('tab1');
                        }
                        alert('Projekt importerat!');
                
            } catch (error) {
                console.error('Import error:', error);
                alert('Fel vid import: ' + error.message);
            } finally {
                isImporting = false;
            }
        };
        
        reader.readAsText(file);
    };
    
    // Reset flag if user cancels
    input.oncancel = () => {
        console.log('File dialog cancelled');
        isImporting = false;
    };
    
    console.log('About to trigger file dialog with input.click()');
    input.click();
    console.log('input.click() completed');
}

/**
 * Parse CSV text into rows
 * @param {string} text - CSV text
 * @returns {Array} Parsed rows
 */
function parseCSV(text) {
    const rows = [];
    let row = [];
    let field = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (inQuotes) {
            if (char === '"') {
                if (text[i + 1] === '"') {
                    field += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                field += char;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
            } else if (char === ',') {
                row.push(field);
                field = '';
            } else if (char === '\n') {
                row.push(field);
                rows.push(row);
                row = [];
                field = '';
            } else if (char === '\r') {
                continue;
            } else {
                field += char;
            }
        }
    }

    if (field.length > 0 || row.length > 0) {
        row.push(field);
        rows.push(row);
    }

    return rows;
}

function ensureArraySlot(arr, index, defaultValue) {
    while (arr.length <= index) {
        arr.push(typeof defaultValue === 'function' ? defaultValue() : JSON.parse(JSON.stringify(defaultValue)));
    }
}

function applyTranslationEntry(project, key, value) {
    if (!project) return false;

    if (key.startsWith('productData.')) {
        const field = key.split('.')[1];
        if (!project.productData) project.productData = {};
        project.productData[field] = value;
        return true;
    }

    if (key.startsWith('manufacturer.')) {
        const field = key.split('.')[1];
        if (!project.manufacturer) project.manufacturer = {};
        project.manufacturer[field] = value;
        return true;
    }

    if (key.startsWith('riskFramework.')) {
        const field = key.split('.')[1];
        if (!project.riskFramework) project.riskFramework = {};
        project.riskFramework[field] = value;
        return true;
    }

    if (key === 'moduleMotivation') {
        project.moduleMotivation = value;
        return true;
    }

    if (key === 'meta.projectName') {
        if (!project.meta) project.meta = {};
        project.meta.projectName = value;
        if (typeof window.updateProjectName === 'function') {
            window.updateProjectName(value || 'Namnlöst projekt');
        }
        return true;
    }

    if (key === 'meta.revision') {
        project.revision = value;
        if (typeof window.updateProjectRevision === 'function') {
            window.updateProjectRevision(value || '1.0');
        }
        return true;
    }

    const riskMatch = key.match(/^risks\.([^\.]+)\.(.+)$/);
    if (riskMatch) {
        const [, riskId, fieldPart] = riskMatch;
        const risk = (project.risks || []).find(r => r.id === riskId);
        if (!risk) return false;

        if (fieldPart === 'machine_part') {
            risk.area = value;
            return true;
        }
        if (fieldPart === 'zone_area') {
            risk.zone = value;
            return true;
        }
        if (fieldPart === 'description') {
            risk.description = value;
            return true;
        }
        if (fieldPart === 'comment') {
            risk.comment = value;
            return true;
        }

        const measureMatch = fieldPart.match(/^measures\[(\d+)\]\.text$/);
        if (measureMatch) {
            const idx = parseInt(measureMatch[1], 10);
            if (!risk.protectiveMeasures) risk.protectiveMeasures = [];
            ensureArraySlot(risk.protectiveMeasures, idx, { measure: '', type: '' });
            if (typeof risk.protectiveMeasures[idx] !== 'object') {
                risk.protectiveMeasures[idx] = { measure: '', type: '' };
            }
            risk.protectiveMeasures[idx].measure = value;
            return true;
        }

        const evidenceMatch = fieldPart.match(/^evidence\[(\d+)\]$/);
        if (evidenceMatch) {
            const idx = parseInt(evidenceMatch[1], 10);
            if (!risk.evidenceLinks) risk.evidenceLinks = [];
            ensureArraySlot(risk.evidenceLinks, idx, '');
            risk.evidenceLinks[idx] = value;
            return true;
        }
    }

    const ifaceMatch = key.match(/^interfaceRisks\.([^\.]+)\.(.+)$/);
    if (ifaceMatch) {
        const [, riskId, fieldPart] = ifaceMatch;
        const risk = (project.interfaceRisks || []).find(r => r.id === riskId);
        if (!risk) return false;

        if (fieldPart === 'interface_with') {
            risk.interfaceWith = value;
            return true;
        }
        if (fieldPart === 'zone_area') {
            risk.area = value;
            return true;
        }
        if (fieldPart === 'description') {
            risk.description = value;
            return true;
        }
        if (fieldPart === 'comment') {
            risk.comment = value;
            return true;
        }

        const measureMatch = fieldPart.match(/^measures\[(\d+)\]\.text$/);
        if (measureMatch) {
            const idx = parseInt(measureMatch[1], 10);
            if (!risk.protectiveMeasures) risk.protectiveMeasures = [];
            ensureArraySlot(risk.protectiveMeasures, idx, { measure: '', type: '' });
            if (typeof risk.protectiveMeasures[idx] !== 'object') {
                risk.protectiveMeasures[idx] = { measure: '', type: '' };
            }
            risk.protectiveMeasures[idx].measure = value;
            return true;
        }

        const evidenceMatch = fieldPart.match(/^evidence\[(\d+)\]$/);
        if (evidenceMatch) {
            const idx = parseInt(evidenceMatch[1], 10);
            if (!risk.evidenceLinks) risk.evidenceLinks = [];
            ensureArraySlot(risk.evidenceLinks, idx, '');
            risk.evidenceLinks[idx] = value;
            return true;
        }
    }

    return false;
}

/**
 * Import translation CSV (AI-bridge)
 */
export function importTranslationCSV() {
    const project = getCurrentProject();
    if (!project) {
        alert('Inget projekt laddat');
        return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,text/csv';

    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target.result;
            const rows = parseCSV(text);
            if (!rows || rows.length < 2) {
                alert(t('aibridge.import_invalid'));
                return;
            }

            const header = rows[0].map(h => h.trim().toLowerCase());
            if (header.length < 4 || header[0] !== 'projectid' || header[1] !== 'projectnumber' || header[2] !== 'key' || header[3] !== 'value') {
                alert(t('aibridge.import_invalid'));
                return;
            }

            const targetProjectNumber = project.productData?.projectNumber || '';
            const incomingProjectNumber = rows[1][1] || '';
            if (incomingProjectNumber && targetProjectNumber && incomingProjectNumber !== targetProjectNumber) {
                const proceed = confirm(t('aibridge.import_mismatch'));
                if (!proceed) return;
            }

            let updated = 0;
            let skipped = 0;

            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                if (!row || row.length < 4) {
                    skipped++;
                    continue;
                }
                const key = row[2];
                const value = row[3];
                const applied = applyTranslationEntry(project, key, value);
                if (applied) {
                    updated++;
                } else {
                    skipped++;
                }
            }

            project.lastModified = new Date().toISOString();
            
            // Migrate to new data layer
            const repo = getProjectRepository();
            await repo.saveProject(project);
            
            if (typeof window.loadProjectDataToForm === 'function') {
                window.loadProjectDataToForm();
            }
            if (typeof window.renderRiskCards === 'function') {
                window.renderRiskCards();
            }
            if (typeof window.renderInterfaceRisks === 'function') {
                window.renderInterfaceRisks();
            }

            alert(`${t('aibridge.import_success')}\n${t('aibridge.import_summary').replace('{{updated}}', updated).replace('{{skipped}}', skipped)}`);
        };

        reader.readAsText(file);
    };

    input.click();
}

function getEmptyProject() {
    if (typeof window.createEmptyProject === 'function') {
        return window.createEmptyProject();
    }
    if (typeof createEmptyProject === 'function') {
        return createEmptyProject();
    }
    throw new Error('createEmptyProject is not available');
}

// Expose functions globally
if (typeof window !== 'undefined') {
    window.importProject = importProject;
    window.importTranslationCSV = importTranslationCSV;
}
