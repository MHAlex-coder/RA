/**
 * Audit Interceptor
 * Wrappa repositories för automatisk ändringsloggning
 * 
 * Detta interceptor jämför före/efter-värden och loggar automatiskt
 * alla ändringar utan att behöva manuell loggning i features.
 */

import * as auditService from './audit-service.js';

/**
 * Jämför två värden och returnerar true om de är olika
 * @param {any} a - Värde 1
 * @param {any} b - Värde 2
 * @returns {boolean}
 */
function isDifferent(a, b) {
    if (typeof a === 'object' && typeof b === 'object') {
        return JSON.stringify(a) !== JSON.stringify(b);
    }
    return a !== b;
}

/**
 * Hitta ändrade fält mellan två objekt
 * @param {Object} oldObj - Gammalt objekt
 * @param {Object} newObj - Nytt objekt
 * @returns {Object} Objekt med ändrade fält och deras gamla/nya värden
 */
function getChangedFields(oldObj, newObj) {
    const changes = {};
    
    // Alla fält i nya objektet
    const allKeys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]);
    
    for (const key of allKeys) {
        const oldValue = oldObj?.[key];
        const newValue = newObj?.[key];
        
        // Skippa funktioner
        if (typeof newValue === 'function' || typeof oldValue === 'function') {
            continue;
        }
        
        // Skippa arrayer och djupa objekt (de hanteras separat)
        if (Array.isArray(oldValue) || Array.isArray(newValue)) {
            continue;
        }
        
        // Skippa objekt (bara primitiva värden)
        if (typeof oldValue === 'object' && oldValue !== null) {
            continue;
        }
        if (typeof newValue === 'object' && newValue !== null) {
            continue;
        }
        
        // Normalisera tomma värden (undefined, null, '') till null för jämförelse
        const normalizedOld = (oldValue === undefined || oldValue === '' || oldValue === null) ? null : oldValue;
        const normalizedNew = (newValue === undefined || newValue === '' || newValue === null) ? null : newValue;
        
        // Om värdet faktiskt ändrats
        if (normalizedOld !== normalizedNew) {
            changes[key] = {
                old: oldValue,
                new: newValue
            };
        }
    }
    
    return changes;
}

/**
 * Wrappa project repository med automatisk audit logging
 * @param {Object} baseRepository - Bas project repository
 * @returns {Object} Audited repository
 */
