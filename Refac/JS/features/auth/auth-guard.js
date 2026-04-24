/**
 * Auth Guard
 * Skyddar funktioner och features med autentisering och behörighetskontroll
 * 
 * Dessa guards kan användas för att wrappa funktioner eller
 * kontrollera åtkomst i event handlers.
 */

import { isAuthenticated, hasPermission, hasAnyPermission, hasAllPermissions, getCurrentUser } from './auth-service.js';

/**
 * Visa login modal (importeras dynamiskt för att undvika circular dependency)
 */
let showLoginModalFn = null;
let showAccessDeniedFn = null;

/**
 * Registrera UI-funktioner för auth guard
 * @param {Object} handlers - UI handlers
 */
export function registerAuthUI(handlers) {
    if (handlers.showLoginModal) {
        showLoginModalFn = handlers.showLoginModal;
    }
    if (handlers.showAccessDenied) {
        showAccessDeniedFn = handlers.showAccessDenied;
    }
}

/**
 * Visa login modal (fallback om inte registrerad)
 */
function showLoginModal() {
    if (showLoginModalFn) {
        showLoginModalFn();
    } else {
        console.warn('Login modal not registered. Please log in.');
        alert('Du måste logga in för att fortsätta.');
    }
}

/**
 * Visa åtkomst nekad meddelande
 * @param {string} message - Meddelande
 */
function showAccessDenied(message = 'Du har inte behörighet att utföra denna åtgärd.') {
    if (showAccessDeniedFn) {
        showAccessDeniedFn(message);
    } else {
        console.warn('Access denied:', message);
        alert(message);
    }
}

/**
 * Kräv autentisering för en funktion
 * Returnerar en wrapper som kontrollerar auth innan körning
 * 
 * @example
 * const protectedSave = requireAuth(saveProject);
 * protectedSave(project); // Visar login om ej inloggad
 * 
 * @param {Function} callback - Funktion att skydda
 * @param {Object} options - Alternativ
 * @returns {Function} Skyddad funktion
 */
export function requireAuth(callback, options = {}) {
    const { silent = false, returnValue = undefined } = options;
    
    return async function(...args) {
        if (!isAuthenticated()) {
            if (!silent) {
                showLoginModal();
            }
            return returnValue;
        }
        
        return callback.apply(this, args);
    };
}

/**
 * Kräv specifik behörighet för en funktion
 * 
 * @example
 * const adminOnlyDelete = requirePermission('user.delete', deleteUser);
 * adminOnlyDelete(userId); // Visar fel om ej behörig
 * 
 * @param {string} permission - Behörighet som krävs
 * @param {Function} callback - Funktion att skydda
 * @param {Object} options - Alternativ
 * @returns {Function} Skyddad funktion
 */
export function requirePermission(permission, callback, options = {}) {
    const { silent = false, returnValue = undefined, message } = options;
    
    return async function(...args) {
        if (!isAuthenticated()) {
            if (!silent) {
                showLoginModal();
            }
            return returnValue;
        }
        
        if (!hasPermission(permission)) {
            if (!silent) {
                showAccessDenied(message || `Du har inte behörighet: ${permission}`);
            }
            return returnValue;
        }
        
        return callback.apply(this, args);
    };
}

/**
 * Kräv en av flera behörigheter
 * 
 * @param {string[]} permissions - Behörigheter (minst en krävs)
 * @param {Function} callback - Funktion att skydda
 * @param {Object} options - Alternativ
 * @returns {Function} Skyddad funktion
 */
export function requireAnyPermission(permissions, callback, options = {}) {
    const { silent = false, returnValue = undefined, message } = options;
    
    return async function(...args) {
        if (!isAuthenticated()) {
            if (!silent) {
                showLoginModal();
            }
            return returnValue;
        }
        
        if (!hasAnyPermission(permissions)) {
            if (!silent) {
                showAccessDenied(message || `Du har inte någon av behörigheterna: ${permissions.join(', ')}`);
            }
            return returnValue;
        }
        
        return callback.apply(this, args);
    };
}

/**
 * Kräv alla behörigheter
 * 
 * @param {string[]} permissions - Alla behörigheter som krävs
 * @param {Function} callback - Funktion att skydda
 * @param {Object} options - Alternativ
 * @returns {Function} Skyddad funktion
 */
