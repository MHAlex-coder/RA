/**
 * User Menu
 * Visar inloggad användare och logout-knapp
 */

import { getCurrentUser, logout, hasPermission } from '../features/auth/index.js';
import { hideLoginModal, showLoginModal } from './login-modal.js';

/**
 * Initiera user menu
 */
export function initializeUserMenu() {
    createUserMenu();
    updateUserMenu();
    
    // Uppdatera menu när auth ändras
    window.addEventListener('auth-changed', updateUserMenu);

    attachLoginStatusButton();
    
    // Exponera globalt för login-modal
    window.updateUserMenu = updateUserMenu;
}

/**
 * Skapa user menu HTML
 */
function createUserMenu() {
    const html = `
        <div id="userMenuContainer" class="user-menu-container hidden">
            <div class="user-menu">
                <div class="user-info">
                    <div class="user-avatar">
                        <span id="userInitials" class="initials">--</span>
                    </div>
                    <div class="user-details">
                        <div id="userName" class="user-name">Användare</div>
                        <div id="userRole" class="user-role">Inget roll</div>
                    </div>
                </div>
                
                <hr class="menu-divider" />
                
                <div id="userMenuItems" class="menu-items">
                    <!-- Menu items will be inserted here -->
                </div>
                
                <hr class="menu-divider" />
                
                <button id="logoutButton" class="menu-item logout-item">
                    🚪 Logga ut
                </button>
            </div>
        </div>
    `;
    
    // Lägg till i övre höger hörn
    const header = document.querySelector('header') || document.body;
    header.insertAdjacentHTML('beforeend', html);
    
    attachEventListeners();
}

/**
 * Lägg till event listeners
 */
function attachEventListeners() {
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
    
    // Slå på/av menu vid klick på user info
    const userInfo = document.querySelector('.user-info');
    if (userInfo) {
        userInfo.addEventListener('click', toggleUserMenu);
    }
    
    // Stäng menu vid klick utanför
    document.addEventListener('click', (e) => {
        const container = document.getElementById('userMenuContainer');
        const userInfo = document.querySelector('.user-info');
        
        if (container && !container.contains(e.target) && !userInfo?.contains(e.target)) {
            container.classList.add('hidden');
        }
    });
}

/**
 * Uppdatera user menu med aktuell användare
 */
export function updateUserMenu() {
    const user = getCurrentUser();
    const container = document.getElementById('userMenuContainer');
    
    updateLoginStatusButton(user);

    if (!user) {
        if (container) {
            container.classList.add('hidden');
        }
        return;
    }
    
    if (container) {
        container.classList.remove('hidden');
    }
    
    // Uppdatera användarinfo
    const initials = getInitials(user.username);
    document.getElementById('userInitials').textContent = initials;
    document.getElementById('userName').textContent = user.username;
    document.getElementById('userRole').textContent = getRoleLabel(user.role);
    
    // Uppdatera meny-items baserat på roll
    updateMenuItems(user);
}

/**
 * Koppla login-statusknappen
 */
function attachLoginStatusButton() {
    const loginStatusBtn = document.getElementById('login-status-btn');
    if (!loginStatusBtn) return;

    loginStatusBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const user = getCurrentUser();
        if (!user) {
            showLoginModal();
            return;
        }
        handleLogout();
    });
}

/**
 * Uppdatera login-statusknappen
 * @param {Object|null} user
 */
function updateLoginStatusButton(user) {
    const loginStatusBtn = document.getElementById('login-status-btn');
    if (!loginStatusBtn) return;

    if (!user) {
        loginStatusBtn.textContent = '🔒 Logga in';
        loginStatusBtn.classList.add('btn-secondary');
        return;
    }

    loginStatusBtn.textContent = `🚪 Logga ut: ${user.username}`;
    loginStatusBtn.classList.add('btn-secondary');
}

/**
 * Uppdatera meny-items baserat på användarroll
 * @param {Object} user - Användare
 */
