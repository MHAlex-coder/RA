/**
 * Login Modal
 * UI för inloggning och registrering av användare
 */

import { login, registerUser, getCurrentUser } from '../features/auth/index.js';
import { checkPasswordStrength } from '../features/auth/password-utils.js';
import { needsFirstRunSetup } from '../features/auth/index.js';

let loginModal = null;

/**
 * Initiera login modal
 */
export async function initializeLoginModal() {
    await createLoginModal();
    await checkAuthStatusOnLoad();
}

/**
 * Skapa login modal HTML
 */
async function createLoginModal() {
    const html = `
        <div id="loginModalOverlay" class="modal-overlay">
            <div class="login-modal">
                <div class="login-header">
                    <h2>HETZA-RA Login</h2>
                    <p class="subtitle">Maskinrelaterad riskanalys</p>
                </div>
                
                <div id="loginTabs" class="login-tabs">
                    <button class="tab-button active" data-tab="login">Inloggning</button>
                </div>
                
                <!-- Login Tab -->
                <div id="loginTab" class="tab-content active">
                    <form id="loginForm" class="login-form">
                        <div class="form-group">
                            <label for="username">Användarnamn eller E-post</label>
                            <input 
                                type="text" 
                                id="username" 
                                name="username" 
                                required 
                                autocomplete="username"
                                placeholder="exempel@exempel.se"
                            />
                        </div>
                        
                        <div class="form-group">
                            <label for="password">Lösenord</label>
                            <input 
                                type="password" 
                                id="password" 
                                name="password" 
                                required 
                                autocomplete="current-password"
                                placeholder="••••••••"
                            />
                        </div>
                        
                        <div class="form-group checkbox">
                            <input 
                                type="checkbox" 
                                id="rememberMe" 
                                name="rememberMe"
                            />
                            <label for="rememberMe">Kom ihåg mig</label>
                        </div>
                        
                        <button type="submit" class="btn btn-primary btn-block">
                            Logga in
                        </button>
                        
                        <div id="loginError" class="error-message"></div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    const container = document.body;
    container.insertAdjacentHTML('afterbegin', html);
    
    // Vänta på nästa tick för att säkerställa att DOM är uppdaterad
    await new Promise(resolve => setTimeout(resolve, 0));
    
    loginModal = document.getElementById('loginModalOverlay');
    
    if (!loginModal) {
        console.error('Failed to create login modal element!');
        return;
    }
    
    console.log('Login modal element created successfully');
    attachEventListeners();
}

/**
 * Lägg till event listeners
 */
function attachEventListeners() {
    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
    });
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register form (bara om det finns)
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Password strength indicator (bara om det finns)
    const passwordInput = document.getElementById('regPassword');
    if (passwordInput) {
        passwordInput.addEventListener('input', updatePasswordStrength);
    }
    
    // Close modal on overlay click
    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                // Prevent closing if user is not authenticated
                if (!getCurrentUser()) {
                    e.preventDefault();
                }
            }
        });
    }
}

/**
 * Byt till en flik
 * @param {string} tabName - Fliknamn
 */
function switchTab(tabName) {
    // Uppdatera knappar
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // Uppdatera innehål
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.toggle('active', tab.id === `${tabName}Tab`);
    });
    
    // Rensa felmeddelanden
    document.getElementById('loginError').textContent = '';
    document.getElementById('registerError').textContent = '';
}

/**
 * Hantera inloggning
 * @param {Event} e
 */
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorContainer = document.getElementById('loginError');
    
    errorContainer.textContent = '';
    errorContainer.style.display = 'none';
    
    try {
        const result = await login(username, password);
        
        // login() returnerar { user, session } vid framgång
        if (result && result.user) {
            showSuccessMessage('Inloggning lyckades!', 1000);
            hideLoginModal();
            // Uppdatera UI
            if (window.updateUserMenu) {
                window.updateUserMenu();
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        errorContainer.textContent = error.message || 'Inloggningen misslyckades. Kontrollera användarnamn och lösenord.';
        errorContainer.style.display = 'block';
    }
}

/**
 * Hantera registrering
 * @param {Event} e
 */
async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const passwordConfirm = document.getElementById('regPasswordConfirm').value;
    const errorContainer = document.getElementById('registerError');
    
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
    
    if (!document.getElementById('agreeTerms').checked) {
        errorContainer.textContent = 'Du måste acceptera användarvillkoren.';
        errorContainer.style.display = 'block';
        return;
    }
    
    try {
        const result = await registerUser({
            username,
            email,
            password
        });
        
        if (result.success) {
            showSuccessMessage('Konto skapat! Loggar in...', 1500);
            setTimeout(() => {
                switchTab('login');
                document.getElementById('username').value = username;
                document.getElementById('password').value = '';
            }, 500);
        } else {
            errorContainer.textContent = result.error || 'Registreringen misslyckades.';
            errorContainer.style.display = 'block';
        }
    } catch (error) {
        console.error('Registration error:', error);
        errorContainer.textContent = 'Ett oväntat fel inträffade: ' + error.message;
        errorContainer.style.display = 'block';
    }
}

/**
 * Uppdatera lösenordsstyrka-indikatorn
 */
function updatePasswordStrength() {
    const password = document.getElementById('regPassword').value;
    const container = document.getElementById('passwordStrengthContainer');
    
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
    
    const html = `
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
 * Visa framgångsmeddelande
 * @param {string} message - Meddelande
 * @param {number} duration - Varaktighet i ms
 */
function showSuccessMessage(message, duration = 2000) {
    const messageEl = document.createElement('div');
    messageEl.className = 'success-toast';
    messageEl.textContent = message;
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
        messageEl.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        messageEl.classList.remove('show');
        setTimeout(() => messageEl.remove(), 300);
    }, duration);
}

/**
 * Visa login modal
 */
export function showLoginModal() {
    if (loginModal) {
        loginModal.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Dölj login modal
 */
export function hideLoginModal() {
    if (loginModal) {
        loginModal.classList.remove('visible');
        document.body.style.overflow = '';
    }
}

/**
 * Kontrollera autentiseringsstatus vid sidhämtning
 */
async function checkAuthStatusOnLoad() {
    // Kontrollera först om det är första körningen
    const isFirstRun = await needsFirstRunSetup();
    if (isFirstRun) {
        // First-run-setup tar hand om allt
        hideLoginModal();
        return;
    }
    
    const user = getCurrentUser();
    if (!user) {
        showLoginModal();
    } else {
        hideLoginModal();
    }
}

/**
 * Tvinga omloggning
 */
export function forceRelogin() {
    document.getElementById('loginForm').reset();
    showLoginModal();
}

export default {
    initializeLoginModal,
    showLoginModal,
    hideLoginModal,
    forceRelogin
};
