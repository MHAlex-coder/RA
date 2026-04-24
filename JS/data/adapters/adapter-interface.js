/**
 * DataAdapter Interface
 * Alla datapersistence-adapters måste implementera dessa metoder
 * 
 * Detta är ett abstrakt kontrakt som IndexedDB, SQLite, HTTP och andra adapters
 * måste följa för att möjliggöra utbytbarhet.
 */

/**
 * @interface DataAdapter
 */
export const DataAdapterInterface = {
    /**
     * Initialisera adapter (anslut till databas, sätt upp schema, etc.)
     * 
     * @async
     * @returns {Promise<void>}
     * @throws {Error} Om initialisering misslyckas
     */
    async init() {
        throw new Error('init() not implemented in adapter');
    },
    
    /**
     * Hämta ett objekt med ID
     * 
     * @async
     * @param {string} store - Objektlagringsnamn (t.ex. 'projects', 'risks')
     * @param {number|string} id - Objekt-ID
     * @returns {Promise<object|null>} Objektet eller null om inte hittat
     * @throws {Error} Om hämtningen misslyckas
     */
    async get(store, id) {
        throw new Error('get() not implemented in adapter');
    },
    
    /**
     * Hämta alla objekt från en store
     * 
     * @async
     * @param {string} store - Objektlagringsnamn
     * @returns {Promise<Array>} Array av objekt
     * @throws {Error} Om hämtningen misslyckas
     */
    async getAll(store) {
        throw new Error('getAll() not implemented in adapter');
    },
    
    /**
     * Spara ett objekt (skapa eller uppdatera)
     * 
     * @async
     * @param {string} store - Objektlagringsnamn
     * @param {object} data - Objektdata att spara
     * @returns {Promise<object>} Sparat objekt med ID satt
     * @throws {Error} Om sparningen misslyckas
     */
    async save(store, data) {
        throw new Error('save() not implemented in adapter');
    },
    
    /**
     * Ta bort ett objekt
     * 
     * @async
     * @param {string} store - Objektlagringsnamn
     * @param {number|string} id - Objekt-ID
     * @returns {Promise<void>}
     * @throws {Error} Om borttagningen misslyckas
     */
    async delete(store, id) {
        throw new Error('delete() not implemented in adapter');
    },
    
    /**
     * Sök/filtrera objekt
     * 
     * @async
     * @param {string} store - Objektlagringsnamn
     * @param {object} query - Sökkriterier
     * @returns {Promise<Array>} Matchande objekt
     * @throws {Error} Om sökningen misslyckas
     */
    async query(store, query) {
        throw new Error('query() not implemented in adapter');
    }
};

/**
 * Kontrollera att en adapter implementerar interface
 * 
 * @param {object} adapter - Adapter att validera
 * @throws {Error} Om adapter saknar någon metod
 */
export function validateAdapter(adapter) {
    const requiredMethods = ['init', 'get', 'getAll', 'save', 'delete', 'query'];
    
    for (const method of requiredMethods) {
        if (typeof adapter[method] !== 'function') {
            throw new Error(`Adapter saknar metod: ${method}`);
        }
    }
}