export function createAuditedProjectRepository(baseRepository) {
    console.log('🔧 Creating audited project repository wrapper');
    
    const wrapper = {
        ...baseRepository,
        
        /**
         * Spara projekt (med automatisk audit logging)
         * @async
         * @param {Object} project - Projekt att spara
         * @param {Object} options - Alternativ
         * @returns {Promise<Object>}
         */
        async saveProject(project, options = {}) {
            const { skipAudit = false } = options;
            
            console.log('🔍 Audit: saveProject called', { 
                projectId: project.id, 
                skipAudit,
                hasProductName: !!project.productData?.productName 
            });
            
            // Hämta gammal version för jämförelse
            let previousProject = null;
            if (project.id && !skipAudit) {
                try {
                    previousProject = await baseRepository.getById(project.id);
                    console.log('🔍 Audit: Found previous project:', {
                        found: previousProject !== null,
                        previousName: previousProject?.productData?.productName,
                        currentName: project.productData?.productName
                    });
                } catch (error) {
                    // Projekt finns inte ännu (nytt projekt)
                    console.log('🔍 Audit: No previous project found (new project):', error.message);
                    previousProject = null;
                }
            } else {
                console.log('🔍 Audit: Skipping previous project fetch', { hasId: !!project.id, skipAudit });
            }
            
            // Spara projekt
            const result = await baseRepository.saveProject(project);
            console.log('✅ Audit: Project saved, ID:', result.id);
            
            // Logga ändringar om inte skipAudit
            if (!skipAudit && previousProject) {
                console.log('🔍 Audit: Logging changes...');
                await logProjectChanges(previousProject, result);
            } else if (!skipAudit && !previousProject && project.id) {
                // Nytt projekt - spara INTE hela projektet
                console.log('🔍 Audit: Creating new project log (previousProject was null)');
                await auditService.logAction({
                    action: 'create',
                    category: 'project',
                    projectId: result.id,
                    projectName: result.productData?.productName || '',
                    entityId: result.id,
                    entityName: result.productData?.productName || '',
                    summary: `Skapade projekt: ${result.productData?.productName || ''}`
                });
            } else {
                console.log('🔍 Audit: Skipped logging', { skipAudit, hadPreviousProject: !!previousProject, projectId: project.id });
            }
            
            return result;
        },
        
        /**
         * Ta bort projekt (med audit logging)
         * @async
         * @param {number|string} projectId - Projekt-ID
         * @returns {Promise<void>}
         */
        async deleteProject(projectId, options = {}) {
            const { skipAudit = false } = options;
            
            // Hämta projekt före radering
            let project = null;
            if (!skipAudit) {
                try {
                    project = await baseRepository.getById(projectId);
                } catch (error) {
                    // Projekt finns inte
                }
            }
            
            // Ta bort
            const result = await baseRepository.deleteProject(projectId);
            
            // Logga
            if (!skipAudit && project) {
                await auditService.logAction({
                    action: 'delete',
                    category: 'project',
                    projectId: projectId,
                    projectName: project.productData?.productName || '',
                    entityId: projectId,
                    entityName: project.productData?.productName || '',
                    previousValue: project,
                    summary: `Raderade projekt: ${project.productData?.productName || ''}`
                });
            }
            
            return result;
        },
        
        /**
         * Hämta projekt (för kontroll - ingen loggning)
         * @async
         * @param {number|string} id - Projekt-ID
         * @returns {Promise<Object>}
         */
        async getById(id) {
            return baseRepository.getById(id);
        },
        
        async getProject(id) {
            return baseRepository.getById(id);
        },
        
        /**
         * Lista projekt (för kontroll - ingen loggning)
         * @async
         * @returns {Promise<Array>}
         */
        async listProjects() {
            return baseRepository.listProjects();
        }
    };
    
    console.log('✅ Audited repository wrapper created');
    return wrapper;
}

/**
 * Jämför två projekt och logga specifika ändringar
 * @async
 * @param {Object} previous - Tidigare projekt
 * @param {Object} current - Nuvarande projekt
 */
async function logProjectChanges(previous, current) {
    const changes = [];
    
    // Skippa meta-fält (timestamps som ändras automatiskt)
    // Dessa uppdateras vid varje save och ska inte loggas som ändringar
    
    // Produktdata - samla ändrade fält
    if (previous.productData && current.productData) {
        const changedFields = getChangedFields(previous.productData, current.productData);
        for (const [field, change] of Object.entries(changedFields)) {
            changes.push(`Produktdata.${field}: "${change.old}" → "${change.new}"`);
        }
    }
    
    // Tillverkare - samla ändrade fält
    if (previous.manufacturer && current.manufacturer) {
        const changedFields = getChangedFields(previous.manufacturer, current.manufacturer);
        for (const [field, change] of Object.entries(changedFields)) {
            changes.push(`Tillverkare.${field}: "${change.old}" → "${change.new}"`);
        }
    }
    
    // Compliance - samla ändrade fält
    if (previous.compliance && current.compliance) {
        const changedFields = getChangedFields(previous.compliance, current.compliance);
        for (const [field, change] of Object.entries(changedFields)) {
            changes.push(`Compliance.${field}: "${change.old}" → "${change.new}"`);
        }
    }
    
    // Risker - detaljerade ändringar
    const riskChanges = await getRiskChangesSummary(previous.risks || [], current.risks || []);
    changes.push(...riskChanges.details);
    
    // Interface - detaljerade ändringar
    const ifaceChanges = await getInterfaceChangesSummary(previous.interfaces || [], current.interfaces || []);
    changes.push(...ifaceChanges.details);

    // Kontrollrapport - checkpunkter
    const controlChanges = getControlReportChangesSummary(
        previous.controlReport?.checkpointStatus || {},
        current.controlReport?.checkpointStatus || {}
    );
    changes.push(...controlChanges.details);
    
    // Logga endast om det finns ändringar
    if (changes.length > 0) {
        await auditService.logAction({
            action: 'update',
            category: 'project',
            projectId: current.id,
            projectName: current.productData?.productName || '',
            entityId: current.id,
            entityName: current.productData?.productName || '',
            summary: `Uppdaterade projekt: ${changes.join(', ')}`
        });
    }
}

