# HETZA-RA: Technical Overview for AI Collaborators

**Project Name:** HETZA-RA (Riskbedömning & CE-märkning)  
**Primary Language:** Swedish  
**Version:** 1.0.0  
**Last Updated:** February 2026

---

## 1. Architecture & Tech Stack

### High-Level Architecture

HETZA-RA is a **frontend-first risk assessment and CE-marking application** for machinery. It uses a **three-tier architecture** with a data abstraction layer designed to support multiple deployment scenarios:

```
┌─────────────────────────────────────────────────────────────┐
│                    UI LAYER (HTML/CSS)                      │
│        (7 Tabs, Settings, Import/Export, Modals)            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              FEATURE LAYER (Business Logic)                 │
│    (12 feature modules: Tab 1-7, Project, Support, etc.)    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│          DATA ABSTRACTION LAYER (Repository Pattern)        │
│              (Repositories + Adapter Interface)              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│        PERSISTENCE LAYER (Multiple Adapters)                │
│  IndexedDB (current) | SQLite (planned) | HTTP (planned)    │
│  Tauri Desktop (planned) | Local File Storage (planned)     │
└─────────────────────────────────────────────────────────────┘
```

### Core Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Bundler** | Parcel 2.16.3 | Module bundling and dev server |
| **Language** | JavaScript (ES Modules) | Application logic |
| **UI Framework** | Vanilla HTML/CSS | No framework dependencies |
| **State Management** | Global state object (state.js) | In-memory project state |
| **Data Persistence** | IndexedDB | Browser-based NoSQL storage |
| **Internationalization** | i18n/index.js | Swedish/English translations |
| **Build Output** | Single-page application (dist/) | Static HTML + bundled JS |

### Why This Architecture?

1. **Future Deployment Support**: Data layer can swap adapters (IndexedDB → SQLite → HTTP) without changing feature code
2. **Offline-First**: IndexedDB enables complete offline functionality
3. **No Backend Dependency**: Currently works entirely in-browser
4. **Gradual Migration Path**: Legacy code can coexist with new repository pattern during refactoring

---

## 2. Project Structure

### Directory Hierarchy

```
JS/
├── main.js                          # Parcel entry point, DOMContentLoaded init
├── state.js                         # Global project state management
├── matrix.js                        # Risk matrix calculations
├── window-exports.js                # Legacy HTML event bindings
│
├── data/                            # DATA ABSTRACTION LAYER (NEW)
│   ├── index.js                     # Data layer initialization & exports
│   ├── compat-storage-service.js    # Backward compatibility wrapper
│   ├── adapters/
│   │   ├── adapter-interface.js     # Contract for all adapters
│   │   └── indexeddb-adapter.js     # IndexedDB implementation (175 lines)
│   └── repositories/
│       ├── base-repository.js       # Common CRUD logic
│       └── project-repository.js    # Project-specific operations
│
├── features/                        # FEATURE MODULES
│   ├── tab1/                        # Tab 1: Produktdata (Product Data)
│   │   ├── product-data.js
│   │   ├── directives.js
│   │   ├── standards.js
│   │   └── index.js
│   │
│   ├── tab2/                        # Tab 2: Riskparametrar & Åtgärder (Risk Assessment)
│   │   ├── risk-parameters.js
│   │   ├── risk-crud.js
│   │   ├── risk-validation.js
│   │   ├── risk-measures.js
│   │   └── index.js
│   │
│   ├── tab3/                        # Tab 3: Gränssnitt (Interfaces)
│   │   └── interface-crud.js
│   │
│   ├── tab4/                        # Tab 4: Kontrollista (Control Checklist)
│   │   └── control-list.js
│   │
│   ├── tab5/                        # Tab 5: Livsfaser (Life Phases)
│   │   └── life-phases.js
│   │
│   ├── tab6/                        # Tab 6: Maskinbegränsningar (Machine Limits)
│   │   └── machine-limits.js
│   │
│   ├── tab7/                        # Tab 7: Köpta Maskiner (Purchased Machines)
│   │   ├── module-interface.js
│   │   ├── purchased-machines.js
│   │   └── index.js
│   │
│   ├── project/                     # PROJECT MANAGEMENT
│   │   ├── project-list.js          # Load latest project
│   │   ├── project-load.js          # Display project data
│   │   ├── project-create.js        # Create new project
│   │   └── revision.js              # Revision management
│   │
│   ├── support/                     # SUPPORT FEATURES
│   │   ├── auto-save.js             # Auto-save to storage
│   │   ├── export.js                # Export project + CSV
│   │   └── import.js                # Import project + CSV
│   │
│   ├── lists/                       # LIST MANAGEMENT
│   │   └── list-editor.js           # Edit risk groups, hazards, etc.
│   │
│   └── layout/                      # UI LAYOUT
│       └── (header, footer, etc.)
│
├── ui/                              # UI COMPONENTS & STATE
│   ├── tabs.js                      # Tab switching logic
│   ├── settings.js                  # Settings menu
│   ├── modals.js                    # Modal dialogs
│   └── (form elements, buttons, etc.)
│
├── i18n/                            # INTERNATIONALIZATION
│   └── index.js                     # Translation system (Swedish/English)
│
├── config/                          # STATIC DATA & CONFIG
│   ├── risk-data.js                 # Risk groups, categories, measures
│   └── control-questions.js         # Default control questions
│
└── utils/                           # UTILITIES
    └── (formatting, validation helpers)

data/                               # STATIC JSON DATA
├── hazards.json                     # List of hazards
├── riskGroups.json                  # Risk group definitions
├── scenarios.json                   # Risk scenarios
└── standards.json                   # Standards/directives

CSS/
├── style.css                        # Main styles
└── components.css                   # Component styles

index.html                           # Single HTML entry point
package.json                         # Parcel config + dependencies
```

