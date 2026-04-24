/**
 * Safety Layout Functions
 * Handles uploading and viewing layout images
 */

import { getCurrentProject } from '../../state.js';
import { t } from '../../i18n/index.js';
import { saveCurrentProject } from '../support/auto-save.js';

let currentZoom = 1;
let currentImageIndex = -1;

export async function uploadLayoutImage() {
    const project = getCurrentProject();
    if (!project) {
        alert('Inget projekt är laddat. Skapa eller ladda ett projekt först.');
        return;
    }
    
    const titleInput = document.getElementById('layout-title');
    const title = titleInput?.value.trim() || 'Namnlös layoutbild';
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onerror = (error) => {
            console.error('FileReader fel:', error);
            alert('Kunde inte läsa filen. Försök igen.');
        };
        reader.onload = async (event) => {
            try {
                const imageData = {
                    title: title,
                    fileName: file.name,
                    fileType: file.type,
                    data: event.target.result,
                    uploadDate: new Date().toISOString(),
                    id: Date.now()
                };
                
                if (!project.safetyLayoutImages) {
                    project.safetyLayoutImages = [];
                }
                project.safetyLayoutImages.push(imageData);
                
                await saveCurrentProject();
                
                if (titleInput) titleInput.value = '';
                renderLayoutImages();
            } catch (error) {
                console.error('Fel vid uppladdning:', error);
                alert('Ett fel uppstod vid uppladdning: ' + error.message);
            }
        };
        reader.readAsDataURL(file);
    };
    input.click();
}

export function renderLayoutImages() {
    const container = document.getElementById('layout-images-container');
    const project = getCurrentProject();
    if (!container) return;
    
    if (!project || !project.safetyLayoutImages || project.safetyLayoutImages.length === 0) {
        container.innerHTML = `
            <div class="card" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                <p style="font-size: 1.2rem; margin: 0;">📭 ${t('layout.noimages')}</p>
                <p style="margin-top: 0.5rem; font-size: 0.9rem;">${t('layout.useform')}</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
            ${project.safetyLayoutImages.map((img, idx) => `
                <div class="card" style="overflow: hidden;">
                    <div style="position: relative; background: #f5f5f5; height: 200px; overflow: hidden; cursor: pointer;" onclick="openImageViewer(${idx})">
                        ${img.fileType === 'application/pdf' ? 
                            `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666;">
                                <div style="text-align: center;">
                                    <div style="font-size: 4rem;">📄</div>
                                    <div style="margin-top: 0.5rem;">PDF-dokument</div>
                                </div>
                            </div>` : 
                            `<img src="${img.data}" alt="${img.title}" style="width: 100%; height: 100%; object-fit: contain;" />`
                        }
                    </div>
                    <div class="card-body">
                        <h4 style="margin: 0 0 0.5rem 0; color: var(--primary-color);">${img.title}</h4>
                        <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">
                            ${img.fileName}<br/>
                            <span style="font-size: 0.8rem;">${new Date(img.uploadDate).toLocaleString('sv-SE')}</span>
                        </p>
                        <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                            <button class="btn btn-primary" onclick="openImageViewer(${idx})" style="flex: 1;">🔍 ${t('layout.view')}</button>
                            <button class="btn btn-danger" onclick="deleteLayoutImage(${idx})" style="padding: 0.5rem 1rem;">${t('layout.delete')}</button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

export function openImageViewer(index) {
    const project = getCurrentProject();
    if (!project || !project.safetyLayoutImages) return;
    const image = project.safetyLayoutImages[index];
    if (!image) return;
    
    if (image.fileType === 'application/pdf') {
        const win = window.open();
        win.document.write(`
            <html>
            <head>
                <title>${image.title}</title>
                <style>body { margin: 0; padding: 0; } iframe { width: 100vw; height: 100vh; border: none; }</style>
            </head>
            <body>
                <iframe src="${image.data}"></iframe>
            </body>
            </html>
        `);
        return;
    }
    
    currentImageIndex = index;
    currentZoom = 1;
    
    const modal = document.getElementById('image-viewer-modal');
    const img = document.getElementById('viewer-image');
    const title = document.getElementById('viewer-title');
    
    img.src = image.data;
    img.alt = image.title;
    title.textContent = image.title;
    
    modal.classList.remove('hidden');
    updateZoomDisplay();
    setupImagePan();
}

export function closeImageViewer() {
    const modal = document.getElementById('image-viewer-modal');
    if (!modal) return;
    
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.log('Kunde inte avsluta fullskärm:', err));
    }
    
    modal.classList.add('hidden');
    currentImageIndex = -1;
    currentZoom = 1;
}

