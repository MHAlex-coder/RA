# Autentisering & Audit Logging Plan

## Översikt

Detta dokument beskriver implementationen av:
1. **Autentisering** - Inloggning med användarroller (Admin/User)
2. **Audit Logging** - Spårning av alla ändringar för maskinsäkerhetsdokumentation

**Mål:** Framtidssäkrad arkitektur som följer befintligt repository pattern och kan använda olika adapters (IndexedDB, SQLite, HTTP API).

---

## 1. Arkitektur Översikt

### Nuvarande Arkitektur (Referens)

```
┌─────────────────────────────────────────┐
│           Feature Modules               │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Project Repository              │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         IndexedDB Adapter               │
└─────────────────────────────────────────┘
```

### Ny Arkitektur (Med Auth & Audit)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           UI LAYER                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ Login Modal │  │ User Menu   │  │ Admin Panel │  │ Audit View  │     │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                        FEATURE LAYER                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐       │
│  │   Auth Service   │  │  Audit Service   │  │ Project Features │       │
│  │  (login/logout)  │  │  (log changes)   │  │   (existing)     │       │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘       │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                      REPOSITORY LAYER                                    │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐       │
│  │ User Repository  │  │ Audit Repository │  │Project Repository│       │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘       │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                       ADAPTER LAYER                                      │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    DataAdapter Interface                         │    │
│  │  (IndexedDB / SQLite / HTTP API / Tauri)                        │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Datamodeller

### 2.1 User (Användare)

```javascript
/**
 * @typedef {Object} User
 * @property {string} id - Unikt användar-ID (UUID)
 * @property {string} username - Användarnamn för inloggning
 * @property {string} passwordHash - Hashad lösenord (bcrypt/argon2)
 * @property {string} email - E-postadress
 * @property {string} fullName - Fullständigt namn
 * @property {'admin'|'user'|'viewer'} role - Användarroll
 * @property {boolean} isActive - Om kontot är aktivt
 * @property {string} created - ISO8601 timestamp
 * @property {string} lastLogin - ISO8601 timestamp
 * @property {Object} preferences - Användarinställningar
 */

const UserSchema = {
    id: 'uuid',
    username: 'string',           // Unikt
    passwordHash: 'string',       // Aldrig klartext!
    email: 'string',
    fullName: 'string',
    role: 'admin|user|viewer',
    isActive: true,
    created: 'ISO8601',
    lastLogin: 'ISO8601',
    preferences: {
        language: 'sv|en',
        theme: 'light|dark',
        autoSaveInterval: 30000
    }
};
```

### 2.2 Session (Aktiv Session)

```javascript
/**
 * @typedef {Object} Session
 * @property {string} id - Session-ID (token)
 * @property {string} userId - Koppling till User
 * @property {string} created - ISO8601 timestamp
 * @property {string} expires - ISO8601 timestamp
 * @property {string} userAgent - Browser info
 * @property {string} ipAddress - IP (för framtida backend)
 */

const SessionSchema = {
    id: 'token-uuid',
    userId: 'user-uuid',
    created: 'ISO8601',
    expires: 'ISO8601',
    userAgent: 'string',
    ipAddress: 'string'     // Null för offline-mode
};
```

### 2.3 AuditLog (Ändringslogg)

