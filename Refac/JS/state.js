/**
 * state.js - Centralized State Management
 * Single source of truth for application state (AppState)
 * 
 * All state mutations should go through this module to ensure consistency
 * and enable future debugging/logging capabilities
 */

// Private state - only accessible through getter functions
let _appState = {
    currentProject: null,
    currentTab: 'tab1',
    currentObject: null,
    selectedRiskId: null,
    riskSortOrder: 'index',
    exportSortOrder: 'level',
    moduleDataLoaded: null
};

// Subscription system for reactive state changes
const subscribers = new Map();

/**
 * Get the entire application state (read-only)
 * @returns {object} The current AppState
 */
export function getState() {
    return _appState;
}

/**
 * Get current project
 * @returns {object|null} The currently loaded project
 */
export function getCurrentProject() {
    return _appState.currentProject;
}

/**
 * Set current project
 * @param {object} project - The project object to set
 */
export function setCurrentProject(project) {
    _appState.currentProject = project;
    notifySubscribers('projectChanged', project);
}

/**
 * Get currently selected risk ID
 * @returns {string|null} The selected risk ID
 */
export function getSelectedRiskId() {
    return _appState.selectedRiskId;
}

/**
 * Set selected risk ID
 * @param {string} riskId - The risk ID to select
 */
export function setSelectedRiskId(riskId) {
    _appState.selectedRiskId = riskId;
    notifySubscribers('riskSelected', riskId);
}

/**
 * Get currently active tab
 * @returns {string} The tab ID (e.g., 'tab1', 'tab2')
 */
export function getCurrentTab() {
    return _appState.currentTab;
}

/**
 * Set currently active tab
 * @param {string} tabId - The tab ID to activate
 */
export function setCurrentTab(tabId) {
    _appState.currentTab = tabId;
    notifySubscribers('tabChanged', tabId);
}

/**
 * Get current object (e.g., selected module)
 * @returns {string|null} The object identifier
 */
export function getCurrentObject() {
    return _appState.currentObject;
}

/**
 * Set current object
 * @param {string|null} objectId - The object identifier
 */
export function setCurrentObject(objectId) {
    _appState.currentObject = objectId;
    notifySubscribers('objectChanged', objectId);
}

/**
 * Get risk sort order
 * @returns {string} The sort order ('index', 'level', etc.)
 */
export function getRiskSortOrder() {
    return _appState.riskSortOrder;
}

/**
 * Set risk sort order
 * @param {string} order - The sort order
 */
export function setRiskSortOrder(order) {
    _appState.riskSortOrder = order;
    notifySubscribers('sortOrderChanged', order);
}

/**
 * Get export sort order
 * @returns {string} The export sort order
 */
export function getExportSortOrder() {
    return _appState.exportSortOrder;
}

/**
 * Set export sort order
 * @param {string} order - The sort order
 */
export function setExportSortOrder(order) {
    _appState.exportSortOrder = order;
    notifySubscribers('exportSortChanged', order);
}

/**
 * Get module data loaded
 * @returns {object|null} Module data or null if none loaded
 */
export function getModuleDataLoaded() {
    return _appState.moduleDataLoaded;
}

/**
 * Set module data loaded
 * @param {object|null} data - Module data or null to clear
 */
export function setModuleDataLoaded(data) {
    _appState.moduleDataLoaded = data;
    notifySubscribers('moduleDataChanged', data);
}

/**
 * Clear module data
 */
export function clearModuleData() {
    _appState.moduleDataLoaded = null;
    notifySubscribers('moduleDataCleared', null);
}

/**
 * Subscribe to state changes
 * @param {string} event - Event name (e.g., 'projectChanged', 'riskSelected')
 * @param {function} callback - Function to call when event occurs
 * @returns {function} Unsubscribe function
 */
export function subscribe(event, callback) {
    if (!subscribers.has(event)) {
        subscribers.set(event, []);
    }
    subscribers.get(event).push(callback);
    
    // Return unsubscribe function
    return () => {
        const callbacks = subscribers.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    };
}

/**
 * Notify all subscribers of a state change
 * @param {string} event - Event name
 * @param {*} data - Data to pass to subscribers
 * @private
 */
function notifySubscribers(event, data) {
    const callbacks = subscribers.get(event) || [];
    callbacks.forEach(cb => {
        try {
            cb(data);
        } catch (error) {
            console.error(`Error in subscriber for event "${event}":`, error);
        }
    });
}

/**
 * Reset state to initial values (use with caution!)
 * Only used for testing or hard resets
 */
export function resetState() {
    _appState = {
        currentProject: null,
        currentTab: 'tab1',
        currentObject: null,
        selectedRiskId: null,
        riskSortOrder: 'index',
        exportSortOrder: 'level',
        moduleDataLoaded: null
    };
    notifySubscribers('stateReset', null);
}
