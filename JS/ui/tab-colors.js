/**
 * Tab Color Management
 * Updates tab button colors based on completion status
 */

import { getCurrentProject } from '../state.js';

/**
 * Update Risk Assessment Tab color based on risk status
 * - Red if unverified risks exist
 * - Green if all risks are verified
 */
export function updateRiskAssessmentTabColor() {
    const project = getCurrentProject();
    const tabBtn = document.querySelector('.tab-btn[data-tab="tab2"]');
    
    if (!tabBtn || !project) return;
    
    const risks = project.risks || [];
    
    if (risks.length === 0) {
        // No risks - neutral state
        tabBtn.classList.remove('complete');
        tabBtn.style.removeProperty('color');
        return;
    }
    
    // Check if all risks are verified
    const allVerified = risks.every(risk => {
        return risk.implemented === true && risk.verified === true;
    });
    
    if (allVerified) {
        // All risks verified - green
        tabBtn.classList.add('complete');
        tabBtn.style.color = '#10b981'; // Green color
    } else {
        // Unverified risks exist - red
        tabBtn.classList.remove('complete');
        tabBtn.style.color = '#dc2626'; // Red color
    }
}

/**
 * Update Interface Risks Tab color based on interface risk status
 * - Red if unverified interface risks exist
 * - Green if all interface risks are verified
 */
export function updateInterfaceRisksTabColor() {
    const project = getCurrentProject();
    const tabBtn = document.querySelector('.tab-btn[data-tab="tab3"]');
    
    if (!tabBtn || !project) return;
    
    const interfaceRisks = project.interfaceRisks || [];
    
    if (interfaceRisks.length === 0) {
        // No interface risks - neutral state
        tabBtn.classList.remove('complete');
        tabBtn.style.removeProperty('color');
        return;
    }
    
    // Check if all interface risks are verified
    const allVerified = interfaceRisks.every(risk => {
        return risk.validationStatus && risk.validationStatus.verified === true;
    });
    
    if (allVerified) {
        // All interface risks verified - green
        tabBtn.classList.add('complete');
        tabBtn.style.color = '#10b981'; // Green color
    } else {
        // Unverified interface risks exist - red
        tabBtn.classList.remove('complete');
        tabBtn.style.color = '#dc2626'; // Red color
    }
}

/**
 * Update Control Report Tab color based on checkpoint completion
 * - Green if all checkpoints are answered with "ja" or "ejakt"
 * - Red if any checkpoint is "nej" or unanswered
 */
export function updateControlReportTabColor() {
    const project = getCurrentProject();
    const tabBtn = document.querySelector('.tab-btn[data-tab="tab4"]');
    
    if (!tabBtn || !project) return;
    
    // Get checkpoint statuses from project
    const checkpointStatus = project.controlReport?.checkpointStatus || {};
    const statusEntries = Object.entries(checkpointStatus);
    
    if (statusEntries.length === 0) {
        // No checkpoints - neutral state (or red since nothing is filled)
        tabBtn.classList.remove('complete');
        tabBtn.style.color = '#dc2626'; // Red color
        return;
    }
    
    // Check if all checkpoints are "ja" or "ejakt"
    const allValidCheckpoints = statusEntries.every(([key, value]) => {
        return value === 'ja' || value === 'ejakt';
    });
    
    if (allValidCheckpoints) {
        // All checkpoints are "ja" or "ejakt" - green
        tabBtn.classList.add('complete');
        tabBtn.style.color = '#10b981'; // Green color
    } else {
        // Some checkpoints are "nej" or unanswered - red
        tabBtn.classList.remove('complete');
        tabBtn.style.color = '#dc2626'; // Red color
    }
}

/**
 * Update all tab colors
 */
export function updateAllTabColors() {
    updateRiskAssessmentTabColor();
    updateInterfaceRisksTabColor();
    updateControlReportTabColor();
}

// Export to window for backward compatibility
if (typeof window !== 'undefined') {
    window.updateRiskAssessmentTabColor = updateRiskAssessmentTabColor;
    window.updateInterfaceRisksTabColor = updateInterfaceRisksTabColor;
    window.updateControlReportTabColor = updateControlReportTabColor;
    window.updateAllTabColors = updateAllTabColors;
}
