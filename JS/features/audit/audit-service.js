/**
 * Audit Service
 * Centraliserad loggning av ändringar i systemet
 * 
 * Denna service tillhandahåller convenience-metoder för att logga
 * olika typer av ändringar med standardiserat format.
 */

import { getAuditRepository, AUDIT_ACTIONS, AUDIT_CATEGORIES } from '../../data/index.js';
import { getCurrentUser } from '../auth/auth-service.js';

/**
 * Logga en generell handling
 * @async
 * @param {Object} options - Loggalternativ
 * @returns {Promise<Object>} Skapad loggpost
 */
export async function logAction(options) {
    const auditRepo = getAuditRepository();
    const user = getCurrentUser();
    
    const entry = {
        userId: user?.id,
        userName: user?.username || user?.fullName || 'Anonym',
        timestamp: new Date().toISOString(),
        ...options
    };
    
    return auditRepo.logAction(entry);
}

/**
 * Logga risk-skapande
 * @async
 * @param {Object} project - Projekt
 * @param {Object} risk - Risk
 * @returns {Promise<Object>}
 */
export async function logRiskCreated(project, risk) {
    return logAction({
        action: AUDIT_ACTIONS.CREATE,
        category: AUDIT_CATEGORIES.RISK,
        projectId: project?.id,
        projectName: project?.productData?.productName || '',
        entityId: risk?.id,
        entityName: risk?.description || 'Ny risk',
        newValue: risk,
        summary: `Skapade risk: ${risk?.description || 'Ny risk'}`
    });
}

/**
 * Logga risk-uppdatering
 * @async
 * @param {Object} project - Projekt
 * @param {Object} oldRisk - Gammal risk
 * @param {Object} newRisk - Ny risk
 * @returns {Promise<Object>}
 */
export async function logRiskUpdated(project, oldRisk, newRisk) {
    return logAction({
        action: AUDIT_ACTIONS.UPDATE,
        category: AUDIT_CATEGORIES.RISK,
        projectId: project?.id,
        projectName: project?.productData?.productName || '',
        entityId: newRisk?.id,
        entityName: newRisk?.description || 'Risk',
        previousValue: oldRisk,
        newValue: newRisk,
        summary: `Uppdaterade risk: ${newRisk?.description || 'Risk'}`
    });
}

/**
 * Logga risk-radering
 * @async
 * @param {Object} project - Projekt
 * @param {Object} risk - Risk
 * @returns {Promise<Object>}
 */
export async function logRiskDeleted(project, risk) {
    return logAction({
        action: AUDIT_ACTIONS.DELETE,
        category: AUDIT_CATEGORIES.RISK,
        projectId: project?.id,
        projectName: project?.productData?.productName || '',
        entityId: risk?.id,
        entityName: risk?.description || 'Risk',
        previousValue: risk,
        summary: `Raderade risk: ${risk?.description || 'Risk'}`
    });
}

/**
 * Logga åtgärd skapad
 * @async
 * @param {Object} project - Projekt
 * @param {Object} risk - Risk (som innehåller åtgärden)
 * @param {Object} measure - Åtgärd
 * @returns {Promise<Object>}
 */
export async function logMeasureAdded(project, risk, measure) {
    return logAction({
        action: AUDIT_ACTIONS.CREATE,
        category: AUDIT_CATEGORIES.MEASURE,
        projectId: project?.id,
        projectName: project?.productData?.productName || '',
        entityId: measure?.id,
        entityName: measure?.description || 'Ny åtgärd',
        newValue: measure,
        summary: `Lade till åtgärd: ${measure?.description || 'Ny åtgärd'} för risk: ${risk?.description || ''}`
    });
}

/**
 * Logga åtgärd uppdaterad
 * @async
 * @param {Object} project - Projekt
 * @param {Object} oldMeasure - Gammal åtgärd
 * @param {Object} newMeasure - Ny åtgärd
 * @returns {Promise<Object>}
 */
