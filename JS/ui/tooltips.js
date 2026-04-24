/**
 * ui/tooltips.js - Tooltip Positioning System
 * Handles dynamic positioning of info tooltips for parameter help
 */

/**
 * Initialize tooltip positioning
 * Dynamically positions tooltips to stay within viewport
 */
export function initializeTooltipPositioning() {
    document.addEventListener('mouseover', (e) => {
        const btn = e.target.closest('.param-info-btn');
        if (!btn) return;
        
        const tooltip = btn.querySelector('.param-tooltip');
        if (!tooltip) return;
        
        positionTooltip(btn, tooltip);
    });
}

/**
 * Position a tooltip relative to its button
 * @param {HTMLElement} btn - The button element
 * @param {HTMLElement} tooltip - The tooltip element to position
 */
function positionTooltip(btn, tooltip) {
    const btnRect = btn.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    // Default position: above the button, aligned to the left
    let top = btnRect.top - tooltipRect.height - 10;
    let left = btnRect.left;
    
    // Adjust if tooltip goes above viewport
    if (top < 10) {
        top = btnRect.bottom + 10;
    }
    
    // Adjust if tooltip goes beyond right edge of viewport
    const maxLeft = window.innerWidth - tooltipRect.width - 10;
    if (left > maxLeft) {
        left = maxLeft;
    }
    
    // Adjust if tooltip goes beyond left edge of viewport
    if (left < 10) {
        left = 10;
    }
    
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
}

/**
 * Show a tooltip
 * @param {HTMLElement} tooltip - The tooltip element
 */
export function showTooltip(tooltip) {
    tooltip.style.display = 'block';
}

/**
 * Hide a tooltip
 * @param {HTMLElement} tooltip - The tooltip element
 */
export function hideTooltip(tooltip) {
    tooltip.style.display = 'none';
}
