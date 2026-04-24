/**
 * utils/csv.js - CSV helpers
 */

export function csvEscape(value) {
    const str = value === undefined || value === null ? '' : String(value);
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
}

export function buildCSV(rows) {
    return rows.map(row => row.map(csvEscape).join(',')).join('\n');
}

export function parseCSV(text) {
    const rows = [];
    let row = [];
    let field = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (inQuotes) {
            if (char === '"') {
                if (text[i + 1] === '"') {
                    field += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                field += char;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
            } else if (char === ',') {
                row.push(field);
                field = '';
            } else if (char === '\n') {
                row.push(field);
                rows.push(row);
                row = [];
                field = '';
            } else if (char === '\r') {
                continue;
            } else {
                field += char;
            }
        }
    }

    if (field.length > 0 || row.length > 0) {
        row.push(field);
        rows.push(row);
    }

    return rows;
}