```javascript
/**
 * @typedef {Object} AuditLogEntry
 * @property {string} id - Unikt logg-ID
 * @property {string} timestamp - ISO8601 timestamp (exakt tidpunkt)
 * @property {string} userId - Vem som gjorde ändringen
 * @property {string} userName - Användarnamn (för snabb visning)
 * @property {string} projectId - Vilket projekt som påverkades
 * @property {string} projectName - Projektnamn (för snabb visning)
 * @property {string} action - Typ av handling
 * @property {string} category - Kategori (risk, interface, product, etc.)
 * @property {string} entityId - ID på det specifika objektet som ändrades
 * @property {string} entityName - Namn/beskrivning på objektet
 * @property {Object} previousValue - Tidigare värde (för rollback)
 * @property {Object} newValue - Nytt värde
 * @property {string} summary - Läsbar sammanfattning av ändringen
 * @property {Object} metadata - Extra information
 */

const AuditLogSchema = {
    id: 'uuid',
    timestamp: 'ISO8601',
    
    // Vem
    userId: 'user-uuid',
    userName: 'string',
    
    // Var
    projectId: 'project-uuid',
    projectName: 'string',
    
    // Vad
    action: 'create|update|delete|view|export|import|login|logout',
    category: 'risk|interface|measure|product|compliance|project|user|system',
    entityId: 'entity-uuid',
    entityName: 'string',
    
    // Detaljer
    previousValue: {},          // Snapshot före ändring
    newValue: {},               // Snapshot efter ändring
    summary: 'string',          // "Lade till risk: Klämrisk vid cylinder"
    
    // Metadata
    metadata: {
        ipAddress: 'string',
        userAgent: 'string',
        sessionId: 'string',
        changeSource: 'manual|import|auto-save|api'
    }
};
```

### 2.4 Roller & Behörigheter

```javascript
/**
 * Rollbaserad åtkomstkontroll (RBAC)
 */
const Roles = {
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
            'audit.view.own'    // Bara egen aktivitet
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
```

---

## 3. Filstruktur

```
JS/
├── data/
│   ├── adapters/
│   │   ├── adapter-interface.js      # Uppdatera med nya stores
│   │   └── indexeddb-adapter.js      # Uppdatera med users, sessions, audit
│   │
│   ├── repositories/
│   │   ├── base-repository.js
│   │   ├── project-repository.js
│   │   ├── user-repository.js        # NY: Hantera användare
│   │   ├── session-repository.js     # NY: Hantera sessioner
│   │   └── audit-repository.js       # NY: Hantera audit logs
│   │
│   └── index.js                      # Uppdatera med nya repositories
│
├── features/
│   ├── auth/                         # NY: Autentisering
│   │   ├── index.js                  # Export auth functions
│   │   ├── auth-service.js           # Login, logout, session management
│   │   ├── auth-guard.js             # Skydda routes/features
│   │   ├── password-utils.js         # Hash, verify, strength check
│   │   └── roles.js                  # Roll-definitioner och permissions
│   │
│   ├── audit/                        # NY: Audit logging
│   │   ├── index.js                  # Export audit functions
│   │   ├── audit-service.js          # Logga ändringar
│   │   ├── audit-interceptor.js      # Automatisk logging vid save
│   │   └── audit-viewer.js           # UI för att visa loggar
│   │
│   └── admin/                        # NY: Admin panel
│       ├── index.js
│       ├── user-management.js        # CRUD för användare
│       └── system-settings.js        # Systeminställningar
│
├── ui/
│   ├── login-modal.js                # NY: Inloggningsformulär
│   ├── user-menu.js                  # NY: Användarmeny (logout, profil)
│   └── admin-panel.js                # NY: Admin-gränssnitt
│
└── state.js                          # Uppdatera med currentUser, session
```

---

## 4. Implementation Faser

### Fas 1: Datalagret (Repositories & Adapters)

**Mål:** Skapa repositories för users, sessions och audit logs.

**Steg:**

1. **Uppdatera IndexedDB Adapter**
   - Lägg till object stores: `users`, `sessions`, `auditLogs`
   - Skapa indexes för snabb sökning

2. **Skapa User Repository**
   ```javascript
   // user-repository.js
   export default function createUserRepository(adapter) {
       return {
           async createUser(userData) { ... },
           async getUserById(id) { ... },
           async getUserByUsername(username) { ... },
           async updateUser(user) { ... },
           async deleteUser(id) { ... },
           async listUsers() { ... },
           async validateCredentials(username, password) { ... }
       };
   }
   ```

3. **Skapa Session Repository**
   ```javascript
   // session-repository.js
   export default function createSessionRepository(adapter) {
       return {
           async createSession(userId) { ... },
           async getSession(sessionId) { ... },
           async validateSession(sessionId) { ... },
           async invalidateSession(sessionId) { ... },
           async invalidateAllUserSessions(userId) { ... },
           async cleanupExpiredSessions() { ... }
       };
   }
   ```

