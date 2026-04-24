/**
 * Project Repository
 * Hanterar alla projektrelaterade CRUD-operationer
 * 
 * Denna repository erbjuder samma gränssnitt som den gamla StorageService
 * men delegerar arbetet till en DataAdapter.
 */

import createBaseRepository from './base-repository.js';

/**
 * Skapa en tom projektmall
 * @returns {object} Tomt projektobjekt
 */
export function createEmptyProject() {
    return {
        id: null,
        meta: {
            projectName: '',
            revision: '1.0',
            created: new Date().toISOString(),
            lastModified: new Date().toISOString()
        },
        productData: {
            orderNumber: '',
            projectNumber: '',
            productType: '',
            productName: '',
            model: '',
            serialNumber: '',
            batchNumber: '',
            machineNumber: '',
            functionDescription: '',
            isPartlyCompleted: false
        },
        manufacturer: {
            companyName: '',
            address: '',
            contactInfo: '',
            email: '',
            phone: '',
            docSignatory: '',
            technicalFileResponsible: ''
        },
        compliance: {
            isHighRisk: false,
            highRiskCategory: '',
            highRiskCustom: '',
            highRiskNotes: '',
            conformityPath: 'self',
            notifiedBody: ''
        },
        digitalSafety: {
            softwareVersion: '',
            updatePolicy: '',
            cybersecurityMeasures: '',
            aiSafetyFunctions: '',
            digitalInstructions: '',
            loggingTraceability: ''
        },
        selectedDirective: '',
        directives: [],
        standards: [],
        riskFramework: {
            intendedUse: '',
            foreseeableMisuse: '',
            spaceLimitations: '',
            timeLimitations: '',
            otherLimitations: '',
            lifePhases: []
        },
        machineCategories: {
            foodMachine: false,
            handheldMachine: false,
            mobileMachine: false,
            liftingFunction: false
        },
        media: {
            logoImage: null
        },
        safetyLayoutImages: [],
        isModuleOrInterface: false,
        showModuleSeparately: false,
        moduleMotivation: '',
        modules: [],
        purchasedMachines: [],
        objects: [],
        risks: [],
        interfaceRisks: [],
        controlPoints: [],
        controlReport: {
            checkpoints: {},
                checkpointStatus: {},
                controlQuestions: {},
            summary: '',
            reviewer: '',
            date: '',
            approver: '',
            approvalDate: ''
        },
        customLists: {},
        customControlQuestions: {}
    };
}

/**
 * Skapa ProjectRepository med given adapter
 * @param {object} adapter - DataAdapter instans
 * @returns {object} ProjectRepository instans
 */
export function createProjectRepository(adapter) {
    const baseRepo = createBaseRepository('projects', adapter);
    
    return {
        ...baseRepo,
        
        /**
         * Skapa nytt projekt
         * @returns {object} Nytt projektobjekt
         */
        create() {
            return createEmptyProject();
        },
        
        /**
         * Spara projekt
         * KOMPATIBILITET: Samma signatur som StorageService.saveProject()
         * 
         * @async
         * @param {object} project
         * @returns {Promise<object>} Sparat projekt
         */
        async saveProject(project) {
            return this.save(project);
        },
        
        /**
         * Ladda projekt
         * KOMPATIBILITET: Samma signatur som StorageService.loadProject()
         * 
         * @async
         * @param {number} projectId
         * @returns {Promise<object|null>}
         */
        async loadProject(projectId) {
            return this.getById(projectId);
        },
        
        /**
         * Lista alla projekt
         * KOMPATIBILITET: Samma signatur som StorageService.listProjects()
         * 
         * @async
         * @returns {Promise<Array>}
         */
        async listProjects() {
            return this.getAll();
        },
        
        /**
         * Ta bort projekt
         * KOMPATIBILITET: Samma signatur som StorageService.deleteProject()
         * 
         * @async
         * @param {number} projectId
         * @returns {Promise<void>}
         */
        async deleteProject(projectId) {
            return this.delete(projectId);
        },
        
        /**
         * Hämta senast modifierat projekt
         * 
         * @async
         * @returns {Promise<object|null>}
         */
        async getLatestProject() {
            const projects = await this.getAll();
            
            if (projects.length === 0) return null;
            
            // Sortera efter lastModified
            return projects.reduce((latest, current) => {
                const currentDate = new Date(current.meta?.lastModified || current.meta?.created || 0);
                const latestDate = new Date(latest.meta?.lastModified || latest.meta?.created || 0);
                return currentDate > latestDate ? current : latest;
            });
        },
        
        /**
         * Sök projekt efter namn
         * 
         * @async
         * @param {string} projectName
         * @returns {Promise<Array>}
         */
        async findByName(projectName) {
            const projects = await this.getAll();
            return projects.filter(p => 
                p.meta?.projectName?.toLowerCase().includes(projectName.toLowerCase()) ||
                p.productData?.projectNumber?.toLowerCase().includes(projectName.toLowerCase())
            );
        }
    };
}

export default createProjectRepository;
