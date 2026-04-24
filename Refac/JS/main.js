/**
 * main.js - Application entry point (Parcel)
 * Loads window exports for legacy HTML bindings
 */

import './window-exports.js';
import { initializeTabs, switchTab } from './ui/tabs.js';
import { t as translate } from './i18n/index.js';
import { initializeSettings } from './ui/settings.js';
import { initializeModalHandlers } from './ui/modals.js';
import './ui/tab-colors.js'; // Load tab color management functions
import { setupAutoSave, saveCurrentProject } from './features/support/auto-save.js';
import { initializeProject } from './features/project/project-list.js';
import { initializeDataLayer, getProjectRepository } from './data/index.js';
import { createEmptyProject } from './data/repositories/project-repository.js';
import { riskGroupsData, riskListLabels } from './config/risk-data.js';
import { initializeTab2 } from './features/tab2/index.js';
import { initializeTab3 } from './features/tab3/index.js';
import { initializeTab4, renderControlChecklist } from './features/tab4/index.js';
import { initializeTab5 } from './features/tab5/index.js';
import { initializeTab6 } from './features/tab6/index.js';
import { initializeTab7, importModule, toggleModuleView, removeModule, closeModuleDataView, displayModuleData } from './features/tab7/index.js';
import { openPurchasedMachineModal } from './features/tab7/purchased-machines.js';
import { openEditListsModal, openProjectSettings } from './features/lists/list-editor.js';
import './features/lists/list-editor.js';
import { createNewRevision } from './features/project/revision.js';
import { initializeTab1 } from './features/tab1/index.js';
import { createNewProject } from './features/project/project-create.js';
import { exportProject, exportTranslationCSV } from './features/support/export.js';
import { importProject, importTranslationCSV } from './features/support/import.js';
import { setLanguage } from './i18n/index.js';
import { initializeAuth } from './features/auth/index.js';
import { showFirstRunSetup } from './features/auth/index.js';
import { initializeLoginModal } from './ui/login-modal.js';
import { initializeUserMenu } from './ui/user-menu.js';
import { initializeUserManagement } from './features/admin/user-management.js';
import { initializeAuditViewer } from './features/audit/audit-viewer.js';

document.addEventListener('DOMContentLoaded', async () => {
	try {
		// Initiera data layer först (KRITISK)
		console.log('🚀 Starting application initialization...');
		await initializeDataLayer();
		
		// Initiera autentiseringssystem
		console.log('🔐 Initializing authentication system...');
		await initializeAuth();
		
		console.log('🎨 Initializing UI components...');
		try {
			await initializeLoginModal();
		} catch (err) {
			console.error('Error in initializeLoginModal:', err);
			throw err;
		}
		
		try {
			initializeUserMenu();
		} catch (err) {
			console.error('Error in initializeUserMenu:', err);
			throw err;
		}
		
		try {
			initializeUserManagement();
		} catch (err) {
			console.error('Error in initializeUserManagement:', err);
			throw err;
		}
		
		try {
			initializeAuditViewer();
			// Exponera globalt för settings menu
			if (typeof window !== 'undefined') {
				const { showRecentAuditLog, exportAuditLogs } = await import('./features/audit/audit-viewer.js');
				window.auditViewer = {
					showRecentAuditLog,
					exportAuditLogs
				};
			}
		} catch (err) {
			console.error('Error in initializeAuditViewer:', err);
			throw err;
		}
		
		// Exponera repositories globalt för backward compatibility under migrering
		if (typeof window !== 'undefined') {
			window.projectRepository = getProjectRepository();
			window.createEmptyProject = createEmptyProject;
		}
		
		if (typeof window !== 'undefined' && typeof window.t !== 'function') {
			window.t = translate;
		}
		// Provide legacy globals expected by modules
		if (typeof window !== 'undefined') {
			window.riskGroupsData = riskGroupsData;
			window.riskListLabels = riskListLabels;
		}

		initializeTabs();
		initializeSettings();
		initializeModalHandlers();

		await initializeProject();
		setupAutoSave();

	initializeTab1();
	initializeTab2();
	initializeTab3();
	initializeTab4();
	initializeTab5();
	initializeTab6();
	initializeTab7();

		const saveBtn = document.getElementById('saveProjectBtn');
		if (saveBtn) {
			saveBtn.addEventListener('click', () => saveCurrentProject());
		}

		const addPurchasedBtn = document.getElementById('add-purchased-machine-btn');
		if (addPurchasedBtn) {
			addPurchasedBtn.addEventListener('click', () => openPurchasedMachineModal());
		}

		const addObjectBtn = document.getElementById('add-object-btn');
		if (addObjectBtn) {
			addObjectBtn.addEventListener('click', () => importModule());
		}

		if (typeof window !== 'undefined') {
			window.createNewRevision = createNewRevision;
			window.renderControlChecklist = renderControlChecklist;
			window.toggleModuleView = toggleModuleView;
			window.removeModule = removeModule;
			window.closeModuleDataView = closeModuleDataView;
			window.displayModuleData = displayModuleData;
			window.switchTab = switchTab;
			// Settings functions
			window.createNewProject = createNewProject;
			window.createEmptyProject = createEmptyProject;
			window.openEditListsModal = openEditListsModal;
			window.openProjectSettings = openProjectSettings;
			window.exportProject = exportProject;
			window.exportTranslationCSV = exportTranslationCSV;
			window.importProject = importProject;
			window.importTranslationCSV = importTranslationCSV;
			// Language switching
			window.setLanguage = setLanguage;
		}
		
		console.log('✅ Application initialized successfully');
	} catch (error) {
		console.error('❌ Application initialization failed:', error);
		console.error('Error stack:', error.stack);
		alert('Applikationen kunde inte initialiseras. Se konsolen för detaljer.');
	}
});