4. **Skapa Audit Repository**
   ```javascript
   // audit-repository.js
   export default function createAuditRepository(adapter) {
       return {
           async logAction(entry) { ... },
           async getLogsForProject(projectId, options) { ... },
           async getLogsForUser(userId, options) { ... },
           async getLogsByDateRange(startDate, endDate) { ... },
           async getLogsByAction(action) { ... },
           async exportLogs(projectId, format) { ... }
       };
   }
   ```

**Leverabler:**
- [ ] Uppdaterad `indexeddb-adapter.js` med nya stores
- [ ] `user-repository.js`
- [ ] `session-repository.js`
- [ ] `audit-repository.js`
- [ ] Uppdaterad `data/index.js` med nya exports

---

### Fas 2: Auth Service

**Mål:** Implementera autentiseringslogik.

**Steg:**

1. **Password Utilities**
   ```javascript
   // password-utils.js
   // Använd SubtleCrypto API för hashing (browser-native)
   export async function hashPassword(password) {
       const encoder = new TextEncoder();
       const data = encoder.encode(password + SALT);
       const hashBuffer = await crypto.subtle.digest('SHA-256', data);
       return bufferToHex(hashBuffer);
   }
   
   export async function verifyPassword(password, hash) {
       const computed = await hashPassword(password);
       return computed === hash;
   }
   
   export function checkPasswordStrength(password) {
       // Minst 8 tecken, en siffra, en stor bokstav
       ...
   }
   ```

2. **Auth Service**
   ```javascript
   // auth-service.js
   import { getUserRepository, getSessionRepository, getAuditRepository } from '../../data/index.js';
   
   let currentUser = null;
   let currentSession = null;
   
   export async function login(username, password) {
       const userRepo = getUserRepository();
       const sessionRepo = getSessionRepository();
       const auditRepo = getAuditRepository();
       
       // Validera credentials
       const user = await userRepo.validateCredentials(username, password);
       if (!user) {
           await auditRepo.logAction({
               action: 'login',
               category: 'system',
               summary: `Misslyckat inloggningsförsök: ${username}`,
               metadata: { success: false }
           });
           throw new Error('Ogiltigt användarnamn eller lösenord');
       }
       
       // Skapa session
       const session = await sessionRepo.createSession(user.id);
       
       // Uppdatera state
       currentUser = user;
       currentSession = session;
       
       // Logga lyckad inloggning
       await auditRepo.logAction({
           action: 'login',
           category: 'system',
           userId: user.id,
           userName: user.fullName,
           summary: `Användare loggade in: ${user.fullName}`
       });
       
       return { user, session };
   }
   
   export async function logout() { ... }
   export function getCurrentUser() { return currentUser; }
   export function isAuthenticated() { return currentSession !== null; }
   export function hasPermission(permission) { ... }
   ```

3. **Auth Guard**
   ```javascript
   // auth-guard.js
   export function requireAuth(callback) {
       return async (...args) => {
           if (!isAuthenticated()) {
               showLoginModal();
               return;
           }
           return callback(...args);
       };
   }
   
   export function requirePermission(permission, callback) {
       return async (...args) => {
           if (!hasPermission(permission)) {
               showAccessDeniedMessage();
               return;
           }
           return callback(...args);
       };
   }
   ```

**Leverabler:**
- [ ] `password-utils.js`
- [ ] `auth-service.js`
- [ ] `auth-guard.js`
- [ ] `roles.js`
- [ ] `features/auth/index.js`

---

### Fas 3: Audit Service

**Mål:** Automatisk loggning av alla ändringar.

**Steg:**

