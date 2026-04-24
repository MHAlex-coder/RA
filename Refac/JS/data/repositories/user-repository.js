/**
 * User Repository
 * Hanterar alla användarrelaterade CRUD-operationer
 * 
 * Denna repository erbjuder gränssnitt för användarhantering
 * och delegerar arbetet till en DataAdapter.
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
 * Skapa en tom användarmall
 * @returns {object} Tomt användarobjekt
 */
export function createEmptyUser() {
    return {
        id: null,
        username: '',
        passwordHash: '',
        email: '',
        fullName: '',
        role: 'user',
        isActive: true,
        created: new Date().toISOString(),
        lastLogin: null,
        preferences: {
            language: 'sv',
            theme: 'light',
            autoSaveInterval: 30000
        }
    };
}

/**
 * Tillgängliga roller med behörigheter
 */
export const ROLES = {
    admin: {
        name: 'Administratör',
        permissions: [
            'user.create',
            'user.update',
            'user.delete',
            'user.list',
            'project.create',
            'project.update',
            'project.delete',
            'project.export',
            'project.import',
            'risk.create',
            'risk.update',
            'risk.delete',
            'audit.view',
            'audit.export',
            'settings.manage'
        ]
    },
    user: {
        name: 'Användare',
        permissions: [
            'project.create',
            'project.update',
            'project.export',
            'risk.create',
            'risk.update',
            'risk.delete',
            'audit.view.own'
        ]
    },
    viewer: {
        name: 'Läsare',
        permissions: [
            'project.view',
            'risk.view',
            'audit.view.own'
        ]
    }
};

/**
 * Skapa UserRepository
 * 
 * @param {object} adapter - DataAdapter instans
 * @returns {object} UserRepository instans
 */
