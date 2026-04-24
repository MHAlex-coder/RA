/**
 * IndexedDB Adapter
 * Implementering av DataAdapter interface för IndexedDB
 * 
 * Denna adapter kapslar in all IndexedDB-logik och gör det enkelt att
 * byta till en annan backend (SQLite, HTTP API, etc.) utan att ändra
 * resten av applikationen.
 */

import { DataAdapterInterface, validateAdapter } from './adapter-interface.js';

/**
 * IndexedDB Adapter Implementation
 */
export const IndexedDBAdapter = {
    dbName: 'HETZA_RA_DB',
    version: 2,  // Uppgraderad för auth & audit
    db: null,
    
    /**
     * Initialisera IndexedDB
     * @async
     * @returns {Promise<void>}
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            
            request.onerror = () => {
                console.error('❌ IndexedDB init error:', request.error);
                reject(request.error);
            };
            
            request.onsuccess = () => {
                this.db = request.result;
                console.log('✅ IndexedDB initialized');
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // ===== PROJECTS STORE =====
                if (!db.objectStoreNames.contains('projects')) {
                    const projectStore = db.createObjectStore('projects', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    projectStore.createIndex('name', 'meta.projectName', { unique: false });
                    projectStore.createIndex('revision', 'meta.revision', { unique: false });
                    console.log('✅ Created "projects" object store');
                }
                
                // ===== USERS STORE =====
                if (!db.objectStoreNames.contains('users')) {
                    const userStore = db.createObjectStore('users', { 
                        keyPath: 'id'
                    });
                    userStore.createIndex('username', 'username', { unique: true });
                    userStore.createIndex('email', 'email', { unique: true });
                    userStore.createIndex('role', 'role', { unique: false });
                    userStore.createIndex('isActive', 'isActive', { unique: false });
                    console.log('✅ Created "users" object store');
                }
                
                // ===== SESSIONS STORE =====
                if (!db.objectStoreNames.contains('sessions')) {
                    const sessionStore = db.createObjectStore('sessions', { 
                        keyPath: 'id'
                    });
                    sessionStore.createIndex('userId', 'userId', { unique: false });
                    sessionStore.createIndex('expires', 'expires', { unique: false });
                    console.log('✅ Created "sessions" object store');
                }
                
                // ===== AUDIT LOGS STORE =====
                if (!db.objectStoreNames.contains('auditLogs')) {
                    const auditStore = db.createObjectStore('auditLogs', { 
                        keyPath: 'id'
                    });
                    auditStore.createIndex('timestamp', 'timestamp', { unique: false });
                    auditStore.createIndex('userId', 'userId', { unique: false });
                    auditStore.createIndex('projectId', 'projectId', { unique: false });
                    auditStore.createIndex('action', 'action', { unique: false });
                    auditStore.createIndex('category', 'category', { unique: false });
                    // Compound index för projektspecifik sökning
                    auditStore.createIndex('project_timestamp', ['projectId', 'timestamp'], { unique: false });
                    console.log('✅ Created "auditLogs" object store');
                }
            };
        });
    },
    
    /**
     * Hämta ett objekt med ID
     * @async
     * @param {string} store - Object store namn
     * @param {number|string} id - Object ID
     * @returns {Promise<object|null>}
     */
    async get(store, id) {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([store], 'readonly');
            const objectStore = transaction.objectStore(store);
            const tryNumeric = typeof id === 'string' && id.trim() !== '' && !Number.isNaN(Number(id));
            
            const getByKey = (key, allowFallback) => {
                const request = objectStore.get(key);
                request.onsuccess = () => {
                    if (request.result || !allowFallback) {
                        resolve(request.result || null);
                        return;
                    }
                    const numericKey = Number(id);
                    const request2 = objectStore.get(numericKey);
                    request2.onsuccess = () => resolve(request2.result || null);
                    request2.onerror = () => reject(request2.error);
                };
                request.onerror = () => reject(request.error);
            };
            
            getByKey(id, tryNumeric);
        });
    },
    
    /**
     * Hämta alla objekt från ett store
     * @async
     * @param {string} store - Object store namn
     * @returns {Promise<Array>}
     */
    async getAll(store) {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([store], 'readonly');
            const objectStore = transaction.objectStore(store);
            const request = objectStore.getAll();
            
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    },
    
    /**
     * Spara ett objekt (skapa eller uppdatera)
     * @async
     * @param {string} store - Object store namn
     * @param {object} data - Objektdata
     * @returns {Promise<object>} Sparat objekt med ID
     */
    async save(store, data) {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([store], 'readwrite');
            const objectStore = transaction.objectStore(store);
            
            let request;
            // Hantera både nummer-ID (projects med autoIncrement) och string-ID (users, sessions, audit)
            if (data.id) {
                // Uppdatering eller insättning med befintligt ID
                request = objectStore.put(data);
            } else {
                // Ny insättning utan ID (autoIncrement för projects)
                const dataToSave = { ...data };
                delete dataToSave.id;
                request = objectStore.add(dataToSave);
            }
            
            request.onsuccess = () => {
                const savedData = { ...data };
                if (!data.id) {
                    savedData.id = request.result;
                }
                console.log(`✅ Saved ${store} with ID: ${savedData.id}`);
                resolve(savedData);
            };
            
            request.onerror = () => {
                console.error(`❌ Error saving ${store}:`, request.error);
                reject(request.error);
            };
        });
    },
    
    /**
     * Ta bort ett objekt
     * @async
     * @param {string} store - Object store namn
     * @param {number|string} id - Object ID
     * @returns {Promise<void>}
     */
    async delete(store, id) {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([store], 'readwrite');
            const objectStore = transaction.objectStore(store);
            const request = objectStore.delete(parseInt(id) || id);
            
            request.onsuccess = () => {
                console.log(`✅ Deleted ${store} with ID: ${id}`);
                resolve();
            };
            
            request.onerror = () => {
                console.error(`❌ Error deleting ${store}:`, request.error);
                reject(request.error);
            };
        });
    },
    
    /**
     * Sök/filtrera objekt
     * @async
     * @param {string} store - Object store namn
     * @param {object} query - Sökkriterier
     * @returns {Promise<Array>}
     */
    async query(store, query) {
        const all = await this.getAll(store);
        
        // Enkel filterlogik - kan utökas för mer avancerade frågor
        return all.filter(item => {
            for (const [key, value] of Object.entries(query)) {
                if (item[key] !== value) return false;
            }
            return true;
        });
    },
    
    /**
     * Hämta objekt via index
     * @async
     * @param {string} store - Object store namn
     * @param {string} indexName - Index namn
     * @param {any} value - Sökvärde
     * @returns {Promise<object|null>}
     */
    async getByIndex(store, indexName, value) {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([store], 'readonly');
            const objectStore = transaction.objectStore(store);
            const index = objectStore.index(indexName);
            const request = index.get(value);
            
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    },
    
    /**
     * Hämta alla objekt via index
     * @async
     * @param {string} store - Object store namn
     * @param {string} indexName - Index namn
     * @param {any} value - Sökvärde
     * @returns {Promise<Array>}
     */
    async getAllByIndex(store, indexName, value) {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([store], 'readonly');
            const objectStore = transaction.objectStore(store);
            const index = objectStore.index(indexName);
            const request = index.getAll(value);
            
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    },
    
    /**
     * Hämta objekt inom ett datumintervall (för audit logs)
     * @async
     * @param {string} store - Object store namn
     * @param {string} indexName - Index namn (t.ex. 'timestamp')
     * @param {string} startDate - Start ISO8601 timestamp
     * @param {string} endDate - Slut ISO8601 timestamp
     * @returns {Promise<Array>}
     */
    async getByDateRange(store, indexName, startDate, endDate) {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([store], 'readonly');
            const objectStore = transaction.objectStore(store);
            const index = objectStore.index(indexName);
            const range = IDBKeyRange.bound(startDate, endDate);
            const request = index.getAll(range);
            
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    },
    
    /**
     * Räkna antal objekt i ett store
     * @async
     * @param {string} store - Object store namn
     * @returns {Promise<number>}
     */
    async count(store) {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([store], 'readonly');
            const objectStore = transaction.objectStore(store);
            const request = objectStore.count();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
};

// Validera att adapter implementerar interface
validateAdapter(IndexedDBAdapter);

export default IndexedDBAdapter;