1. **Audit Service**
   ```javascript
   // audit-service.js
   import { getAuditRepository } from '../../data/index.js';
   import { getCurrentUser } from '../auth/auth-service.js';
   
   /**
    * Logga en ändring
    * @param {Object} options
    */
   export async function logChange(options) {
       const {
           action,
           category,
           projectId,
           projectName,
           entityId,
           entityName,
           previousValue,
           newValue,
           summary
       } = options;
       
       const user = getCurrentUser();
       const auditRepo = getAuditRepository();
       
       await auditRepo.logAction({
           id: generateUUID(),
           timestamp: new Date().toISOString(),
           userId: user?.id || 'anonymous',
           userName: user?.fullName || 'Anonym',
           projectId,
           projectName,
           action,
           category,
           entityId,
           entityName,
           previousValue,
           newValue,
           summary,
           metadata: {
               userAgent: navigator.userAgent,
               changeSource: 'manual'
           }
       });
   }
   
   // Convenience functions
   export async function logRiskCreated(project, risk) {
       await logChange({
           action: 'create',
           category: 'risk',
           projectId: project.id,
           projectName: project.productData.productName,
           entityId: risk.id,
           entityName: risk.description,
           newValue: risk,
           summary: `Skapade risk: ${risk.description}`
       });
   }
   
   export async function logRiskUpdated(project, oldRisk, newRisk) {
       await logChange({
           action: 'update',
           category: 'risk',
           projectId: project.id,
           projectName: project.productData.productName,
           entityId: newRisk.id,
           entityName: newRisk.description,
           previousValue: oldRisk,
           newValue: newRisk,
           summary: `Uppdaterade risk: ${newRisk.description}`
       });
   }
   
   export async function logRiskDeleted(project, risk) { ... }
   export async function logMeasureAdded(project, risk, measure) { ... }
   export async function logProjectExported(project) { ... }
   export async function logProjectImported(project) { ... }
   ```

2. **Audit Interceptor (Automatisk Loggning)**
   ```javascript
   // audit-interceptor.js
   /**
    * Wrap project repository för automatisk audit logging
    */
   export function createAuditedProjectRepository(baseRepo) {
       return {
           ...baseRepo,
           
           async saveProject(project, options = {}) {
               const previousProject = await baseRepo.getProject(project.id);
               const result = await baseRepo.saveProject(project);
               
               if (!options.skipAudit) {
                   await logProjectChanges(previousProject, project);
               }
               
               return result;
           },
           
           async deleteProject(projectId) {
               const project = await baseRepo.getProject(projectId);
               const result = await baseRepo.deleteProject(projectId);
               
               await logChange({
                   action: 'delete',
                   category: 'project',
                   projectId,
                   projectName: project?.productData?.productName,
                   previousValue: project,
                   summary: `Raderade projekt: ${project?.productData?.productName}`
               });
               
               return result;
           }
       };
   }
   
   /**
    * Jämför två projekt och logga skillnader
    */
   async function logProjectChanges(previous, current) {
       if (!previous) {
           // Nytt projekt
           await logChange({
               action: 'create',
               category: 'project',
               projectId: current.id,
               projectName: current.productData.productName,
               newValue: current,
               summary: `Skapade projekt: ${current.productData.productName}`
           });
           return;
       }
       
       // Jämför och logga specifika ändringar
       await compareAndLogRisks(previous, current);
       await compareAndLogInterfaces(previous, current);
       await compareAndLogProductData(previous, current);
       // etc.
   }
   ```

**Leverabler:**
- [ ] `audit-service.js`
- [ ] `audit-interceptor.js`
- [ ] Uppdaterade feature-moduler med audit-anrop
- [ ] `features/audit/index.js`

---

### Fas 4: UI Components

**Mål:** Skapa användargränssnitt för login, användarmeny och audit viewer.

**Steg:**

1. **Login Modal**
   ```javascript
   // ui/login-modal.js
   export function showLoginModal() {
       const modal = document.getElementById('loginModal');
       modal.classList.remove('hidden');
   }
   
   export function initializeLoginModal() {
       const form = document.getElementById('loginForm');
       form.addEventListener('submit', async (e) => {
           e.preventDefault();
           const username = document.getElementById('loginUsername').value;
           const password = document.getElementById('loginPassword').value;
           
           try {
               await login(username, password);
               hideLoginModal();
               updateUserMenu();
               showSuccessNotification('Inloggad!');
           } catch (error) {
               showErrorNotification(error.message);
           }
       });
   }
   ```

