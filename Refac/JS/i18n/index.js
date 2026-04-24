/**
 * i18n/index.js - Internationalization (i18n) System
 * Provides translation function t() and language switching
 */

import sv from './translations-sv.js';
import en from './translations-en.js';

// All translations organized by language
const translations = {
    sv,
    en
};

// Get saved language from localStorage or default to Swedish
let currentLang = localStorage.getItem('hetza-language') || 'sv';

/**
 * Get a translation by key
 * @param {string} key - Translation key (e.g., "header.title")
 * @param {object} vars - Variables for text replacement (e.g., {name: "John"})
 * @param {string|null} fallback - Fallback text if key not found
 * @returns {string} Translated text
 */
export function t(key, vars = {}, fallback = null) {
    let text = translations[currentLang]?.[key] || translations.sv?.[key] || fallback || key;
    
    // Replace variables in the text
    Object.keys(vars).forEach(varName => {
        text = text.replace(new RegExp(`{${varName}}`, 'g'), vars[varName]);
    });
    
    return text;
}

/**
 * Change language and update the entire UI
 * @param {string} lang - Language code (sv/en)
 */
export function setLanguage(lang) {
    if (!translations[lang]) {
        console.warn(`Language "${lang}" not found`);
        return;
    }
    
    currentLang = lang;
    localStorage.setItem('hetza-language', lang);
    
    console.log(`Language changed to: ${lang}`);
    
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const vars = el.getAttribute('data-i18n-vars');
        el.textContent = vars ? t(key, JSON.parse(vars)) : t(key);
    });
    
    // Update elements with data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });
    
    // Update elements with data-i18n-title
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        el.title = t(key);
    });
    
    // Restart UI components to update dynamic text
    if (typeof renderStandardsList === 'function') renderStandardsList();
    if (typeof renderDirectivesList === 'function') renderDirectivesList();
    if (typeof renderRiskCards === 'function') renderRiskCards();
    if (typeof renderInterfaceRisks === 'function') renderInterfaceRisks();
    if (typeof renderObjectsList === 'function') renderObjectsList();
    if (typeof renderLayoutImages === 'function') renderLayoutImages();
    if (typeof updateDeclarationModeUI === 'function') updateDeclarationModeUI();
    if (typeof renderControlChecklist === 'function') renderControlChecklist();
    if (typeof renderControlReportSummary === 'function') renderControlReportSummary();
    
    // Update language selector
    updateLanguageSelector();
}

/**
 * Update language selector in UI
 */
export function updateLanguageSelector() {
    const langButtons = document.querySelectorAll('[data-lang-selector]');
    langButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang-selector') === currentLang) {
            btn.classList.add('active');
        }
    });
    
    // Update document's language attribute
    document.documentElement.lang = currentLang === 'en' ? 'en-GB' : 'sv-SE';
}

/**
 * Initialize language system on page load
 */
export function initializeLanguageSystem() {
    setLanguage(currentLang);
}

/**
 * Get current language
 */
export function getCurrentLang() {
    return currentLang;
}

// Initialize on page load if document is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLanguageSystem);
} else {
    initializeLanguageSystem();
}
