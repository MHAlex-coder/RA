/**
 * First Run Setup
 * Dialog för att konfigurera första admin-användare
 */

import { getUserRepository } from '../../data/index.js';
import { registerUser } from './auth-service.js';
import { checkPasswordStrength } from './password-utils.js';

/**
 * Kontrollera om första körning behövs
 * @async
 * @returns {Promise<boolean>} - true om setup krävs
 */
export async function needsFirstRunSetup() {
    try {
        const userRepo = getUserRepository();
        const users = await userRepo.getAll();
        return users.length === 0;
    } catch (error) {
        console.error('Error checking first run setup:', error);
        return false;
    }
}

/**
 * Visa första körnings-dialog
 * @async
 * @returns {Promise<void>}
 */
export async function showFirstRunSetup() {
    const needs = await needsFirstRunSetup();
    if (!needs) return;
    
    const dialog = createSetupDialog();
    document.body.appendChild(dialog);
    attachSetupEventListeners(dialog);
}

/**
 * Skapa setup-dialog HTML
 * @returns {HTMLElement}
 */
function createSetupDialog() {
    const container = document.createElement('div');
    container.className = 'first-run-overlay';
    container.innerHTML = `
        <div class="first-run-dialog">
            <div class="setup-header">
                <h1>🔒 Välkommen till HETZA-RA</h1>
                <p>Denna applikation är skyddad med autentisering. Skapa den första admin-användaren för att komma igång.</p>
            </div>
            
            <form id="setupForm" class="setup-form">
                <div class="setup-content">
                    <div class="setup-step">
                        <h3>Skapa Admin-konto</h3>
                        <p class="step-description">Den första användaren blir automatiskt systemadministratör.</p>
                        
                        <div class="form-group">
                            <label for="setupUsername">Användarnamn</label>
                            <input 
                                type="text" 
                                id="setupUsername" 
                                name="username" 
                                required 
                                minlength="3"
                                maxlength="50"
                                placeholder="admin"
                                autofocus
                            />
                            <small class="help-text">3-50 tecken, bokstäver och siffror</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="setupEmail">E-postadress</label>
                            <input 
                                type="email" 
                                id="setupEmail" 
                                name="email" 
                                required
                                placeholder="admin@exempel.se"
                            />
                        </div>
                        
                        <div class="form-group">
                            <label for="setupPassword">Lösenord</label>
                            <input 
                                type="password" 
                                id="setupPassword" 
                                name="password" 
                                required 
                                minlength="8"
                                placeholder="••••••••"
                            />
                            <div id="setupPasswordStrength" class="password-strength"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="setupPasswordConfirm">Bekräfta lösenord</label>
                            <input 
                                type="password" 
                                id="setupPasswordConfirm" 
                                name="passwordConfirm" 
                                required 
                                minlength="8"
                                placeholder="••••••••"
                            />
                        </div>
                        
                        <div id="setupError" class="error-message"></div>
                    </div>
                    
                    <div class="setup-info">
                        <h4>ℹ️ Om autentisering</h4>
                        <ul>
                            <li>Alla ändringar loggas för audit trail</li>
                            <li>Tre användarroller: Admin, Användare, Betraktare</li>
                            <li>Sessioner är 24 timmar</li>
                            <li>Data lagras säkert i IndexedDB</li>
                        </ul>
                    </div>
                </div>
                
                <div class="setup-buttons">
                    <button type="submit" class="btn btn-primary btn-large">
                        ✅ Skapa Admin & Fortsätt
                    </button>
                </div>
            </form>
        </div>
    `;
    
    return container;
}

/**
 * Lägg till event listeners för setup-dialog
 * @param {HTMLElement} dialog
 */
function attachSetupEventListeners(dialog) {
    const form = dialog.querySelector('#setupForm');
    const passwordInput = dialog.querySelector('#setupPassword');
    const errorContainer = dialog.querySelector('#setupError');
    
    // Lösenordsstyrka
    passwordInput.addEventListener('input', () => {
        updateSetupPasswordStrength(dialog);
    });
    
    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSetupSubmit(dialog);
    });
    
    // Förhindra att dialog stängs
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
            e.preventDefault();
        }
    });
}

