/**
 * Auth Service
 * Hanterar autentisering och sessioner
 * 
 * Detta är det centrala auth-lagret som koordinerar mellan
 * UserRepository, SessionRepository och AuditRepository.
 */

import { getUserRepository, getSessionRepository, getAuditRepository, ROLES } from '../../data/index.js';
import { hashPassword, verifyPassword, checkPasswordStrength, isValidEmail, validateUsername } from './password-utils.js';

/**
 * Aktuell användare och session (in-memory state)
 */
let currentUser = null;
let currentSession = null;
let authInitialized = false;

/**
 * Auth event listeners
 */
const authListeners = {
    login: [],
    logout: [],
    sessionExpired: []
};

/**
 * Lägg till auth event listener
 * @param {string} event - Event typ ('login', 'logout', 'sessionExpired')
 * @param {Function} callback - Callback funktion
 */
export function onAuthEvent(event, callback) {
    if (authListeners[event]) {
        authListeners[event].push(callback);
    }
}

/**
 * Ta bort auth event listener
 * @param {string} event - Event typ
 * @param {Function} callback - Callback att ta bort
 */
export function offAuthEvent(event, callback) {
    if (authListeners[event]) {
        authListeners[event] = authListeners[event].filter(cb => cb !== callback);
    }
}

/**
 * Trigga auth event
 * @param {string} event - Event typ
 * @param {any} data - Event data
 */
