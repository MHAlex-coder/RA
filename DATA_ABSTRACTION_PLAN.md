# Data Abstraction Layer - Arkitektur- och Refaktoreringsplan

## Dokumentversion
- **Datum:** 2026-02-01
- **Status:** PLANERING (ingen implementation ännu)
- **Mål:** Framtidssäker datahantering med stöd för lokal, desktop och molnbaserad drift

---

## 1. Nulägesanalys

### 1.1 Nuvarande Arkitektur

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Parcel)                         │
├─────────────────────────────────────────────────────────────────┤
│  Features (35+ modules)                                          │
│  ├── tab1-tab7 (UI/forms)                                        │
│  ├── project (create, list, load)                                │
│  ├── support (auto-save, import, export)                         │
│  └── export (doc, tcf, risk-assessment)                          │
├─────────────────────────────────────────────────────────────────┤
│  state.js (centraliserat state)                                  │
├─────────────────────────────────────────────────────────────────┤
│  storage.js (IndexedDB - direkt åtkomst från features)           │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Identifierade Datapunkter

#### A. Primära Dataentiteter (i `storage.js`)

| Entitet | Beskrivning | Lagringstyp |
|---------|-------------|-------------|
| `Project` | Huvudobjekt med all projektdata | IndexedDB object store |
| `Project.risks[]` | Riskobjekt med IN/OUT-parametrar | Inbäddat i Project |
| `Project.interfaceRisks[]` | Gränssnittsrisker | Inbäddat i Project |
| `Project.standards[]` | Standarder (EN/ISO) | Inbäddat i Project |
| `Project.directives[]` | Direktiv (EU) | Inbäddat i Project |
| `Project.objects[]` | Moduler/objekt | Inbäddat i Project |
| `Project.modules[]` | Importerade modulprojekt | Inbäddat i Project |
| `Project.controlReport` | Kontrollrapport | Inbäddat i Project |
| `Project.media.logoImage` | Logotypbild (base64) | Inbäddat i Project |
| `Project.safetyLayoutImages[]` | Säkerhetslayoutbilder | Inbäddat i Project |

#### B. Statisk/Konfigurationsdata (i `data/` och `config/`)

| Fil | Innehåll | Typ |
|-----|----------|-----|
| `data/hazards.json` | Farodefinitioner | Statisk |
| `data/riskGroups.json` | Riskgruppsdefinitioner | Statisk |
| `data/scenarios.json` | Scenariodefinitioner | Statisk |
| `data/standards.json` | Standardkatalog | Statisk |
| `config/control-questions.js` | Kontrollfrågor | Statisk (kan anpassas per projekt) |
| `config/risk-data.js` | Risklistor | Statisk |
| `config/constants.js` | Appkonstanter | Statisk |

#### C. Översättningar (i `i18n/`)

| Fil | Innehåll |
|-----|----------|
| `i18n/translations-sv.js` | Svenska översättningar |
| `i18n/translations-en.js` | Engelska översättningar |
| `controlQuestions_translations.json` | Kontrollfrågeöversättningar |

### 1.3 Filer som Direkt Använder `StorageService`

| Fil | Operationer | Risk vid refaktorering |
|-----|-------------|------------------------|
| `JS/storage.js` | Definerar StorageService | 🔴 Kritisk - ändras helt |
| `JS/features/project/project-list.js` | `listProjects()` | 🟡 Medium |
| `JS/features/project/project-create.js` | `saveProject()` | 🟡 Medium |
| `JS/features/support/auto-save.js` | `saveProject()` | 🔴 Hög |
| `JS/features/support/import.js` | `saveProject()` | 🟡 Medium |
| `JS/features/tab1/directives.js` | `saveProject()` (3 ställen) | 🟡 Medium |
| `JS/features/tab2/risk-parameters.js` | `saveProject()` | 🟡 Medium |
| `JS/features/tab2/index.js` | `saveProject()` | 🟡 Medium |
| `JS/features/tab4/control-list.js` | `saveProject()` (3 ställen) | 🟡 Medium |
| `JS/features/tab5/life-phases.js` | `saveProject()` (2 ställen) | 🟡 Medium |
| `JS/features/tab6/machine-limits.js` | `saveProject()` (2 ställen) | 🟡 Medium |
| `JS/features/tab7/index.js` | `saveProject()` (2 ställen) | 🟡 Medium |
| `JS/features/tab7/module-interface.js` | `saveProject()` | 🟡 Medium |
| `JS/features/tab7/purchased-machines.js` | `saveProject()` (2 ställen) | 🟡 Medium |
| `JS/features/export/doc.js` | `saveProject()` | 🟢 Låg |

