/**
 * Session Repository
 * Hanterar alla sessionsrelaterade operationer
 * 
 * Denna repository hanterar användarsessioner för autentisering.
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
 * Generera ett kryptografiskt säkert token
 * @returns {string} Säkert token
 */
function generateSecureToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Session-konfiguration
 */
const SESSION_CONFIG = {
    // Session gäller i 24 timmar
    expirationMs: 24 * 60 * 60 * 1000,
    // Förnya session om mindre än 1 timme kvar
    renewThresholdMs: 60 * 60 * 1000
};

/**
 * Skapa en tom sessionsmall
 * @returns {object} Tomt sessionsobjekt
 */
export function createEmptySession() {
    return {
        id: null,
        userId: '',
        created: new Date().toISOString(),
        expires: null,
        lastActivity: new Date().toISOString(),
        userAgent: '',
        ipAddress: null
    };
}

/**
 * Skapa SessionRepository
 * 
 * @param {object} adapter - DataAdapter instans
 * @returns {object} SessionRepository instans
 */
export default function createSessionRepository(adapter) {
    const storeName = 'sessions';
    const base = createBaseRepository(storeName, adapter);
    
    return {
        ...base,
        
        /**
         * Skapa ny session för användare
         * @async
         * @param {string} userId - Användar-ID
         * @param {object} options - Extra alternativ (userAgent, ipAddress)
         * @returns {Promise<object>} Skapad session
         */
        async createSession(userId, options = {}) {
            if (!userId) {
                throw new Error('Användar-ID krävs för att skapa session');
            }
            
            const now = new Date();
            const expires = new Date(now.getTime() + SESSION_CONFIG.expirationMs);
            
            const session = {
                id: generateSecureToken(),
                userId,
                created: now.toISOString(),
                expires: expires.toISOString(),
                lastActivity: now.toISOString(),
                userAgent: options.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : ''),
                ipAddress: options.ipAddress || null
            };
            
            return adapter.save(storeName, session);
        },
        
        /**
         * Hämta session med ID
         * @async
         * @param {string} sessionId - Session-ID (token)
         * @returns {Promise<object|null>}
         */
        async getSession(sessionId) {
            return adapter.get(storeName, sessionId);
        },
        
        /**
         * Validera session
         * @async
         * @param {string} sessionId - Session-ID (token)
         * @returns {Promise<object|null>} Session om giltig, annars null
         */
        async validateSession(sessionId) {
            const session = await this.getSession(sessionId);
            
            if (!session) {
                return null;
            }
            
            const now = new Date();
            const expires = new Date(session.expires);
            
            // Kontrollera om sessionen har gått ut
            if (now > expires) {
                // Ta bort utgången session
                await this.invalidateSession(sessionId);
                return null;
            }
            
            // Uppdatera lastActivity
            session.lastActivity = now.toISOString();
            
            // Förnya session om nära utgång
            const timeLeft = expires.getTime() - now.getTime();
            if (timeLeft < SESSION_CONFIG.renewThresholdMs) {
                session.expires = new Date(now.getTime() + SESSION_CONFIG.expirationMs).toISOString();
                console.log('🔄 Session renewed');
            }
            
            await adapter.save(storeName, session);
            return session;
        },
        
        /**
         * Invalidera (radera) session
         * @async
         * @param {string} sessionId - Session-ID
         * @returns {Promise<void>}
         */
        async invalidateSession(sessionId) {
            await adapter.delete(storeName, sessionId);
            console.log('🚪 Session invalidated');
        },
        
        /**
         * Invalidera alla sessioner för en användare
         * @async
         * @param {string} userId - Användar-ID
         * @returns {Promise<number>} Antal raderade sessioner
         */
        async invalidateAllUserSessions(userId) {
            const sessions = await adapter.getAllByIndex(storeName, 'userId', userId);
            
            let count = 0;
            for (const session of sessions) {
                await adapter.delete(storeName, session.id);
                count++;
            }
            
            console.log(`🚪 Invalidated ${count} sessions for user ${userId}`);
            return count;
        },
        
        /**
         * Hämta alla sessioner för en användare
         * @async
         * @param {string} userId - Användar-ID
         * @returns {Promise<Array>}
         */
        async getUserSessions(userId) {
            return adapter.getAllByIndex(storeName, 'userId', userId);
        },
        
        /**
         * Rensa utgångna sessioner
         * @async
         * @returns {Promise<number>} Antal raderade sessioner
         */
        async cleanupExpiredSessions() {
            const allSessions = await adapter.getAll(storeName);
            const now = new Date();
            
            let count = 0;
            for (const session of allSessions) {
                const expires = new Date(session.expires);
                if (now > expires) {
                    await adapter.delete(storeName, session.id);
                    count++;
                }
            }
            
            if (count > 0) {
                console.log(`🧹 Cleaned up ${count} expired sessions`);
            }
            
            return count;
        },
        
        /**
         * Hämta aktiv session från storage (localStorage)
         * @returns {string|null} Session-ID
         */
        getStoredSessionId() {
            if (typeof localStorage === 'undefined') {
                return null;
            }
            return localStorage.getItem('sessionId');
        },
        
        /**
         * Spara session i storage (localStorage)
         * @param {string} sessionId - Session-ID
         */
        storeSessionId(sessionId) {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('sessionId', sessionId);
            }
        },
        
        /**
         * Ta bort session från storage
         */
        clearStoredSessionId() {
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem('sessionId');
            }
        },
        
        /**
         * Räkna aktiva sessioner
         * @async
         * @returns {Promise<number>}
         */
        async countActiveSessions() {
            const allSessions = await adapter.getAll(storeName);
            const now = new Date();
            
            return allSessions.filter(session => {
                const expires = new Date(session.expires);
                return now <= expires;
            }).length;
        }
    };
}
