/**
 * Manufacturer Data Form Handling
 * Manages manufacturer/company information and logo in Tab 1
 */

import { getCurrentProject } from '../../state.js';
import { t } from '../../i18n/index.js';

/**
 * Initialize manufacturer form fields and event listeners
 */
export function initializeManufacturerForm() {
    const manufacturerFields = [
        'companyName', 'address', 'contactInfo', 
        'docSignatory', 'technicalFileResponsible',
        'manufacturerEmail', 'manufacturerPhone'
    ];
    
    // Add change listeners to all manufacturer fields
    manufacturerFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.addEventListener('change', updateManufacturerData);
        }
    });
    
    // Logo upload
    const logoUpload = document.getElementById('logoUpload');
    if (logoUpload) {
        logoUpload.addEventListener('change', handleLogoUpload);
    }
    
    // Remove logo button
    const removeLogoBtn = document.getElementById('removeLogoBtn');
    if (removeLogoBtn) {
        removeLogoBtn.addEventListener('click', removeLogo);
    }
    
    console.log('✓ Manufacturer form initialized');
}

/**
 * Load manufacturer data from project into form
 * @param {Object} project - Project object
 */
export function loadManufacturerData(project) {
    if (!project || !project.manufacturer) return;
    
    const fields = {
        'companyName': project.manufacturer.companyName || '',
        'address': project.manufacturer.address || '',
        'contactInfo': project.manufacturer.contactInfo || '',
        'docSignatory': project.manufacturer.docSignatory || '',
        'technicalFileResponsible': project.manufacturer.technicalFileResponsible || '',
        'manufacturerEmail': project.manufacturer.email || '',
        'manufacturerPhone': project.manufacturer.phone || ''
    };
    
    Object.entries(fields).forEach(([fieldId, value]) => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.value = value;
        }
    });
    
    // Load logo preview if exists
    if (project.media?.logoImage) {
        displayLogoPreview(project.media.logoImage);
    }
}

/**
 * Update manufacturer data from form
 */
function updateManufacturerData() {
    const project = getCurrentProject();
    if (!project) return;
    
    project.manufacturer.companyName = document.getElementById('companyName')?.value || '';
    project.manufacturer.address = document.getElementById('address')?.value || '';
    project.manufacturer.contactInfo = document.getElementById('contactInfo')?.value || '';
    project.manufacturer.docSignatory = document.getElementById('docSignatory')?.value || '';
    project.manufacturer.technicalFileResponsible = document.getElementById('technicalFileResponsible')?.value || '';
    project.manufacturer.email = document.getElementById('manufacturerEmail')?.value || '';
    project.manufacturer.phone = document.getElementById('manufacturerPhone')?.value || '';
    
    // Update timestamp
    project.meta.lastModified = new Date().toISOString();
    
    // Update DoC fields if they exist
    if (typeof window.loadDoCData === 'function') {
        window.loadDoCData();
    }
}

/**
 * Handle logo file upload
 * @param {Event} event - File input change event
 */
function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert(t('error.invalidfiletype', {}, 'Endast bildfiler tillåtna'));
        return;
    }
    
    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
        alert(t('error.filetoobig', {}, 'Filen är för stor. Max 2MB tillåten.'));
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const project = getCurrentProject();
        if (!project) return;
        
        project.media.logoImage = e.target.result;
        project.meta.lastModified = new Date().toISOString();
        
        // Display preview
        displayLogoPreview(e.target.result);
    };
    reader.readAsDataURL(file);
}

/**
 * Display logo preview
 * @param {string} dataUrl - Base64 image data URL
 */
function displayLogoPreview(dataUrl) {
    const preview = document.getElementById('logoPreview');
    const removeBtn = document.getElementById('removeLogoBtn');
    
    if (preview) {
        preview.innerHTML = `
            <img src="${dataUrl}" 
                 alt="Logotyp" 
                 style="max-width: 200px; max-height: 100px; border: 1px solid var(--border-color); border-radius: var(--border-radius);" />
        `;
    }
    
    if (removeBtn) {
        removeBtn.style.display = 'inline-block';
    }
}

/**
 * Remove logo from project
 */
function removeLogo() {
    if (!confirm(t('message.confirmremovelogo', {}, 'Vill du ta bort logotypen?'))) {
        return;
    }
    
    const project = getCurrentProject();
    if (!project) return;
    
    project.media.logoImage = '';
    project.meta.lastModified = new Date().toISOString();
    
    // Clear preview and input
    const preview = document.getElementById('logoPreview');
    const logoUpload = document.getElementById('logoUpload');
    const removeBtn = document.getElementById('removeLogoBtn');
    
    if (preview) preview.innerHTML = '';
    if (logoUpload) logoUpload.value = '';
    if (removeBtn) removeBtn.style.display = 'none';
}

/**
 * Validate manufacturer data
 * @returns {Object} Validation result with isValid and errors
 */
export function validateManufacturerData() {
    const project = getCurrentProject();
    if (!project) {
        return { isValid: false, errors: ['No project loaded'] };
    }
    
    const errors = [];
    
    // Required fields check
    if (!project.manufacturer.companyName?.trim()) {
        errors.push(t('validation.companynamerequired', {}, 'Företagsnamn måste anges'));
    }
    
    if (!project.manufacturer.address?.trim()) {
        errors.push(t('validation.addressrequired', {}, 'Adress måste anges'));
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Get manufacturer data summary for reports
 * @returns {Object} Manufacturer data summary
 */
export function getManufacturerSummary() {
    const project = getCurrentProject();
    if (!project) return {};
    
    return {
        companyName: project.manufacturer.companyName || '-',
        address: project.manufacturer.address || '-',
        contactInfo: project.manufacturer.contactInfo || '-',
        email: project.manufacturer.email || '-',
        phone: project.manufacturer.phone || '-',
        docSignatory: project.manufacturer.docSignatory || '-',
        technicalFileResponsible: project.manufacturer.technicalFileResponsible || '-',
        logoImage: project.media?.logoImage || ''
    };
}
