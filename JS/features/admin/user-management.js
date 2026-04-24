/**
 * User Management
 * Admin panel för användarhantering
 */

import { hasPermission, getCurrentUser } from '../auth/index.js';
import { getUserRepository } from '../../data/index.js';
import { ROLES } from '../../data/index.js';

let userManagementModal = null;

/**
 * Initiera user management modul
 */
export function initializeUserManagement() {
    createUserManagementModal();
    // Exponera globalt för user menu
    window.userManagement = {
        show: showUserManagement
    };
}

/**
 * Skapa user management modal HTML
 */
function createUserManagementModal() {
    const html = `
        <div id="userManagementModal" class="modal hidden">
            <div class="modal-content large">
                <div class="modal-header">
                    <h2>Användarhantering</h2>
                    <button class="modal-close" onclick="this.closest('.modal').classList.add('hidden')">×</button>
                </div>
                
                <div class="modal-body">
                    <div class="management-toolbar">
                        <button id="createUserBtn" class="btn btn-primary">
                            ➕ Ny användare
                        </button>
                        <input 
                            type="text" 
                            id="userSearchInput" 
                            placeholder="Sök efter användare..."
                            class="search-input"
                        />
                    </div>
                    
                    <table class="user-table">
                        <thead>
                            <tr>
                                <th>Användarnamn</th>
                                <th>E-post</th>
                                <th>Roll</th>
                                <th>Status</th>
                                <th>Skapad</th>
                                <th>Åtgärder</th>
                            </tr>
                        </thead>
                        <tbody id="userTableBody">
                            <!-- Users will be inserted here -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', html);
    userManagementModal = document.getElementById('userManagementModal');
    attachEventListeners();
}

/**
 * Lägg till event listeners
 */
function attachEventListeners() {
    document.getElementById('createUserBtn')?.addEventListener('click', showCreateUserDialog);
    document.getElementById('userSearchInput')?.addEventListener('input', filterUsers);
}

/**
 * Visa user management modal
 */
async function showUserManagement() {
    if (!hasPermission('user.list')) {
        alert('Du har inte behörighet för användarhantering');
        return;
    }
    
    await loadAndRenderUsers();
    userManagementModal?.classList.remove('hidden');
}

/**
 * Ladda och rendera användare
 */
async function loadAndRenderUsers() {
    try {
        const userRepo = getUserRepository();
        const users = await userRepo.getAll();
        renderUserTable(users);
    } catch (error) {
        console.error('Error loading users:', error);
        alert('Fel vid hämtning av användare: ' + error.message);
    }
}

/**
 * Rendera användartabell
 * @param {Array} users - Användare
 */
function renderUserTable(users) {
    const tbody = document.getElementById('userTableBody');
    if (!tbody) return;
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-message">Inga användare hittade</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => renderUserRow(user)).join('');
    
    // Lägg till event listeners
    tbody.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => showEditUserDialog(btn.dataset.userId));
    });
    
    tbody.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => deleteUser(btn.dataset.userId));
    });
    
    tbody.querySelectorAll('.btn-reset-password').forEach(btn => {
        btn.addEventListener('click', () => resetPassword(btn.dataset.userId));
    });
}

/**
 * Rendera en användarrad
 * @param {Object} user - Användare
 * @returns {string} HTML
 */
function renderUserRow(user) {
    const createdDate = new Date(user.createdAt).toLocaleDateString('sv-SE');
    const status = user.active ? '✅ Aktiv' : '⛔ Inaktiv';
    const roleName = getRoleLabel(user.role);
    
    return `
        <tr>
            <td><strong>${escapeHtml(user.username)}</strong></td>
            <td>${escapeHtml(user.email)}</td>
            <td>${roleName}</td>
            <td>${status}</td>
            <td>${createdDate}</td>
            <td class="action-buttons">
                <button class="btn-small btn-edit" data-user-id="${user.id}" title="Redigera">
                    ✏️
                </button>
                <button class="btn-small btn-reset-password" data-user-id="${user.id}" title="Återställ lösenord">
                    🔑
                </button>
                <button class="btn-small btn-delete" data-user-id="${user.id}" title="Radera">
                    🗑️
                </button>
            </td>
        </tr>
    `;
}

/**
 * Visa dialog för att skapa ny användare
 */
function showCreateUserDialog() {
    const dialog = createUserDialog();
    
    const form = dialog.querySelector('form');
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const username = form.username.value.trim();
        const email = form.email.value.trim();
        const password = form.password.value;
        const confirmPassword = form.confirmPassword.value;
        const role = form.role.value;
        
        if (!username || !email) {
            alert('Användarnamn och e-post krävs');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('Lösenorden matchar inte');
            return;
        }
        
        if (password.length < 8) {
            alert('Lösenordet måste vara minst 8 tecken');
            return;
        }
        
        try {
            const userRepo = getUserRepository();
            const { hashPassword } = await import('../auth/password-utils.js');
            
            const passwordHash = await hashPassword(password, username);
            
            const newUser = await userRepo.createUser({
                username,
                email,
                passwordHash,
                fullName: username,
                role,
                salt: username, // Viktigt: samma salt som vid hashing!
                isActive: true
            });
            
            alert(`Användare skapad: ${username}`);
            dialog.remove();
            await loadAndRenderUsers();
        } catch (error) {
            alert('Fel vid skapande: ' + error.message);
        }
    };
}

/**
 * Visa dialog för att redigera användare
 * @param {string|number} userId - Användar-ID
 */
async function showEditUserDialog(userId) {
    try {
        const userRepo = getUserRepository();
        const user = await userRepo.getById(userId);
        
        if (!user) {
            alert('Användaren hittades inte');
            return;
        }
        
        const dialog = createUserDialog(user);
        
        const form = dialog.querySelector('form');
        form.onsubmit = async (e) => {
            e.preventDefault();
            
            const updated = {
                ...user,
                role: form.role.value,
                active: form.active.checked
            };
            
            try {
                const result = await userRepo.update(userId, updated);
                
                if (result.success) {
                    alert('Användare uppdaterad');
                    dialog.remove();
                    await loadAndRenderUsers();
                } else {
                    alert('Fel: ' + result.error);
                }
            } catch (error) {
                alert('Fel vid uppdatering: ' + error.message);
            }
        };
    } catch (error) {
        console.error('Error loading user:', error);
        alert('Fel: ' + error.message);
    }
}

/**
 * Skapa user dialog
 * @param {Object} user - Användare (valfritt för edit)
 * @returns {HTMLElement}
 */
function createUserDialog(user = null) {
    const isEdit = !!user;
    const title = isEdit ? 'Redigera användare' : 'Ny användare';
    
    const html = `
        <div class="dialog-overlay">
            <div class="dialog-content">
                <div class="dialog-header">
                    <h3>${title}</h3>
                    <button class="dialog-close" type="button">×</button>
                </div>
                
                <form class="dialog-form">
                    ${!isEdit ? `
                        <div class="form-group">
                            <label for="username">Användarnamn</label>
                            <input type="text" name="username" required minlength="3" />
                        </div>
                        
                        <div class="form-group">
                            <label for="email">E-post</label>
                            <input type="email" name="email" required />
                        </div>
                        
                        <div class="form-group">
                            <label for="password">Lösenord</label>
                            <input type="password" name="password" required minlength="8" 
                                   placeholder="Minst 8 tecken" />
                        </div>
                        
                        <div class="form-group">
                            <label for="confirmPassword">Bekräfta lösenord</label>
                            <input type="password" name="confirmPassword" required minlength="8" 
                                   placeholder="Ange lösenordet igen" />
                        </div>
                    ` : `
                        <div class="form-group">
                            <label>Användarnamn</label>
                            <input type="text" value="${escapeHtml(user.username)}" disabled />
                        </div>
                        
                        <div class="form-group">
                            <label>E-post</label>
                            <input type="email" value="${escapeHtml(user.email)}" disabled />
                        </div>
                        
                        <div class="form-group">
                            <label for="active">Status</label>
                            <input type="checkbox" name="active" ${user.active ? 'checked' : ''} />
                            <label for="active" class="inline">Aktiv</label>
                        </div>
                    `}
                    
                    <div class="form-group">
                        <label for="role">Roll</label>
                        <select name="role" required>
                            <option value="viewer" ${user?.role === 'viewer' ? 'selected' : ''}>Betraktare</option>
                            <option value="user" ${user?.role === 'user' ? 'selected' : ''}>Användare</option>
                            <option value="admin" ${user?.role === 'admin' ? 'selected' : ''}>Admin</option>
                        </select>
                    </div>
                    
                    <div class="dialog-buttons">
                        <button type="submit" class="btn btn-primary">
                            ${isEdit ? 'Spara' : 'Skapa'}
                        </button>
                        <button type="button" class="btn btn-secondary dialog-close">
                            Avbryt
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    const dialog = document.createElement('div');
    dialog.innerHTML = html;
    const element = dialog.firstElementChild;
    
    // Event listeners
    element.querySelector('.dialog-close').addEventListener('click', () => element.remove());
    
    document.body.appendChild(element);
    return element;
}

