/**
 * Control Report Rendering
 * Handles the rendering of control checklist UI for Tab 4
 */

import { getCurrentProject } from '../../state.js';
import { t } from '../../i18n/index.js';
import { 
    getCheckpointKey, 
    getCheckpointStatus, 
    getActiveControlTemplate,
    getActiveControlItems 
} from './control-list.js';

/**
 * Update control report directive header
 * @param {Object} template - Control template
 */
export function updateControlReportDirective(template = getActiveControlTemplate()) {
    const project = getCurrentProject();
    if (!project) return;
    
    const primary = project.selectedDirective || '';
    const extras = (project.directives || []).map(d => d.name).filter(Boolean);
    const displayDirective = primary || extras[0] || '';
    const otherDirectives = extras.filter(name => name !== displayDirective);
    
    const titleEl = document.getElementById('control-checklist-title');
    const noteEl = document.getElementById('control-directive-note');

    if (titleEl) {
        titleEl.textContent = t(template.titleKey, {}, displayDirective || '');
    }
    
    if (noteEl) {
        const othersText = otherDirectives.length 
            ? ` | ${t('control.report.note.others')} ${otherDirectives.join(', ')}` 
            : '';
        
        if (displayDirective) {
            noteEl.textContent = `${t(template.noteKey)}${othersText}`;
        } else if (otherDirectives.length) {
            noteEl.textContent = `${t('control.report.note.onlyothers')} ${otherDirectives.join(', ')}`;
        } else {
            noteEl.textContent = t('control.report.note.nodirective');
        }
    }
}

/**
 * Render control checklist for Tab 4
 */
export function renderControlChecklist() {
    const container = document.getElementById('control-checklist');
    if (!container) return;
    
    const template = getActiveControlTemplate();
    console.log('🎯 Rendering control checklist with template:', template.levels[0].titleKey);
    updateControlReportDirective(template);

    /**
     * Render a single control item
     * @param {Object} item - Control item configuration
     * @param {string} groupId - Unique group ID for radio buttons
     * @returns {string} HTML string
     */
    const renderItem = (item, groupId) => {
        const translatedItem = t(item.textKey);
        const storageKey = getCheckpointKey(item.id);
        const status = getCheckpointStatus(storageKey);
        const helpButton = item.helpKey 
            ? `<button class="control-help-btn" 
                       onclick="showControlHelp('${item.helpKey}')" 
                       title="${t('control.help.tooltip', {}, 'Visa hjälptext')}" 
                       style="background: none; border: none; color: var(--primary-color); cursor: pointer; font-size: 1rem; padding: 0; margin-left: 0.5rem;">
                    ⓘ
               </button>` 
            : '';
        
        return `
            <div style="padding: 0.75rem; background: var(--bg-secondary); border-radius: var(--border-radius);">
                <div style="margin-bottom: 0.5rem; font-size: 0.9rem;">
                    <strong>${translatedItem}</strong>${helpButton}
                </div>
                <div style="display: flex; gap: 1.5rem; align-items: center;">
                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                        <input type="radio" 
                               name="${groupId}" 
                               value="ja" 
                               ${status === 'ja' ? 'checked' : ''}
                               onchange="updateCheckpointStatus('${storageKey}', 'ja')" />
                        <span style="font-size: 0.85rem;">${t('report.yes')}</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                        <input type="radio" 
                               name="${groupId}" 
                               value="nej" 
                               ${status === 'nej' ? 'checked' : ''}
                               onchange="updateCheckpointStatus('${storageKey}', 'nej')" />
                        <span style="font-size: 0.85rem;">${t('report.no')}</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                        <input type="radio" 
                               name="${groupId}" 
                               value="ejakt" 
                               ${status === 'ejakt' ? 'checked' : ''}
                               onchange="updateCheckpointStatus('${storageKey}', 'ejakt')" />
                        <span style="font-size: 0.85rem;">${t('report.na')}</span>
                    </label>
                </div>
            </div>
        `;
    };

    // Render all levels, sections, and items
    container.innerHTML = template.levels.map((level, levelIdx) => `
        <div style="margin-bottom: 2rem;">
            <h3 style="color: var(--primary-color); margin: 0 0 0.35rem 0;">
                ${t(level.titleKey)}
            </h3>
            ${level.subtitleKey 
                ? `<p style="color: var(--text-secondary); margin: 0 0 0.75rem 0;">${t(level.subtitleKey)}</p>` 
                : ''}
            ${level.sections.map((section, secIdx) => `
                <div style="margin-bottom: 1.5rem;">
                    <h4 style="color: var(--text-primary); margin: 0 0 0.75rem 0; font-size: 1rem;">
                        ${t(section.titleKey)}
                    </h4>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-left: 0.5rem;">
                        ${section.items.map((item, itemIdx) => 
                            renderItem(item, `chk-${levelIdx}-${secIdx}-${itemIdx}`)
                        ).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `).join('');
}

/**
 * Get control report statistics
 * @returns {Object} Statistics object with counts
 */
export function getControlReportStatistics() {
    const project = getCurrentProject();
    if (!project) {
        return { total: 0, answered: 0, yes: 0, no: 0, na: 0, completion: 0 };
    }
    
    const template = getActiveControlTemplate();
    const items = getActiveControlItems(template);
    
    let yes = 0;
    let no = 0;
    let na = 0;
    let answered = 0;
    
    items.forEach(item => {
        const key = getCheckpointKey(item.id);
        const status = getCheckpointStatus(key);
        
        if (status) answered++;
        if (status === 'ja') yes++;
        if (status === 'nej') no++;
        if (status === 'ejakt') na++;
    });
    
    const total = items.length;
    const completion = total > 0 ? Math.round((answered / total) * 100) : 0;
    
    return {
        total,
        answered,
        yes,
        no,
        na,
        completion
    };
}

/**
 * Render control report summary statistics
 * @param {string} containerId - Container element ID
 */
export function renderControlReportSummary(containerId = 'control-report-summary') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const stats = getControlReportStatistics();
    
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem;">
            <div style="padding: 1rem; background: var(--bg-secondary); border-radius: var(--border-radius); text-align: center;">
                <div style="font-size: 1.5rem; font-weight: bold; color: var(--primary-color);">${stats.total}</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary);">${t('control.total', {}, 'Totalt')}</div>
            </div>
            <div style="padding: 1rem; background: var(--bg-secondary); border-radius: var(--border-radius); text-align: center;">
                <div style="font-size: 1.5rem; font-weight: bold; color: var(--success-color);">${stats.yes}</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary);">${t('report.yes', {}, 'Ja')}</div>
            </div>
            <div style="padding: 1rem; background: var(--bg-secondary); border-radius: var(--border-radius); text-align: center;">
                <div style="font-size: 1.5rem; font-weight: bold; color: var(--danger-color);">${stats.no}</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary);">${t('report.no', {}, 'Nej')}</div>
            </div>
            <div style="padding: 1rem; background: var(--bg-secondary); border-radius: var(--border-radius); text-align: center;">
                <div style="font-size: 1.5rem; font-weight: bold; color: var(--text-secondary);">${stats.na}</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary);">${t('report.na', {}, 'Ej akt.')}</div>
            </div>
            <div style="padding: 1rem; background: var(--bg-secondary); border-radius: var(--border-radius); text-align: center;">
                <div style="font-size: 1.5rem; font-weight: bold; color: var(--primary-color);">${stats.completion}%</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary);">${t('control.completion', {}, 'Färdig')}</div>
            </div>
        </div>
    `;
}