export async function logMeasureUpdated(project, oldMeasure, newMeasure) {
    return logAction({
        action: AUDIT_ACTIONS.UPDATE,
        category: AUDIT_CATEGORIES.MEASURE,
        projectId: project?.id,
        projectName: project?.productData?.productName || '',
        entityId: newMeasure?.id,
        entityName: newMeasure?.description || 'Åtgärd',
        previousValue: oldMeasure,
        newValue: newMeasure,
        summary: `Uppdaterade åtgärd: ${newMeasure?.description || 'Åtgärd'}`
    });
}

/**
 * Logga åtgärd raderad
 * @async
 * @param {Object} project - Projekt
 * @param {Object} measure - Åtgärd
 * @returns {Promise<Object>}
 */
export async function logMeasureDeleted(project, measure) {
    return logAction({
        action: AUDIT_ACTIONS.DELETE,
        category: AUDIT_CATEGORIES.MEASURE,
        projectId: project?.id,
        projectName: project?.productData?.productName || '',
        entityId: measure?.id,
        entityName: measure?.description || 'Åtgärd',
        previousValue: measure,
        summary: `Raderade åtgärd: ${measure?.description || 'Åtgärd'}`
    });
}

/**
 * Logga interface skapad
 * @async
 * @param {Object} project - Projekt
 * @param {Object} iface - Interface
 * @returns {Promise<Object>}
 */
export async function logInterfaceCreated(project, iface) {
    return logAction({
        action: AUDIT_ACTIONS.CREATE,
        category: AUDIT_CATEGORIES.INTERFACE,
        projectId: project?.id,
        projectName: project?.productData?.productName || '',
        entityId: iface?.id,
        entityName: iface?.name || 'Nytt interface',
        newValue: iface,
        summary: `Skapade interface: ${iface?.name || 'Nytt interface'}`
    });
}

/**
 * Logga interface uppdaterad
 * @async
 * @param {Object} project - Projekt
 * @param {Object} oldIface - Gammalt interface
 * @param {Object} newIface - Nytt interface
 * @returns {Promise<Object>}
 */
export async function logInterfaceUpdated(project, oldIface, newIface) {
    return logAction({
        action: AUDIT_ACTIONS.UPDATE,
        category: AUDIT_CATEGORIES.INTERFACE,
        projectId: project?.id,
        projectName: project?.productData?.productName || '',
        entityId: newIface?.id,
        entityName: newIface?.name || 'Interface',
        previousValue: oldIface,
        newValue: newIface,
        summary: `Uppdaterade interface: ${newIface?.name || 'Interface'}`
    });
}

/**
 * Logga interface raderad
 * @async
 * @param {Object} project - Projekt
 * @param {Object} iface - Interface
 * @returns {Promise<Object>}
 */
export async function logInterfaceDeleted(project, iface) {
    return logAction({
        action: AUDIT_ACTIONS.DELETE,
        category: AUDIT_CATEGORIES.INTERFACE,
        projectId: project?.id,
        projectName: project?.productData?.productName || '',
        entityId: iface?.id,
        entityName: iface?.name || 'Interface',
        previousValue: iface,
        summary: `Raderade interface: ${iface?.name || 'Interface'}`
    });
}

/**
 * Logga projekt-data uppdaterad
 * @async
 * @param {Object} project - Projekt
 * @param {string} fieldName - Fältnamn
 * @param {any} oldValue - Gammalt värde
 * @param {any} newValue - Nytt värde
 * @returns {Promise<Object>}
 */
export async function logProjectFieldUpdated(project, fieldName, oldValue, newValue) {
    // Konvertera värden till strängar om de är primitiva, annars begränsa storleken
    const formatValue = (val) => {
        if (val === null || val === undefined) return val;
        if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
            return val;
        }
        // För objekt/arrayer, begränsa till 200 tecken
        const str = JSON.stringify(val);
        return str.length > 200 ? str.substring(0, 200) + '...' : str;
    };
    
    return logAction({
        action: AUDIT_ACTIONS.UPDATE,
        category: AUDIT_CATEGORIES.PROJECT,
        projectId: project?.id,
        projectName: project?.productData?.productName || '',
        entityId: project?.id,
        entityName: fieldName,
        previousValue: formatValue(oldValue),
        newValue: formatValue(newValue),
        summary: `Uppdaterade ${fieldName}: "${formatValue(oldValue)}" → "${formatValue(newValue)}"`
    });
}

