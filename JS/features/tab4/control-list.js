/**
 * Control Report List Management
 * Manages the control checkpoints data and status
 */

import { getCurrentProject } from '../../state.js';
import { t } from '../../i18n/index.js';
import { CONTROL_REPORT_TEMPLATES } from './control-templates.js';
import { getProjectRepository } from '../../data/index.js';

/**
 * Get checkpoint key for storage
 * @param {string} itemId - Item ID
 * @returns {string} Storage key
 */
export function getCheckpointKey(itemId) {
    return `chk::${itemId}`;
}

/**
 * Get checkpoint status
 * @param {string} key - Checkpoint key
 * @returns {string} Status ('ja', 'nej', 'ejakt', or empty)
 */
export function getCheckpointStatus(key) {
    const project = getCurrentProject();
    if (!project?.controlReport?.checkpointStatus) {
        return ''; // No status selected yet
    }
    const statuses = project.controlReport.checkpointStatus;
    return statuses[key] || '';
}

/**
 * Update checkpoint status (Ja/Nej/Ej akt)
 * @param {string} key - Checkpoint key
 * @param {string} status - Status value ('ja', 'nej', 'ejakt')
 */
export function updateCheckpointStatus(key, status) {
    const project = getCurrentProject();
    if (!project) return;
    
    // Initialize control report if needed
    if (!project.controlReport) {
        project.controlReport = {
            checkpoints: {},
            checkpointStatus: {},
            summary: '',
            reviewer: '',
            date: '',
            approver: '',
            approvalDate: ''
        };
    }
    
    if (!project.controlReport.checkpointStatus) {
        project.controlReport.checkpointStatus = {};
    }
    
    project.controlReport.checkpointStatus[key] = status;
    
    // Update tab color
    if (typeof window.updateControlReportTabColor === 'function') {
        window.updateControlReportTabColor();
    }
    
    // Save project (using repository pattern)
    (async () => {
        try {
            const repo = getProjectRepository();
            await repo.saveProject(project);
        } catch (error) {
            console.error('Error saving checkpoint status:', error);
        }
    })();
}

/**
 * Check/uncheck all control points
 * @param {boolean} checked - Whether to check all
 */
export function checkAllControlPoints(checked) {
    const project = getCurrentProject();
    if (!project) return;
    
    // Initialize control report if needed
    if (!project.controlReport) {
        project.controlReport = {
            checkpoints: {},
            checkpointStatus: {},
            summary: '',
            reviewer: '',
            date: '',
            approver: '',
            approvalDate: ''
        };
    }
    
    const template = getActiveControlTemplate();
    const items = getActiveControlItems(template);
    
    items.forEach(item => {
        const key = getCheckpointKey(item.id);
        if (!project.controlReport.checkpointStatus) {
            project.controlReport.checkpointStatus = {};
        }
        project.controlReport.checkpointStatus[key] = checked ? 'ja' : '';
    });
    
    // Save project
    (async () => {
        try {
            const repo = getProjectRepository();
            await repo.saveProject(project);
        } catch (error) {
            console.error('Error saving checkpoint statuses:', error);
        }
    })();
}

/**
 * Save control report data (summary, reviewer, dates)
 */
export function saveControlReportData() {
    const project = getCurrentProject();
    if (!project) return;
    
    if (!project.controlReport) {
        project.controlReport = {
            checkpoints: {},
            checkpointStatus: {},
            summary: '',
            reviewer: '',
            date: '',
            approver: '',
            approvalDate: ''
        };
    }
    
    project.controlReport.summary = document.getElementById('control-summary')?.value || '';
    project.controlReport.reviewer = document.getElementById('control-reviewer')?.value || '';
    project.controlReport.date = document.getElementById('control-date')?.value || '';
    project.controlReport.approver = document.getElementById('control-approver')?.value || '';
    project.controlReport.approvalDate = document.getElementById('control-approval-date')?.value || '';
    
    (async () => {
        try {
            const repo = getProjectRepository();
            await repo.saveProject(project);
        } catch (error) {
            console.error('Error saving control report data:', error);
        }
    })();
}

/**
 * Load control report data into form fields
 */