2. **User Menu**
   ```javascript
   // ui/user-menu.js
   export function updateUserMenu() {
       const user = getCurrentUser();
       const menuEl = document.getElementById('userMenu');
       
       if (user) {
           menuEl.innerHTML = `
               <span class="user-name">${user.fullName}</span>
               <span class="user-role">${getRoleName(user.role)}</span>
               <button onclick="logout()">Logga ut</button>
           `;
       } else {
           menuEl.innerHTML = `
               <button onclick="showLoginModal()">Logga in</button>
           `;
       }
   }
   ```

3. **Audit Viewer**
   ```javascript
   // features/audit/audit-viewer.js
   export async function showAuditLog(projectId = null) {
       const auditRepo = getAuditRepository();
       
       let logs;
       if (projectId) {
           logs = await auditRepo.getLogsForProject(projectId, {
               limit: 100,
               orderBy: 'timestamp',
               order: 'desc'
           });
       } else {
           logs = await auditRepo.getLogsByDateRange(
               new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 dagar
               new Date()
           );
       }
       
       renderAuditTable(logs);
   }
   
   function renderAuditTable(logs) {
       const container = document.getElementById('auditLogContainer');
       container.innerHTML = `
           <table class="audit-table">
               <thead>
                   <tr>
                       <th>Tidpunkt</th>
                       <th>Användare</th>
                       <th>Projekt</th>
                       <th>Handling</th>
                       <th>Beskrivning</th>
                       <th>Detaljer</th>
                   </tr>
               </thead>
               <tbody>
                   ${logs.map(log => `
                       <tr class="audit-row audit-${log.action}">
                           <td>${formatDateTime(log.timestamp)}</td>
                           <td>${log.userName}</td>
                           <td>${log.projectName || '-'}</td>
                           <td>${getActionLabel(log.action)}</td>
                           <td>${log.summary}</td>
                           <td>
                               <button onclick="showAuditDetails('${log.id}')">
                                   Visa
                               </button>
                           </td>
                       </tr>
                   `).join('')}
               </tbody>
           </table>
       `;
   }
   ```

4. **Admin Panel**
   ```javascript
   // features/admin/user-management.js
   export async function showUserManagement() {
       if (!hasPermission('user.list')) {
           showAccessDeniedMessage();
           return;
       }
       
       const userRepo = getUserRepository();
       const users = await userRepo.listUsers();
       
       renderUserTable(users);
   }
   
   export async function createUser(userData) {
       if (!hasPermission('user.create')) {
           throw new Error('Åtkomst nekad');
       }
       
       const userRepo = getUserRepository();
       const auditRepo = getAuditRepository();
       
       // Hash password
       userData.passwordHash = await hashPassword(userData.password);
       delete userData.password;
       
       const user = await userRepo.createUser(userData);
       
       await auditRepo.logAction({
           action: 'create',
           category: 'user',
           entityId: user.id,
           entityName: user.fullName,
           summary: `Skapade användare: ${user.fullName} (${user.role})`
       });
       
       return user;
   }
   ```

**Leverabler:**
- [ ] `ui/login-modal.js`
- [ ] `ui/user-menu.js`
- [ ] `features/audit/audit-viewer.js`
- [ ] `features/admin/user-management.js`
- [ ] HTML för login modal och admin panel
- [ ] CSS för nya komponenter

---

### Fas 5: Integration & Migration

**Mål:** Integrera auth och audit i befintliga features.

**Steg:**

1. **Uppdatera main.js**
   ```javascript
   // main.js
   import { initializeAuth, isAuthenticated } from './features/auth/index.js';
   import { showLoginModal } from './ui/login-modal.js';
   
   document.addEventListener('DOMContentLoaded', async () => {
       await initializeDataLayer();
       await initializeAuth();
       
       // Visa login om inte autentiserad
       if (!isAuthenticated()) {
           showLoginModal();
           return;
       }
       
       // Fortsätt med normal initialisering...
   });
   ```