/**
 * Logga projekt-export
 * @async
 * @param {Object} project - Projekt
 * @returns {Promise<Object>}
 */
export async function logProjectExported(project) {
    return logAction({
        action: AUDIT_ACTIONS.EXPORT,
        category: AUDIT_CATEGORIES.PROJECT,
        projectId: project?.id,
        projectName: project?.productData?.productName || '',
        entityId: project?.id,
        entityName: project?.productData?.productName || '',
        summary: `Exporterade projekt: ${project?.productData?.productName || ''}`
    });
}

/**
 * Logga projekt-import
 * @async
 * @param {Object} project - Projekt
 * @returns {Promise<Object>}
 */
export async function logProjectImported(project) {
    return logAction({
        action: AUDIT_ACTIONS.IMPORT,
        category: AUDIT_CATEGORIES.PROJECT,
        projectId: project?.id,
        projectName: project?.productData?.productName || '',
        entityId: project?.id,
        entityName: project?.productData?.productName || '',
        newValue: project,
        summary: `Importerade projekt: ${project?.productData?.productName || ''}`
    });
}

/**
 * Logga compliance-status uppdaterad
 * @async
 * @param {Object} project - Projekt
 * @param {Object} oldCompliance - Gammal compliance
 * @param {Object} newCompliance - Ny compliance
 * @returns {Promise<Object>}
 */
export async function logComplianceUpdated(project, oldCompliance, newCompliance) {
    return logAction({
        action: AUDIT_ACTIONS.UPDATE,
        category: AUDIT_CATEGORIES.COMPLIANCE,
        projectId: project?.id,
        projectName: project?.productData?.productName || '',
        entityId: project?.id,
        entityName: 'Compliance',
        previousValue: oldCompliance,
        newValue: newCompliance,
        summary: `Uppdaterade compliance-status`
    });
}

/**
 * Hämta audit logs för ett projekt
 * @async
 * @param {string|number} projectId - Projekt-ID
 * @param {Object} options - Filtreringsalternativ
 * @returns {Promise<Array>} Loggposter
 */
export async function getProjectLogs(projectId, options = {}) {
    const auditRepo = getAuditRepository();
    return auditRepo.getLogsForProject(projectId, options);
}

/**
 * Hämta audit logs för en användare
 * @async
 * @param {string} userId - Användar-ID
 * @param {Object} options - Filtreringsalternativ
 * @returns {Promise<Array>} Loggposter
 */
export async function getUserLogs(userId, options = {}) {
    const auditRepo = getAuditRepository();
    return auditRepo.getLogsForUser(userId, options);
}

/**
 * Hämta senaste audit logs
 * @async
 * @param {number} limit - Max antal
 * @returns {Promise<Array>}
 */
export async function getRecentLogs(limit = 50) {
    const auditRepo = getAuditRepository();
    return auditRepo.getRecentLogs(limit);
}

/**
 * Exportera audit logs
 * @async
 * @param {Object} options - Exportalternativ
 * @returns {Promise<Object|string>}
 */
export async function exportAuditLogs(options = {}) {
    const auditRepo = getAuditRepository();
    return auditRepo.exportLogs(options);
}

/**
 * Hämta audit-statistik
 * @async
 * @returns {Promise<Object>}
 */
export async function getAuditStatistics() {
    const auditRepo = getAuditRepository();
    return auditRepo.getStatistics();
}

export default {
    logAction,
    logRiskCreated,
    logRiskUpdated,
    logRiskDeleted,
    logMeasureAdded,
    logMeasureUpdated,
    logMeasureDeleted,
    logInterfaceCreated,
    logInterfaceUpdated,
    logInterfaceDeleted,
    logProjectFieldUpdated,
    logProjectExported,
    logProjectImported,
    logComplianceUpdated,
    getProjectLogs,
    getUserLogs,
    getRecentLogs,
    exportAuditLogs,
    getAuditStatistics
};
