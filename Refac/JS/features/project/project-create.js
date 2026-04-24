/**
 * Project Creation
 * Handles creating new projects and initializing UI
 */

import { getCurrentProject, setCurrentProject } from '../../state.js';
import { getProjectRepository } from '../../data/index.js';
import { controlQuestions } from '../../config/control-questions.js';
import { updateProjectName, updateProjectRevision, loadProjectDataToForm } from './project-load.js';

/**
 * Create a new project
 */
export async function createNewProject() {
    const currentProject = getCurrentProject();
    if (currentProject && currentProject.id) {
        const confirmed = confirm('Vill du skapa ett nytt projekt? Osparade ändringar i nuvarande projekt kan gå förlorade om det inte är sparat.');
        if (!confirmed) return;
    }
    
    const newProject = getEmptyProject();
    newProject.customControlQuestions = JSON.parse(JSON.stringify(controlQuestions));
    
    newProject.meta.lastModified = new Date().toISOString();
    
    // Migrate to new data layer - save first to get ID
    const repo = getProjectRepository();
    const savedProject = await repo.saveProject(newProject);
    
    // Update state with saved project (now has ID)
    setCurrentProject(savedProject);
    
    updateProjectName(savedProject.meta.projectName || 'Namnlöst projekt');
    updateProjectRevision(savedProject.meta.revision);
    
    loadProjectDataToForm();
    
    if (typeof window.renderStandardsList === 'function') {
        window.renderStandardsList();
    }
    if (typeof window.renderDirectivesList === 'function') {
        window.renderDirectivesList();
    }
    if (typeof window.renderRiskCards === 'function') {
        window.renderRiskCards();
    }
    if (typeof window.renderInterfaceRisks === 'function') {
        window.renderInterfaceRisks();
    }
    if (typeof window.renderObjectsList === 'function') {
        window.renderObjectsList();
    }
    if (typeof window.initializeControlReport === 'function') {
        window.initializeControlReport();
    }
    
    if (typeof window.updateRiskAssessmentTabColor === 'function') {
        window.updateRiskAssessmentTabColor();
    }
    if (typeof window.updateControlReportTabColor === 'function') {
        window.updateControlReportTabColor();
    }
    
    if (typeof window.switchTab === 'function') {
        window.switchTab('tab1');
    }
    
    const settingsMenu = document.getElementById('settings-menu');
    if (settingsMenu) {
        settingsMenu.classList.add('hidden');
    }
    
    console.log('Nytt projekt skapat');
}

function getEmptyProject() {
    if (typeof window.createEmptyProject === 'function') {
        return window.createEmptyProject();
    }
    throw new Error('createEmptyProject is not available');
}

// Expose globally
if (typeof window !== 'undefined') {
    window.createNewProject = createNewProject;
}