export function loadControlReportData() {
    const project = getCurrentProject();
    if (!project?.controlReport) return;
    
    const report = project.controlReport;
    
    const summaryEl = document.getElementById('control-summary');
    if (summaryEl) summaryEl.value = report.summary || '';
    
    const reviewerEl = document.getElementById('control-reviewer');
    if (reviewerEl) reviewerEl.value = report.reviewer || '';
    
    const dateEl = document.getElementById('control-date');
    if (dateEl) dateEl.value = report.date || '';
    
    const approverEl = document.getElementById('control-approver');
    if (approverEl) approverEl.value = report.approver || '';
    
    const approvalDateEl = document.getElementById('control-approval-date');
    if (approvalDateEl) approvalDateEl.value = report.approvalDate || '';
}

/**
 * Get active control template based on selected directive
 * Combines machinery and low voltage templates when both are selected
 * @returns {Object} Template configuration
 */
export function getActiveControlTemplate() {
    const project = getCurrentProject();
    
    const hasLowVoltage = isLowVoltageSelected();
    const isRegulation = isRegulationSelected();
    const hasMachinery = project?.selectedDirective && 
                        (project.selectedDirective.includes('2006/42') || 
                         project.selectedDirective.includes('2023/1230'));
    
    // If both machinery and low voltage are selected, combine templates
    if (hasMachinery && hasLowVoltage) {
        const machineryTemplate = isRegulation ? 
            CONTROL_REPORT_TEMPLATES.regulation : 
            CONTROL_REPORT_TEMPLATES.directive;
        const lvdTemplate = CONTROL_REPORT_TEMPLATES.lowvoltage;
        
        return {
            titleKey: machineryTemplate.titleKey,
            noteKey: machineryTemplate.noteKey,
            levels: [
                ...machineryTemplate.levels,
                ...lvdTemplate.levels
            ]
        };
    }
    
    // Only Low Voltage Directive is selected
    if (hasLowVoltage) {
        return CONTROL_REPORT_TEMPLATES.lowvoltage;
    }
    
    // Only Machinery Directive/Regulation is selected
    return isRegulation ? CONTROL_REPORT_TEMPLATES.regulation : CONTROL_REPORT_TEMPLATES.directive;
}

/**
 * Get all active control items from template
 * @param {Object} template - Optional template override
 * @returns {Array} Flattened array of control items
 */
export function getActiveControlItems(template = getActiveControlTemplate()) {
    return template.levels.flatMap(level => 
        level.sections.flatMap(section => section.items)
    );
}

/**
 * Check if Regulation 2023/1230 is selected
 * @returns {boolean} True if regulation is selected
 */
function isRegulationSelected() {
    const project = getCurrentProject();
    if (!project) return false;
    
    const primary = project.selectedDirective || '';
    const extras = (project.directives || []).map(d => d.name).filter(Boolean);
    
    return primary.includes('2023/1230') || extras.some(name => name && name.includes('2023/1230'));
}

/**
 * Check if Low Voltage Directive 2014/35/EU is selected
 * @returns {boolean} True if low voltage directive is selected
 */
function isLowVoltageSelected() {
    const project = getCurrentProject();
    if (!project) return false;
    
    const primary = project.selectedDirective || '';
    const extras = (project.directives || []).map(d => d.name).filter(Boolean);
    
    return primary.includes('2014/35') || extras.some(name => name && name.includes('2014/35'));
}

/**
 * Show help text for a control checkpoint
 * @param {string} helpKey - Translation key for help text
 */
export function showControlHelp(helpKey) {
    const helpText = t(helpKey, {}, '');
    if (!helpText) return;

    // Create and show modal
    const modal = document.createElement('div');
    modal.id = 'control-help-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        border-radius: var(--border-radius);
        padding: 2rem;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;

    content.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <button onclick="document.getElementById('control-help-modal').remove()" style="float: right; background: none; border: none; font-size: 1.5rem; cursor: pointer;">✕</button>
            <h3 style="color: var(--primary-color); margin: 0 0 1rem 0;">${t('control.help.title', {}, 'Hjälptext')}</h3>
        </div>
        <div style="white-space: pre-wrap; line-height: 1.6; color: var(--text-primary); font-size: 0.95rem;">
            ${escapeHtml(helpText)}
        </div>
        <div style="margin-top: 1.5rem; text-align: right;">
            <button onclick="document.getElementById('control-help-modal').remove()" class="btn btn-primary">${t('action.close', {}, 'Stäng')}</button>
        </div>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

/**
 * Escape HTML for security
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Expose functions globally for onclick handlers
if (typeof window !== 'undefined') {
    window.updateCheckpointStatus = updateCheckpointStatus;
    window.showControlHelp = showControlHelp;
    window.checkAllControlPoints = checkAllControlPoints;
}
