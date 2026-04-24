/**
 * ui/settings.js - Settings Menu Management
 * Handles the settings dropdown menu and associated functionality
 */

import { t } from '../i18n/index.js';
import { importProject } from '../features/support/import.js';

/**
 * Initialize settings menu
 */
export function initializeSettings() {
    const settingsBtn = document.getElementById('settings-btn');
    const settingsMenu = document.getElementById('settings-menu');
    
    if (!settingsBtn || !settingsMenu) return;
    
    // Toggle settings menu on click
    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsMenu.classList.toggle('hidden');
    });
    
    // Close settings menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#settings-btn') && !e.target.closest('#settings-menu')) {
            settingsMenu.classList.add('hidden');
        }
    });
    
    // Handle settings menu items
    const menuItems = settingsMenu.querySelectorAll('[data-action], [data-settings-action]');
    menuItems.forEach(item => {
        // Remove any existing listener first to prevent duplicates
        item.removeEventListener('click', handleSettingsAction);
        item.addEventListener('click', handleSettingsAction);
    });
    
    console.log('Settings initialized');
}

/**
 * Handle settings menu action
 * @param {Event} event - Click event
 */
function handleSettingsAction(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const action = event.currentTarget.getAttribute('data-action') || event.currentTarget.getAttribute('data-settings-action');
    
    switch (action) {
        case 'newproject':
        case 'new-project':
            if (typeof createNewProject === 'function') {
                createNewProject();
            }
            break;
        case 'editlists':
        case 'edit-lists':
            if (typeof openEditListsModal === 'function') {
                openEditListsModal();
            }
            break;
        case 'projectsettings':
        case 'project-settings':
            if (typeof openProjectSettings === 'function') {
                openProjectSettings();
            }
            break;
        case 'user-management':
        case 'usermanagement':
            if (window.userManagement && typeof window.userManagement.show === 'function') {
                window.userManagement.show();
            } else {
                console.warn('User management module not loaded');
            }
            break;
        case 'audit-log':
        case 'auditlog':
            if (window.auditViewer && typeof window.auditViewer.showRecentAuditLog === 'function') {
                window.auditViewer.showRecentAuditLog(100);
            } else {
                console.warn('Audit viewer module not loaded');
            }
            break;
        case 'newrevision':
        case 'new-revision':
            if (typeof createNewRevision === 'function') {
                createNewRevision();
            }
            break;
        case 'importproject':
        case 'import-project':
            importProject();
            break;
        case 'exportproject':
        case 'export-project':
            if (typeof exportProject === 'function') {
                exportProject();
            }
            break;
        case 'export_aibridge':
        case 'export-aibridge':
            if (typeof exportTranslationCSV === 'function') {
                exportTranslationCSV();
            }
            break;
        case 'import_aibridge':
        case 'import-aibridge':
            if (typeof importTranslationCSV === 'function') {
                importTranslationCSV();
            }
            break;
    }
    
    // Close the menu after action
    const settingsMenu = document.getElementById('settings-menu');
    if (settingsMenu) {
        settingsMenu.classList.add('hidden');
    }
}

/**
 * Close settings menu programmatically
 */
export function closeSettingsMenu() {
    const settingsMenu = document.getElementById('settings-menu');
    if (settingsMenu) {
        settingsMenu.classList.add('hidden');
    }
}
