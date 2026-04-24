/**
 * Tab 4 - Control Report
 * Main coordinator for control report management
 */

import { getCurrentProject } from '../../state.js';
import { t } from '../../i18n/index.js';

// Import control list management
import { 
    getCheckpointKey,
    getCheckpointStatus,
    updateCheckpointStatus,
    checkAllControlPoints,
    saveControlReportData,
    loadControlReportData,
    getActiveControlTemplate,
    getActiveControlItems,
    showControlHelp
} from './control-list.js';

// Import rendering functions
import { 
    renderControlChecklist,
    updateControlReportDirective,
    getControlReportStatistics,
    renderControlReportSummary
} from './control-render.js';

/**
 * Initialize Tab 4 - Control Report
 */
export function initializeTab4() {
    console.log('Initializing Tab 4 - Control Report');
    
    const project = getCurrentProject();
    if (!project) {
        console.warn('No project loaded for Tab 4');
        return;
    }
    
    // Initialize control report data if not exists
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
    
    // Render control checklist
    renderControlChecklist();
    
    // Load saved data
    loadControlReportData();
    
        // Update tab color after loading
        if (typeof window.updateControlReportTabColor === 'function') {
            window.updateControlReportTabColor();
        }
    
    // Setup event listeners
    setupTab4EventListeners();
    
    // Expose functions globally
    exposeTab4GlobalFunctions();
}

/**
 * Setup event listeners for Tab 4
 */
function setupTab4EventListeners() {
    // Summary field
    const summaryEl = document.getElementById('control-summary');
    if (summaryEl) {
        summaryEl.addEventListener('change', saveControlReportData);
    }
    
    // Reviewer field
    const reviewerEl = document.getElementById('control-reviewer');
    if (reviewerEl) {
        reviewerEl.addEventListener('change', saveControlReportData);
    }
    
    // Date field
    const dateEl = document.getElementById('control-date');
    if (dateEl) {
        dateEl.addEventListener('change', saveControlReportData);
    }
    
    // Approver field
    const approverEl = document.getElementById('control-approver');
    if (approverEl) {
        approverEl.addEventListener('change', saveControlReportData);
    }
    
    // Approval date field
    const approvalDateEl = document.getElementById('control-approval-date');
    if (approvalDateEl) {
        approvalDateEl.addEventListener('change', saveControlReportData);
    }
    
    // Check all button (if exists)
    const checkAllBtn = document.getElementById('check-all-controls-btn');
    if (checkAllBtn) {
        checkAllBtn.onclick = () => {
            checkAllControlPoints(true);
            renderControlChecklist();
        };
    }
    
    // Uncheck all button (if exists)
    const uncheckAllBtn = document.getElementById('uncheck-all-controls-btn');
    if (uncheckAllBtn) {
        uncheckAllBtn.onclick = () => {
            checkAllControlPoints(false);
            renderControlChecklist();
        };
    }
}

/**
 * Expose Tab 4 functions globally for onclick handlers
 */
function exposeTab4GlobalFunctions() {
    if (typeof window !== 'undefined') {
        // Already exposed in control-list.js but ensuring they're available
        window.updateCheckpointStatus = (key, status) => {
            updateCheckpointStatus(key, status);
            // Optionally update statistics/summary after status change
            renderControlReportSummary();
        };
        
        window.showControlHelp = showControlHelp;
        window.checkAllControlPoints = checkAllControlPoints;
        window.saveControlReportData = saveControlReportData;
    }
}

/**
 * Load Tab 4 data
 */
export function loadTab4Data() {
    const project = getCurrentProject();
    if (!project) return;
    
    console.log('Loading Tab 4 data');
    renderControlChecklist();
    loadControlReportData();
}

/**
 * Validate Tab 4 data
 * @returns {boolean} - True if valid
 */
export function validateTab4() {
    const project = getCurrentProject();
    if (!project) return false;
    
    // Control report is optional, so always valid
    // Could add specific validation logic here if needed
    return true;
}

/**
 * Get control report completion status
 * @returns {Object} Status object with completion percentage and stats
 */
export function getControlReportStatus() {
    return getControlReportStatistics();
}

// Export all functions
export {
    // List management
    getCheckpointKey,
    getCheckpointStatus,
    updateCheckpointStatus,
    checkAllControlPoints,
    saveControlReportData,
    loadControlReportData,
    getActiveControlTemplate,
    getActiveControlItems,
    showControlHelp,
    
    // Rendering
    renderControlChecklist,
    updateControlReportDirective,
    getControlReportStatistics,
    renderControlReportSummary
};

// Re-export main initializer as default
export { initializeTab4 as initializeControlReport };
