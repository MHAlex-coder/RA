/**
 * Base Repository
 * Abstrakt bas för alla repositories
 * 
 * Tillhandahåller gemensam logik för CRUD-operationer och
 * delegerar faktisk lagring till en adapter.
 */

/**
 * Skapa en repository för en specifik entity-typ
 * 
 * @param {string} storeName - Objektlagringsnamn (t.ex. 'projects')
 * @param {object} adapter - DataAdapter instans
 * @returns {object} Repository instans
 */
export function createBaseRepository(storeName, adapter) {
    return {
        storeName,
        adapter,
        
        /**
         * Skapa ny entitet
         * @returns {object} Ny entitet
         */
        create() {
            throw new Error('create() must be implemented in specific repository');
        },
        
        /**
         * Hämta entitet med ID
         * @async
         * @param {number|string} id
         * @returns {Promise<object|null>}
         */
        async getById(id) {
            return this.adapter.get(this.storeName, id);
        },
        
        /**
         * Hämta alla entiteter
         * @async
         * @returns {Promise<Array>}
         */
        async getAll() {
            return this.adapter.getAll(this.storeName);
        },
        
        /**
         * Spara entitet
         * @async
         * @param {object} entity
         * @returns {Promise<object>}
         */
        async save(entity) {
            if (!entity) {
                throw new Error('Cannot save null/undefined entity');
            }
            
            // Uppdatera metadata
            if (!entity.id) {
                entity.meta = entity.meta || {};
                entity.meta.created = new Date().toISOString();
            }
            if (entity.meta) {
                entity.meta.lastModified = new Date().toISOString();
            }
            
            return this.adapter.save(this.storeName, entity);
        },
        
        /**
         * Ta bort entitet
         * @async
         * @param {number|string} id
         * @returns {Promise<void>}
         */
        async delete(id) {
            return this.adapter.delete(this.storeName, id);
        },
        
        /**
         * Sök entiteter
         * @async
         * @param {object} query
         * @returns {Promise<Array>}
         */
        async query(query) {
            return this.adapter.query(this.storeName, query);
        }
    };
}

export default createBaseRepository;