2. **Uppdatera Project Repository**
   ```javascript
   // data/index.js
   import { createAuditedProjectRepository } from '../features/audit/audit-interceptor.js';
   
   export function getProjectRepository() {
       if (!projectRepository) {
           throw new Error('Data layer not initialized');
       }
       // Returnera audited version
       return createAuditedProjectRepository(projectRepository);
   }
   ```

3. **Migrera Features till Audit**
   - Tab 2 (Risk): Lägg till audit vid create/update/delete risk
   - Tab 3 (Interface): Lägg till audit vid interface-ändringar
   - Export/Import: Logga vid export och import
   - Settings: Logga vid systeminställningar

**Leverabler:**
- [ ] Uppdaterad `main.js` med auth-flöde
- [ ] Uppdaterad `data/index.js` med audited repository
- [ ] Migrerade feature-moduler

---

### Fas 6: Initial Setup & Default Admin

**Mål:** Skapa första admin-användare vid första körning.

**Steg:**

1. **First-Run Detection**
   ```javascript
   // features/auth/first-run.js
   export async function checkFirstRun() {
       const userRepo = getUserRepository();
       const users = await userRepo.listUsers();
       
       if (users.length === 0) {
           return true;
       }
       return false;
   }
   
   export async function showFirstRunSetup() {
       // Visa modal för att skapa första admin
       const modal = document.getElementById('firstRunModal');
       modal.innerHTML = `
           <h2>Välkommen till HETZA-RA</h2>
           <p>Skapa ett administratörskonto för att komma igång.</p>
           <form id="firstRunForm">
               <input type="text" id="adminFullName" placeholder="Fullständigt namn" required>
               <input type="text" id="adminUsername" placeholder="Användarnamn" required>
               <input type="email" id="adminEmail" placeholder="E-post" required>
               <input type="password" id="adminPassword" placeholder="Lösenord" required>
               <input type="password" id="adminPasswordConfirm" placeholder="Bekräfta lösenord" required>
               <button type="submit">Skapa administratör</button>
           </form>
       `;
       modal.classList.remove('hidden');
   }
   
   export async function createInitialAdmin(data) {
       const userRepo = getUserRepository();
       
       const admin = await userRepo.createUser({
           id: generateUUID(),
           username: data.username,
           passwordHash: await hashPassword(data.password),
           email: data.email,
           fullName: data.fullName,
           role: 'admin',
           isActive: true,
           created: new Date().toISOString(),
           preferences: {
               language: 'sv',
               theme: 'light'
           }
       });
       
       // Auto-login
       await login(data.username, data.password);
       
       return admin;
   }
   ```

**Leverabler:**
- [ ] `first-run.js`
- [ ] First-run setup modal
- [ ] Integrering i main.js

---

## 5. Säkerhetsöverväganden

### Lösenordshantering

| Aspekt | Implementation |
|--------|----------------|
| **Hashing** | SHA-256 via SubtleCrypto (browser-native) |
| **Salt** | Unikt salt per användare + global pepper |
| **Styrka** | Minst 8 tecken, kräv siffra + stor bokstav |
| **Lagring** | Aldrig klartext, endast hash i IndexedDB |

### Session Management

| Aspekt | Implementation |
|--------|----------------|
| **Token** | Kryptografiskt säkert UUID |
| **Expiry** | 24 timmar inaktivitet |
| **Storage** | SessionStorage för token, IndexedDB för session-data |
| **Invalidation** | Vid logout, lösenordsbyte, admin-åtgärd |

### Offline-Mode Säkerhet

| Aspekt | Implementation |
|--------|----------------|
| **Data-at-rest** | IndexedDB är origin-bunden (samma origin policy) |
| **Begränsning** | Offline-mode är single-user (ingen delning) |
| **Framtid** | Kryptering av känslig data kan läggas till |

### Audit Log Integritet