export function toggleFullscreen() {
    const modal = document.getElementById('image-viewer-modal');
    const btn = document.getElementById('fullscreen-btn');
    
    if (!document.fullscreenElement) {
        modal.requestFullscreen().catch(err => {
            console.log('Kunde inte gå till fullskärm:', err);
            alert('Fullskärm stöds inte i denna webbläsare');
        });
        if (btn) {
            btn.textContent = '⛶ Avsluta fullskärm';
            btn.style.background = '#f59e0b';
        }
    } else {
        document.exitFullscreen().catch(err => console.log('Kunde inte avsluta fullskärm:', err));
        if (btn) {
            btn.textContent = '⛶ Fullskärm';
            btn.style.background = '';
        }
    }
}

document.addEventListener('fullscreenchange', () => {
    const btn = document.getElementById('fullscreen-btn');
    if (btn) {
        if (document.fullscreenElement) {
            btn.textContent = '⛶ Avsluta fullskärm';
            btn.style.background = '#f59e0b';
        } else {
            btn.textContent = '⛶ Fullskärm';
            btn.style.background = '';
        }
    }
});

export function zoomIn() {
    currentZoom = Math.min(currentZoom + 0.25, 5);
    applyZoom();
}

export function zoomOut() {
    currentZoom = Math.max(currentZoom - 0.25, 0.25);
    applyZoom();
}

export function resetZoom() {
    currentZoom = 1;
    const img = document.getElementById('viewer-image');
    if (!img) return;
    img.style.transform = 'scale(1) translate(0, 0)';
    img.dataset.translateX = '0';
    img.dataset.translateY = '0';
    updateZoomDisplay();
}

function applyZoom() {
    const img = document.getElementById('viewer-image');
    if (!img) return;
    const translateX = img.dataset.translateX || '0';
    const translateY = img.dataset.translateY || '0';
    img.style.transform = `scale(${currentZoom}) translate(${translateX}px, ${translateY}px)`;
    updateZoomDisplay();
}

function updateZoomDisplay() {
    const zoomLevel = document.getElementById('zoom-level');
    if (zoomLevel) zoomLevel.textContent = Math.round(currentZoom * 100) + '%';
}

function setupImagePan() {
    const img = document.getElementById('viewer-image');
    if (!img) return;
    let isDragging = false;
    let startX, startY;
    let translateX = 0, translateY = 0;
    
    img.dataset.translateX = '0';
    img.dataset.translateY = '0';
    
    img.onmousedown = (e) => {
        if (currentZoom <= 1) return;
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        img.style.cursor = 'grabbing';
    };
    
    img.onmousemove = (e) => {
        if (!isDragging) return;
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        img.dataset.translateX = translateX;
        img.dataset.translateY = translateY;
        img.style.transform = `scale(${currentZoom}) translate(${translateX}px, ${translateY}px)`;
    };
    
    img.onmouseup = () => {
        isDragging = false;
        img.style.cursor = 'move';
    };
    
    img.onmouseleave = () => {
        isDragging = false;
        img.style.cursor = 'move';
    };
    
    const container = document.getElementById('image-viewer-container');
    if (container) {
        container.onwheel = (e) => {
            e.preventDefault();
            if (e.deltaY < 0) zoomIn();
            else zoomOut();
        };
    }
}

export async function deleteLayoutImage(index) {
    const project = getCurrentProject();
    if (!project?.safetyLayoutImages) return;
    const image = project.safetyLayoutImages[index];
    if (!confirm(t('layout.confirm_delete', {title: image.title}))) return;
    
    project.safetyLayoutImages.splice(index, 1);
    await saveCurrentProject();
    renderLayoutImages();
}

if (typeof window !== 'undefined') {
    window.uploadLayoutImage = uploadLayoutImage;
    window.renderLayoutImages = renderLayoutImages;
    window.openImageViewer = openImageViewer;
    window.closeImageViewer = closeImageViewer;
    window.toggleFullscreen = toggleFullscreen;
    window.zoomIn = zoomIn;
    window.zoomOut = zoomOut;
    window.resetZoom = resetZoom;
    window.deleteLayoutImage = deleteLayoutImage;
}