/**
 * Räkna ändringar i kontrollrapportens checkpunkter
 * @param {Object} previousStatuses - Tidigare status (key -> ja/nej/ejakt)
 * @param {Object} currentStatuses - Nuvarande status (key -> ja/nej/ejakt)
 * @returns {Object} Sammanfattning av ändringar med detaljer
 */
function getControlReportChangesSummary(previousStatuses = {}, currentStatuses = {}) {
    const details = [];
    const allKeys = new Set([
        ...Object.keys(previousStatuses || {}),
        ...Object.keys(currentStatuses || {})
    ]);

    for (const key of allKeys) {
        const prev = previousStatuses?.[key] || '';
        const curr = currentStatuses?.[key] || '';
        if (prev !== curr) {
            details.push(`Kontrollrapport: ${key}: "${prev || '-'}" → "${curr || '-'}"`);
        }
    }

    return { details };
}

/**
 * Räkna risk-ändringar med detaljer
 * @param {Array} previousRisks - Tidigare risker
 * @param {Array} currentRisks - Nuvarande risker
 * @returns {Object} Sammanfattning av ändringar med detaljer
 */
async function getRiskChangesSummary(previousRisks = [], currentRisks = []) {
    const details = [];
    
    // Nya risker
    for (const risk of currentRisks) {
        const existed = previousRisks.find(r => r.id === risk.id);
        if (!existed) {
            details.push(`Skapade risk: "${risk.description || risk.id}"`);
        }
    }
    
    // Uppdaterade/raderade risker
    for (const previousRisk of previousRisks) {
        const current = currentRisks.find(r => r.id === previousRisk.id);
        
        if (!current) {
            details.push(`Raderade risk: "${previousRisk.description || previousRisk.id}"`);
        } else if (isDifferent(previousRisk, current)) {
            // Hitta exakt vad som ändrades
            const riskChanges = getChangedFields(previousRisk, current);
            for (const [field, change] of Object.entries(riskChanges)) {
                details.push(`Risk "${current.description || current.id}" - ${field}: "${change.old}" → "${change.new}"`);
            }
        }
    }
    
    return { details };
}

/**
 * Räkna interface-ändringar med detaljer
 * @param {Array} previousInterfaces - Tidigare interfaces
 * @param {Array} currentInterfaces - Nuvarande interfaces
 * @returns {Object} Sammanfattning av ändringar med detaljer
 */
async function getInterfaceChangesSummary(previousInterfaces = [], currentInterfaces = []) {
    const details = [];
    
    // Nya interfaces
    for (const iface of currentInterfaces) {
        const existed = previousInterfaces.find(i => i.id === iface.id);
        if (!existed) {
            details.push(`Skapade interface: "${iface.name || iface.id}"`);
        }
    }
    
    // Uppdaterade/raderade interfaces
    for (const previousIface of previousInterfaces) {
        const current = currentInterfaces.find(i => i.id === previousIface.id);
        
        if (!current) {
            details.push(`Raderade interface: "${previousIface.name || previousIface.id}"`);
        } else if (isDifferent(previousIface, current)) {
            // Hitta exakt vad som ändrades
            const ifaceChanges = getChangedFields(previousIface, current);
            for (const [field, change] of Object.entries(ifaceChanges)) {
                details.push(`Interface "${current.name || current.id}" - ${field}: "${change.old}" → "${change.new}"`);
            }
        }
    }
    
    return { details };
}

export default {
    createAuditedProjectRepository
};
