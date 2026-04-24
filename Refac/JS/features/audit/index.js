/**
 * Audit Feature Index
 * Exporterar alla audit-relaterade funktioner
 */

export * as auditService from './audit-service.js';
export * as auditInterceptor from './audit-interceptor.js';
export * as auditViewer from './audit-viewer.js';

// Convenience exports
export {
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
} from './audit-service.js';

export {
    createAuditedProjectRepository
} from './audit-interceptor.js';

export {
    initializeAuditViewer,
    showProjectAuditLog,
    showUserAuditLog,
    showRecentAuditLog,
    showAuditLogByDateRange,
    showAuditDetails,
    exportAuditLogs as exportAuditLogsUI
} from './audit-viewer.js';

export default {
    service: () => import('./audit-service.js'),
    interceptor: () => import('./audit-interceptor.js'),
    viewer: () => import('./audit-viewer.js')
};
