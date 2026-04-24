/**
 * Audit Viewer
 * UI för att visa och filtrera audit logs
 * 
 * Denna modul tillhandahåller funktioner för att visa
 * ändringsloggarna i gränssnittet.
 */

import * as auditService from './audit-service.js';
import { getCurrentUser, isAdmin, hasPermission } from '../auth/index.js';
import { getAuditRepository } from '../../data/index.js';

/**
 * Initiera audit viewer UI
 * Ansluter event listeners för audit-relaterade UI-element
 */
export function initializeAuditViewer() {
    // Event listeners kan läggas till här vid behov
}

/**
 * Visa audit logs för ett projekt
 * @async
 * @param {string|number} projectId - Projekt-ID
 * @param {Object} options - Filtreringsalternativ
 */
export async function showProjectAuditLog(projectId, options = {}) {
    if (!hasPermission('audit.view')) {
        console.warn('User does not have audit.view permission');
        return;
    }
    
    const logs = await auditService.getProjectLogs(projectId, options);
    renderAuditTable(logs, `Ändringslogg för projekt`);
}

/**
 * Visa audit logs för en användare
 * @async
 * @param {string} userId - Användar-ID
 * @param {Object} options - Filtreringsalternativ
 */
export async function showUserAuditLog(userId, options = {}) {
    const currentUser = getCurrentUser();
    
    // Användare kan se sin egen logg, admin kan se alla
    if (currentUser?.id !== userId && !isAdmin()) {
        console.warn('User does not have permission to view this audit log');
        return;
    }
    
    const logs = await auditService.getUserLogs(userId, options);
    renderAuditTable(logs, `Aktivitetslogg för användare`);
}

/**
 * Visa senaste audit logs
 * @async
 * @param {number} limit - Max antal
 */
