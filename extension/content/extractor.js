/**
 * Rich Content Extractor
 * Extracts various content types from web pages
 */

const ContentExtractor = {
    /**
     * Get user's current text selection
     */
    getSelection() {
        const selection = window.getSelection();
        return selection ? selection.toString().trim() : '';
    },

    /**
     * Extract email content (Gmail, Outlook Web patterns)
     */
    extractEmail() {
        // Gmail patterns
        const gmailSubject = document.querySelector('.hP')?.textContent ||
            document.querySelector('[data-legacy-subject-id]')?.textContent;
        const gmailFrom = document.querySelector('.gD')?.getAttribute('email') ||
            document.querySelector('.go')?.textContent;
        const gmailBody = document.querySelector('.a3s.aiL')?.innerText ||
            document.querySelector('.ii.gt')?.innerText;

        // Outlook patterns
        const outlookSubject = document.querySelector('[aria-label*="Subject"]')?.textContent ||
            document.querySelector('.allowTextSelection')?.textContent;
        const outlookFrom = document.querySelector('[aria-label*="From"]')?.textContent;
        const outlookBody = document.querySelector('[aria-label="Message body"]')?.innerText;

        // Generic email patterns
        const genericSubject = document.querySelector('[class*="subject"], .subject, #subject')?.textContent;
        const genericFrom = document.querySelector('[class*="from"], .from, .sender')?.textContent;
        const genericBody = document.querySelector('[class*="email-body"], .email-content, .message-body')?.innerText;

        return {
            subject: gmailSubject || outlookSubject || genericSubject || null,
            from: gmailFrom || outlookFrom || genericFrom || null,
            body: gmailBody || outlookBody || genericBody || null,
            hasEmail: !!(gmailSubject || outlookSubject || genericSubject)
        };
    },

    /**
     * Extract all forms on the page
     */
    extractForms() {
        const forms = Array.from(document.querySelectorAll('form'));

        return forms.map((form, index) => ({
            formIndex: index,
            action: form.action || 'none',
            method: form.method || 'GET',
            name: form.name || form.id || `form-${index}`,
            fields: Array.from(form.querySelectorAll('input, select, textarea')).map(field => {
                const label = document.querySelector(`label[for="${field.id}"]`)?.textContent ||
                    field.closest('label')?.textContent?.replace(field.value, '').trim() ||
                    field.placeholder ||
                    field.name;
                return {
                    name: field.name || field.id,
                    type: field.type || field.tagName.toLowerCase(),
                    label: label?.trim() || null,
                    required: field.required,
                    placeholder: field.placeholder || null,
                    options: field.tagName === 'SELECT'
                        ? Array.from(field.options).map(o => o.text)
                        : null
                };
            }).filter(f => f.name && f.type !== 'hidden')
        })).filter(f => f.fields.length > 0);
    },

    /**
     * Extract tables from the page
     */
    extractTables() {
        const tables = Array.from(document.querySelectorAll('table'));

        return tables.map((table, index) => {
            const headers = Array.from(table.querySelectorAll('th'))
                .map(th => th.textContent.trim())
                .filter(h => h);

            const rows = Array.from(table.querySelectorAll('tbody tr'))
                .slice(0, 15) // Limit rows
                .map(row =>
                    Array.from(row.querySelectorAll('td'))
                        .map(td => td.textContent.trim())
                );

            return {
                tableIndex: index,
                headers,
                rowCount: table.querySelectorAll('tbody tr').length,
                sampleRows: rows,
                caption: table.querySelector('caption')?.textContent || null
            };
        }).filter(t => t.headers.length > 0 || t.sampleRows.length > 0);
    },

    /**
     * Extract document structure (headings, paragraphs, lists)
     */
    extractDocument() {
        // Headings
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
            .map(h => ({
                level: parseInt(h.tagName.substring(1)),
                text: h.textContent.trim()
            }))
            .filter(h => h.text.length > 0 && h.text.length < 200);

        // Paragraphs (meaningful ones only)
        const paragraphs = Array.from(document.querySelectorAll('p'))
            .map(p => p.textContent.trim())
            .filter(text => text.length > 30 && text.length < 2000)
            .slice(0, 20);

        // Lists
        const lists = Array.from(document.querySelectorAll('ul, ol'))
            .map(list => ({
                type: list.tagName.toLowerCase(),
                items: Array.from(list.querySelectorAll(':scope > li'))
                    .map(li => li.textContent.trim())
                    .filter(text => text.length > 0 && text.length < 500)
                    .slice(0, 20)
            }))
            .filter(list => list.items.length > 0);

        // Code blocks
        const codeBlocks = Array.from(document.querySelectorAll('pre, code'))
            .map(c => c.textContent.trim())
            .filter(text => text.length > 10 && text.length < 2000)
            .slice(0, 5);

        return {
            headings,
            paragraphs,
            lists,
            codeBlocks
        };
    },

    /**
     * Extract buttons and actions
     */
    extractActions() {
        const buttons = Array.from(document.querySelectorAll('button, [role="button"], input[type="submit"], input[type="button"], a.btn, a.button'))
            .map(btn => ({
                text: btn.textContent?.trim() || btn.value || btn.getAttribute('aria-label'),
                type: btn.type || 'button'
            }))
            .filter(btn => btn.text && btn.text.length > 0 && btn.text.length < 100)
            .slice(0, 30);

        return buttons;
    },

    /**
     * Extract links
     */
    extractLinks() {
        return Array.from(document.querySelectorAll('a[href]'))
            .map(a => ({
                text: a.textContent.trim(),
                url: a.href
            }))
            .filter(link => link.text.length > 0 && link.text.length < 100)
            .slice(0, 30);
    },

    /**
     * Get page metadata
     */
    getMetadata() {
        return {
            url: window.location.href,
            title: document.title,
            description: document.querySelector('meta[name="description"]')?.content || null,
            timestamp: new Date().toISOString()
        };
    },

    /**
     * Full page extraction with all content types
     */
    extractAll() {
        const selection = this.getSelection();
        const email = this.extractEmail();
        const forms = this.extractForms();
        const tables = this.extractTables();
        const document = this.extractDocument();
        const actions = this.extractActions();
        const links = this.extractLinks();
        const metadata = this.getMetadata();

        return {
            selection,
            email,
            forms,
            tables,
            document,
            actions,
            links,
            metadata,
            hasContent: {
                selection: selection.length > 0,
                email: email.hasEmail,
                forms: forms.length > 0,
                tables: tables.length > 0,
                document: document.headings.length > 0 || document.paragraphs.length > 0
            }
        };
    },

    /**
     * Convert extracted content to a text format for AI processing
     */
    toText(extracted, options = {}) {
        const parts = [];

        // Add selection first if present
        if (extracted.selection && options.includeSelection !== false) {
            parts.push('=== SELECTED TEXT ===');
            parts.push(extracted.selection);
            parts.push('');
        }

        // Email content
        if (extracted.email?.hasEmail && options.includeEmail !== false) {
            parts.push('=== EMAIL ===');
            if (extracted.email.subject) parts.push(`Subject: ${extracted.email.subject}`);
            if (extracted.email.from) parts.push(`From: ${extracted.email.from}`);
            if (extracted.email.body) parts.push(`Body: ${extracted.email.body}`);
            parts.push('');
        }

        // Document structure
        if (options.includeDocument !== false) {
            const doc = extracted.document;

            if (doc.headings.length > 0) {
                parts.push('=== DOCUMENT STRUCTURE ===');
                doc.headings.forEach(h => {
                    const prefix = '#'.repeat(h.level);
                    parts.push(`${prefix} ${h.text}`);
                });
                parts.push('');
            }

            if (doc.paragraphs.length > 0) {
                parts.push('=== CONTENT ===');
                doc.paragraphs.slice(0, 10).forEach(p => parts.push(p));
                parts.push('');
            }

            if (doc.lists.length > 0) {
                parts.push('=== LISTS ===');
                doc.lists.forEach(list => {
                    list.items.forEach((item, i) => {
                        const bullet = list.type === 'ol' ? `${i + 1}.` : '-';
                        parts.push(`${bullet} ${item}`);
                    });
                });
                parts.push('');
            }
        }

        // Forms
        if (extracted.forms.length > 0 && options.includeForms !== false) {
            parts.push('=== FORMS ===');
            extracted.forms.forEach(form => {
                parts.push(`Form: ${form.name}`);
                form.fields.forEach(field => {
                    const req = field.required ? ' (required)' : '';
                    parts.push(`  - ${field.label || field.name}: ${field.type}${req}`);
                });
            });
            parts.push('');
        }

        // Tables
        if (extracted.tables.length > 0 && options.includeTables !== false) {
            parts.push('=== TABLES ===');
            extracted.tables.forEach(table => {
                if (table.headers.length > 0) {
                    parts.push(`Headers: ${table.headers.join(' | ')}`);
                }
                if (table.sampleRows.length > 0) {
                    parts.push(`Sample data (${table.rowCount} rows):`);
                    table.sampleRows.slice(0, 3).forEach(row => {
                        parts.push(`  ${row.join(' | ')}`);
                    });
                }
            });
            parts.push('');
        }

        // Metadata
        parts.push('=== PAGE INFO ===');
        parts.push(`Title: ${extracted.metadata.title}`);
        parts.push(`URL: ${extracted.metadata.url}`);

        return parts.join('\n');
    }
};

// Make available globally
window.ContentExtractor = ContentExtractor;
