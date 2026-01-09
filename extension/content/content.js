/**
 * Content Script - Main Entry Point
 * Listens for messages from popup/background and coordinates extraction
 */

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('[Workflow Extension] Received message:', request.action);

    switch (request.action) {
        case 'ping':
            sendResponse({ status: 'ready' });
            break;

        case 'enableSelectionMode':
            if (window.SelectionMode) {
                window.SelectionMode.enable();
                sendResponse({ success: true });
            } else {
                sendResponse({ success: false, error: 'SelectionMode not loaded' });
            }
            break;

        case 'disableSelectionMode':
            if (window.SelectionMode) {
                window.SelectionMode.disable();
                sendResponse({ success: true });
            } else {
                sendResponse({ success: false, error: 'SelectionMode not loaded' });
            }
            break;

        case 'getSelection':
            const selection = window.getSelection().toString().trim();
            sendResponse({ selection });
            break;

        case 'extractContent':
            if (window.ContentExtractor) {
                const extracted = window.ContentExtractor.extractAll();
                const options = request.options || {};
                const textContent = window.ContentExtractor.toText(extracted, options);
                sendResponse({
                    success: true,
                    extracted,
                    textContent,
                    hasContent: extracted.hasContent
                });
            } else {
                sendResponse({ success: false, error: 'ContentExtractor not loaded' });
            }
            break;

        case 'extractDocument':
            if (window.ContentExtractor) {
                const doc = window.ContentExtractor.extractDocument();
                sendResponse({ success: true, document: doc });
            } else {
                sendResponse({ success: false, error: 'ContentExtractor not loaded' });
            }
            break;

        case 'extractForms':
            if (window.ContentExtractor) {
                const forms = window.ContentExtractor.extractForms();
                sendResponse({ success: true, forms });
            } else {
                sendResponse({ success: false, error: 'ContentExtractor not loaded' });
            }
            break;

        case 'extractTables':
            if (window.ContentExtractor) {
                const tables = window.ContentExtractor.extractTables();
                sendResponse({ success: true, tables });
            } else {
                sendResponse({ success: false, error: 'ContentExtractor not loaded' });
            }
            break;

        case 'extractEmail':
            if (window.ContentExtractor) {
                const email = window.ContentExtractor.extractEmail();
                sendResponse({ success: true, email });
            } else {
                sendResponse({ success: false, error: 'ContentExtractor not loaded' });
            }
            break;

        case 'getMetadata':
            if (window.ContentExtractor) {
                const metadata = window.ContentExtractor.getMetadata();
                sendResponse({ success: true, metadata });
            } else {
                sendResponse({
                    success: true,
                    metadata: {
                        url: window.location.href,
                        title: document.title,
                        timestamp: new Date().toISOString()
                    }
                });
            }
            break;

        default:
            sendResponse({ success: false, error: 'Unknown action' });
    }

    // Return true to indicate async response
    return true;
});

// Notify that content script is loaded
console.log('[Workflow Extension] Content script loaded on:', window.location.href);
