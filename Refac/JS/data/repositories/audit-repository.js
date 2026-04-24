/**
 * Audit Repository
 * Hanterar alla audit log operationer
 * 
 * Denna repository hanterar loggning av alla ändringar i systemet
 * för spårbarhet och maskinsäkerhetsdokumentation.
 */

import { createBaseRepository } from './base-repository.js';

/**
 * Generera ett unikt UUID
 * @returns {string} UUID v4
 */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Tillgängliga handlingstyper
 */
export const AUDIT_ACTIONS = {
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
    VIEW: 'view',
    EXPORT: 'export',
    IMPORT: 'import',
    LOGIN: 'login',
    LOGOUT: 'logout',
    LOGIN_FAILED: 'login_failed'
};

/**
 * Tillgängliga kategorier
 */
export const AUDIT_CATEGORIES = {
    RISK: 'risk',
    MEASURE: 'measure',
    INTERFACE: 'interface',
    PRODUCT: 'product',
    COMPLIANCE: 'compliance',
    PROJECT: 'project',
    USER: 'user',
    SYSTEM: 'system'
};

/**
 * Skapa en tom audit log entry
 * @returns {object} Tom loggpost
 */
export function createEmptyAuditEntry() {
    return {
        id: null,
        timestamp: new Date().toISOString(),
        userId: null,
        userName: '',
        projectId: null,
        projectName: '',
        action: '',
        category: '',
        entityId: null,
        entityName: '',
        previousValue: null,
        newValue: null,
        summary: '',
        metadata: {
            userAgent: '',
            ipAddress: null,
            sessionId: null,
            changeSource: 'manual'
        }
    };
}

/**
 * Skapa AuditRepository
 * 
 * @param {object} adapter - DataAdapter instans
 * @returns {object} AuditRepository instans
 */
