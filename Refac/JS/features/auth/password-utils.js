/**
 * Password Utilities
 * Hanterar lösenordshashing och validering
 * 
 * Använder browser-native SubtleCrypto API för säker hashing.
 */

/**
 * Global salt (bör vara unik per installation i produktion)
 * I framtiden kan detta lagras i en konfigurationsfil
 */
const GLOBAL_SALT = 'HETZA-RA-2026-SALT';

/**
 * Konvertera ArrayBuffer till hex-sträng
 * @param {ArrayBuffer} buffer - Buffer att konvertera
 * @returns {string} Hex-sträng
 */
function bufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Generera ett unikt salt för användare
 * @returns {string} Slumpmässigt salt
 */
export function generateSalt() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return bufferToHex(array.buffer);
}

/**
 * Hasha lösenord med SHA-256
 * @async
 * @param {string} password - Klartext lösenord
 * @param {string} salt - Användarspecifikt salt (optional)
 * @returns {Promise<string>} Hashat lösenord
 */
export async function hashPassword(password, salt = '') {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt + GLOBAL_SALT);
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return bufferToHex(hashBuffer);
}

/**
 * Verifiera lösenord mot hash
 * @async
 * @param {string} password - Klartext lösenord att verifiera
 * @param {string} hash - Sparat hash-värde
 * @param {string} salt - Användarspecifikt salt (optional)
 * @returns {Promise<boolean>} True om lösenordet matchar
 */
export async function verifyPassword(password, hash, salt = '') {
    const computed = await hashPassword(password, salt);
    return computed === hash;
}

/**
 * Lösenordsstyrka resultat
 * @typedef {Object} PasswordStrengthResult
 * @property {boolean} isValid - Om lösenordet uppfyller minimikrav
 * @property {number} score - Styrkepoäng (0-5)
 * @property {string} level - Nivå: 'weak', 'fair', 'good', 'strong'
 * @property {string[]} errors - Lista över fel
 * @property {string[]} suggestions - Förslag på förbättringar
 */

/**
 * Kontrollera lösenordsstyrka
 * @param {string} password - Lösenord att kontrollera
 * @returns {PasswordStrengthResult} Resultat
 */
export function checkPasswordStrength(password) {
    const result = {
        isValid: false,
        score: 0,
        level: 'weak',
        errors: [],
        suggestions: []
    };
    
    // Minimikrav
    if (!password) {
        result.errors.push('Lösenord krävs');
        return result;
    }
    
    if (password.length < 8) {
        result.errors.push('Lösenordet måste vara minst 8 tecken');
    } else {
        result.score++;
    }
    
    // Poängberäkning
    if (password.length >= 12) {
        result.score++;
    } else {
        result.suggestions.push('Använd minst 12 tecken för bättre säkerhet');
    }
    
    if (/[a-z]/.test(password)) {
        result.score++;
    } else {
        result.errors.push('Lösenordet måste innehålla minst en liten bokstav');
    }
    
    if (/[A-Z]/.test(password)) {
        result.score++;
    } else {
        result.suggestions.push('Lägg till stora bokstäver');
    }
    
    if (/\d/.test(password)) {
        result.score++;
    } else {
        result.errors.push('Lösenordet måste innehålla minst en siffra');
    }
    
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        result.score++;
    } else {
        result.suggestions.push('Lägg till specialtecken (!@#$%^&*)');
    }
    
    // Kontrollera vanliga lösenord
    const commonPasswords = [
        'password', 'lösenord', '12345678', 'qwerty', 'abc123',
        'admin123', 'welcome', 'password123', 'admin', 'letmein'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
        result.errors.push('Lösenordet är för vanligt');
        result.score = 0;
    }
    
    // Kontrollera upprepningar
    if (/(.)\1{3,}/.test(password)) {
        result.suggestions.push('Undvik upprepade tecken');
        result.score = Math.max(0, result.score - 1);
    }
    
    // Bestäm nivå
    if (result.score <= 1) {
        result.level = 'weak';
    } else if (result.score <= 2) {
        result.level = 'fair';
    } else if (result.score <= 4) {
        result.level = 'good';
    } else {
        result.level = 'strong';
    }
    
    // Validitet: inga errors och minst score 2
    result.isValid = result.errors.length === 0 && result.score >= 2;
    
    return result;
}

/**
 * Generera ett slumpmässigt lösenord
 * @param {number} length - Längd på lösenordet
 * @returns {string} Genererat lösenord
 */
export function generateRandomPassword(length = 16) {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=';
    
    const allChars = lowercase + uppercase + numbers + symbols;
    
    // Säkerställ att minst en av varje typ finns
    let password = '';
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fyll på resten
    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Blanda tecknen
    return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Validera e-postformat
 * @param {string} email - E-postadress att validera
 * @returns {boolean} True om giltig
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validera användarnamn
 * @param {string} username - Användarnamn att validera
 * @returns {Object} Resultat med isValid och errors
 */
export function validateUsername(username) {
    const result = {
        isValid: true,
        errors: []
    };
    
    if (!username) {
        result.isValid = false;
        result.errors.push('Användarnamn krävs');
        return result;
    }
    
    if (username.length < 3) {
        result.isValid = false;
        result.errors.push('Användarnamn måste vara minst 3 tecken');
    }
    
    if (username.length > 30) {
        result.isValid = false;
        result.errors.push('Användarnamn får vara max 30 tecken');
    }
    
    if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
        result.isValid = false;
        result.errors.push('Användarnamn får bara innehålla bokstäver, siffror, _ . -');
    }
    
    return result;
}

export default {
    hashPassword,
    verifyPassword,
    checkPasswordStrength,
    generateRandomPassword,
    generateSalt,
    isValidEmail,
    validateUsername
};
