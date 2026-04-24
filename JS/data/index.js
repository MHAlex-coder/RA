/**
 * Data Layer - Main Entry Point
 * 
 * Exporterar adapter och repositories för användning i applikationen
 */

import IndexedDBAdapter from './adapters/indexeddb-adapter.js';
import createProjectRepository from './repositories/project-repository.js';
import createUserRepository, { ROLES } from './repositories/user-repository.js';
import createSessionRepository from './repositories/session-repository.js';
import createAuditRepository, { AUDIT_ACTIONS, AUDIT_CATEGORIES } from './repositories/audit-repository.js';
import { createAuditedProjectRepository } from '../features/audit/audit-interceptor.js';

let projectRepository = null;
let userRepository = null;
let sessionRepository = null;
let auditRepository = null;

/**
 * Initialisera data layer
 * @async
 * @returns {Promise<void>}
 */
export async function initializeDataLayer() {
    console.log('🔄 Initializing data layer...');
    
    try {
        // Initialisera adapter
        await IndexedDBAdapter.init();
        
        // Skapa repositories
        const baseProjectRepo = createProjectRepository(IndexedDBAdapter);
        userRepository = createUserRepository(IndexedDBAdapter);
        sessionRepository = createSessionRepository(IndexedDBAdapter);
        auditRepository = createAuditRepository(IndexedDBAdapter);
        
        // Wrappa ProjectRepository med audit logging
        projectRepository = createAuditedProjectRepository(baseProjectRepo);
        
        // Rensa utgångna sessioner vid start
        await sessionRepository.cleanupExpiredSessions();
        
        console.log('✅ Data layer initialized successfully');
        console.log('✅ Audit interceptor activated for project changes');
    } catch (error) {
        console.error('❌ Failed to initialize data layer:', error);
        throw error;
    }
}

/**
 * Hämta ProjectRepository
 * @returns {object} ProjectRepository instans
 */
export function getProjectRepository() {
    if (!projectRepository) {
        throw new Error('Data layer not initialized. Call initializeDataLayer() first.');
    }
    console.log('📦 getProjectRepository called, returning:', projectRepository.saveProject.name || 'wrapped');
    return projectRepository;
}

/**
 * Hämta UserRepository
 * @returns {object} UserRepository instans
 */
export function getUserRepository() {
    if (!userRepository) {
        throw new Error('Data layer not initialized. Call initializeDataLayer() first.');
    }
    return userRepository;
}

/**
 * Hämta SessionRepository
 * @returns {object} SessionRepository instans
 */
export function getSessionRepository() {
    if (!sessionRepository) {
        throw new Error('Data layer not initialized. Call initializeDataLayer() first.');
    }
    return sessionRepository;
}

/**
 * Hämta AuditRepository
 * @returns {object} AuditRepository instans
 */
export function getAuditRepository() {
    if (!auditRepository) {
        throw new Error('Data layer not initialized. Call initializeDataLayer() first.');
    }
    return auditRepository;
}

/**
 * Exportera alla repositories
 */
export const repositories = {
    get projects() {
        return getProjectRepository();
    },
    get users() {
        return getUserRepository();
    },
    get sessions() {
        return getSessionRepository();
    },
    get audit() {
        return getAuditRepository();
    }
};

/**
 * Exportera adapters (för framtida användning)
 */
export { IndexedDBAdapter };

/**
 * Exportera konstanter
 */
export { ROLES, AUDIT_ACTIONS, AUDIT_CATEGORIES };

export default {
    initializeDataLayer,
    getProjectRepository,
    getUserRepository,
    getSessionRepository,
    getAuditRepository,
    repositories,
    ROLES,
    AUDIT_ACTIONS,
    AUDIT_CATEGORIES
};