/**
 * Radera användare
 * @param {string|number} userId - Användar-ID
 */
async function deleteUser(userId) {
    if (!confirm('Vill du verkligen radera denna användare?')) {
        return;
    }
    
    try {
        const userRepo = getUserRepository();
        const result = await userRepo.delete(userId);
        
        if (result.success) {
            alert('Användare raderad');
            await loadAndRenderUsers();
        } else {
            alert('Fel: ' + result.error);
        }
    } catch (error) {
        alert('Fel vid borttagning: ' + error.message);
    }
}

/**
 * Återställ lösenord för användare
 * @param {string|number} userId - Användar-ID
 */
async function resetPassword(userId) {
    if (!confirm('Återställ lösenordet för denna användare? De får ett temporärt lösenord.')) {
        return;
    }
    
    try {
        const userRepo = getUserRepository();
        const user = await userRepo.getById(userId);
        
        if (!user) {
            alert('Användaren hittades inte');
            return;
        }
        
        // Generera temporärt lösenord
        const tempPassword = generateTemporaryPassword();
        
        // I en verklig applikation skulle detta lagras säkert eller skickas via e-post
        alert(`Temporärt lösenord för ${user.username}: ${tempPassword}`);
        
    } catch (error) {
        alert('Fel: ' + error.message);
    }
}

/**
 * Generera temporärt lösenord
 * @returns {string}
 */
function generateTemporaryPassword() {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

/**
 * Filtrera användare
 */
async function filterUsers() {
    const searchText = document.getElementById('userSearchInput')?.value.toLowerCase();
    const rows = document.querySelectorAll('#userTableBody tr');
    
    rows.forEach(row => {
        const username = row.cells[0]?.textContent.toLowerCase();
        const email = row.cells[1]?.textContent.toLowerCase();
        
        const matches = !searchText || username.includes(searchText) || email.includes(searchText);
        row.style.display = matches ? '' : 'none';
    });
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

/**
 * Escape HTML tecken
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
    initializeUserManagement,
    showUserManagement
};