export default function createUserRepository(adapter) {
    const storeName = 'users';
    const base = createBaseRepository(storeName, adapter);
    
    return {
        ...base,
        
        /**
         * Skapa tom användare (override base create)
         * @returns {object} Tom användare
         */
        create() {
            return createEmptyUser();
        },
        
        /**
         * Skapa ny användare
         * @async
         * @param {object} userData - Användardata
         * @returns {Promise<object>} Skapad användare
         */
        async createUser(userData) {
            // Validera required fields
            if (!userData.username) {
                throw new Error('Användarnamn krävs');
            }
            if (!userData.passwordHash) {
                throw new Error('Lösenord krävs');
            }
            if (!userData.email) {
                throw new Error('E-post krävs');
            }
            
            // Kontrollera att användarnamnet är ledigt
            const existing = await this.getUserByUsername(userData.username);
            if (existing) {
                throw new Error('Användarnamnet är redan taget');
            }
            
            // Kontrollera att e-posten är ledig
            const existingEmail = await adapter.getByIndex(storeName, 'email', userData.email);
            if (existingEmail) {
                throw new Error('E-postadressen är redan registrerad');
            }
            
            // Skapa användare med genererat ID
            const user = {
                ...createEmptyUser(),
                ...userData,
                id: generateUUID(),
                created: new Date().toISOString()
            };
            
            return adapter.save(storeName, user);
        },
        
        /**
         * Hämta användare med ID
         * @async
         * @param {string} id - Användar-ID
         * @returns {Promise<object|null>}
         */
        async getUserById(id) {
            return adapter.get(storeName, id);
        },
        
        /**
         * Hämta användare med användarnamn
         * @async
         * @param {string} username - Användarnamn
         * @returns {Promise<object|null>}
         */
        async getUserByUsername(username) {
            return adapter.getByIndex(storeName, 'username', username);
        },
        
        /**
         * Hämta användare med e-post
         * @async
         * @param {string} email - E-postadress
         * @returns {Promise<object|null>}
         */
        async getUserByEmail(email) {
            return adapter.getByIndex(storeName, 'email', email);
        },
        
        /**
         * Uppdatera användare
         * @async
         * @param {object} user - Uppdaterad användardata
         * @returns {Promise<object>}
         */
        async updateUser(user) {
            if (!user.id) {
                throw new Error('Användar-ID krävs för uppdatering');
            }
            
            // Kontrollera att användaren finns
            const existing = await this.getUserById(user.id);
            if (!existing) {
                throw new Error('Användaren finns inte');
            }
            
            // Om användarnamn ändras, kontrollera att det är ledigt
            if (user.username !== existing.username) {
                const usernameCheck = await this.getUserByUsername(user.username);
                if (usernameCheck) {
                    throw new Error('Användarnamnet är redan taget');
                }
            }
            
            // Om e-post ändras, kontrollera att den är ledig
            if (user.email !== existing.email) {
                const emailCheck = await this.getUserByEmail(user.email);
                if (emailCheck) {
                    throw new Error('E-postadressen är redan registrerad');
                }
            }
            
            return adapter.save(storeName, user);
        },
        
        /**
         * Ta bort användare
         * @async
         * @param {string} id - Användar-ID
         * @returns {Promise<void>}
         */
        async deleteUser(id) {
            const user = await this.getUserById(id);
            if (!user) {
                throw new Error('Användaren finns inte');
            }
            
            return adapter.delete(storeName, id);
        },
        
        /**
         * Lista alla användare
         * @async
         * @returns {Promise<Array>}
         */
        async listUsers() {
            const users = await adapter.getAll(storeName);
            // Ta bort passwordHash från resultatet
            return users.map(user => {
                const { passwordHash, ...safeUser } = user;
                return safeUser;
            });
        },
        
        /**
         * Lista användare med specifik roll
         * @async
         * @param {string} role - Roll att filtrera på
         * @returns {Promise<Array>}
         */
        async listUsersByRole(role) {
            const users = await adapter.getAllByIndex(storeName, 'role', role);
            return users.map(user => {
                const { passwordHash, ...safeUser } = user;
                return safeUser;
            });
        },
        
        /**
         * Validera användaruppgifter (för inloggning)
         * @async
         * @param {string} username - Användarnamn
         * @param {string} passwordHash - Hashat lösenord (skall vara förhashat i auth-service)
         * @returns {Promise<object|null>} Användare om giltig, annars null
         */
        async validateCredentials(username, passwordHash) {
            const user = await this.getUserByUsername(username);
            
            if (!user) {
                return null;
            }
            
            if (!user.isActive) {
                return null;
            }
            
            if (user.passwordHash !== passwordHash) {
                return null;
            }
            
            // Uppdatera lastLogin
            user.lastLogin = new Date().toISOString();
            await adapter.save(storeName, user);
            
            // Returnera användare utan passwordHash
            const { passwordHash: _, ...safeUser } = user;
            return safeUser;
        },
        
        /**
         * Uppdatera lösenord
         * @async
         * @param {string} userId - Användar-ID
         * @param {string} newPasswordHash - Nytt hashat lösenord
         * @returns {Promise<void>}
         */
        async updatePassword(userId, newPasswordHash) {
            const user = await this.getUserById(userId);
            if (!user) {
                throw new Error('Användaren finns inte');
            }
            
            user.passwordHash = newPasswordHash;
            await adapter.save(storeName, user);
        },
        
        /**
         * Aktivera/inaktivera användare
         * @async
         * @param {string} userId - Användar-ID
         * @param {boolean} isActive - Ny status
         * @returns {Promise<object>}
         */
        async setUserActive(userId, isActive) {
            const user = await this.getUserById(userId);
            if (!user) {
                throw new Error('Användaren finns inte');
            }
            
            user.isActive = isActive;
            return adapter.save(storeName, user);
        },
        
        /**
         * Räkna antal användare
         * @async
         * @returns {Promise<number>}
         */
        async countUsers() {
            return adapter.count(storeName);
        },
        
        /**
         * Kontrollera om det finns några användare (för first-run detection)
         * @async
         * @returns {Promise<boolean>}
         */
        async hasUsers() {
            const count = await this.countUsers();
            return count > 0;
        },
        
        /**
         * Kontrollera om användare har en viss behörighet
         * @param {object} user - Användare
         * @param {string} permission - Behörighet att kontrollera
         * @returns {boolean}
         */
        hasPermission(user, permission) {
            if (!user || !user.role) {
                return false;
            }
            
            const role = ROLES[user.role];
            if (!role) {
                return false;
            }
            
            return role.permissions.includes(permission);
        },
        
        /**
         * Hämta rollnamn
         * @param {string} roleId - Roll-ID
         * @returns {string} Rollnamn
         */
        getRoleName(roleId) {
            const role = ROLES[roleId];
            return role ? role.name : roleId;
        }
    };
}