**Totalt: ~20+ direkta anrop till StorageService.saveProject()**

---

## 2. Föreslagen Arkitektur

### 2.1 Målarkitektur

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            FRONTEND (Parcel)                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  Features (tab1-tab7, project, support, export)                              │
│                              │                                               │
│                              ▼                                               │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                    REPOSITORY LAYER (ny)                                │ │
│  │  ├── ProjectRepository                                                  │ │
│  │  ├── RiskRepository                                                     │ │
│  │  ├── TranslationRepository                                              │ │
│  │  ├── ConfigRepository                                                   │ │
│  │  └── MediaRepository                                                    │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                              │                                               │
│                              ▼                                               │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                    ADAPTER INTERFACE (ny)                               │ │
│  │  DataAdapter { init, get, getAll, save, delete, query }                 │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                              │                                               │
│          ┌──────────────────┼──────────────────┬────────────────────┐       │
│          ▼                  ▼                  ▼                    ▼       │
│   ┌────────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐     │
│   │ IndexedDB  │    │  SQLite    │    │  HTTP API  │    │  Tauri FS  │     │
│   │  Adapter   │    │  Adapter   │    │  Adapter   │    │  Adapter   │     │
│   │ (nuvarande)│    │(Raspberry) │    │  (Cloud)   │    │ (Desktop)  │     │
│   └────────────┘    └────────────┘    └────────────┘    └────────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Ny Mappstruktur

```
JS/
├── data/                          # NY MAPP - Data Abstraction Layer
│   ├── index.js                   # Exporterar alla repositories
│   │
│   ├── adapters/                  # Konkreta adapter-implementationer
│   │   ├── adapter-interface.js   # Interface/kontrakt för adapters
│   │   ├── indexeddb-adapter.js   # Nuvarande IndexedDB (refaktorerad)
│   │   ├── http-adapter.js        # Framtida HTTP API adapter
│   │   ├── sqlite-adapter.js      # Framtida SQLite adapter (Raspberry Pi)
│   │   └── tauri-adapter.js       # Framtida Tauri desktop adapter
│   │
│   ├── repositories/              # Repository pattern implementation
│   │   ├── base-repository.js     # Abstrakt bas med gemensam logik
│   │   ├── project-repository.js  # Projekthantering
│   │   ├── risk-repository.js     # Riskhantering (CRUD)
│   │   ├── translation-repository.js  # Översättningshantering
│   │   ├── config-repository.js   # Statisk konfiguration
│   │   └── media-repository.js    # Bild/fil-hantering
│   │
│   ├── entities/                  # Datamodeller/typdefinitioner
│   │   ├── project.js             # Project entity schema
│   │   ├── risk.js                # Risk entity schema
│   │   └── interfaces.js          # Delade interfaces
│   │
│   └── services/                  # Högre nivå affärslogik
│       ├── sync-service.js        # Framtida synkronisering
│       └── migration-service.js   # Datamigrering mellan versioner
│
├── features/                      # Befintlig (minimal ändring)
├── state.js                       # Befintlig (oförändrad)
├── storage.js                     # FASAS UT → ersätts av data/
└── main.js                        # Uppdateras för att initiera data layer
```

---

## 3. API-kontrakt (Konceptuellt)

### 3.1 Adapter Interface

