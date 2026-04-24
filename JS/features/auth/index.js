/**
 * Auth Module - Main Entry Point
 * 
 * Exporterar alla autentiserings-relaterade funktioner
 */

// Auth Service
export {
    initializeAuth,
    login,
    logout,
    getCurrentUser,
    getCurrentSession,
    isAuthenticated,
    isAuthInitialized,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    registerUser,
    changePassword,
    hasUsers,
    createInitialAdmin,
    validateCurrentSession,
    onAuthEvent,
    offAuthEvent
} from './auth-service.js';

// Auth Guards
export {
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
} from './auth-guard.js';

// Password Utilities
export {
    hashPassword,
    verifyPassword,
    checkPasswordStrength,
    generateRandomPassword,
    generateSalt,
    isValidEmail,
    validateUsername
} from './password-utils.js';

// First Run Setup
export {
    needsFirstRunSetup,
    showFirstRunSetup
} from './first-run-setup.js';

// Re-export ROLES from data layer
export { ROLES } from '../../data/index.js';

/**
 * Convenience default export
 */
import authService from './auth-service.js';
import authGuard from './auth-guard.js';
import passwordUtils from './password-utils.js';
import firstRunSetup from './first-run-setup.js';

export default {
    ...authService,
    ...authGuard,
    ...passwordUtils,
    ...firstRunSetup
};