/**
 * Uppdatera lösenordsstyrka-indikator
 * @param {HTMLElement} dialog
 */
function updateSetupPasswordStrength(dialog) {
    const password = dialog.querySelector('#setupPassword').value;
    const container = dialog.querySelector('#setupPasswordStrength');
    
    if (!password) {
        container.innerHTML = '';
        return;
    }
    
    const strength = checkPasswordStrength(password);
    
    const colors = {
        'weak': '#dc3545',
        'fair': '#ffc107',
        'good': '#17a2b8',
        'strong': '#28a745'
    };
    
    let html = `
        <div class="strength-bar">
            <div class="strength-fill" style="width: ${(strength.score / 4) * 100}%; background-color: ${colors[strength.level]}"></div>
        </div>
        <div class="strength-text" style="color: ${colors[strength.level]}">
            Styrka: ${strength.level === 'weak' ? 'Svag' : strength.level === 'fair' ? 'OK' : strength.level === 'good' ? 'Bra' : 'Stark'}
        </div>
    `;
    
    if (strength.errors.length > 0) {
        html += `<div class="strength-errors">
            <ul>
                ${strength.errors.map(err => `<li>${err}</li>`).join('')}
            </ul>
        </div>`;
    }
    
    container.innerHTML = html;
}

/**
 * Hantera setup-formulär submission
 * @async
 * @param {HTMLElement} dialog
 */
async function handleSetupSubmit(dialog) {
    const form = dialog.querySelector('#setupForm');
    const username = form.username.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const passwordConfirm = form.passwordConfirm.value;
    const errorContainer = dialog.querySelector('#setupError');
    
    errorContainer.textContent = '';
    
    // Validering
    if (password !== passwordConfirm) {
        errorContainer.textContent = 'Lösenorden matchar inte.';
        errorContainer.style.display = 'block';
        return;
    }
    
    const strength = checkPasswordStrength(password);
    if (!strength.isValid) {
        errorContainer.textContent = 'Lösenordet är för svagt: ' + strength.errors.join(', ');
        errorContainer.style.display = 'block';
        return;
    }
    
    try {
        // Inaktivera form under submission
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ Skapar admin...';
        
        // Registrera först admin-användare
        const result = await registerUser({
            username,
            email,
            password,
            role: 'admin'
        });
        
        if (result.success) {
            // Visa framgångsmeddelande
            showSetupSuccess(dialog, username);
            
            // Stäng dialogen efter 2 sekunder
            setTimeout(() => {
                dialog.remove();
                location.reload();
            }, 2000);
        } else {
            errorContainer.textContent = result.error || 'Kunde inte skapa admin-användare.';
            errorContainer.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    } catch (error) {
        console.error('Setup error:', error);
        errorContainer.textContent = 'Fel vid setup: ' + error.message;
        errorContainer.style.display = 'block';
        
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

/**
 * Visa framgångsmeddelande vid setup
 * @param {HTMLElement} dialog
 * @param {string} username
 */
function showSetupSuccess(dialog, username) {
    const form = dialog.querySelector('#setupForm');
    form.innerHTML = `
        <div class="setup-success">
            <div class="success-icon">✅</div>
            <h2>Admin-konto skapat!</h2>
            <p>Välkommen, <strong>${escapeHtml(username)}</strong>!</p>
            <p class="success-message">Du är nu konfigurerad som systemadministratör och kan hantera andra användare.</p>
            <div class="success-features">
                <h4>Du har tillgång till:</h4>
                <ul>
                    <li>📊 Fullständig åtkomst till alla projekt</li>
                    <li>👥 Användarhantering</li>
                    <li>📋 Ändringsloggar</li>
                    <li>⚙️ Systeminställningar</li>
                </ul>
            </div>
            <p class="loading-message">Laddar applikationen...</p>
        </div>
    `;
}

/**
 * Escape HTML-tecken
 * @param {string} text
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

export default {
    needsFirstRunSetup,
    showFirstRunSetup
};
