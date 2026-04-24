/**
 * utils/dom.js - DOM helpers
 */

export function qs(selector, root = document) {
    return root.querySelector(selector);
}

export function qsa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
}

export function setText(el, text) {
    if (el) el.textContent = text;
}

export function setHTML(el, html) {
    if (el) el.innerHTML = html;
}

export function toggleClass(el, className, enabled) {
    if (!el) return;
    if (enabled) {
        el.classList.add(className);
    } else {
        el.classList.remove(className);
    }
}

export function on(el, event, handler, options) {
    if (el) el.addEventListener(event, handler, options);
}

export function off(el, event, handler, options) {
    if (el) el.removeEventListener(event, handler, options);
}
