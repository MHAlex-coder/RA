/**
 * Project Revision Management
 */

import { getCurrentProject } from '../../state.js';
import { saveCurrentProject } from '../support/auto-save.js';
import { updateProjectRevision } from './project-load.js';
import { t } from '../../i18n/index.js';

export async function createNewRevision() {
    const project = getCurrentProject();
    if (!project) {
        alert(t('error.noproject', {}, 'Inget projekt laddat'));
        return;
    }

    const rev = String(project.revision || '1.0');
    const parts = rev.split('.');
    let major = parseInt(parts[0], 10);
    let minor = parseInt(parts[1] || '0', 10);

    if (Number.isNaN(major)) major = 1;
    if (Number.isNaN(minor)) minor = 0;

    minor += 1;
    project.revision = `${major}.${minor}`;
    project.meta = project.meta || {};
    project.meta.lastModified = new Date().toISOString();

    updateProjectRevision(project.revision);
    await saveCurrentProject();
}

if (typeof window !== 'undefined') {
    window.createNewRevision = createNewRevision;
}