```javascript
// data/adapters/adapter-interface.js

/**
 * DataAdapter Interface
 * Alla adapters måste implementera dessa metoder
 */
export const DataAdapterInterface = {
    /**
     * Initialisera adapter (anslut till databas, etc.)
     * @returns {Promise<void>}
     */
    async init() {},
    
    /**
     * Hämta ett objekt med ID
     * @param {string} store - Objektlagringsnamn (t.ex. 'projects')
     * @param {number|string} id - Objekt-ID
     * @returns {Promise<object|null>}
     */
    async get(store, id) {},
    
    /**
     * Hämta alla objekt från en store
     * @param {string} store - Objektlagringsnamn
     * @returns {Promise<Array>}
     */
    async getAll(store) {},
    
    /**
     * Spara ett objekt (skapa eller uppdatera)
     * @param {string} store - Objektlagringsnamn
     * @param {object} data - Objektdata
     * @returns {Promise<object>} Sparat objekt med ID
     */
    async save(store, data) {},
    
    /**
     * Ta bort ett objekt
     * @param {string} store - Objektlagringsnamn
     * @param {number|string} id - Objekt-ID
     * @returns {Promise<void>}
     */
    async delete(store, id) {},
    
    /**
     * Sök/filtrera objekt
     * @param {string} store - Objektlagringsnamn
     * @param {object} query - Sökkriterier
     * @returns {Promise<Array>}
     */
    async query(store, query) {}
};
```

### 3.2 Repository Interface

```javascript
// data/repositories/project-repository.js (konceptuellt)

export const ProjectRepository = {
    /**
     * Skapa nytt projekt
     * @returns {Promise<Project>}
     */
    async create() {},
    
    /**
     * Hämta projekt med ID
     * @param {number} id
     * @returns {Promise<Project|null>}
     */
    async getById(id) {},
    
    /**
     * Lista alla projekt (med metadata)
     * @returns {Promise<Array<ProjectSummary>>}
     */
    async list() {},
    
    /**
     * Spara projekt
     * @param {Project} project
     * @returns {Promise<Project>}
     */
    async save(project) {},
    
    /**
     * Ta bort projekt
     * @param {number} id
     * @returns {Promise<void>}
     */
    async delete(id) {},
    
    /**
     * Hämta senast modifierade projekt
     * @returns {Promise<Project|null>}
     */
    async getLatest() {}
};
```

### 3.3 Entitetsscheman

```javascript
// data/entities/project.js (konceptuellt)

/**
 * @typedef {Object} Project
 * @property {number|null} id - Databas-ID (null för nya projekt)
 * @property {ProjectMeta} meta - Metadata
 * @property {ProductData} productData - Produktinformation
 * @property {Manufacturer} manufacturer - Tillverkarinformation
 * @property {Compliance} compliance - Efterlevnad/högrisk
 * @property {DigitalSafety} digitalSafety - Digital säkerhet
 * @property {RiskFramework} riskFramework - Riskramverk
 * @property {MachineCategories} machineCategories - Maskinkategorier
 * @property {Media} media - Bilder/media
 * @property {Array<Risk>} risks - Riskobjekt
 * @property {Array<InterfaceRisk>} interfaceRisks - Gränssnittsrisker
 * @property {Array<Standard>} standards - Valda standarder
 * @property {Array<Directive>} directives - Valda direktiv
 * @property {Array<Module>} modules - Importerade moduler
 * @property {ControlReport} controlReport - Kontrollrapport
 */

/**
 * @typedef {Object} Risk
 * @property {string} id - Unikt ID (genererat)
 * @property {string} created - ISO timestamp
 * @property {string} lastModified - ISO timestamp
 * @property {string} riskGroup - Riskgrupp
 * @property {string} zone - Zon
 * @property {string} area - Område
 * @property {string} hazardSource - Farokälla
 * @property {string} cause - Orsak
 * @property {string} injury - Skada
 * @property {string} description - Beskrivning
 * @property {RiskParameters} parametersIN - Initiala parametrar
 * @property {RiskParameters} parametersOUT - Residuella parametrar
 * @property {Array<ProtectiveMeasure>} protectiveMeasures - Skyddsåtgärder
 * @property {boolean} implemented - Genomförd
 * @property {boolean} verified - Verifierad
 * @property {string} comment - Kommentar
 */
```

---

## 4. Implementationsfaser

### Fas 1: Förberedelse (Minimal Risk)
**Tid:** 2-4 timmar
**Risk:** 🟢 Låg

1. **Skapa mappstruktur**
   - Skapa `JS/data/` med undermappar
   - Inga ändringar i befintlig kod

2. **Definiera interfaces**
   - Skapa `adapter-interface.js` med kontrakt
   - Skapa entitetsscheman i `entities/`

3. **Dokumentera nuvarande beteende**
   - Skriv tester/specifikationer för StorageService
   - Identifiera edge cases

