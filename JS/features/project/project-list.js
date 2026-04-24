/**
 * Project Listing and Initialization
 * Handles loading latest project and listing projects
 */

import { getCurrentProject, setCurrentProject } from '../../state.js';
import { getProjectRepository } from '../../data/index.js';
import { controlQuestions } from '../../config/control-questions.js';
import { updateProjectName, updateProjectRevision, loadProjectDataToForm } from './project-load.js';

/**
 * Initialize project state from storage
 */
export async function initializeProject() {
    try {
        const repo = getProjectRepository();
        const projects = await repo.listProjects();
        
        if (projects && projects.length > 0) {
            projects.sort((a, b) => {
                const dateA = new Date(a.meta.lastModified);
                const dateB = new Date(b.meta.lastModified);
                return dateB - dateA;
            });
            
            const latestProject = projects[0];
            setCurrentProject(latestProject);
            
            if (!latestProject.customControlQuestions) {
                latestProject.customControlQuestions = JSON.parse(JSON.stringify(controlQuestions));
            }
            
            console.log('✓ Senaste projekt laddat:', latestProject.productData.productName || 'Namnlöst');
            updateProjectName(latestProject.productData.projectNumber || latestProject.productData.projectName || 'Namnlöst projekt');
            updateProjectRevision(latestProject.meta?.revision || '1.0');
            
            loadProjectDataToForm();
        } else {
            console.log('Inga sparade projekt - skapar nytt');
            const empty = getEmptyProject();
            empty.customControlQuestions = JSON.parse(JSON.stringify(controlQuestions));
            setCurrentProject(empty);
            updateProjectName('Nytt projekt');
            updateProjectRevision('1.0');
        }
    } catch (error) {
        console.error('Fel vid laddning av projekt:', error);
        const empty = getEmptyProject();
        empty.customControlQuestions = JSON.parse(JSON.stringify(controlQuestions));
        setCurrentProject(empty);
        updateProjectName('Nytt projekt');
        updateProjectRevision('1.0');
    }
}

/**
 * List all projects from storage
 * @returns {Promise<Array>} Projects list
 */
export async function listProjects() {
    const repo = getProjectRepository();
    return repo.listProjects();
}

function getEmptyProject() {
    if (typeof window.createEmptyProject === 'function') {
        return window.createEmptyProject();
    }
    throw new Error('createEmptyProject is not available');
}

// Expose globally
if (typeof window !== 'undefined') {
    window.initializeProject = initializeProject;
}
