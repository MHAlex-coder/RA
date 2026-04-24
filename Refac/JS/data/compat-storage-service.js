/**
 * StorageService Compatibility Layer
 * 
 * Denna fil gör att old code som använder StorageService.saveProject() etc
 * automatiskt använder den nya data layer under huven.
 * 
 * Detta tillåter oss att migrera gradvis utan att bryta existerande kod.
 */

import { getProjectRepository } from './index.js';

/**
 * Legacy StorageService kompatibilitet
 * Delegerar till ProjectRepository
 */
export const StorageService = {
    dbName: 'HETZA_RA_DB',
    version: 1,
    db: null,
    
    /**
     * Initialisera (redan gjort i data layer)
     */
    async init() {
        console.log('⚠️  StorageService.init() called - already initialized in data layer');
        return;
    },
    
    /**
     * Spara projekt
     * @param {object} project
     * @returns {Promise<object>}
     */
    async saveProject(project) {
        try {
            const repo = getProjectRepository();
            const saved = await repo.saveProject(project);
            console.log('✅ StorageService.saveProject() delegated to ProjectRepository');
            return saved;
        } catch (error) {
            console.error('❌ StorageService.saveProject() failed:', error);
            throw error;
        }
    },
    
    /**
     * Ladda projekt
     * @param {number} projectId
     * @returns {Promise<object|null>}
     */
    async loadProject(projectId) {
        try {
            const repo = getProjectRepository();
            const project = await repo.loadProject(projectId);
            console.log('✅ StorageService.loadProject() delegated to ProjectRepository');
            return project;
        } catch (error) {
            console.error('❌ StorageService.loadProject() failed:', error);
            throw error;
        }
    },
    
    /**
     * Lista alla projekt
     * @returns {Promise<Array>}
     */
    async listProjects() {
        try {
            const repo = getProjectRepository();
            const projects = await repo.listProjects();
            console.log('✅ StorageService.listProjects() delegated to ProjectRepository');
            return projects;
        } catch (error) {
            console.error('❌ StorageService.listProjects() failed:', error);
            throw error;
        }
    },
    
    /**
     * Ta bort projekt
     * @param {number} projectId
     * @returns {Promise<void>}
     */
    async deleteProject(projectId) {
        try {
            const repo = getProjectRepository();
            await repo.deleteProject(projectId);
            console.log('✅ StorageService.deleteProject() delegated to ProjectRepository');
        } catch (error) {
            console.error('❌ StorageService.deleteProject() failed:', error);
            throw error;
        }
    }
};

export default StorageService;
