/**
 * window-exports.js - Register Global Handlers
 * Centralized registration of window.* handlers for legacy HTML bindings
 */

// Import StorageService compatibility layer
import { StorageService } from './data/compat-storage-service.js';

// Register StorageService globally for backward compatibility
if (typeof window !== 'undefined') {
    window.StorageService = StorageService;
}

import { createNewProject } from './features/project/project-create.js';
import { initializeProject } from './features/project/project-list.js';
import { loadProjectDataToForm, updateProjectName, updateProjectRevision } from './features/project/project-load.js';

import { setupAutoSave, updateProjectFromForm, saveCurrentProject } from './features/support/auto-save.js';
import { exportProject, exportTranslationCSV } from './features/support/export.js';
import { importProject, importTranslationCSV } from './features/support/import.js';
import { printRiskAssessment, exportToPDF, generateSummaryReport, generateRiskMatrix } from './features/support/print.js';

import { initializeTab2, loadTab2Data } from './features/tab2/index.js';
import { initializeTab3, loadTab3Data } from './features/tab3/index.js';
import { initializeTab4 as initializeControlReport, loadTab4Data } from './features/tab4/index.js';
import { initializeTab5, loadTab5Data } from './features/tab5/index.js';
import { initializeTab6, loadTab6Data } from './features/tab6/index.js';
import { initializeTab7, loadTab7Data, importModule } from './features/tab7/index.js';

import { openPurchasedMachineModal, closePurchasedMachineModal, savePurchasedMachine, editPurchasedMachine, removePurchasedMachine, renderObjectsList } from './features/tab7/purchased-machines.js';

// Export module handlers
import { generateDoC, previewDoC, loadDoCData, renderDoCDirectives, renderDoCStandards } from './features/export/doc.js';
import { setExportSortOrder, exportRiskAssessment } from './features/export/risk-assessment.js';
import { exportControlReport } from './features/export/control-report.js';
import { renderTCFChecklist, generateTCFChecklist } from './features/export/tcf.js';

// Layout handlers
import { uploadLayoutImage, renderLayoutImages, openImageViewer, closeImageViewer, toggleFullscreen, zoomIn, zoomOut, resetZoom, deleteLayoutImage } from './features/layout/layout.js';

// Modal handlers
import { openRiskMatrixModal, closeRiskMatrixModal } from './ui/modals.js';

// i18n - Language switching
import { setLanguage } from './i18n/index.js';

/**
 * Modules export globally via individual window assignments
 * This file serves as a central import point for all modules
 * Each module handles its own window.* registrations to avoid conflicts
 */
