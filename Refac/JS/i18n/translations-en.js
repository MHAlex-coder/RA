/**
 * i18n/translations-en.js - English Translations
 * Contains all English language strings for the HETZA-RA application
 * 
 * NOTE: This file imports from the original i18n.js for now.
 * In production, these should be split into separate maintainable files.
 */

// Importing translations from original i18n.js and exporting English only
// This is a temporary solution during refactoring
import { translations as allTranslations } from '../../i18n.js';

export default allTranslations.en || {};
