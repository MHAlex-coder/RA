/**
 * Entity Schemas with JSDoc Type Definitions
 * Definierar datastrukturer för alla entiteter
 */

/**
 * @typedef {Object} ProjectMeta
 * @property {string} projectName - Projektnamn
 * @property {string} revision - Versionsnummer (t.ex. "1.0")
 * @property {string} created - ISO timestamp när projektet skapades
 * @property {string} lastModified - ISO timestamp senaste ändring
 */

/**
 * @typedef {Object} ProductData
 * @property {string} orderNumber - Ordernummer
 * @property {string} projectNumber - Projektnummer
 * @property {string} productType - Produkttyp
 * @property {string} productName - Produktnamn
 * @property {string} model - Modell
 * @property {string} serialNumber - Serienummer
 * @property {string} batchNumber - Batchnummer
 * @property {string} machineNumber - Maskinnummer
 * @property {string} functionDescription - Funktionsbeskrivning
 * @property {boolean} isPartlyCompleted - Är delvis slutförd
 */

/**
 * @typedef {Object} Manufacturer
 * @property {string} companyName - Företagsnamn
 * @property {string} address - Adress
 * @property {string} contactInfo - Kontaktinfo
 * @property {string} email - E-post
 * @property {string} phone - Telefon
 * @property {string} docSignatory - Dokumentundertecknare
 * @property {string} technicalFileResponsible - Teknisk filansvarig
 */

/**
 * @typedef {Object} Compliance
 * @property {boolean} isHighRisk - Högrisk-klassificering
 * @property {string} highRiskCategory - Högrisk-kategori
 * @property {string} highRiskCustom - Anpassad högrisk
 * @property {string} highRiskNotes - Högrisk-anteckningar
 * @property {string} conformityPath - Överensstämmelsväg (self/notified)
 * @property {string} notifiedBody - Notifierad body
 */

/**
 * @typedef {Object} DigitalSafety
 * @property {string} softwareVersion - Programvaruversionsnummer
 * @property {string} updatePolicy - Uppdateringspolicy
 * @property {string} cybersecurityMeasures - Cybersäkerhetåtgärder
 * @property {string} aiSafetyFunctions - AI-säkerhetsfunktioner
 * @property {string} digitalInstructions - Digitala instruktioner
 * @property {string} loggingTraceability - Loggning och spårbarhet
 */

/**
 * @typedef {Object} RiskFramework
 * @property {string} intendedUse - Avsedd användning
 * @property {string} foreseeableMisuse - Försebar missbruk
 * @property {string} spaceLimitations - Rumsbegränsningar
 * @property {string} timeLimitations - Tidsbegränsningar
 * @property {string} otherLimitations - Andra begränsningar
 * @property {Array<string>} lifePhases - Livsfaser
 */

/**
 * @typedef {Object} MachineCategories
 * @property {boolean} foodMachine - Livsmedelsmaskin
 * @property {boolean} handheldMachine - Handhållen maskin
 * @property {boolean} mobileMachine - Mobil maskin
 * @property {boolean} liftingFunction - Lyftkraft
 */

/**
 * @typedef {Object} Media
 * @property {string|null} logoImage - Logotypbild (base64)
 */

/**
 * @typedef {Object} RiskParameters
 * @property {number} S - Severity (allvarlighetsgrad) 1-4
 * @property {number} F - Frequency (frekvens) 1-4
 * @property {number} P - Probability (sannolikhet) 1-4
 * @property {number} A - Avoidance (undvikbarhet) 1-4
 */

/**
 * @typedef {Object} ProtectiveMeasure
 * @property {string} measure - Åtgärdsbeskrivning
 * @property {string} type - Åtgärdstyp (protective/structural/informative)
 */