| Aspekt | Implementation |
|--------|----------------|
| **Immutability** | Loggar kan inte ändras eller raderas (soft-delete) |
| **Timestamp** | Server-tid eller synkad tid |
| **Chain** | Varje logg refererar till föregående (för framtida verifiering) |

---

## 6. Framtida Backend-Integration

När HTTP Adapter implementeras i Fas 5 av DATA_ABSTRACTION_PLAN:

### API Endpoints (Framtida)

```
POST   /api/auth/login          # Inloggning
POST   /api/auth/logout         # Utloggning
GET    /api/auth/session        # Validera session
POST   /api/auth/refresh        # Förnya token

GET    /api/users               # Lista användare (admin)
POST   /api/users               # Skapa användare (admin)
GET    /api/users/:id           # Hämta användare
PUT    /api/users/:id           # Uppdatera användare
DELETE /api/users/:id           # Radera användare (admin)

GET    /api/audit               # Lista audit logs
GET    /api/audit/project/:id   # Audit för projekt
GET    /api/audit/export        # Exportera audit (CSV/PDF)
```

### JWT Token (Framtida)

```javascript
// HTTP Adapter kommer hantera JWT automatiskt
const httpAdapter = {
    async init() {
        // Hämta token från localStorage
        this.token = localStorage.getItem('authToken');
    },
    
    async request(method, endpoint, data) {
        return fetch(endpoint, {
            method,
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }
};
```

---

## 7. Checklista per Fas

### Fas 1: Datalager ⬜
- [ ] Uppdatera IndexedDB med `users`, `sessions`, `auditLogs` stores
- [ ] Skapa `user-repository.js`
- [ ] Skapa `session-repository.js`
- [ ] Skapa `audit-repository.js`
- [ ] Uppdatera `data/index.js`
- [ ] Testa repositories

### Fas 2: Auth Service ⬜
- [ ] Skapa `password-utils.js`
- [ ] Skapa `auth-service.js`
- [ ] Skapa `auth-guard.js`
- [ ] Skapa `roles.js`
- [ ] Testa login/logout

### Fas 3: Audit Service ⬜
- [ ] Skapa `audit-service.js`
- [ ] Skapa `audit-interceptor.js`
- [ ] Integrera med project repository
- [ ] Testa automatisk loggning

### Fas 4: UI Components ⬜
- [ ] Skapa login modal HTML/CSS
- [ ] Skapa `login-modal.js`
- [ ] Skapa `user-menu.js`
- [ ] Skapa `audit-viewer.js`
- [ ] Skapa admin panel
- [ ] Testa UI flöden

### Fas 5: Integration ⬜
- [ ] Uppdatera `main.js`
- [ ] Migrera features till audit
- [ ] Testa hela flödet
- [ ] Verifiera permissions

### Fas 6: First-Run Setup ⬜
- [ ] Skapa `first-run.js`
- [ ] Skapa first-run modal
- [ ] Testa ny installation
- [ ] Dokumentera setup-process

---

## 8. Tidsuppskattning

| Fas | Uppskattad tid | Beroenden |
|-----|---------------|-----------|
| Fas 1: Datalager | 2-3 timmar | Ingen |
| Fas 2: Auth Service | 2-3 timmar | Fas 1 |
| Fas 3: Audit Service | 2-3 timmar | Fas 1 |
| Fas 4: UI Components | 3-4 timmar | Fas 2, 3 |
| Fas 5: Integration | 2-3 timmar | Fas 4 |
| Fas 6: First-Run | 1-2 timmar | Fas 5 |
| **Total** | **12-18 timmar** | |

---

## 9. Nästa Steg

1. **Godkänn planen** - Granska och bekräfta arkitekturen
2. **Börja Fas 1** - Uppdatera datalager med nya stores/repositories
3. **Iterativ utveckling** - En fas i taget med testning efter varje steg
4. **Integration** - Koppla ihop allt och verifiera

---

**Skapad:** Februari 2026  
**Status:** Planering ⬜  
**Nästa Fas:** Fas 1 - Datalager