### Module Responsibilities

| Module | Responsibility |
|--------|-----------------|
| **main.js** | Initialize data layer, set up event listeners, load first project |
| **state.js** | Hold current project in memory, provide getter/setter |
| **data/index.js** | Export repositories and initialize adapters |
| **features/** | Business logic for each feature tab |
| **ui/** | Handle UI state and event binding |
| **i18n/index.js** | Translate content based on language selection |
| **config/** | Static reference data (risks, standards, etc.) |

---

## 3. Data Models & State

### Central Entity: Project

The **Project** is the core entity representing a complete risk assessment for one machine/product.

```javascript
{
  id: "uuid-or-auto-increment",
  
  // Metadata
  meta: {
    projectName: string,
    revision: string,           // e.g., "1.0", "1.1"
    created: ISO8601 timestamp,
    lastModified: ISO8601 timestamp
  },
  
  // Tab 1: Product Data
  productData: {
    orderNumber: string,
    projectNumber: string,
    productType: string,
    productName: string,
    model: string,
    serialNumber: string,
    batchNumber: string,
    machineNumber: string,
    functionDescription: string,
    isPartlyCompleted: boolean
  },
  
  // Manufacturer Info
  manufacturer: {
    companyName: string,
    address: string,
    contactInfo: string,
    email: string,
    phone: string,
    docSignatory: string,
    technicalFileResponsible: string
  },
  
  // Tab 2: Risk Assessment
  risks: [
    {
      id: string,
      groupId: string,              // e.g., "mechanical", "electrical"
      hazardIds: [string, ...],     // References to hazards
      description: string,
      existingMeasures: string,
      residualRisk: number,         // 1-5 scale
      measures: [
        {
          id: string,
          description: string,
          priority: "high"|"medium"|"low",
          dueDate: ISO8601 timestamp,
          responsible: string,
          status: "open"|"closed"
        }
      ]
    }
  ],
  
  // Tab 3: Interfaces
  interfaces: [
    {
      id: string,
      name: string,
      type: string,
      description: string,
      safetyRelevant: boolean
    }
  ],
  
  // Tab 4: Control Checklist
  customControlQuestions: [
    {
      id: string,
      question: string,
      notes: string,
      checked: boolean
    }
  ],
  
  // Tab 5: Life Phases
  lifePhases: {
    transport: boolean,
    installation: boolean,
    operation: boolean,
    maintenance: boolean,
    decommissioning: boolean
  },
  
  // Tab 6: Machine Limits
  machineLimits: {
    maxPower: number,
    maxSpeed: number,
    maxWeight: number,
    otherLimits: string
  },
  
  // Tab 7: Purchased Machines (Modules)
  purchasedMachines: [
    {
      id: string,
      name: string,
      manufacturer: string,
      model: string,
      serialNumber: string,
      certificateType: string,
      riskAssessmentIncluded: boolean
    }
  ],
  
  // Compliance
  compliance: {
    isHighRisk: boolean,
    highRiskCategory: string,
    highRiskCustom: string,
    highRiskNotes: string,
    conformityPath: "self"|"notified"|"custom",
    standards: [string, ...]
  }
}
```

### Global State Management

**Location:** `JS/state.js`

```javascript
// Global in-memory state
let currentProject = null;

export function getCurrentProject() {
  return currentProject;
}

export function setCurrentProject(project) {
  currentProject = project;
}
```

**Why Simple?** The project is loaded entirely into memory and kept in sync with IndexedDB via the repository pattern. No need for Redux/Vuex since there's only one "entity" being managed (the current project).

### Data Persistence Flow

```
User Action (e.g., save risk)
    ↓
Feature Module calls: await repo.saveProject(project)
    ↓
Project Repository validates & calls adapter.save('projects', project)
    ↓
IndexedDB Adapter stores in "projects" object store
    ↓
Data persisted to browser IndexedDB
    ↓
Auto-save triggers periodically (every 30 seconds)
```

---

## 4. Key Workflows

### Workflow 1: Load and Display Latest Project (On App Startup)

**Triggered:** `DOMContentLoaded` event  
**Entry Point:** `main.js` → `initializeProject()`  
**Feature:** `JS/features/project/project-list.js`

```
1. Call initializeDataLayer()
   └─ Initialize IndexedDB adapter
   └─ Create project repository
   
2. Call getProjectRepository().listProjects()
   └─ Query all projects from IndexedDB
   
3. Sort projects by lastModified (descending)
   └─ Most recent project first
   
4. If projects exist:
   └─ Load latest project into global state
   └─ Load project data into form fields (Tab 1-7)
   └─ Display project name and revision
   
   Else:
   └─ Create empty project template
   └─ Load default control questions
   └─ Display "New Project" as title
   
5. UI is now ready for user interaction
```

**Key Files Involved:**
- `main.js` - Orchestration
- `project-list.js` - Load and sort logic
- `project-load.js` - Populate form fields
- `data/index.js` - Initialize data layer
- `data/repositories/project-repository.js` - Query projects

---

### Workflow 2: Add a New Risk and Save (Tab 2)

**Triggered:** User clicks "Lägg till risk" (Add Risk)  
**Entry Points:** `features/tab2/risk-crud.js`

```
1. User fills risk form:
   ├─ Select Risk Group (dropdown)
   ├─ Select Hazards (multi-select)
   ├─ Enter Description
   ├─ Enter Existing Measures
   └─ Enter Residual Risk (1-5)

2. Click "Spara risk" (Save Risk)
   └─ Call createRisk() or updateRisk()
   
3. Form validation:
   └─ Check all required fields filled
   └─ Validate risk level (1-5)
   └─ Check for duplicate hazard combinations
   
4. Add risk object to currentProject.risks array:
   ├─ Generate unique ID
   ├─ Create measure objects (if applicable)
   └─ Calculate risk matrix position
   
5. Call saveRisk() which is wrapped in async IIFE:
   ├─ await getProjectRepository().saveProject(currentProject)
   └─ Persist entire project to IndexedDB
   
6. Update UI:
   ├─ Close form modal
   ├─ Refresh risk table
   ├─ Show success notification
   
7. Auto-save triggers after 30 seconds (backup save)
```

**Key Files Involved:**
- `features/tab2/risk-crud.js` - Create/update/delete risk logic
- `features/tab2/risk-validation.js` - Input validation
- `features/tab2/risk-measures.js` - Measure management
- `state.js` - Access currentProject
- `data/repositories/project-repository.js` - Save to IndexedDB

---

### Workflow 3: Export Project to JSON File (Support Feature)

**Triggered:** User selects "Exportera projekt" (Export Project)  
**Entry Point:** `features/support/export.js`

```
1. User clicks "Exportera projekt" in Settings menu
   
2. Call exportProject() function
   ├─ Get current project from global state
   ├─ Format project data
   ├─ Add metadata (export timestamp, version)
   └─ Convert to JSON string
   
3. Create Blob from JSON string
   
4. Generate filename:
   └─ `{projectName}_{revision}_{timestamp}.json`
   
5. Create download link:
   ├─ Create <a> element
   ├─ Set href to Blob URL
   ├─ Set download attribute
   └─ Trigger click event
   
6. Browser downloads JSON file to user's computer
   
7. User can re-import file later via "Importera projekt"
```

**Key Files Involved:**
- `features/support/export.js` - Export logic
- `features/support/import.js` - Re-import logic
- `state.js` - Access currentProject
- `i18n/index.js` - Format translated content for export

---

## 5. Developer Patterns

### Error Handling Pattern

**Pattern:** Try-catch with console logging + user notification

```javascript
// Feature modules wrap async operations
try {
    const repo = getProjectRepository();
    await repo.saveProject(project);
    console.log('✓ Project saved successfully');
    // Optional: Show toast notification
} catch (error) {
    console.error('❌ Failed to save project:', error);
    // Show error notification to user
    showErrorNotification('Kunde inte spara projektet');
}
```

**Design Decision:** Console errors are logged for developers, user-facing errors are shown via modals/toasts.

---

### Data Persistence Pattern (Repository Pattern)

All data access goes through repositories:

```javascript
// ✅ CORRECT: Use repository
const repo = getProjectRepository();
await repo.saveProject(project);

// ❌ WRONG: Direct storage access
StorageService.saveProject(project);  // Deprecated!
```

**Why?** Repositories abstract the persistence layer, allowing adapter swaps without changing feature code.

---

### Async/Await Pattern in Event Handlers

Since features work with async repositories, event handlers use an IIFE wrapper:

```javascript
// Event handler
document.getElementById('saveBtn').addEventListener('click', async () => {
    // Direct async handler
    const repo = getProjectRepository();
    await repo.saveProject(project);
});

// OR wrapped in IIFE (for complex callback scenarios)
(() => {
    try {
        const repo = getProjectRepository();
        repo.saveProject(project);  // Fire and forget if no await needed
    } catch (error) {
        console.error('Error:', error);
    }
})();
```

---

### Internationalization Pattern

All user-facing text uses data-i18n attributes:

```html
<!-- HTML -->
<button data-i18n="header.save">Spara</button>
<label data-i18n="tab1.productName">Produktnamn</label>
```

```javascript
// Translation function
import { t } from './i18n/index.js';

const message = t('header.save');  // Returns "Spara" (Swedish) or "Save" (English)
```

**Translation Files:** `i18n/` directory contains JSON with Swedish/English key-value pairs.

---

### Styling Pattern

No CSS framework. Pure CSS with CSS custom properties (variables):

```css
/* CSS Variables */
:root {
    --primary-color: #007bff;
    --bg-color: #f8f9fa;
    --border-color: #dee2e6;
}

