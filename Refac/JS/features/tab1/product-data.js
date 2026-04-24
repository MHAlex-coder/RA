/**
 * Product Data Form Handling
 * Manages product information fields in Tab 1
 */

import { getState, getCurrentProject, subscribe } from '../../state.js';
import { t } from '../../i18n/index.js';

/**
 * Initialize product data form fields and event listeners
 */
export function initializeProductDataForm() {
    const productFields = [
        'orderNumber', 'projectNumber', 'productType', 'productName', 
        'model', 'serialNumber', 'batchNumber', 'machineNumber', 
        'functionDescription'
    ];
    
    // Add change listeners to all product fields
    productFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.addEventListener('change', updateProductData);
        }
    });
    
    // Project number updates sidebar in real-time
    const projectNumberInput = document.getElementById('projectNumber');
    if (projectNumberInput) {
        projectNumberInput.addEventListener('input', (e) => {
            updateProjectName(e.target.value || 'Namnlöst projekt');
        });
    }
    
    // Partly completed checkbox
    const partlyCheckbox = document.getElementById('isPartlyCompleted');
    if (partlyCheckbox) {
        partlyCheckbox.addEventListener('change', () => {
            updateProductData();
            updateDeclarationModeUI();
        });
    }
    
    console.log('✓ Product data form initialized');
}

/**
 * Load product data from project into form
 * @param {Object} project - Project object
 */
export function loadProductData(project) {
    if (!project || !project.productData) return;
    
    const fields = {
        'orderNumber': project.productData.orderNumber || '',
        'projectNumber': project.productData.projectNumber || '',
        'productType': project.productData.productType || '',
        'productName': project.productData.productName || '',
        'model': project.productData.model || '',
        'serialNumber': project.productData.serialNumber || '',
        'batchNumber': project.productData.batchNumber || '',
        'machineNumber': project.productData.machineNumber || '',
        'functionDescription': project.productData.functionDescription || ''
    };
    
    Object.entries(fields).forEach(([fieldId, value]) => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.value = value;
        }
    });
    
    // Checkboxes
    const partlyCheckbox = document.getElementById('isPartlyCompleted');
    if (partlyCheckbox) {
        partlyCheckbox.checked = project.productData.isPartlyCompleted || false;
    }
    
    // Update sidebar with project name
    updateProjectName(project.productData.projectNumber || 'Namnlöst projekt');
}

/**
 * Update product data from form fields
 */
function updateProductData() {
    const project = getCurrentProject();
    if (!project) return;
    
    // Collect product data from form
    project.productData.orderNumber = document.getElementById('orderNumber')?.value || '';
    project.productData.projectNumber = document.getElementById('projectNumber')?.value || '';
    project.productData.productType = document.getElementById('productType')?.value || '';
    project.productData.productName = document.getElementById('productName')?.value || '';
    project.productData.model = document.getElementById('model')?.value || '';
    project.productData.serialNumber = document.getElementById('serialNumber')?.value || '';
    project.productData.batchNumber = document.getElementById('batchNumber')?.value || '';
    project.productData.machineNumber = document.getElementById('machineNumber')?.value || '';
    project.productData.functionDescription = document.getElementById('functionDescription')?.value || '';
    project.productData.isPartlyCompleted = document.getElementById('isPartlyCompleted')?.checked || false;
    
    // Update sidebar if project number changed
    if (project.productData.projectNumber) {
        updateProjectName(project.productData.projectNumber);
    }
    
    // Update timestamp
    project.meta.lastModified = new Date().toISOString();
    
    // Update DoC fields if they exist
    if (typeof window.loadDoCData === 'function') {
        window.loadDoCData();
    }
}

/**
 * Update project name in sidebar
 * @param {string} name - Project name
 */
function updateProjectName(name) {
    const projectNameElement = document.getElementById('currentProjectName');
    if (projectNameElement) {
        projectNameElement.textContent = name;
    }
}

/**
 * Update declaration mode UI based on partly completed checkbox
 */
function updateDeclarationModeUI() {
    const project = getCurrentProject();
    if (!project) return;
    
    const isPartly = project.productData?.isPartlyCompleted || false;
    const declarationModeElement = document.getElementById('declarationMode');
    
    if (declarationModeElement) {
        declarationModeElement.textContent = isPartly 
            ? t('declaration.incorporationmode', {}, 'Inbyggnadsintyg')
            : t('declaration.conformitymode', {}, 'Försäkran om överensstämmelse');
    }
}

/**
 * Validate product data
 * @returns {Object} Validation result with isValid and errors
 */
export function validateProductData() {
    const project = getCurrentProject();
    if (!project) {
        return { isValid: false, errors: ['No project loaded'] };
    }
    
    const errors = [];
    
    // Required fields check
    if (!project.productData.productName?.trim()) {
        errors.push(t('validation.productnamerequired', {}, 'Produktnamn måste anges'));
    }
    
    if (!project.productData.projectNumber?.trim()) {
        errors.push(t('validation.projectnumberrequired', {}, 'Projektnummer måste anges'));
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Get product data summary for reports
 * @returns {Object} Product data summary
 */
export function getProductDataSummary() {
    const project = getCurrentProject();
    if (!project) return {};
    
    return {
        orderNumber: project.productData.orderNumber || '-',
        projectNumber: project.productData.projectNumber || '-',
        productType: project.productData.productType || '-',
        productName: project.productData.productName || '-',
        model: project.productData.model || '-',
        serialNumber: project.productData.serialNumber || '-',
        batchNumber: project.productData.batchNumber || '-',
        machineNumber: project.productData.machineNumber || '-',
        functionDescription: project.productData.functionDescription || '-',
        isPartlyCompleted: project.productData.isPartlyCompleted || false
    };
}