function emitAuthEvent(event, data) {
    if (authListeners[event]) {
        authListeners[event].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Auth event listener error (${event}):`, error);
            }
        });
    }
}

/**
 * Säkerställ att en default admin-användare finns
 * Skapar eller uppdaterar admin med lösenord 123456789
 * @async
 */
async function ensureDefaultAdmin() {
    const userRepo = getUserRepository();
    
    try {
        // Försök hitta befintlig admin
        let admin = await userRepo.getUserByUsername('admin');
        const salt = '';
        const passwordHash = await hashPassword('123456789', salt);
        
        if (admin) {
            // Uppdatera befintlig admin
            console.log('🔄 Uppdaterar befintlig admin-användare...');
            admin.passwordHash = passwordHash;
            admin.salt = salt;
            admin.role = 'admin';
            admin.fullName = 'Administrator';
            admin.isActive = true;
            admin.updatedAt = new Date().toISOString();
            if (!admin.email) {
                admin.email = 'admin@local.invalid';
            }
            await userRepo.save(admin);
            console.log('✅ Admin-användare uppdaterad (användarnamn: admin, lösenord: 123456789)');
        } else {
            // Skapa ny admin
            console.log('📝 Skapar ny admin-användare...');
            await userRepo.createUser({
                username: 'admin',
                email: 'admin@local.invalid',
                fullName: 'Administrator',
                role: 'admin',
                passwordHash,
                salt,
                isActive: true
            });
            console.log('✅ Admin-användare skapad (användarnamn: admin, lösenord: 123456789)');
        }
    } catch (error) {
        console.error('❌ Kunde inte säkerställa admin-användare:', error);
    }
}

/**
 * Initialisera auth service
 * Kontrollerar om det finns en sparad session och återställer den
 * @async
 * @returns {Promise<boolean>} True om en giltig session hittades
 */
export async function initializeAuth() {
    console.log('🔐 Initializing auth service...');
    
    // Skapa default admin om inga användare finns
    await ensureDefaultAdmin();
    
    try {
        const sessionRepo = getSessionRepository();
        
        // Hämta sparad session ID från localStorage
        const storedSessionId = sessionRepo.getStoredSessionId();
        
        if (storedSessionId) {
            // Validera sessionen
            const session = await sessionRepo.validateSession(storedSessionId);
            
            if (session) {
                // Hämta användaren
                const userRepo = getUserRepository();
                const user = await userRepo.getUserById(session.userId);
                
                if (user && user.isActive) {
                    currentUser = user;
                    currentSession = session;
                    authInitialized = true;
                    console.log(`✅ Session restored for user: ${user.fullName}`);
                    emitAuthEvent('login', { user, session });
                    return true;
                }
            }
            
            // Ogiltig session - rensa
            sessionRepo.clearStoredSessionId();
        }
        
        authInitialized = true;
        console.log('ℹ️ No valid session found');
        return false;
        
    } catch (error) {
        console.error('❌ Auth initialization error:', error);
        authInitialized = true;
        return false;
    }
}

/**
 * Logga in användare
 * @async
 * @param {string} username - Användarnamn
 * @param {string} password - Lösenord (klartext)
 * @returns {Promise<Object>} { user, session }
 * @throws {Error} Om inloggning misslyckas
 */
export async function login(username, password) {
    const userRepo = getUserRepository();
    const sessionRepo = getSessionRepository();
    const auditRepo = getAuditRepository();
    
    try {
        // Hämta användare
        const user = await userRepo.getUserByUsername(username);
        
        if (!user) {
            await auditRepo.logLogin({ username }, false);
            throw new Error('Ogiltigt användarnamn eller lösenord');
        }
        
        if (!user.isActive) {
            await auditRepo.logLogin(user, false);
            throw new Error('Kontot är inaktiverat');
        }
        
        // Verifiera lösenord
        const passwordHash = await hashPassword(password, user.salt || '');
        
        if (user.passwordHash !== passwordHash) {
            await auditRepo.logLogin(user, false);
            throw new Error('Ogiltigt användarnamn eller lösenord');
        }
        
        // Uppdatera lastLogin
        user.lastLogin = new Date().toISOString();
        await userRepo.updateUser(user);
        
        // Skapa session
        const session = await sessionRepo.createSession(user.id, {
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
        });
        
        // Spara session ID
        sessionRepo.storeSessionId(session.id);
        
        // Uppdatera state
        const { passwordHash: _, salt: __, ...safeUser } = user;
        currentUser = safeUser;
        currentSession = session;
        
        // Logga
        await auditRepo.logLogin(safeUser, true);
        
        console.log(`✅ User logged in: ${safeUser.fullName}`);
        emitAuthEvent('login', { user: safeUser, session });
        
        return { user: safeUser, session };
        
    } catch (error) {
        console.error('❌ Login failed:', error.message);
        throw error;
    }
}

/**
 * Logga ut användare
 * @async
 * @returns {Promise<void>}
 */
export async function logout() {
    const sessionRepo = getSessionRepository();
    const auditRepo = getAuditRepository();
    
    try {
        if (currentSession) {
            // Invalidera session
            await sessionRepo.invalidateSession(currentSession.id);
        }
        
        if (currentUser) {
            await auditRepo.logLogout(currentUser);
        }
        
        // Rensa localStorage
        sessionRepo.clearStoredSessionId();
        
        const user = currentUser;
        
        // Rensa state
        currentUser = null;
        currentSession = null;
        
        console.log('🚪 User logged out');
        emitAuthEvent('logout', { user });
        
    } catch (error) {
        console.error('❌ Logout error:', error);
        // Rensa ändå
        currentUser = null;
        currentSession = null;
        getSessionRepository().clearStoredSessionId();
    }
}

/**
 * Hämta nuvarande användare
 * @returns {Object|null} Användare eller null
 */
export function getCurrentUser() {
    return currentUser;
}

/**
 * Hämta nuvarande session
 * @returns {Object|null} Session eller null
 */
export function getCurrentSession() {
    return currentSession;
}

/**
 * Kontrollera om användare är inloggad
 * @returns {boolean}
 */
export function isAuthenticated() {
    return currentUser !== null && currentSession !== null;
}

/**
 * Kontrollera om auth service är initialiserad
 * @returns {boolean}
 */
export function isAuthInitialized() {
    return authInitialized;
}

/**
 * Kontrollera om användaren har en viss behörighet
 * @param {string} permission - Behörighet att kontrollera
 * @returns {boolean}
 */
export function hasPermission(permission) {
    if (!currentUser || !currentUser.role) {
        return false;
    }
    
    const role = ROLES[currentUser.role];
    if (!role) {
        return false;
    }
    
    return role.permissions.includes(permission);
}

/**
 * Kontrollera om användaren har en av flera behörigheter
 * @param {string[]} permissions - Behörigheter att kontrollera
 * @returns {boolean}
 */
export function hasAnyPermission(permissions) {
    return permissions.some(permission => hasPermission(permission));
}

/**
 * Kontrollera om användaren har alla behörigheter
 * @param {string[]} permissions - Behörigheter att kontrollera
 * @returns {boolean}
 */
export function hasAllPermissions(permissions) {
    return permissions.every(permission => hasPermission(permission));
}

/**
 * Kontrollera om användaren är admin
 * @returns {boolean}
 */
export function isAdmin() {
    return currentUser?.role === 'admin';
}

/**
 * Registrera ny användare (endast admin)
 * @async
 * @param {Object} userData - Användardata
 * @returns {Promise<Object>} Skapad användare
 */
export async function registerUser(userData) {
    const userRepo = getUserRepository();
    
    // Tillåt första registrering utan behörigheter
    const users = await userRepo.getAll();
    const isFirstUser = users.length === 0;
    
    // Kontrollera behörigheter för icke-första-användarfall
    if (!isFirstUser && !hasPermission('user.create')) {
        throw new Error('Du har inte behörighet att skapa användare');
    }
    
    const auditRepo = getAuditRepository();
    
    // Validera
    const usernameValidation = validateUsername(userData.username);
    if (!usernameValidation.isValid) {
        throw new Error(usernameValidation.errors.join(', '));
    }
    
    if (!isValidEmail(userData.email)) {
        throw new Error('Ogiltig e-postadress');
    }
    
    const passwordStrength = checkPasswordStrength(userData.password);
    if (!passwordStrength.isValid) {
        throw new Error(passwordStrength.errors.join(', '));
    }
    
    // Hasha lösenord
    const salt = '';  // Kan använda generateSalt() i framtiden
    const passwordHash = await hashPassword(userData.password, salt);
    
    // Skapa användare
    const user = await userRepo.createUser({
        username: userData.username,
        email: userData.email,
        fullName: userData.fullName,
        role: userData.role || 'user',
        passwordHash,
        salt,
        isActive: true
    });
    
    // Logga
    await auditRepo.logAction({
        userId: currentUser?.id,
        userName: currentUser?.fullName,
        action: 'create',
        category: 'user',
        entityId: user.id,
        entityName: user.fullName,
        summary: `Skapade användare: ${user.fullName} (${user.role})`
    });
    
    // Ta bort känsliga fält
    const { passwordHash: _, salt: __, ...safeUser } = user;
    return safeUser;
}

/**
 * Uppdatera användarlösenord
 * @async
 * @param {string} userId - Användar-ID
 * @param {string} currentPassword - Nuvarande lösenord (för verifiering)
 * @param {string} newPassword - Nytt lösenord
 * @returns {Promise<void>}
 */
export async function changePassword(userId, currentPassword, newPassword) {
    const userRepo = getUserRepository();
    const sessionRepo = getSessionRepository();
    const auditRepo = getAuditRepository();
    
    // Kontrollera behörighet
    if (currentUser?.id !== userId && !hasPermission('user.update')) {
        throw new Error('Du har inte behörighet att ändra detta lösenord');
    }
    
    // Hämta användare
    const user = await userRepo.getUserById(userId);
    if (!user) {
        throw new Error('Användaren finns inte');
    }
    
    // Verifiera nuvarande lösenord (om användaren ändrar sitt eget)
    if (currentUser?.id === userId) {
        const currentHash = await hashPassword(currentPassword, user.salt || '');
        if (user.passwordHash !== currentHash) {
            throw new Error('Nuvarande lösenord är felaktigt');
        }
    }
    
    // Validera nytt lösenord
    const passwordStrength = checkPasswordStrength(newPassword);
    if (!passwordStrength.isValid) {
        throw new Error(passwordStrength.errors.join(', '));
    }
    
    // Uppdatera lösenord
    const newHash = await hashPassword(newPassword, user.salt || '');
    await userRepo.updatePassword(userId, newHash);
    
    // Invalidera alla sessioner (tvinga ny inloggning)
    await sessionRepo.invalidateAllUserSessions(userId);
    
    // Logga
    await auditRepo.logAction({
        userId: currentUser?.id,
        userName: currentUser?.fullName,
        action: 'update',
        category: 'user',
        entityId: userId,
        entityName: user.fullName,
        summary: `Ändrade lösenord för: ${user.fullName}`
    });
    
    console.log(`✅ Password changed for user: ${user.fullName}`);
}

/**
 * Kontrollera om det finns några användare (för first-run)
 * @async
 * @returns {Promise<boolean>}
 */
export async function hasUsers() {
    const userRepo = getUserRepository();
    return userRepo.hasUsers();
}

/**
 * Skapa initial admin-användare (endast vid first-run)
 * @async
 * @param {Object} adminData - Admin-data
 * @returns {Promise<Object>} Skapad admin och session
 */
export async function createInitialAdmin(adminData) {
    const userRepo = getUserRepository();
    const auditRepo = getAuditRepository();
    
    // Kontrollera att inga användare finns
    const usersExist = await userRepo.hasUsers();
    if (usersExist) {
        throw new Error('Det finns redan användare i systemet');
    }
    
    // Validera
    const usernameValidation = validateUsername(adminData.username);
    if (!usernameValidation.isValid) {
        throw new Error(usernameValidation.errors.join(', '));
    }
    
    if (!isValidEmail(adminData.email)) {
        throw new Error('Ogiltig e-postadress');
    }
    
    const passwordStrength = checkPasswordStrength(adminData.password);
    if (!passwordStrength.isValid) {
        throw new Error(passwordStrength.errors.join(', '));
    }
    
    // Hasha lösenord
    const salt = '';
    const passwordHash = await hashPassword(adminData.password, salt);
    
    // Skapa admin
    const admin = await userRepo.createUser({
        username: adminData.username,
        email: adminData.email,
        fullName: adminData.fullName,
        role: 'admin',
        passwordHash,
        salt,
        isActive: true
    });
    
    // Logga
    await auditRepo.logAction({
        userId: admin.id,
        userName: admin.fullName,
        action: 'create',
        category: 'system',
        entityId: admin.id,
        entityName: admin.fullName,
        summary: `Första administratören skapad: ${admin.fullName}`
    });
    
    console.log(`✅ Initial admin created: ${admin.fullName}`);
    
    // Auto-login
    const result = await login(adminData.username, adminData.password);
    
    return result;
}

/**
 * Validera aktuell session
 * @async
 * @returns {Promise<boolean>}
 */
export async function validateCurrentSession() {
    if (!currentSession) {
        return false;
    }
    
    const sessionRepo = getSessionRepository();
    const validSession = await sessionRepo.validateSession(currentSession.id);
    
    if (!validSession) {
        // Session har gått ut
        currentUser = null;
        currentSession = null;
        sessionRepo.clearStoredSessionId();
        emitAuthEvent('sessionExpired', {});
        return false;
    }
    
    currentSession = validSession;
    return true;
}

export default {
    initializeAuth,
    login,
    logout,
    getCurrentUser,
    getCurrentSession,
    isAuthenticated,
    isAuthInitialized,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    registerUser,
    changePassword,
    hasUsers,
    createInitialAdmin,
    validateCurrentSession,
    onAuthEvent,
    offAuthEvent
};