export function requireAllPermissions(permissions, callback, options = {}) {
    const { silent = false, returnValue = undefined, message } = options;
    
    return async function(...args) {
        if (!isAuthenticated()) {
            if (!silent) {
                showLoginModal();
            }
            return returnValue;
        }
        
        if (!hasAllPermissions(permissions)) {
            if (!silent) {
                showAccessDenied(message || `Du saknar behörigheter: ${permissions.join(', ')}`);
            }
            return returnValue;
        }
        
        return callback.apply(this, args);
    };
}

/**
 * Kräv admin-roll
 * 
 * @param {Function} callback - Funktion att skydda
 * @param {Object} options - Alternativ
 * @returns {Function} Skyddad funktion
 */
export function requireAdmin(callback, options = {}) {
    const { silent = false, returnValue = undefined } = options;
    
    return async function(...args) {
        if (!isAuthenticated()) {
            if (!silent) {
                showLoginModal();
            }
            return returnValue;
        }
        
        const user = getCurrentUser();
        if (user?.role !== 'admin') {
            if (!silent) {
                showAccessDenied('Denna åtgärd kräver administratörsbehörighet.');
            }
            return returnValue;
        }
        
        return callback.apply(this, args);
    };
}

/**
 * Kontrollera auth och returnera boolean (för UI)
 * 
 * @example
 * if (checkAuth()) {
 *   // Användaren är inloggad
 * }
 * 
 * @param {boolean} showModal - Visa login modal om ej inloggad
 * @returns {boolean}
 */
export function checkAuth(showModal = true) {
    if (!isAuthenticated()) {
        if (showModal) {
            showLoginModal();
        }
        return false;
    }
    return true;
}

/**
 * Kontrollera behörighet och returnera boolean (för UI)
 * 
 * @example
 * if (checkPermission('user.delete')) {
 *   showDeleteButton();
 * }
 * 
 * @param {string} permission - Behörighet att kontrollera
 * @param {boolean} showError - Visa felmeddelande om ej behörig
 * @returns {boolean}
 */
export function checkPermission(permission, showError = false) {
    if (!isAuthenticated()) {
        if (showError) {
            showLoginModal();
        }
        return false;
    }
    
    if (!hasPermission(permission)) {
        if (showError) {
            showAccessDenied(`Du har inte behörighet: ${permission}`);
        }
        return false;
    }
    
    return true;
}

/**
 * Guard för att kontrollera om användaren äger en resurs
 * 
 * @param {Function} getOwnerId - Funktion som returnerar ägarens ID
 * @param {Function} callback - Funktion att skydda
 * @param {Object} options - Alternativ
 * @returns {Function} Skyddad funktion
 */
export function requireOwnerOrPermission(getOwnerId, permission, callback, options = {}) {
    const { silent = false, returnValue = undefined } = options;
    
    return async function(...args) {
        if (!isAuthenticated()) {
            if (!silent) {
                showLoginModal();
            }
            return returnValue;
        }
        
        const user = getCurrentUser();
        const ownerId = await getOwnerId(...args);
        
        // Ägare eller har behörighet
        if (user.id === ownerId || hasPermission(permission)) {
            return callback.apply(this, args);
        }
        
        if (!silent) {
            showAccessDenied('Du har inte behörighet att ändra denna resurs.');
        }
        return returnValue;
    };
}

/**
 * Decorator-liknande syntax för att skydda objekt-metoder
 * 
 * @example
 * const protectedService = guardMethods(myService, {
 *   save: 'project.update',
 *   delete: 'project.delete'
 * });
 * 
 * @param {Object} obj - Objekt med metoder
 * @param {Object} permissions - Map av metodnamn till behörigheter
 * @returns {Object} Skyddat objekt
 */
export function guardMethods(obj, permissions) {
    const guarded = { ...obj };
    
    for (const [method, permission] of Object.entries(permissions)) {
        if (typeof obj[method] === 'function') {
            guarded[method] = requirePermission(permission, obj[method].bind(obj));
        }
    }
    
    return guarded;
}

export default {
    registerAuthUI,
    requireAuth,
    requirePermission,
    requireAnyPermission,
    requireAllPermissions,
    requireAdmin,
    requireOwnerOrPermission,
    checkAuth,
    checkPermission,
    guardMethods
};