export async function showRecentAuditLog(limit = 50) {
    if (!isAdmin()) {
        console.warn('Only admins can view full audit log');
        return;
    }
    
    // Öppna modal
    const modal = document.getElementById('auditLogModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
    
    const logs = await auditService.getRecentLogs(limit);
    renderAuditTable(logs, `Senaste ändringar (${logs.length} poster)`);
}

/**
 * Visa audit logs med datumfilter
 * @async
 * @param {Date|string} startDate - Startdatum
 * @param {Date|string} endDate - Slutdatum
 */
export async function showAuditLogByDateRange(startDate, endDate) {
    if (!isAdmin()) {
        console.warn('Only admins can view full audit log');
        return;
    }
    
    const auditRepo = await getAuditRepository();
    const logs = await auditRepo.getLogsByDateRange(startDate, endDate);
    renderAuditTable(logs, `Ändringar ${formatDate(startDate)} - ${formatDate(endDate)}`);
}

/**
 * Rendera audit log tabell
 * @param {Array} logs - Loggposter
 * @param {string} title - Tabelltitel
 */
function renderAuditTable(logs, title = 'Ändringslogg') {
    const container = document.getElementById('auditLogContainer');
    
    if (!container) {
        console.warn('No audit log container found');
        return;
    }
    
    if (logs.length === 0) {
        container.innerHTML = `
            <div class="audit-empty">
                <p>Inga ändringar att visa</p>
            </div>
        `;
        return;
    }
    
    const html = `
        <div class="audit-viewer">
            <div class="audit-header">
                <h3>${title}</h3>
                <div class="audit-actions">
                    <button class="btn btn-small" onclick="window.auditViewer.exportAuditLogs()">
                        📁 Exportera CSV
                    </button>
                </div>
            </div>
            
            <table class="audit-table">
                <thead>
                    <tr>
                        <th>Tidpunkt</th>
                        <th>Användare</th>
                        <th>Projekt</th>
                        <th>Handling</th>
                        <th>Objekt</th>
                        <th>Beskrivning</th>
                        <th>Åtgärd</th>
                    </tr>
                </thead>
                <tbody>
                    ${logs.map(log => renderAuditRow(log)).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = html;
}

/**
 * Rendera en rad i audit-tabellen
 * @param {Object} log - Loggpost
 * @returns {string} HTML
 */
function renderAuditRow(log) {
    const actionLabel = getActionLabel(log.action);
    const categoryLabel = getCategoryLabel(log.category);
    const timeStr = formatDateTime(log.timestamp);
    
    return `
        <tr class="audit-row audit-${log.action}">
            <td title="${log.timestamp}">${timeStr}</td>
            <td>${escapeHtml(log.userName || 'Anonym')}</td>
            <td>${escapeHtml(log.projectName || '-')}</td>
            <td>
                <span class="audit-action audit-action-${log.action}">
                    ${actionLabel}
                </span>
            </td>
            <td>${escapeHtml(log.entityName || log.category || '-')}</td>
            <td>${escapeHtml(log.summary || '')}</td>
            <td>
                <button class="btn-link" onclick="showAuditDetails('${log.id}')">
                    Visa detaljer
                </button>
            </td>
        </tr>
    `;
}

/**
 * Visa detaljerad vy av en audit-post i en ny flik
 * @async
 * @param {string} logId - Logg-ID
 */
export async function showAuditDetails(logId) {
    const auditRepo = getAuditRepository();
    const log = await auditRepo.getById(logId);
    
    if (!log) {
        alert('Loggposten hittades inte');
        return;
    }
    
    // Skapa en fullständig HTML-sida
    const htmlPage = `
<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ändringslogg - Detaljer</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            padding: 30px;
        }
        
        h1 {
            color: #2c3e50;
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 3px solid #3498db;
        }
        
        .detail-section {
            margin-bottom: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 6px;
            border-left: 4px solid #3498db;
        }
        
        .detail-section h2 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 1.3em;
        }
        
        dl {
            display: grid;
            grid-template-columns: 200px 1fr;
            gap: 10px 20px;
        }
        
        dt {
            font-weight: 600;
            color: #555;
        }
        
        dd {
            color: #333;
        }
        
        pre {
            background: #2c3e50;
            color: #ecf0f1;
            padding: 20px;
            border-radius: 6px;
            overflow-x: auto;
            font-family: 'Courier New', Courier, monospace;
            font-size: 0.9em;
            line-height: 1.5;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        
        .action-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-weight: 600;
            font-size: 0.9em;
        }
        
        .action-create {
            background: #d4edda;
            color: #155724;
        }
        
        .action-update {
            background: #fff3cd;
            color: #856404;
        }
        
        .action-delete {
            background: #f8d7da;
            color: #721c24;
        }
        
        .action-login, .action-logout {
            background: #d1ecf1;
            color: #0c5460;
        }
        
        .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            background: #3498db;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 1em;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .print-button:hover {
            background: #2980b9;
        }
        
        @media print {
            .print-button {
                display: none;
            }
            
            body {
                background: white;
                padding: 0;
            }
            
            .container {
                box-shadow: none;
                padding: 0;
            }
        }
        
        @media (max-width: 768px) {
            dl {
                grid-template-columns: 1fr;
                gap: 5px;
            }
            
            dt {
                margin-top: 10px;
            }
        }
    </style>
</head>
<body>
    <button class="print-button" onclick="window.print()">🖨️ Skriv ut</button>
    
    <div class="container">
        <h1>Ändringslogg - Detaljerad information</h1>
        
        <div class="detail-section">
            <h2>Information</h2>
            <dl>
                <dt>Tidpunkt:</dt>
                <dd>${formatDateTime(log.timestamp)}</dd>
                
                <dt>Användare:</dt>
                <dd>${escapeHtml(log.userName || log.userId || 'Anonym')}</dd>
                
                <dt>Handling:</dt>
                <dd>
                    <span class="action-badge action-${log.action}">
                        ${getActionLabel(log.action)}
                    </span>
                </dd>
                
                <dt>Kategori:</dt>
                <dd>${getCategoryLabel(log.category)}</dd>
                
                <dt>Projekt:</dt>
                <dd>${escapeHtml(log.projectName || log.projectId || '-')}</dd>
                
                <dt>Objekt:</dt>
                <dd>${escapeHtml(log.entityName || log.entityId || '-')}</dd>
            </dl>
        </div>
        
        ${log.summary ? `
            <div class="detail-section">
                <h2>Sammanfattning</h2>
                <p>${escapeHtml(log.summary)}</p>
            </div>
        ` : ''}
        
        ${log.previousValue ? `
            <div class="detail-section">
                <h2>Tidigare värde</h2>
                <pre>${escapeHtml(JSON.stringify(log.previousValue, null, 2))}</pre>
            </div>
        ` : ''}
        
        ${log.newValue ? `
            <div class="detail-section">
                <h2>Nytt värde</h2>
                <pre>${escapeHtml(JSON.stringify(log.newValue, null, 2))}</pre>
            </div>
        ` : ''}
        
        ${log.metadata ? `
            <div class="detail-section">
                <h2>Metadata</h2>
                <dl>
                    ${log.metadata.userAgent ? `
                        <dt>Browser:</dt>
                        <dd>${escapeHtml(log.metadata.userAgent)}</dd>
                    ` : ''}
                    
                    ${log.metadata.changeSource ? `
                        <dt>Källa:</dt>
                        <dd>${escapeHtml(log.metadata.changeSource)}</dd>
                    ` : ''}
                    
                    ${Object.entries(log.metadata).filter(([key]) => key !== 'userAgent' && key !== 'changeSource').map(([key, value]) => `
                        <dt>${escapeHtml(key)}:</dt>
                        <dd>${escapeHtml(String(value))}</dd>
                    `).join('')}
                </dl>
            </div>
        ` : ''}
    </div>