/* Component styles */
.btn {
    padding: 0.5rem 1rem;
    border: 1px solid var(--border-color);
    background-color: var(--primary-color);
}
```

**Design:** Keep styles modular in separate CSS files (style.css for globals, components.css for reusable components).

---

### Form Input Pattern

Forms are data-driven. When user modifies a field, update currentProject immediately:

```javascript
// Tab 1: Product Data input
document.getElementById('productName').addEventListener('change', (e) => {
    getCurrentProject().productData.productName = e.target.value;
    // Auto-save timer will trigger in background
});
```

**Why?** Data-driven approach ensures the form is always in sync with the in-memory project state.

---

## 6. Data Adapter Interface (Future Deployment Support)

The data abstraction layer defines a strict interface that all adapters must implement:

```javascript
// adapter-interface.js
export const DataAdapterInterface = {
    async init()                    // Initialize adapter
    async get(store, id)            // Get one object
    async getAll(store)             // Get all objects
    async save(store, object)       // Save object
    async delete(store, id)         // Delete object
    async query(store, predicate)   // Query with custom logic
    async clear(store)              // Clear all objects in store
}
```

**Current Implementation:** IndexedDB Adapter  
**Future Implementations (Planned):**
- SQLite Adapter (for Raspberry Pi local storage)
- HTTP API Adapter (for cloud deployments)
- Tauri Adapter (for desktop app via Tauri)

**Adapter Usage:** Simply change one line in `data/index.js` to swap adapters!

---

## 7. Build & Deployment

### Development Server

```bash
npm start
# Runs Parcel dev server on http://localhost:1234
# Auto-reloads on file changes
# Hot module replacement enabled
```

### Production Build

```bash
npm run build
# Creates optimized bundle in dist/
# Output: index.html + bundled JS/CSS
# Ready to deploy to static hosting
```

### Build Output

```
dist/
├── index.html                      # Entry point
├── Refac.6e12e6f0.js              # Main bundle (386.75 KB)
├── Refac.73a6401a.js              # Feature code
├── Refac.85ecbeca.js              # UI code
└── CSS files                       # Compiled styles
```

---

## 8. Testing the Application

### Quick Test Checklist

1. **Create New Project**
   - Click Settings → Nytt projekt
   - Fill Product Data (Tab 1)
   - Verify data saves to IndexedDB

2. **Add and Save Data**
   - Tab 2: Add a risk
   - Tab 3: Add an interface
   - Tab 4: Check control questions
   - Verify each save works

3. **Reload and Verify Persistence**
   - Press F5 to reload page
   - Verify all data is loaded back
   - Check browser DevTools → Application → IndexedDB

4. **Export/Import**
   - Settings → Exportera projekt
   - Download JSON file
   - Create new project
   - Settings → Importera projekt
   - Verify imported data matches

5. **Language Switching**
   - Settings → English
   - Verify all text translates
   - Create new project in English
   - Switch back to Swedish
   - Verify text updates

6. **Auto-Save**
   - Modify data
   - Wait 30 seconds without clicking save
   - Reload page
   - Verify changes persisted

---

## 9. Known Limitations & Future Work

### Current Limitations
- **Offline Only**: No real-time sync with backend
- **Single Adapter**: Only IndexedDB (no SQLite/HTTP yet)
- **No Authentication**: All data is local to browser
- **No Collaboration**: Single-user only
- **No API**: No REST/GraphQL endpoints

### Phase 5 Roadmap (Not Started)
- [ ] SQLite Adapter for Raspberry Pi deployments
- [ ] HTTP API Adapter for cloud-based risk assessment
- [ ] Tauri Integration for desktop application
- [ ] Backend API for multi-user collaboration
- [ ] Cloud sync with conflict resolution

---

## 10. Code Navigation Quick Reference

### To Find...

| What | Where |
|------|-------|
| Project structure | `JS/features/` (organized by tab) |
| Risk logic | `JS/features/tab2/` |
| Data saving | `JS/data/repositories/project-repository.js` |
| Database adapter | `JS/data/adapters/indexeddb-adapter.js` |
| Translations | `JS/i18n/index.js` + JSON files |
| Global state | `JS/state.js` |
| Auto-save | `JS/features/support/auto-save.js` |
| Settings menu | `JS/ui/settings.js` |
| Tab switching | `JS/ui/tabs.js` |

---

## 11. Contact & Questions

For questions about:
- **Architecture decisions**: Refer to `DATA_ABSTRACTION_PLAN.md` and `REFACTOR_PLAN.md`
- **Feature implementations**: Check the specific feature module's comments
- **Data model**: See `project-repository.js` for the empty project template
- **Testing**: Use browser DevTools and the test checklist above

---

**Document Status:** Complete ✅  
**Last Reviewed:** February 2026  
**Contributors:** AI Refactoring Team
