/**
 * ui/modals.js - Modal and Dialog Management
 * Handles opening/closing of modals and floating windows
 */

import { renderRiskMatrixInfo } from '../features/export/risk-matrix-info.js';

/**
 * Open risk matrix modal
 */
export function openRiskMatrixModal() {
    const window_ = document.getElementById('risk-matrix-window');
    const body = document.getElementById('risk-matrix-body');
    if (!window_ || !body) return;
    
    body.innerHTML = renderRiskMatrixInfo();
    window_.style.display = 'flex';
    
    initializeFloatingWindow();
}

/**
 * Close risk matrix modal
 */
export function closeRiskMatrixModal() {
    const window_ = document.getElementById('risk-matrix-window');
    if (window_) window_.style.display = 'none';
}

/**
 * Close purchased machine modal
 */
export function closePurchasedMachineModal() {
    const modal = document.getElementById('purchased-machine-modal');
    if (modal) modal.style.display = 'none';
}

/**
 * Initialize floating window drag and resize
 */
function initializeFloatingWindow() {
    const window_ = document.getElementById('risk-matrix-window');
    const header = document.getElementById('risk-matrix-header');
    const resizeHandle = document.getElementById('risk-matrix-resize');
    
    if (!window_ || !header || !resizeHandle) return;
    
    let isDragging = false;
    let isResizing = false;
    let startX = 0;
    let startY = 0;
    let startWidth = 0;
    let startHeight = 0;
    let windowX = 0;
    let windowY = 0;
    
    // Drag
    header.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        const rect = window_.getBoundingClientRect();
        windowX = rect.left;
        windowY = rect.top;
    });
    
    // Resize
    resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        const rect = window_.getBoundingClientRect();
        startWidth = rect.width;
        startHeight = rect.height;
    });
    
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            window_.style.left = (windowX + deltaX) + 'px';
            window_.style.top = (windowY + deltaY) + 'px';
            window_.style.right = 'auto';
        }
        
        if (isResizing) {
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            const newWidth = Math.max(300, startWidth + deltaX);
            const newHeight = Math.max(200, startHeight + deltaY);
            window_.style.width = newWidth + 'px';
            window_.style.maxHeight = newHeight + 'px';
        }
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
        isResizing = false;
    });
}

/**
 * Initialize modal close handlers
 */
export function initializeModalHandlers() {
    window.addEventListener('click', (event) => {
        const purchasedModal = document.getElementById('purchased-machine-modal');
        if (event.target === purchasedModal) {
            closePurchasedMachineModal();
        }
    });
}

// Expose inline handlers
if (typeof window !== 'undefined') {
    window.openRiskMatrixModal = openRiskMatrixModal;
    window.closeRiskMatrixModal = closeRiskMatrixModal;
}