function updateMenuItems(user) {
    const menuContainer = document.getElementById('userMenuItems');
    if (!menuContainer) return;
    
    const items = [];
    
    // Profil
    items.push({
        label: '👤 Min profil',
        action: 'showProfile',
        show: true
    });
    
    // Ändringslogg för användare
    items.push({
        label: '📋 Mina ändringar',
        action: 'showMyAuditLog',
        show: true
    });
    
    // Admin-meny
    if (hasPermission('user.manage')) {
        items.push({
            label: '⚙️ Användarhantering',
            action: 'showUserManagement',
            show: true
        });
    }
    
    // Fullständig ändringslogg (admin)
    if (hasPermission('audit.view')) {
        items.push({
            label: '📊 Alla ändringar',
            action: 'showAllAuditLog',
            show: true
        });
    }
    
    // Inställningar
    items.push({
        label: '⚙️ Inställningar',
        action: 'showSettings',
        show: true
    });
    
    // Rendera items
    menuContainer.innerHTML = items
        .filter(item => item.show)
        .map(item => `
            <button class="menu-item" data-action="${item.action}">
                ${item.label}
            </button>
        `).join('');
    
    // Lägg till event listeners för meny-items
    menuContainer.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            const action = item.dataset.action;
            handleMenuAction(action);
            document.getElementById('userMenuContainer').classList.add('hidden');
        });
    });
}

/**
 * Hantera meny-åtgärd
 * @param {string} action - Åtgärd
 */
function handleMenuAction(action) {
    switch (action) {
        case 'showProfile':
            showUserProfile();
            break;
        case 'showMyAuditLog':
            showUserAuditLog();
            break;
        case 'showUserManagement':
            showUserManagement();
            break;
        case 'showAllAuditLog':
            showAllAuditLog();
            break;
        case 'showSettings':
            showSettings();
            break;
    }
}

/**
 * Visa användarprofil
 */
function showUserProfile() {
    const user = getCurrentUser();
    if (!user) return;
    
    const message = `Användare: ${user.username}\nE-post: ${user.email || 'N/A'}\nRoll: ${getRoleLabel(user.role)}`;
    alert(message);
}

/**
 * Visa användarens ändringslogg
 */
function showUserAuditLog() {
    const user = getCurrentUser();
    if (!user) return;
    
    // Delegera till audit viewer
    if (window.auditViewer) {
        window.auditViewer.showUserAuditLog(user.id);
    } else {
        console.warn('Audit viewer not loaded');
    }
}

/**
 * Visa användarhantering (admin)
 */
function showUserManagement() {
    if (window.userManagement) {
        window.userManagement.show();
    } else {
        console.warn('User management module not loaded');
    }
}

/**
 * Visa all ändringslogg (admin)
 */
function showAllAuditLog() {
    if (window.auditViewer) {
        window.auditViewer.showRecentAuditLog(100);
    } else {
        console.warn('Audit viewer not loaded');
    }
}

/**
 * Visa inställningar
 */
function showSettings() {
    const user = getCurrentUser();
    if (!user) return;
    
    // Placeholder för inställningar
    alert('Inställningar för ' + user.username);
}

/**
 * Slå på/av user menu
 */
function toggleUserMenu() {
    const container = document.getElementById('userMenuContainer');
    if (container) {
        container.classList.toggle('hidden');
    }
}

/**
 * Hantera logout
 */
async function handleLogout() {
    if (confirm('Vill du logga ut?')) {
        try {
            await logout();
            updateUserMenu();
            hideLoginModal();
            
            // Visa login modal igen
            setTimeout(() => {
                const loginModal = document.getElementById('loginModalOverlay');
                if (loginModal) {
                    loginModal.classList.add('visible');
                    document.body.style.overflow = 'hidden';
                }
            }, 500);
            
        } catch (error) {
            console.error('Logout error:', error);
            alert('Fel vid utloggning: ' + error.message);
        }
    }
}

/**
 * Få initialer från användarnamn
 * @param {string} username
 * @returns {string}
 */
function getInitials(username) {
    if (!username) return '--';
    const parts = username.split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
}

/**
 * Få etikett för roll
 * @param {string} role
 * @returns {string}
 */
function getRoleLabel(role) {
    const labels = {
        'admin': '👑 Admin',
        'user': '👤 Användare',
        'viewer': '👁️ Betraktare'
    };
    return labels[role] || role;
}

export default {
    initializeUserMenu,
    updateUserMenu
};