export default function createAuditRepository(adapter) {
    const storeName = 'auditLogs';
    const base = createBaseRepository(storeName, adapter);
    
    return {
        ...base,
        
        /**
         * Logga en handling
         * @async
         * @param {object} entry - Loggpost data
         * @returns {Promise<object>} Skapad loggpost
         */
        async logAction(entry) {
            const auditEntry = {
                ...createEmptyAuditEntry(),
                ...entry,
                id: generateUUID(),
                timestamp: new Date().toISOString()
            };
            
            // Lägg till user agent om i browser
            if (typeof navigator !== 'undefined' && !auditEntry.metadata.userAgent) {
                auditEntry.metadata.userAgent = navigator.userAgent;
            }
            
            const saved = await adapter.save(storeName, auditEntry);
            console.log(`📋 Audit: ${auditEntry.action} - ${auditEntry.summary}`);
            return saved;
        },
        
        /**
         * Hämta loggar för ett projekt
         * @async
         * @param {string|number} projectId - Projekt-ID
         * @param {object} options - Filtreringsalternativ
         * @returns {Promise<Array>}
         */
        async getLogsForProject(projectId, options = {}) {
            const { limit = 100, offset = 0, action, category, orderBy = 'timestamp', order = 'desc' } = options;
            
            let logs = await adapter.getAllByIndex(storeName, 'projectId', projectId);
            
            // Filtrera på action om specificerat
            if (action) {
                logs = logs.filter(log => log.action === action);
            }
            
            // Filtrera på category om specificerat
            if (category) {
                logs = logs.filter(log => log.category === category);
            }
            
            // Sortera
            logs.sort((a, b) => {
                const aVal = a[orderBy];
                const bVal = b[orderBy];
                if (order === 'desc') {
                    return bVal > aVal ? 1 : -1;
                }
                return aVal > bVal ? 1 : -1;
            });
            
            // Paginering
            return logs.slice(offset, offset + limit);
        },
        
        /**
         * Hämta loggar för en användare
         * @async
         * @param {string} userId - Användar-ID
         * @param {object} options - Filtreringsalternativ
         * @returns {Promise<Array>}
         */
        async getLogsForUser(userId, options = {}) {
            const { limit = 100, offset = 0, orderBy = 'timestamp', order = 'desc' } = options;
            
            let logs = await adapter.getAllByIndex(storeName, 'userId', userId);
            
            // Sortera
            logs.sort((a, b) => {
                const aVal = a[orderBy];
                const bVal = b[orderBy];
                if (order === 'desc') {
                    return bVal > aVal ? 1 : -1;
                }
                return aVal > bVal ? 1 : -1;
            });
            
            // Paginering
            return logs.slice(offset, offset + limit);
        },
        
        /**
         * Hämta loggar inom ett datumintervall
         * @async
         * @param {Date|string} startDate - Startdatum
         * @param {Date|string} endDate - Slutdatum
         * @param {object} options - Filtreringsalternativ
         * @returns {Promise<Array>}
         */
        async getLogsByDateRange(startDate, endDate, options = {}) {
            const { limit = 1000, projectId, userId, action, category } = options;
            
            const start = typeof startDate === 'string' ? startDate : startDate.toISOString();
            const end = typeof endDate === 'string' ? endDate : endDate.toISOString();
            
            let logs = await adapter.getByDateRange(storeName, 'timestamp', start, end);
            
            // Filtrera
            if (projectId) {
                logs = logs.filter(log => log.projectId === projectId);
            }
            if (userId) {
                logs = logs.filter(log => log.userId === userId);
            }
            if (action) {
                logs = logs.filter(log => log.action === action);
            }
            if (category) {
                logs = logs.filter(log => log.category === category);
            }
            
            // Sortera (nyaste först)
            logs.sort((a, b) => b.timestamp > a.timestamp ? 1 : -1);
            
            return logs.slice(0, limit);
        },
        
        /**
         * Hämta loggar för en specifik handling
         * @async
         * @param {string} action - Handlingstyp
         * @param {object} options - Filtreringsalternativ
         * @returns {Promise<Array>}
         */
        async getLogsByAction(action, options = {}) {
            const { limit = 100, offset = 0 } = options;
            
            let logs = await adapter.getAllByIndex(storeName, 'action', action);
            
            // Sortera (nyaste först)
            logs.sort((a, b) => b.timestamp > a.timestamp ? 1 : -1);
            
            return logs.slice(offset, offset + limit);
        },
        
        /**
         * Hämta loggar för en specifik kategori
         * @async
         * @param {string} category - Kategori
         * @param {object} options - Filtreringsalternativ
         * @returns {Promise<Array>}
         */
        async getLogsByCategory(category, options = {}) {
            const { limit = 100, offset = 0 } = options;
            
            let logs = await adapter.getAllByIndex(storeName, 'category', category);
            
            // Sortera (nyaste först)
            logs.sort((a, b) => b.timestamp > a.timestamp ? 1 : -1);
            
            return logs.slice(offset, offset + limit);
        },
        
        /**
         * Hämta senaste loggar
         * @async
         * @param {number} limit - Max antal
         * @returns {Promise<Array>}
         */
        async getRecentLogs(limit = 50) {
            const logs = await adapter.getAll(storeName);
            
            // Sortera (nyaste först)
            logs.sort((a, b) => b.timestamp > a.timestamp ? 1 : -1);
            
            return logs.slice(0, limit);
        },
        
        /**
         * Exportera loggar som JSON
         * @async
         * @param {object} options - Exportalternativ
         * @returns {Promise<object>} Exportdata
         */
        async exportLogs(options = {}) {
            const { projectId, startDate, endDate, format = 'json' } = options;
            
            let logs;
            
            if (startDate && endDate) {
                logs = await this.getLogsByDateRange(startDate, endDate, { projectId, limit: 10000 });
            } else if (projectId) {
                logs = await this.getLogsForProject(projectId, { limit: 10000 });
            } else {
                logs = await adapter.getAll(storeName);
                logs.sort((a, b) => b.timestamp > a.timestamp ? 1 : -1);
            }
            
            const exportData = {
                exportedAt: new Date().toISOString(),
                totalEntries: logs.length,
                filters: { projectId, startDate, endDate },
                entries: logs
            };
            
            if (format === 'csv') {
                return this.convertToCSV(logs);
            }
            
            return exportData;
        },
        
        /**
         * Konvertera loggar till CSV-format
         * @param {Array} logs - Loggposter
         * @returns {string} CSV-sträng
         */
        convertToCSV(logs) {
            const headers = [
                'Tidpunkt',
                'Användare',
                'Projekt',
                'Handling',
                'Kategori',
                'Objekt',
                'Sammanfattning'
            ];
            
            const rows = logs.map(log => [
                log.timestamp,
                log.userName || log.userId,
                log.projectName || log.projectId || '',
                log.action,
                log.category,
                log.entityName || log.entityId || '',
                `"${(log.summary || '').replace(/"/g, '""')}"`
            ]);
            
            return [headers.join(';'), ...rows.map(row => row.join(';'))].join('\n');
        },
        
        /**
         * Räkna loggar för ett projekt
         * @async
         * @param {string|number} projectId - Projekt-ID
         * @returns {Promise<number>}
         */
        async countLogsForProject(projectId) {
            const logs = await adapter.getAllByIndex(storeName, 'projectId', projectId);
            return logs.length;
        },
        
        /**
         * Räkna totalt antal loggar
         * @async
         * @returns {Promise<number>}
         */
        async countTotalLogs() {
            return adapter.count(storeName);
        },
        
        /**
         * Hämta statistik för audit logs
         * @async
         * @returns {Promise<object>}
         */
        async getStatistics() {
            const allLogs = await adapter.getAll(storeName);
            
            const stats = {
                total: allLogs.length,
                byAction: {},
                byCategory: {},
                byUser: {},
                last24Hours: 0,
                lastWeek: 0
            };
            
            const now = new Date();
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            
            for (const log of allLogs) {
                // Räkna per action
                stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;
                
                // Räkna per category
                stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
                
                // Räkna per user
                if (log.userId) {
                    stats.byUser[log.userId] = (stats.byUser[log.userId] || 0) + 1;
                }
                
                // Tidbaserad statistik
                const logDate = new Date(log.timestamp);
                if (logDate > oneDayAgo) {
                    stats.last24Hours++;
                }
                if (logDate > oneWeekAgo) {
                    stats.lastWeek++;
                }
            }
            
            return stats;
        },
        
        /**
         * Logga risk-skapande
         * @async
         */
        async logRiskCreated(user, project, risk) {
            return this.logAction({
                userId: user?.id,
                userName: user?.fullName || 'Anonym',
                projectId: project?.id,
                projectName: project?.productData?.productName || '',
                action: AUDIT_ACTIONS.CREATE,
                category: AUDIT_CATEGORIES.RISK,
                entityId: risk.id,
                entityName: risk.description || risk.name || '',
                newValue: risk,
                summary: `Skapade risk: ${risk.description || risk.name || 'Ny risk'}`
            });
        },
        
        /**
         * Logga risk-uppdatering
         * @async
         */
        async logRiskUpdated(user, project, oldRisk, newRisk) {
            return this.logAction({
                userId: user?.id,
                userName: user?.fullName || 'Anonym',
                projectId: project?.id,
                projectName: project?.productData?.productName || '',
                action: AUDIT_ACTIONS.UPDATE,
                category: AUDIT_CATEGORIES.RISK,
                entityId: newRisk.id,
                entityName: newRisk.description || newRisk.name || '',
                previousValue: oldRisk,
                newValue: newRisk,
                summary: `Uppdaterade risk: ${newRisk.description || newRisk.name || ''}`
            });
        },
        
        /**
         * Logga risk-radering
         * @async
         */
        async logRiskDeleted(user, project, risk) {
            return this.logAction({
                userId: user?.id,
                userName: user?.fullName || 'Anonym',
                projectId: project?.id,
                projectName: project?.productData?.productName || '',
                action: AUDIT_ACTIONS.DELETE,
                category: AUDIT_CATEGORIES.RISK,
                entityId: risk.id,
                entityName: risk.description || risk.name || '',
                previousValue: risk,
                summary: `Raderade risk: ${risk.description || risk.name || ''}`
            });
        },
        
        /**
         * Logga projekt-export
         * @async
         */
        async logProjectExported(user, project) {
            return this.logAction({
                userId: user?.id,
                userName: user?.fullName || 'Anonym',
                projectId: project?.id,
                projectName: project?.productData?.productName || '',
                action: AUDIT_ACTIONS.EXPORT,
                category: AUDIT_CATEGORIES.PROJECT,
                entityId: project?.id,
                entityName: project?.productData?.productName || '',
                summary: `Exporterade projekt: ${project?.productData?.productName || ''}`
            });
        },
        
        /**
         * Logga projekt-import
         * @async
         */
        async logProjectImported(user, project) {
            return this.logAction({
                userId: user?.id,
                userName: user?.fullName || 'Anonym',
                projectId: project?.id,
                projectName: project?.productData?.productName || '',
                action: AUDIT_ACTIONS.IMPORT,
                category: AUDIT_CATEGORIES.PROJECT,
                entityId: project?.id,
                entityName: project?.productData?.productName || '',
                newValue: project,
                summary: `Importerade projekt: ${project?.productData?.productName || ''}`
            });
        },
        
        /**
         * Logga inloggning
         * @async
         */
        async logLogin(user, success = true) {
            return this.logAction({
                userId: user?.id,
                userName: user?.fullName || user?.username || 'Okänd',
                action: success ? AUDIT_ACTIONS.LOGIN : AUDIT_ACTIONS.LOGIN_FAILED,
                category: AUDIT_CATEGORIES.SYSTEM,
                summary: success 
                    ? `Användare loggade in: ${user?.fullName || user?.username || ''}` 
                    : `Misslyckat inloggningsförsök: ${user?.username || 'Okänd'}`
            });
        },
        
        /**
         * Logga utloggning
         * @async
         */
        async logLogout(user) {
            return this.logAction({
                userId: user?.id,
                userName: user?.fullName || 'Anonym',
                action: AUDIT_ACTIONS.LOGOUT,
                category: AUDIT_CATEGORIES.SYSTEM,
                summary: `Användare loggade ut: ${user?.fullName || ''}`
            });
        }
    };
}
