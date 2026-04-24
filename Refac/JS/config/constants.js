/**
 * config/constants.js - Application Constants
 * Centralized configuration options and static settings
 */

// Fast direktivlista för enkel engångsval i UI
export const DIRECTIVE_OPTIONS = [
    { id: 'directive-2006-42-eg', name: 'Maskindirektivet 2006/42/EG' },
    { id: 'regulation-2023-1230', name: 'Maskinförordningen (EU) 2023/1230' },
    { id: 'directive-2014-35-eu', name: 'Lågspänningsdirektivet 2014/35/EU' }
];

// Livsfaser som kan väljas i flik 1
export const LIFE_PHASE_OPTIONS = [
    { id: 'lifephase-manufacturing', value: 'Tillverkning' },
    { id: 'lifephase-transport', value: 'Transport/montering/installation' },
    { id: 'lifephase-commissioning', value: 'Idrifttagning' },
    { id: 'lifephase-setup', value: 'Inställning/programmering/provning' },
    { id: 'lifephase-operation', value: 'Användning/samtliga driftsätt' },
    { id: 'lifephase-cleaning', value: 'Rengöring' },
    { id: 'lifephase-troubleshooting', value: 'Felsökning' },
    { id: 'lifephase-maintenance', value: 'Underhåll' },
    { id: 'lifephase-decommissioning', value: 'Urdrifttagning/skrotning' }
];

// Överhöga (ej uttömmande) högriskkategorier per direktivet 2006/42/EG
export const HIGH_RISK_DIRECTIVE = [
    'Bilaga IV: Säkerhetskomponenter (t.ex. ljusridåer, tvåhandsdon)',
    'Bilaga IV: Pressar och formsprutningsmaskiner (metall, plast, gummi)',
    'Bilaga IV: Lyftanordningar och lyfttillbehör för personer/last',
    'Bilaga IV: Motordrivna sågar/aggregat för trä och liknande',
    'Bilaga IV: Skyddsstrukturer (ROPS/FOPS) och säkerhetskomponenter för fordon'
];

// Överhöga (ej uttömmande) högriskkategorier per EU 2023/1230
export const HIGH_RISK_REGULATION = [
    'Bilaga I (Regulation): Safety components inklusive digitala/AI-baserade funktioner',
    'Bilaga I (Regulation): Maskiner med AI som påverkar säkerhetsfunktioner',
    'Bilaga I (Regulation): Lyftanordningar/lyfttillbehör för personer/last',
    'Bilaga I (Regulation): Sågar/pressar/formsprutor enligt högrisklistan',
    'Bilaga I (Regulation): Skyddsstrukturer (ROPS/FOPS) och säkerhetskomponenter för fordon'
];

// Fallback risk levels if RiskMatrix not available yet
export const RISK_LEVELS_FALLBACK = {
    severityLevels: {
        1: 'S1: Ingen skada',
        2: 'S2: Lindrig',
        3: 'S3: Allvarlig',
        4: 'S4: Dödlig'
    },
    frequencyLevels: {
        1: 'F1: Sällan',
        2: 'F2: Ofta'
    },
    probabilityLevels: {
        1: 'P1: Mycket låg',
        2: 'P2: Låg',
        3: 'P3: Medel',
        4: 'P4: Hög',
        5: 'P5: Mycket hög'
    },
    avoidanceLevels: {
        1: 'A1: Lätt att undvika',
        2: 'A2: Svårt att undvika'
    }
};