/**
 * @typedef {Object} Risk
 * @property {string} id - Unikt ID (timestamp-baserat)
 * @property {string} created - ISO timestamp
 * @property {string} lastModified - ISO timestamp
 * @property {string} riskGroup - Riskgrupp
 * @property {string} zone - Zon
 * @property {string} area - Område/maskindel
 * @property {string} hazardSource - Farokälla
 * @property {string} cause - Orsak
 * @property {string} injury - Skada
 * @property {string} description - Beskrivning
 * @property {RiskParameters} parametersIN - Initiala riskparametrar
 * @property {RiskParameters} parametersOUT - Residuella riskparametrar
 * @property {Array<ProtectiveMeasure>} protectiveMeasures - Skyddsåtgärder
 * @property {string} measureValuationReason - Motivering för åtgärdsvärdering
 * @property {boolean} isSafetyFunction - Är säkerhetsfunktion
 * @property {string} selectedPL - Vald Performance Level (om säkerhetsfunktion)
 * @property {string} plDeviation - Motivering för PL-avvikelse
 * @property {boolean} implemented - Åtgärd genomförd
 * @property {boolean} verified - Åtgärd verifierad
 * @property {boolean} plCalculation - PL-beräkning genomförd
 * @property {string} comment - Kommentar
 * @property {Array<string>} evidenceLinks - Bevistelinks
 */

/**
 * @typedef {Object} InterfaceRisk
 * @property {string} id - Unikt ID
 * @property {string} created - ISO timestamp
 * @property {string} lastModified - ISO timestamp
 * @property {string} interfaceWith - Gränssnitt med
 * @property {string} area - Område
 * @property {string} description - Beskrivning
 * @property {RiskParameters} parametersIN - Initiala parametrar
 * @property {RiskParameters} parametersOUT - Residuella parametrar
 * @property {Array<ProtectiveMeasure>} protectiveMeasures - Åtgärder
 * @property {string} comment - Kommentar
 * @property {Array<string>} evidenceLinks - Bevistelinks
 */

/**
 * @typedef {Object} Standard
 * @property {string} name - Standardnamn (t.ex. "EN ISO 12345")
 * @property {string} title - Standardtitel
 * @property {boolean} selected - Är vald
 */

/**
 * @typedef {Object} Directive
 * @property {string} name - Direktivnamn
 * @property {string} title - Direktivtitel
 */

/**
 * @typedef {Object} Module
 * @property {string} id - Modul-ID
 * @property {string} name - Modulnamn
 * @property {object} data - Modulens projektdata
 */

/**
 * @typedef {Object} ControlCheckpoint
 * @property {string} id - Kontrollpunkt-ID
 * @property {string} category - Kategori
 * @property {string} description - Beskrivning
 * @property {boolean} checked - Är markerad
 */

/**
 * @typedef {Object} ControlReport
 * @property {object} checkpoints - Kontrollpunkter
 * @property {object} controlQuestions - Kontrollfrågor
 * @property {string} summary - Sammanfattning
 * @property {string} reviewer - Granskare
 * @property {string} date - Datum
 * @property {string} approver - Godkännare
 * @property {string} approvalDate - Godkännandatum
 */

/**
 * @typedef {Object} Project
 * @property {number|null} id - Databas-ID (null för nya projekt)
 * @property {ProjectMeta} meta - Projektmetadata
 * @property {ProductData} productData - Produktinformation
 * @property {Manufacturer} manufacturer - Tillverkarinformation
 * @property {Compliance} compliance - Efterlevnad
 * @property {DigitalSafety} digitalSafety - Digital säkerhet
 * @property {RiskFramework} riskFramework - Riskramverk
 * @property {MachineCategories} machineCategories - Maskinkategorier
 * @property {Media} media - Media/bilder
 * @property {Array<Risk>} risks - Riskobjekt
 * @property {Array<InterfaceRisk>} interfaceRisks - Gränssnittsrisker
 * @property {Array<Standard>} standards - Valda standarder
 * @property {Array<Directive>} directives - Valda direktiv
 * @property {string} selectedDirective - Valt huvuddirektiv
 * @property {Array<Module>} modules - Importerade moduler
 * @property {Array<object>} objects - Objekt
 * @property {Array<object>} purchasedMachines - Köpta maskiner
 * @property {Array<object>} safetyLayoutImages - Säkerhetslayoutbilder
 * @property {boolean} isModuleOrInterface - Är modul/gränssnitt
 * @property {boolean} showModuleSeparately - Visa modul separat
 * @property {string} moduleMotivation - Modulmotivering
 * @property {ControlReport} controlReport - Kontrollrapport
 * @property {object} customLists - Anpassade listor
 * @property {object} customControlQuestions - Anpassade kontrollfrågor
 * @property {string} revision - Revisionsnummer
 */

export {};
