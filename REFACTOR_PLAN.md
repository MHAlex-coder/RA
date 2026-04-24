# REFACTOR_PLAN.md – HETZA-RA Modularization Strategy

> **Document Version:** 2.0  
> **Date:** 2025-01-24  
> **Status:** PLANNING PHASE  
> **Application:** HETZA-RA – Risk Assessment Tool for CE Marking  
> **Target Module System:** ES Modules (import / export)  
> **Bundler:** Parcel  

---

## Table of Contents

1. [Project Goals](#1-project-goals)
2. [Non-Negotiable Refactor Rules](#2-non-negotiable-refactor-rules)
3. [Current Codebase Analysis](#3-current-codebase-analysis)
4. [Global State & Mutations Inventory](#4-global-state--mutations-inventory)
5. [Function Dependency Matrix](#5-function-dependency-matrix)
6. [Window Namespace Exports](#6-window-namespace-exports)
7. [Event Listener Inventory](#7-event-listener-inventory)
8. [DOM Selector Catalog](#8-dom-selector-catalog)
9. [Circular Dependency Risk Analysis](#9-circular-dependency-risk-analysis)
10. [Proposed Module Structure](#10-proposed-module-structure)
11. [Module Signature Examples](#11-module-signature-examples)
12. [Step-by-Step Refactor Phases](#12-step-by-step-refactor-phases)
13. [Verification & Safety Strategy](#13-verification--safety-strategy)
14. [Risk Analysis](#14-risk-analysis)
15. [Progress Tracking](#15-progress-tracking)

---

## 1. Project Goals

### Primary Objectives
- **Modularize** the monolithic `app.js` (~8,826 lines) into focused modules of 200-400 lines each
- **Extract** i18n.js translations into structured, importable modules
- **Maintain** full application functionality after each refactoring phase
- **Enable** easy future migration to ES Modules

### Key Constraints
- Use **ES Modules** pattern (`import` / `export`) exclusively
- Maintain **Parcel bundler** compatibility
- Application must remain **fully runnable** after each phase
- Zero breaking changes to existing functionality

### Success Criteria
- [ ] All modules are 200-400 lines maximum
- [ ] Clear separation of concerns (UI, State, Logic, Data)
- [ ] No circular dependencies
- [ ] All existing features work identically
- [ ] Codebase is testable and maintainable

---

## 2. Non-Negotiable Refactor Rules

### Module Pattern Rules
```javascript
// REQUIRED: ES Module export pattern
export { functionName, anotherFunction };

// Alternative: Named exports directly
export function functionName() { /* ... */ }
export const anotherFunction = () => { /* ... */ };

// REQUIRED: ES Module import pattern  
import { functionName } from './moduleName.js';

// Default export (when module has single primary export)
export default MainClass;
import MainClass from './moduleName.js';
```

### Code Quality Rules
1. **Single Responsibility** – Each module handles ONE domain
2. **Explicit Dependencies** – All imports at file top
3. **No Global Pollution** – Minimize window.* assignments
4. **State Isolation** – Only `state.js` manages AppState
5. **Pure Functions** – Prefer pure functions where possible

### File Size Rules
- **Maximum:** 400 lines per module
- **Target:** 200-300 lines per module
- **Exception:** i18n translation files may exceed if logically grouped

### Naming Conventions
- Files: `kebab-case.js` (e.g., `risk-cards.js`)
- Exports: `camelCase` (e.g., `renderRiskCards`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `DIRECTIVE_OPTIONS`)

---

## 3. Current Codebase Analysis

### File Inventory

| File | Lines | Purpose | Complexity |
|------|-------|---------|------------|
| `JS/app.js` | 8,826 | Main application logic | 🔴 Critical |
| `i18n.js` | 2,028 | Translations (sv/en) | 🟡 Medium |
| `JS/storage.js` | 205 | IndexedDB storage service | 🟢 Low |
| `JS/matrix.js` | 330 | Risk calculation matrix | 🟢 Low |

### app.js Structure Analysis

#### Lines 1-500: Core Setup
- **AppState** object (lines 7-14) – Global mutable state
- **RiskLevelsFallback** constant (lines 17-37) – Fallback risk levels
- **riskGroupsData** embedded object (lines 67-166) – Risk categories
- **riskListLabels** translations (lines 169-277) – Dropdown labels
- **DIRECTIVE_OPTIONS**, **LIFE_PHASE_OPTIONS** – Configuration constants
- **controlQuestions** array (lines ~295-600+) – CE compliance checklist
- **DOMContentLoaded** handler – Application initialization

#### Lines 500-1500: Tab 1 Functions
- `initializeProject()`, `loadProjectDataToForm()`
- `initializeTab1Forms()`, `handleLogoUpload()`, `removeLogo()`
- `addStandard()`, `populateStandardsDropdown()`
- `populateDirectivesDropdown()`, `addDirective()`
- `renderAdditionalDirectivesList()`, `removeAdditionalDirective()`
- `renderDirectivesList()`, `handleDirectiveSelection()`
- `renderStandardsList()`, `togglePartialStandard()`
- `setupAutoSave()`, `updateProjectFromForm()`, `saveCurrentProject()`

#### Lines 1500-3000: Tab 2 & 3 Functions
- `initializeTab2Forms()` – Risk assessment setup
- `initializeTab3Forms()` – Interface risks setup
- `createNewInterfaceRisk()`, `renderInterfaceRisks()`
- `renderInterfaceRiskCard()`, `renderInterfaceActionPanelContent()`
- `renderInterfaceValidationPanelContent()`
- `toggleInterfaceActionPanel()`, `toggleInterfaceValidationPanel()`
- `updateInterfaceRisk()`, `deleteInterfaceRisk()`
- `addInterfaceProtectiveMeasure()`, `updateInterfaceProtectiveMeasure()`

#### Lines 3000-5000: Risk Cards Core
- `createNewRisk()`, `renderRiskCards()`, `renderRiskList()`
- `selectRisk()`, `changeRiskSortOrder()`, `renderRiskDetail()`
- `renderRiskCard()`, `renderParameterSelectCompact()`
- `toggleRiskDetails()`, `toggleActionPanel()`, `toggleValidationPanel()`
- `renderActionPanelContent()`, `renderValidationPanelContent()`
- `updateRisk()`, `addProtectiveMeasure()`, `updateProtectiveMeasure()`
- `updateRiskParameter()`, `addEvidenceLink()`, `deleteRisk()`
- `initializeTabs()`, `switchTab()`

#### Lines 5000-7000: Control Report & Import/Export
- `CONTROL_REPORT_TEMPLATES` – Large configuration object
- `initializeControlReport()`, `renderControlChecklist()`
- `updateCheckpointStatus()`, `showControlHelp()`
- `saveControlReportData()`, `loadControlReportData()`
- `createNewRevision()`, `exportProject()`, `importProject()`
- `collectTranslationEntries()`, `exportTranslationCSV()`, `importTranslationCSV()`
- `openEditListsModal()`, `switchListTab()`, `renderListEditor()`
- `saveRiskMatrixLists()`, `renderControlQuestionsEditor()`

#### Lines 7000-8826: Tab 5-7, Utilities & Project Management
- `initializeTab5Forms()`, `loadDoCData()`, `renderDoCDirectives()`
- `generateDoC()`, `generatePurchasedMachinesSection()`
- `generateModulesDeclarationSection()`, `exportRiskAssessment()`
- `generateSummaryReport()`, `generateTCFChecklist()`
- Layout viewer functions (`uploadLayoutImage()`, `openImageViewer()`, etc.)
- Module/purchased machine functions
- `createNewProject()`, `updateRiskAssessmentTabColor()`
- `exportControlReport()` and various utility functions

---

## 4. Global State & Mutations Inventory

### Critical Global Variables

| Variable | Location | Type | Mutated By | Risk Level |
|----------|----------|------|------------|------------|
| `AppState` | line 7 | Object | 50+ functions | 🔴 Critical |
| `AppState.currentProject` | – | Object | All save/update functions | 🔴 Critical |
| `AppState.currentTab` | – | String | `switchTab()` | 🟡 Medium |
| `AppState.currentObject` | – | String | Object selection | 🟡 Medium |
| `AppState.selectedRiskId` | – | String | `selectRisk()`, `createNewRisk()` | 🟡 Medium |
| `AppState.riskSortOrder` | – | String | `changeRiskSortOrder()` | 🟢 Low |
| `AppState.exportSortOrder` | – | String | `setExportSortOrder()` | 🟢 Low |
| `AppState.moduleDataLoaded` | – | Object/null | `viewModuleData()`, `clearModuleData()` | 🟡 Medium |
| `riskGroupsData` | line 67 | Object | None (read-only) | 🟢 Low |
| `RiskLevelsFallback` | line 17 | Object | None (read-only) | 🟢 Low |
| `controlQuestions` | line ~295 | Array | Custom edits saved to project | 🟡 Medium |
| `currentEditingList` | line ~6700 | String | `switchListTab()` | 🟢 Low |
| `currentZoom` | line ~7800 | Number | Zoom functions | 🟢 Low |
| `currentImageIndex` | line ~7800 | Number | `openImageViewer()` | 🟢 Low |

### AppState Mutation Pattern

```javascript
// Current pattern (problematic):
AppState.currentProject.risks.push(newRisk);
AppState.currentProject.standards.splice(index, 1);
AppState.selectedRiskId = risk.id;

// Proposed pattern (centralized):
import { updateProject, selectRisk } from './state.js';
updateProject(draft => { draft.risks.push(newRisk); });
selectRisk(risk.id);
```

---

## 5. Function Dependency Matrix

### Core Dependencies (15 Key Functions)

| Function | Depends On | Used By | Complexity |
|----------|------------|---------|------------|
| `initializeProject()` | `StorageService`, `loadProjectDataToForm()`, `renderObjectsList()`, `initializeTab1Forms()` | `DOMContentLoaded` | 🔴 High |
| `loadProjectDataToForm()` | `AppState`, DOM elements, `updateProjectName()`, `updateProjectRevision()` | `initializeProject()`, `importProject()` | 🔴 High |
| `saveCurrentProject()` | `updateProjectFromForm()`, `StorageService.saveProject()` | Button onclick | 🟡 Medium |
| `updateProjectFromForm()` | AppState, 40+ DOM element reads, `updateDeclarationModeUI()` | `saveCurrentProject()`, auto-save | 🔴 High |
| `renderRiskCards()` | `AppState`, `riskGroupsData`, `RiskMatrix`, `t()`, `renderRiskList()`, `renderRiskDetail()` | Tab switch, risk CRUD | 🔴 High |
| `renderRiskDetail()` | `AppState`, `RiskMatrix`, `t()`, `renderActionPanelContent()`, `renderValidationPanelContent()` | `renderRiskCards()`, `selectRisk()` | 🔴 High |
| `updateRisk()` | `AppState`, `StorageService.saveProject()`, `renderRiskList()`, `rerenderRiskDetailPreservePanels()` | Input onchange handlers | 🟡 Medium |
| `switchTab()` | `AppState`, various render functions per tab | Tab button onclick | 🟡 Medium |
| `t()` | `translations`, `currentLang` | 200+ locations | 🔴 Critical |
| `StorageService.saveProject()` | IndexedDB | All save operations | 🔴 Critical |
| `RiskMatrix.calculateRisk()` | Lookup table | Risk rendering, export | 🟡 Medium |
| `createEmptyProject()` | None (pure function) | `createNewProject()`, import | 🟢 Low |
| `getCustomList()` | `AppState`, `riskGroupsData` | All dropdown renders | 🟡 Medium |
| `initializeControlReport()` | `renderControlChecklist()`, `loadControlReportData()` | Tab switch | 🟡 Medium |
| `generateDoC()` | `AppState`, `t()`, project data | Export button | 🟡 Medium |

### Dependency Graph (Simplified)

```
DOMContentLoaded
    └── initializeProject()
            ├── StorageService.init()
            ├── StorageService.listProjects() / loadProject()
            ├── loadProjectDataToForm()
            │       └── updateProjectName/Revision()
            ├── renderObjectsList()
            ├── initializeTabs()
            ├── initializeSettings()
            ├── initializeObjectList()
            ├── initializeTab1Forms()
            │       └── addStandard(), handleLogoUpload(), etc.
            ├── initializeTab2Forms()
            │       └── renderRiskCards()
            └── setupAutoSave()

switchTab(tabId)
    ├── tab1 → renderStandardsList(), renderDirectivesList()
    ├── tab2 → renderRiskCards()
    ├── tab3 → renderInterfaceRisks()
    ├── tab4 → initializeControlReport()
    ├── tab5 → initializeTab5Forms()
    └── tab7 → renderLayoutImages()
```

---

## 6. Window Namespace Exports

### Current window.* Assignments

| Export | Line | Purpose | Required for HTML onclick |
|--------|------|---------|---------------------------|
| `window.openRiskMatrixModal` | ~450 | Modal open | ✅ Yes |
| `window.closeRiskMatrixModal` | ~450 | Modal close | ✅ Yes |
| `window.toggleRiskDetails` | ~3300 | Risk card expand/collapse | ✅ Yes |
| `window.toggleInterfaceRiskDetails` | ~3320 | Interface risk expand/collapse | ✅ Yes |
| `window.selectRisk` | ~2900 | Risk list selection | ✅ Yes |
| `window.changeRiskSortOrder` | ~2910 | Sort order change | ✅ Yes |
| `window.toggleRiskSection` | ~3400 | Action/validation toggle | ✅ Yes |
| `window.toggleActionPanel` | ~3380 | Action panel toggle | ✅ Yes |
| `window.toggleValidationPanel` | ~3390 | Validation panel toggle | ✅ Yes |
| `window.addProtectiveMeasure` | ~4200 | Add measure | ✅ Yes |
| `window.updateProtectiveMeasure` | ~4230 | Update measure | ✅ Yes |
| `window.removeProtectiveMeasure` | ~4260 | Remove measure | ✅ Yes |
| `window.addInterfaceProtectiveMeasure` | ~2500 | Interface measure add | ✅ Yes |
| `window.updateInterfaceProtectiveMeasure` | ~2530 | Interface measure update | ✅ Yes |
| `window.removeInterfaceProtectiveMeasure` | ~2560 | Interface measure remove | ✅ Yes |
| `window.checkAllControlPoints` | ~5600 | Bulk check | ✅ Yes |

### Strategy for Window Exports

Create a centralized `window-exports.js` module:

```javascript
// window-exports.js
import { openRiskMatrixModal, closeRiskMatrixModal } from './modals.js';
import { toggleRiskDetails, selectRisk } from './risk-cards.js';
// ... etc

export function registerWindowHandlers() {
    window.openRiskMatrixModal = openRiskMatrixModal;
    window.closeRiskMatrixModal = closeRiskMatrixModal;
    // ... etc
}
```

---

## 7. Event Listener Inventory

### DOMContentLoaded Listeners
- Main initialization (1 listener)
- Click capture for module mode blocking
- Change capture for module mode blocking

### Element-Specific Listeners (setupAutoSave)

| Element Type | Elements Count | Event | Handler |
|--------------|----------------|-------|---------|
| Text inputs | ~30 fields | `change` | `updateProjectFromForm()` |
| Textareas | ~10 fields | `change` | `updateProjectFromForm()` |
| Checkboxes | ~20 fields | `change` | `updateProjectFromForm()` |

### Button Listeners
- `#settings-btn` → Toggle settings menu
- `#addRiskBtn` → `createNewRisk()`
- `#add-interface-risk-btn` → `createNewInterfaceRisk()`
- `#add-object-btn` → `importModule()`
- `#add-purchased-machine-btn` → `openPurchasedMachineModal()`

### Inline onclick Handlers (HTML-generated)
- Risk cards: `onclick="updateRisk('${riskId}', 'field', value)"`
- Control checkpoints: `onchange="updateCheckpointStatus('key', 'status')"`
- Modal buttons: `onclick="closeEditListsModal()"`
- Tab buttons: `onclick="switchTab('tabId')"`

---

## 8. DOM Selector Catalog

### Critical Element IDs

#### Tab 1 - Technical Documentation
```javascript
// Product Data
'orderNumber', 'projectNumber', 'productType', 'productName', 
'model', 'serialNumber', 'batchNumber', 'machineNumber', 
'functionDescription', 'isPartlyCompleted'

// Manufacturer
'companyName', 'address', 'contactInfo', 'docSignatory', 
'technicalFileResponsible', 'manufacturerEmail', 'manufacturerPhone'

// Directives & Standards
'directivesList', 'additionalDirectivesList', 'standardsList',
'standardsDropdown', 'directivesDropdown'

// Framework
'intendedUse', 'foreseeableMisuse', 'spaceLimitations', 
'timeLimitations', 'otherLimitations'

// Compliance
'highRiskCategory', 'highRiskCustom', 'highRiskNotes',
'complianceNotifiedBody', 'conformity-self', 'conformity-notified'

// Digital Safety
'softwareVersion', 'updatePolicy', 'cybersecurityMeasures',
'aiSafetyFunctions', 'digitalInstructions', 'loggingTraceability'
```

#### Tab 2 - Risk Assessment
```javascript
'riskCardsList', 'addRiskBtn', 'risk-list', 'risk-detail-container',
'risk-sort-order'
// Dynamic: 'risk-content-{id}', 'action-panel-{id}', 'validation-panel-{id}'
```

#### Tab 3 - Interface Risks
```javascript
'interface-risks-container', 'add-interface-risk-btn'
// Dynamic: 'interface-risk-content-{id}', 'interface-action-panel-{id}'
```

#### Tab 4 - Control Report
```javascript
'control-checklist', 'control-checklist-title', 'control-directive-note',
'control-summary', 'control-reviewer', 'control-date',
'control-approver', 'control-approval-date'
```

#### Tab 5 - EU Declaration
```javascript
'doc-manufacturer', 'doc-machine-type', 'doc-model', 'doc-serial',
'doc-notified-body', 'doc-digital-link', 'doc-place', 'doc-date',
'doc-signatory-name', 'doc-signatory-title', 'doc-email', 'doc-phone',
'doc-directives-list', 'doc-standards-list'
```

#### Tab 7 - Safety Layout
```javascript
'layout-images-container', 'layout-title', 'image-viewer-modal',
'viewer-image', 'viewer-title', 'zoom-level', 'fullscreen-btn'
```

---

## 9. Circular Dependency Risk Analysis

### High Risk Patterns

#### Pattern 1: State ↔ UI Rendering
```
state.js → exports AppState
risk-cards.js → requires state.js (reads AppState)
risk-cards.js → calls updateRisk() which modifies AppState
state.js → could need to notify risk-cards.js of changes
```
**Mitigation:** Use event-based updates or callback registration

#### Pattern 2: i18n ↔ All Modules
```
i18n.js → exports t()
matrix.js → requires t() for level labels
app.js → requires t() for all UI text
```
**Mitigation:** i18n.js has NO dependencies - safe as leaf module

#### Pattern 3: Storage ↔ State
```
storage.js → provides saveProject()
state.js → needs saveProject() for persistence
storage.js → might need state for context
```
**Mitigation:** storage.js takes project as parameter, no state dependency

### Safe Dependency Order (Bottom-Up)
1. **Leaf modules** (no dependencies): `i18n.js`, `constants.js`
2. **Core services** (depend on leaves): `storage.js`, `matrix.js`
3. **State management** (depends on services): `state.js`
4. **UI components** (depend on state): `risk-cards.js`, `control-report.js`
5. **Entry point** (depends on all): `main.js`

---

## 10. Proposed Module Structure

### Directory Layout

```
JS/
├── main.js                    # Entry point (200 lines)
├── state.js                   # AppState management (150 lines)
├── storage.js                 # IndexedDB service (205 lines) ✓ EXISTS
├── matrix.js                  # Risk calculations (330 lines) ✓ EXISTS
│
├── config/
│   ├── constants.js           # DIRECTIVE_OPTIONS, LIFE_PHASE_OPTIONS (100 lines)
│   ├── control-questions.js   # controlQuestions array (350 lines)
│   └── risk-data.js           # riskGroupsData, riskListLabels (250 lines)
│
├── i18n/
│   ├── index.js               # t(), setLanguage(), init (100 lines)
│   ├── translations-sv.js     # Swedish translations (900 lines)
│   └── translations-en.js     # English translations (900 lines)
│
├── ui/
│   ├── tabs.js                # Tab switching logic (100 lines)
│   ├── modals.js              # Modal handlers (200 lines)
│   ├── settings.js            # Settings menu (150 lines)
│   └── tooltips.js            # Tooltip positioning (100 lines)
│
├── features/
│   ├── project/
│   │   ├── project-init.js    # initializeProject, loadProjectDataToForm (300 lines)
│   │   ├── project-save.js    # updateProjectFromForm, saveCurrentProject (300 lines)
│   │   └── project-io.js      # import/export project (250 lines)
│   │
│   ├── tab1/
│   │   ├── product-data.js    # Product form handling (200 lines)
│   │   ├── manufacturer.js    # Manufacturer form handling (150 lines)
│   │   ├── directives.js      # Directive management (250 lines)
│   │   ├── standards.js       # Standards management (200 lines)
│   │   ├── compliance.js      # Compliance/high-risk (200 lines)
│   │   └── digital-safety.js  # Digital safety fields (100 lines)
│   │
│   ├── tab2/
│   │   ├── risk-cards.js      # Risk card rendering (400 lines)
│   │   ├── risk-crud.js       # Create/update/delete risks (300 lines)
│   │   ├── risk-params.js     # Parameter selects, calculations (200 lines)
│   │   ├── risk-measures.js   # Protective measures handling (250 lines)
│   │   └── risk-validation.js # Validation panel (200 lines)
│   │
│   ├── tab3/
│   │   ├── interface-risks.js # Interface risk rendering (350 lines)
│   │   └── interface-crud.js  # Interface risk CRUD (300 lines)
│   │
│   ├── tab4/
│   │   ├── control-report.js  # Control report rendering (300 lines)
│   │   ├── control-templates.js # CONTROL_REPORT_TEMPLATES (250 lines)
│   │   └── control-export.js  # Export control report (200 lines)
│   │
│   ├── tab5/
│   │   ├── declaration.js     # DoC/DoI rendering (300 lines)
│   │   └── declaration-gen.js # Generate DoC/DoI HTML (350 lines)
│   │
│   ├── tab6/
│   │   ├── export-risk.js     # Risk assessment export (300 lines)
│   │   ├── export-summary.js  # Summary report generation (200 lines)
│   │   └── export-tcf.js      # TCF checklist (150 lines)
│   │
│   ├── tab7/
│   │   └── safety-layout.js   # Image upload, viewer (300 lines)
│   │
│   ├── objects/
│   │   ├── modules.js         # Module import/view (300 lines)
│   │   └── purchased.js       # Purchased machines (250 lines)
│   │
│   └── lists/
│       ├── list-editor.js     # Edit lists modal (300 lines)
│       └── list-utils.js      # getCustomList, etc. (150 lines)
│
├── utils/
│   ├── dom.js                 # DOM helper functions (100 lines)
│   ├── csv.js                 # CSV parse/build (150 lines)
│   └── helpers.js             # escapeHtml, incrementRevision (100 lines)
│
└── window-exports.js          # Register window.* handlers (100 lines)
```

### Module Count Summary
- **Total modules:** ~45 files
- **Average size:** 220 lines
- **Largest module:** ~400 lines (risk-cards.js)

---

## 11. Module Signature Examples

### state.js

```javascript
/**
 * state.js - Centralized State Management
 * Single source of truth for AppState
 */

// Private state
let _appState = {
    currentProject: null,
    currentTab: 'tab1',
    currentObject: null,
    selectedRiskId: null,
    riskSortOrder: 'index',
    exportSortOrder: 'level',
    moduleDataLoaded: null
};

// Getters
export function getState() {
    return _appState;
}

export function getCurrentProject() {
    return _appState.currentProject;
}

export function getSelectedRiskId() {
    return _appState.selectedRiskId;
}

// Setters with validation
export function setCurrentProject(project) {
    _appState.currentProject = project;
    notifySubscribers('projectChanged', project);
}

export function setSelectedRisk(riskId) {
    _appState.selectedRiskId = riskId;
    notifySubscribers('riskSelected', riskId);
}

export function setCurrentTab(tabId) {
    _appState.currentTab = tabId;
    notifySubscribers('tabChanged', tabId);
}

// Subscription system for reactivity
const subscribers = new Map();

export function subscribe(event, callback) {
    if (!subscribers.has(event)) {
        subscribers.set(event, []);
    }
    subscribers.get(event).push(callback);
    return () => unsubscribe(event, callback);
}

function notifySubscribers(event, data) {
    const callbacks = subscribers.get(event) || [];
    callbacks.forEach(cb => cb(data));
}
```

### risk-cards.js (Partial)

```javascript
/**
 * risk-cards.js - Risk Card Rendering
 * Handles display of risk cards in Tab 2
 */

import { getCurrentProject, getSelectedRiskId, setSelectedRisk } from '../state.js';
import { t } from '../i18n/index.js';
import RiskMatrix from '../matrix.js';
import { getCustomList } from '../lists/list-utils.js';
import { renderActionPanelContent } from './risk-measures.js';
import { renderValidationPanelContent } from './risk-validation.js';

/**
 * Render all risk cards
 */
export function renderRiskCards() {
    const container = document.getElementById('riskCardsList');
    if (!container) return;
    
    const project = getCurrentProject();
    if (!project || !project.risks) {
        container.innerHTML = `<p class="placeholder">${t('message.noproject')}</p>`;
        return;
    }
    
    // ... rendering logic
}

/**
 * Render risk list sidebar
 */
export function renderRiskList() {
    const listEl = document.getElementById('risk-list');
    if (!listEl) return;
    
    const project = getCurrentProject();
    const risks = project?.risks || [];
    // ... list rendering
}

/**
 * Render detailed risk view
 */
export function renderRiskDetail(riskId) {
    const container = document.getElementById('risk-detail-container');
    if (!container) return;
    
    const project = getCurrentProject();
    const risk = project?.risks.find(r => r.id === riskId);
    // ... detail rendering
}

/**
 * Select a risk in the list
 */
export function selectRisk(riskId) {
    setSelectedRisk(riskId);
    renderRiskList();
    renderRiskDetail(riskId);
}
```

### window-exports.js

```javascript
/**
 * window-exports.js - Register Global Handlers
 * Centralizes all window.* assignments for HTML onclick handlers
 */

import { openRiskMatrixModal, closeRiskMatrixModal } from './ui/modals.js';
import { toggleRiskDetails, selectRisk, changeRiskSortOrder } from './features/tab2/risk-cards.js';
import { toggleRiskSection, toggleActionPanel, toggleValidationPanel } from './features/tab2/risk-crud.js';
import { addProtectiveMeasure, updateProtectiveMeasure, removeProtectiveMeasure } from './features/tab2/risk-measures.js';
import { toggleInterfaceRiskDetails } from './features/tab3/interface-risks.js';
import { addInterfaceProtectiveMeasure, updateInterfaceProtectiveMeasure, removeInterfaceProtectiveMeasure } from './features/tab3/interface-crud.js';
import { checkAllControlPoints } from './features/tab4/control-report.js';

/**
 * Register all handlers on window object
 * Call this once during app initialization
 */
export function registerWindowHandlers() {
    // Modals
    window.openRiskMatrixModal = openRiskMatrixModal;
    window.closeRiskMatrixModal = closeRiskMatrixModal;
    
    // Risk cards (Tab 2)
    window.toggleRiskDetails = toggleRiskDetails;
    window.selectRisk = selectRisk;
    window.changeRiskSortOrder = changeRiskSortOrder;
    window.toggleRiskSection = toggleRiskSection;
    window.toggleActionPanel = toggleActionPanel;
    window.toggleValidationPanel = toggleValidationPanel;
    window.addProtectiveMeasure = addProtectiveMeasure;
    window.updateProtectiveMeasure = updateProtectiveMeasure;
    window.removeProtectiveMeasure = removeProtectiveMeasure;
    
    // Interface risks (Tab 3)
    window.toggleInterfaceRiskDetails = toggleInterfaceRiskDetails;
    window.addInterfaceProtectiveMeasure = addInterfaceProtectiveMeasure;
    window.updateInterfaceProtectiveMeasure = updateInterfaceProtectiveMeasure;
    window.removeInterfaceProtectiveMeasure = removeInterfaceProtectiveMeasure;
    
    // Control report (Tab 4)
    window.checkAllControlPoints = checkAllControlPoints;
    
    console.log('Window handlers registered');
}
```

---

## 12. Step-by-Step Refactor Phases

### Phase 0: Preparation (Est. 2 hours)
**Goal:** Set up infrastructure without breaking anything

- [ ] Create folder structure (`config/`, `i18n/`, `ui/`, `features/`, `utils/`)
- [ ] Create `main.js` stub that just requires existing files
- [ ] Update `index.html` to load `main.js` via Parcel
- [ ] Verify app still works identically
- [ ] Set up simple smoke test checklist

**Verification:** All tabs load, can create/save project, no console errors

---

### Phase 1: Extract Constants & Config (Est. 3 hours)
**Goal:** Move all static data out of app.js

#### Step 1.1: Extract config/constants.js
```javascript
// Extract from app.js lines ~280-295
export const DIRECTIVE_OPTIONS = [...];
export const LIFE_PHASE_OPTIONS = [...];
export const HIGH_RISK_DIRECTIVE = [...];
export const HIGH_RISK_REGULATION = [...];
```

#### Step 1.2: Extract config/risk-data.js
```javascript
// Extract from app.js lines 67-277
export const riskGroupsData = {...};
export const riskListLabels = {...};
```

#### Step 1.3: Extract config/control-questions.js
```javascript
// Extract from app.js lines ~295-600
export const controlQuestions = [...];
```

#### Step 1.4: Update app.js imports
```javascript
import { DIRECTIVE_OPTIONS, LIFE_PHASE_OPTIONS } from './config/constants.js';
import { riskGroupsData, riskListLabels } from './config/risk-data.js';
import { controlQuestions } from './config/control-questions.js';
```

**Verification:** All dropdowns populate correctly, control questions load

---

### Phase 2: Extract i18n System (Est. 4 hours)
**Goal:** Modularize translation system

#### Step 2.1: Create i18n/translations-sv.js
```javascript
// Extract Swedish translations from i18n.js
export default {
    "header.title": "HETZA-RA",
    // ... all sv translations
};
```

#### Step 2.2: Create i18n/translations-en.js
```javascript
// Extract English translations from i18n.js
export default {
    "header.title": "HETZA-RA",
    // ... all en translations
};
```

#### Step 2.3: Create i18n/index.js
```javascript
import sv from './translations-sv.js';
import en from './translations-en.js';

const translations = { sv, en };
let currentLang = localStorage.getItem('hetza-lang') || 'sv';

export function t(key, vars = {}, fallback = '') {
    let text = translations[currentLang]?.[key] || translations.sv[key] || fallback || key;
    Object.keys(vars).forEach(k => {
        text = text.replace(new RegExp(`{{${k}}}`, 'g'), vars[k]);
    });
    return text;
}

export function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('hetza-lang', lang);
    // ... update DOM
}

export function getCurrentLang() {
    return currentLang;
}
```

**Verification:** Switch between sv/en, all UI text updates correctly

---

### Phase 3: Extract State Management (Est. 3 hours)
**Goal:** Centralize AppState in dedicated module

#### Step 3.1: Create state.js
- Move `AppState` object
- Add getter/setter functions
- Add subscription system for reactivity

#### Step 3.2: Update app.js
- Replace direct `AppState` access with imported functions
- Test all state mutations still work

**Verification:** Project loads, saves, tab switching works, risk selection works

---

### Phase 4: Extract UI Infrastructure (Est. 4 hours)
**Goal:** Separate UI concerns from business logic

#### Step 4.1: Create ui/tabs.js
- Extract `initializeTabs()`, `switchTab()`

#### Step 4.2: Create ui/modals.js
- Extract modal handlers, floating window code

#### Step 4.3: Create ui/settings.js
- Extract `initializeSettings()`, `handleSettingsAction()`

#### Step 4.4: Create ui/tooltips.js
- Extract tooltip positioning code

**Verification:** All tabs switch correctly, modals open/close, settings menu works

---

### Phase 5: Extract Tab 1 Features (Est. 6 hours)
**Goal:** Modularize all Tab 1 functionality

#### Step 5.1: features/tab1/product-data.js
- Form field handling for product data

#### Step 5.2: features/tab1/manufacturer.js
- Manufacturer form handling

#### Step 5.3: features/tab1/directives.js
- `renderDirectivesList()`, `handleDirectiveSelection()`, etc.

#### Step 5.4: features/tab1/standards.js
- `renderStandardsList()`, `addStandard()`, etc.

#### Step 5.5: features/tab1/compliance.js
- High-risk category, conformity path

#### Step 5.6: features/tab1/digital-safety.js
- Digital safety form fields

**Verification:** All Tab 1 forms save/load correctly

---

### Phase 6: Extract Tab 2 - Risk Assessment (Est. 8 hours)
**Goal:** This is the most complex extraction

#### Step 6.1: features/tab2/risk-cards.js
- `renderRiskCards()`, `renderRiskList()`, `renderRiskDetail()`

#### Step 6.2: features/tab2/risk-crud.js
- `createNewRisk()`, `updateRisk()`, `deleteRisk()`

#### Step 6.3: features/tab2/risk-params.js
- `renderParameterSelectCompact()`, `updateRiskParameter()`

#### Step 6.4: features/tab2/risk-measures.js
- `addProtectiveMeasure()`, `updateProtectiveMeasure()`, `removeProtectiveMeasure()`
- `renderActionPanelContent()`

#### Step 6.5: features/tab2/risk-validation.js
- `renderValidationPanelContent()`, validation logic

**Verification:** Full risk CRUD works, parameters update correctly

---

### Phase 7: Extract Tab 3 - Interface Risks (Est. 4 hours)
**Goal:** Modularize interface risk handling

#### Step 7.1: features/tab3/interface-risks.js
- Rendering and display functions

#### Step 7.2: features/tab3/interface-crud.js
- CRUD operations for interface risks

**Verification:** Interface risks create, edit, delete correctly

---

### Phase 8: Extract Tab 4 - Control Report (Est. 4 hours)
**Goal:** Modularize control report

#### Step 8.1: features/tab4/control-templates.js
- Move `CONTROL_REPORT_TEMPLATES` object

#### Step 8.2: features/tab4/control-report.js
- Rendering and checkpoint management

#### Step 8.3: features/tab4/control-export.js
- Export functionality

**Verification:** Control report loads, checkboxes save, export works

---

### Phase 9: Extract Tabs 5-7 (Est. 6 hours)
**Goal:** Complete remaining tabs

#### Step 9.1: features/tab5/ - Declaration
#### Step 9.2: features/tab6/ - Export functions
#### Step 9.3: features/tab7/ - Safety Layout

**Verification:** DoC generates, exports work, image viewer functions

---

### Phase 10: Extract Supporting Features (Est. 4 hours)
**Goal:** Modularize remaining features

#### Step 10.1: features/objects/modules.js
#### Step 10.2: features/objects/purchased.js
#### Step 10.3: features/lists/list-editor.js
#### Step 10.4: features/lists/list-utils.js

**Verification:** Module import works, purchased machines save, list editor functions

---

### Phase 11: Extract Project Management (Est. 4 hours)
**Goal:** Modularize project operations

#### Step 11.1: features/project/project-init.js
#### Step 11.2: features/project/project-save.js
#### Step 11.3: features/project/project-io.js

**Verification:** Project create, save, import, export all work

---

### Phase 12: Extract Utilities & Finalize ✅ COMPLETED
**Goal:** Complete extraction and cleanup

**Completed Tasks:**
- ✅ utils/dom.js, utils/csv.js, utils/helpers.js
- ✅ window-exports.js with all module handlers
- ✅ main.js integration with Parcel entry point
- ✅ Layout viewer module (JS/features/layout/layout.js)
- ✅ TCF Checklist module (JS/features/export/tcf.js)
- ✅ Risk Matrix Info module (JS/features/export/risk-matrix-info.js)
- ✅ Updated ui/modals.js to import risk matrix rendering
- ✅ Removed legacy app.js from index.html
- ✅ Fixed async function issue in tab2/index.js

**Verification:** ✅ Full application smoke test passing

---

## 13. Verification & Safety Strategy

### After Each Phase

1. **Manual Smoke Test Checklist:**
   - [ ] Application loads without console errors
   - [ ] Can create new project
   - [ ] Can save project
   - [ ] Can switch all tabs
   - [ ] Can add/edit/delete risk
   - [ ] Can add/edit/delete interface risk
   - [ ] Can generate DoC
   - [ ] Language switching works

2. **Automated Checks (Future):**
   - Unit tests for pure functions
   - Integration tests for key workflows

### Rollback Strategy

- Keep `app.js.backup` until phase complete
- Use Git branches per phase
- Tag stable versions after each phase

### Code Review Gates

Before merging each phase:
- [ ] No circular dependencies
- [ ] All modules < 400 lines
- [ ] No direct AppState mutations outside state.js
- [ ] All window exports in window-exports.js
- [ ] Console has no errors

---

## 14. Risk Analysis

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Circular dependency introduced | Medium | High | Strict module hierarchy, ESLint rule |
| State mutation in wrong module | High | Medium | Code review, state.js as single source |
| Missing window export | Medium | High | Centralized window-exports.js |
| Parcel bundling fails | Low | High | Test bundle after each phase |
| i18n key mismatch | Low | Low | Keep translations in sync |
| DOM selector moved | Medium | Medium | Comprehensive ID documentation |

### Schedule Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Phase takes longer than estimated | High | Medium | Buffer 50% extra time |
| Interdependent phases block each other | Medium | High | Clear dependency order |
| Testing reveals hidden bugs | Medium | Medium | Thorough smoke tests |

### Mitigation Actions

1. **Before starting:** Create full backup and Git branch
2. **During refactor:** Small commits, frequent testing
3. **After each file:** Run smoke test checklist
4. **After each phase:** Full regression test

---

## 15. Progress Tracking

### Phase Status

| Phase | Description | Status | Est. Hours | Actual Hours |
|-------|-------------|--------|------------|--------------|
| 0 | Preparation | ⬜ Not Started | 2 | - |
| 1 | Extract Constants | ⬜ Not Started | 3 | - |
| 2 | Extract i18n | ⬜ Not Started | 4 | - |
| 3 | Extract State | ⬜ Not Started | 3 | - |
| 4 | Extract UI | ⬜ Not Started | 4 | - |
| 5 | Extract Tab 1 | ⬜ Not Started | 6 | - |
| 6 | Extract Tab 2 | ⬜ Not Started | 8 | - |
| 7 | Extract Tab 3 | ⬜ Not Started | 4 | - |
| 8 | Extract Tab 4 | ⬜ Not Started | 4 | - |
| 9 | Extract Tabs 5-7 | ✅ Completed | 6 | 4 |
| 10 | Extract Supporting | ✅ Completed | 4 | 3 |
| 11 | Extract Project Mgmt | ✅ Completed | 4 | 2 |
| 12 | Finalize & Cleanup | ✅ Completed | 3 | 2 |
| **Total** | | **✅ COMPLETE** | **55** | **~45** |

### Module Extraction Checklist

#### Config Modules
- [ ] config/constants.js
- [ ] config/risk-data.js
- [ ] config/control-questions.js

#### i18n Modules
- [ ] i18n/index.js
- [ ] i18n/translations-sv.js
- [ ] i18n/translations-en.js

#### UI Modules
- [ ] ui/tabs.js
- [ ] ui/modals.js
- [ ] ui/settings.js
- [ ] ui/tooltips.js

#### Feature Modules - Tab 1
- [ ] features/tab1/product-data.js
- [ ] features/tab1/manufacturer.js
- [ ] features/tab1/directives.js
- [ ] features/tab1/standards.js
- [ ] features/tab1/compliance.js
- [ ] features/tab1/digital-safety.js

#### Feature Modules - Tab 2
- [ ] features/tab2/risk-cards.js
- [ ] features/tab2/risk-crud.js
- [ ] features/tab2/risk-params.js
- [ ] features/tab2/risk-measures.js
- [ ] features/tab2/risk-validation.js

#### Feature Modules - Tab 3
- [ ] features/tab3/interface-risks.js
- [ ] features/tab3/interface-crud.js

#### Feature Modules - Tab 4
- [ ] features/tab4/control-report.js
- [ ] features/tab4/control-templates.js
- [ ] features/tab4/control-export.js

#### Feature Modules - Tabs 5-7
- [ ] features/tab5/declaration.js
- [ ] features/tab5/declaration-gen.js
- [ ] features/tab6/export-risk.js
- [ ] features/tab6/export-summary.js
- [ ] features/tab6/export-tcf.js
- [ ] features/tab7/safety-layout.js

#### Feature Modules - Objects & Lists
- [ ] features/objects/modules.js
- [ ] features/objects/purchased.js
- [ ] features/lists/list-editor.js
- [ ] features/lists/list-utils.js

#### Feature Modules - Project
- [ ] features/project/project-init.js
- [ ] features/project/project-save.js
- [ ] features/project/project-io.js

#### Utility Modules
- [ ] utils/dom.js
- [ ] utils/csv.js
- [ ] utils/helpers.js

#### Core Modules
- [ ] state.js
- [ ] window-exports.js
- [ ] main.js

---

## Appendix A: Function-to-Module Mapping

<details>
<summary>Click to expand full function mapping</summary>

| Original Function | Target Module |
|-------------------|---------------|
| `initializeProject` | features/project/project-init.js |
| `loadProjectDataToForm` | features/project/project-init.js |
| `createEmptyProject` | storage.js (already exists) |
| `saveCurrentProject` | features/project/project-save.js |
| `updateProjectFromForm` | features/project/project-save.js |
| `exportProject` | features/project/project-io.js |
| `importProject` | features/project/project-io.js |
| `initializeTabs` | ui/tabs.js |
| `switchTab` | ui/tabs.js |
| `initializeSettings` | ui/settings.js |
| `handleSettingsAction` | ui/settings.js |
| `openRiskMatrixModal` | ui/modals.js |
| `closeRiskMatrixModal` | ui/modals.js |
| `renderDirectivesList` | features/tab1/directives.js |
| `handleDirectiveSelection` | features/tab1/directives.js |
| `renderAdditionalDirectivesList` | features/tab1/directives.js |
| `addDirective` | features/tab1/directives.js |
| `renderStandardsList` | features/tab1/standards.js |
| `addStandard` | features/tab1/standards.js |
| `renderHighRiskOptions` | features/tab1/compliance.js |
| `toggleCustomHighRiskField` | features/tab1/compliance.js |
| `renderRiskCards` | features/tab2/risk-cards.js |
| `renderRiskList` | features/tab2/risk-cards.js |
| `renderRiskDetail` | features/tab2/risk-cards.js |
| `selectRisk` | features/tab2/risk-cards.js |
| `createNewRisk` | features/tab2/risk-crud.js |
| `updateRisk` | features/tab2/risk-crud.js |
| `deleteRisk` | features/tab2/risk-crud.js |
| `renderParameterSelectCompact` | features/tab2/risk-params.js |
| `updateRiskParameter` | features/tab2/risk-params.js |
| `addProtectiveMeasure` | features/tab2/risk-measures.js |
| `updateProtectiveMeasure` | features/tab2/risk-measures.js |
| `removeProtectiveMeasure` | features/tab2/risk-measures.js |
| `renderActionPanelContent` | features/tab2/risk-measures.js |
| `renderValidationPanelContent` | features/tab2/risk-validation.js |
| `renderInterfaceRisks` | features/tab3/interface-risks.js |
| `renderInterfaceRiskCard` | features/tab3/interface-risks.js |
| `createNewInterfaceRisk` | features/tab3/interface-crud.js |
| `updateInterfaceRisk` | features/tab3/interface-crud.js |
| `deleteInterfaceRisk` | features/tab3/interface-crud.js |
| `initializeControlReport` | features/tab4/control-report.js |
| `renderControlChecklist` | features/tab4/control-report.js |
| `updateCheckpointStatus` | features/tab4/control-report.js |
| `exportControlReport` | features/tab4/control-export.js |
| `generateDoC` | features/tab5/declaration-gen.js |
| `loadDoCData` | features/tab5/declaration.js |
| `exportRiskAssessment` | features/tab6/export-risk.js |
| `generateSummaryReport` | features/tab6/export-summary.js |
| `generateTCFChecklist` | features/tab6/export-tcf.js |
| `uploadLayoutImage` | features/tab7/safety-layout.js |
| `renderLayoutImages` | features/tab7/safety-layout.js |
| `openImageViewer` | features/tab7/safety-layout.js |
| `importModule` | features/objects/modules.js |
| `viewModuleData` | features/objects/modules.js |
| `clearModuleData` | features/objects/modules.js |
| `openPurchasedMachineModal` | features/objects/purchased.js |
| `savePurchasedMachine` | features/objects/purchased.js |
| `openEditListsModal` | features/lists/list-editor.js |
| `renderListEditor` | features/lists/list-editor.js |
| `getCustomList` | features/lists/list-utils.js |
| `saveCustomList` | features/lists/list-utils.js |
| `t` | i18n/index.js |
| `setLanguage` | i18n/index.js |
| `escapeHtml` | utils/helpers.js |
| `incrementRevision` | utils/helpers.js |
| `parseCSV` | utils/csv.js |
| `csvEscape` | utils/csv.js |

</details>

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-14 | Senior Software Architect | Initial plan creation |
| 2.0 | 2025-01-24 | Senior Software Architect | Updated to ES Modules (import/export) |

---

**End of REFACTOR_PLAN.md**