**Filer som skapas:**
- `JS/data/index.js`
- `JS/data/adapters/adapter-interface.js`
- `JS/data/entities/project.js`
- `JS/data/entities/risk.js`

---

### Fas 2: IndexedDB Adapter (Refaktorering)
**Tid:** 4-6 timmar
**Risk:** 🟡 Medium

1. **Skapa IndexedDB Adapter**
   - Flytta logik från `storage.js` till `indexeddb-adapter.js`
   - Implementera adapter interface

2. **Skapa Base Repository**
   - Gemensam logik för alla repositories
   - Dependency injection för adapter

3. **Skapa ProjectRepository**
   - Wrapper runt adapter för projektobjekt
   - Behåll samma API som nuvarande StorageService

4. **Parallellkörning**
   - Kör nya och gamla samtidigt för att verifiera
   - Logga eventuella skillnader

**Filer som skapas:**
- `JS/data/adapters/indexeddb-adapter.js`
- `JS/data/repositories/base-repository.js`
- `JS/data/repositories/project-repository.js`

**Filer som ändras:**
- `JS/storage.js` (lägg till deprecation warning)

---

### Fas 3: Migrera Features (Inkrementell)
**Tid:** 8-12 timmar
**Risk:** 🟡 Medium - 🔴 Hög

Migrera en feature i taget, börja med lågrisk:

#### 3.1 Låg Risk (börja här)
1. `JS/features/export/doc.js`
2. `JS/features/tab6/machine-limits.js`
3. `JS/features/tab5/life-phases.js`

#### 3.2 Medium Risk
4. `JS/features/tab4/control-list.js`
5. `JS/features/tab2/risk-parameters.js`
6. `JS/features/tab7/*.js`
7. `JS/features/tab1/directives.js`

#### 3.3 Hög Risk (sist)
8. `JS/features/project/project-list.js`
9. `JS/features/project/project-create.js`
10. `JS/features/support/auto-save.js`
11. `JS/features/support/import.js`

**Mönster för migrering:**
```javascript
// FÖRE:
if (typeof StorageService !== 'undefined') {
    StorageService.saveProject(project);
}

// EFTER:
import { projectRepository } from '../../data/index.js';
await projectRepository.save(project);
```

---

### Fas 4: Ta Bort Gamla storage.js
**Tid:** 1-2 timmar
**Risk:** 🟡 Medium

1. Verifiera att alla features använder nya repositories
2. Ta bort `window.StorageService` exponering
3. Ta bort eller arkivera `storage.js`
4. Uppdatera `main.js` för att initialisera data layer

---

### Fas 5: Lägg till Nya Adapters (Framtida)
**Tid:** Varierar per adapter
**Risk:** 🟢 Låg (isolerat)

#### 5.1 SQLite Adapter (för Raspberry Pi)
- Använd `better-sqlite3` eller `sql.js`
- Implementera samma interface
- Byt adapter via konfiguration

#### 5.2 HTTP Adapter (för Cloud)
- REST API-anrop
- Autentisering/token-hantering
- Offline-cache

#### 5.3 Tauri Adapter (för Desktop)
- Tauri file system API
- SQLite via Tauri
- Native dialoger för import/export

---

## 5. Högriskområden

### 5.1 Auto-Save (`auto-save.js`)
**Problem:**
- Triggas ofta (på varje fältändring)
- Race conditions möjliga
- Måste hantera asynkrona sparningar

**Lösning:**
- Debounce sparningar (redan implementerat delvis)
- Kö för sparoperationer
- Konflikthantering

### 5.2 Import/Export (`import.js`, `export.js`)
**Problem:**
- Hanterar hela projektobjekt
- Filformat måste vara bakåtkompatibelt
- Bilder (base64) kan vara stora

**Lösning:**
- Versionera exportformatet
- Migreringslogik för äldre filer
- Komprimering för bilder

### 5.3 State Synchronization (`state.js`)
**Problem:**
- `state.js` och repositories kan hamna i osynk
- Subscribers kan missa uppdateringar

**Lösning:**
- Repositories notifierar state vid ändringar
- Centraliserad mutation genom repositories
- Eventual consistency acceptabel för lokal app