</body>
</html>
    `;
    
    // Öppna i ny flik
    const newWindow = window.open('', '_blank');
    if (newWindow) {
        newWindow.document.write(htmlPage);
        newWindow.document.close();
    } else {
        alert('Popup-blockerare förhindrade öppning av ny flik. Tillåt popup-fönster för denna sida.');
    }
}

/**
 * Exportera audit logs
 * @async
 */
export async function exportAuditLogs(projectId = null) {
    try {
        const format = prompt('Välj format (json/csv):', 'csv');
        if (!format) return;
        
        const exported = await auditService.exportAuditLogs({
            projectId,
            format: format.toLowerCase()
        });
        
        const content = typeof exported === 'string' ? exported : JSON.stringify(exported, null, 2);
        const filename = `audit-${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'json'}`;
        
        downloadFile(content, filename, format === 'csv' ? 'text/csv' : 'application/json');
        
    } catch (error) {
        console.error('Export error:', error);
        alert('Fel vid export: ' + error.message);
    }
}

/**
 * Få etikett för handling
 * @param {string} action - Handling-ID
 * @returns {string} Etikett
 */
function getActionLabel(action) {
    const labels = {
        'create': '✨ Skapad',
        'update': '✏️ Uppdaterad',
        'delete': '🗑️ Raderad',
        'view': '👁️ Visad',
        'export': '📤 Exporterad',
        'import': '📥 Importerad',
        'login': '✅ Inloggning',
        'logout': '🚪 Utloggning',
        'login_failed': '❌ Inloggning misslyckad'
    };
    return labels[action] || action;
}

/**
 * Få etikett för kategori
 * @param {string} category - Kategori-ID
 * @returns {string} Etikett
 */
function getCategoryLabel(category) {
    const labels = {
        'risk': 'Risk',
        'measure': 'Åtgärd',
        'interface': 'Gränssnitt',
        'product': 'Produkt',
        'compliance': 'Compliance',
        'project': 'Projekt',
        'user': 'Användare',
        'system': 'System'
    };
    return labels[category] || category;
}

/**
 * Formatera datum och tid
 * @param {string} isoString - ISO8601 sträng
 * @returns {string} Formaterad tid
 */
function formatDateTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString('sv-SE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

/**
 * Formatera datum
 * @param {Date|string} date - Datum
 * @returns {string}
 */
function formatDate(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('sv-SE');
}

/**
 * Escape HTML tecken
 * @param {string} text - Text att escape
 * @returns {string}
 */
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

/**
 * Ladda ner fil
 * @param {string} content - Filinnehål
 * @param {string} filename - Filnamn
 * @param {string} mimeType - MIME-typ
 */
function downloadFile(content, filename, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Skapa modal för audit-detaljer
 * @returns {HTMLElement}
 */
function createAuditDetailsModal() {
    const modal = document.createElement('div');
    modal.id = 'auditDetailsModal';
    modal.className = 'modal hidden';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Ändringsdetaljer</h3>
                <button class="modal-close" onclick="this.closest('.modal').classList.add('hidden')">×</button>
            </div>
            <div class="modal-body" id="auditDetailsContent"></div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

// Exponera globalt för HTML event handlers
window.showAuditDetails = showAuditDetails;
if (window.auditViewer) {
    window.auditViewer.showAuditDetails = showAuditDetails;
}
window.exportAuditLogs = exportAuditLogs;

export default {
    initializeAuditViewer,
    showProjectAuditLog,
    showUserAuditLog,
    showRecentAuditLog,
    showAuditLogByDateRange,
    showAuditDetails,
    exportAuditLogs
};
