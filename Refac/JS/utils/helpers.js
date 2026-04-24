/**
 * utils/helpers.js - General helpers
 */

export function safeParseJSON(value, fallback = null) {
    try {
        return JSON.parse(value);
    } catch (error) {
        return fallback;
    }
}

export function cloneDeep(value) {
    return JSON.parse(JSON.stringify(value));
}

export function formatDateISO(date = new Date()) {
    return date.toISOString().split('T')[0];
}

export function formatDateLocale(date = new Date(), locale = 'sv-SE') {
    return date.toLocaleDateString(locale);
}

export function ensureArraySlot(arr, index, defaultValue) {
    while (arr.length <= index) {
        arr.push(typeof defaultValue === 'function' ? defaultValue() : cloneDeep(defaultValue));
    }
}