### 5.4 Modulprojekt (`tab7/index.js`)
**Problem:**
- Laddar hela externa projekt in i moduler
- Komplex datastruktur
- Readonly-läge vid visning

**Lösning:**
- Separata repositories för module data
- Tydlig separation mellan "main project" och "viewed module"

---

## 6. Filer som Kan Förbli Oförändrade

| Fil/Mapp | Anledning |
|----------|-----------|
| `JS/state.js` | Ren state-hantering, ingen persistence |
| `JS/ui/*.js` | Ren UI-logik |
| `JS/utils/*.js` | Hjälpfunktioner |
| `JS/config/*.js` | Statiska konfigurationsfiler |
| `JS/i18n/*.js` | Översättningslogik (om inte DB-baserad) |
| `JS/matrix.js` | Beräkningslogik |
| `CSS/*.css` | Stilar |
| `index.html` | Markup |
| `data/*.json` | Statiska datadefinitioner |

---

## 7. Filer som Kräver Minimal Refaktorering

| Fil | Ändring |
|-----|---------|
| `JS/features/tab1/standards.js` | Eventuellt ingen StorageService-användning |
| `JS/features/tab2/risk-cards.js` | Läser bara från state |
| `JS/features/tab3/*.js` | Läser/skriver via state |
| `JS/features/layout/*.js` | UI-fokuserad |

---

## 8. Antaganden

1. **Asynkrona operationer acceptabla**
   - Alla databassoperationer blir `async/await`
   - UI måste hantera laddningstillstånd

2. **Enkelt användarläge**
   - Ingen samtidig redigering av samma projekt
   - Konflikthantering inte kritisk initialt

3. **Bakåtkompatibilitet krävs**
   - Exporterade `.hra`-filer måste fungera
   - IndexedDB-data måste migreras

4. **Parcel-bundling fungerar**
   - Inga issue med nya imports
   - Tree-shaking fungerar för oanvända adapters

5. **Bilder hanteras som base64**
   - Kan bli stora, men acceptabelt för MVP
   - Framtida optimering med blob storage

---

## 9. Osäkerheter att Utreda

1. **IndexedDB till SQLite migrering**
   - Hur exporterar vi befintlig data?
   - Engångsmigrering eller kontinuerlig?

2. **Offline-first för HTTP adapter**
   - Behövs offline-cache?
   - Synkroniseringslogik komplex

3. **Tauri vs Electron**
   - Tauri är mindre men nyare
   - Electron har bredare ekosystem

4. **Bildhantering**
   - BLOB i databas vs filsystem?
   - Komprimering och thumbnails?

5. **Multi-project hantering**
   - Behövs en "workspace" nivå?
   - Projektlista med metadata vs full data?

---

## 10. Checklista för Implementation

### Innan Start
- [ ] Skapa backup av hela projektet
- [ ] Skapa feature branch
- [ ] Säkerställ att alla befintliga tester passerar

### Per Fas
- [ ] Implementera enligt plan
- [ ] Testa manuellt i webbläsaren
- [ ] Verifiera att Parcel bygger utan fel
- [ ] Kontrollera att import/export fungerar
- [ ] Testa auto-save
- [ ] Verifiera att modulvisning fungerar

### Efter Komplett Migrering
- [ ] Ta bort deprecated kod
- [ ] Uppdatera REFACTOR_PLAN.md
- [ ] Dokumentera nya API:er
- [ ] Skapa migreringsguide för eventuell SQLite

---

## 11. Sammanfattning

### Vad som ska göras:
1. Skapa en data abstraction layer med Repository pattern
2. Implementera IndexedDB adapter som första adapter
3. Migrera alla features stegvis från direkt StorageService-användning
4. Förbereda för framtida adapters (SQLite, HTTP, Tauri)

### Vad som INTE ska göras nu:
1. Implementera SQLite/HTTP/Tauri adapters
2. Ändra state.js eller UI-komponenter
3. Ändra projektets exportformat
4. Introducera nya beroenden (utom för adapters)

### Förväntad tidsåtgång:
- **Fas 1-2:** 6-10 timmar
- **Fas 3:** 8-12 timmar
- **Fas 4:** 1-2 timmar
- **Totalt:** 15-24 timmar

---

*Dokument skapat för inkrementell refaktorering utan att bryta befintlig funktionalitet.*
