/**
 * ui/tabs.js - Tab Switching Logic
 * Manages tab navigation and switching between different sections of the application
 */

import { setCurrentTab, getCurrentTab } from '../state.js';
import { t } from '../i18n/index.js';

/**
 * Initialize tab system
 */
export function initializeTabs() {
    const tabButtons = document.querySelectorAll('[data-tab]');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const tabId = button.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    console.log('Tabs initialized');
}

/**
 * Switch to a specific tab
 * @param {string} tabId - The ID of the tab to switch to
 */
export function switchTab(tabId) {
    const oldTab = getCurrentTab();
    const resolvedTabId = document.getElementById(tabId) ? tabId : (tabId === 'tab1' ? 'tab1a' : tabId);
    
    // Update state
    setCurrentTab(resolvedTabId);
    
    // Update DOM
    document.querySelectorAll('.tab-content').forEach(pane => {
        pane.style.display = 'none';
        pane.classList.remove('active');
    });
    
    const newPane = document.getElementById(resolvedTabId);
    if (newPane) {
        newPane.style.display = 'block';
        newPane.classList.add('active');
    }
    
    // Update button states
    document.querySelectorAll('[data-tab]').forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('data-tab') === resolvedTabId) {
            button.classList.add('active');
        }
    });
    
    console.log(`Switched from tab ${oldTab} to ${resolvedTabId}`);
    
    // Trigger tab-specific initialization if needed
    triggerTabInit(resolvedTabId);
}

/**
 * Trigger initialization for a specific tab
 * @param {string} tabId - The tab ID
 * @private
 */
function triggerTabInit(tabId) {
    // This will be called after switching to a tab
    // Tab-specific modules can subscribe to tab change events
    switch (tabId) {
        case 'tab1':
            if (typeof initializeTab1Forms === 'function') {
                initializeTab1Forms();
            }
            break;
        case 'tab2':
            if (typeof initializeTab2Forms === 'function') {
                initializeTab2Forms();
            }
            break;
        case 'tab3':
            if (typeof initializeTab3Forms === 'function') {
                initializeTab3Forms();
            }
            break;
        case 'tab4':
            if (typeof initializeTab4Forms === 'function') {
                initializeTab4Forms();
            }
            break;
        // Add more cases as needed
    }
}

/**
 * Get current tab
 * @returns {string} Current tab ID
 */
export function getCurrentTabId() {
    return getCurrentTab();
}
