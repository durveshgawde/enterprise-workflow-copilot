/**
 * Main Popup Logic
 * Handles UI interactions and content extraction
 */

// DOM Elements
const userEmail = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');
const selectionModeBtn = document.getElementById('selectionModeBtn');
const fullPageBtn = document.getElementById('fullPageBtn');
const statusSection = document.getElementById('statusSection');
const statusContent = document.getElementById('statusContent');
const dashboardLink = document.getElementById('dashboardLink');

// Content type toggles
const includeEmail = document.getElementById('includeEmail');
const includeForms = document.getElementById('includeForms');
const includeTables = document.getElementById('includeTables');
const includeDocument = document.getElementById('includeDocument');

// Set dashboard link from config
if (typeof CONFIG !== 'undefined' && CONFIG.DASHBOARD_URL) {
    dashboardLink.href = CONFIG.DASHBOARD_URL + '/dashboard/workflows';
}

// Check authentication on load
chrome.storage.local.get(['jwt_token', 'user_data'], (result) => {
    if (!result.jwt_token) {
        window.location.href = 'auth.html';
        return;
    }

    if (result.user_data) {
        userEmail.textContent = result.user_data.email || 'User';
    }
});

// Logout handler
logoutBtn.addEventListener('click', async () => {
    await chrome.storage.local.remove(['jwt_token', 'user_data', 'pending_workflow']);
    window.location.href = 'auth.html';
});

// Selection Mode
selectionModeBtn.addEventListener('click', async () => {
    try {
        // Get active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        // Enable selection mode in content script
        const response = await chrome.tabs.sendMessage(tab.id, {
            action: 'enableSelectionMode'
        });

        if (response.success) {
            showStatus('✂️ Selection mode enabled! Select text on the page.', 'info');
            // Close popup so user can interact with page
            setTimeout(() => window.close(), 1000);
        } else {
            showStatus('❌ Failed to enable selection mode', 'error');
        }
    } catch (error) {
        console.error('[Popup] Error enabling selection mode:', error);
        showStatus('❌ Error: ' + error.message, 'error');
    }
});

// Full Page Extraction
fullPageBtn.addEventListener('click', async () => {
    try {
        showStatus('🔄 Extracting page content...', 'loading');

        // Get active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        // Get extraction options
        const options = {
            includeEmail: includeEmail.checked,
            includeForms: includeForms.checked,
            includeTables: includeTables.checked,
            includeDocument: includeDocument.checked,
            includeSelection: false
        };

        // Extract content from page
        const response = await chrome.tabs.sendMessage(tab.id, {
            action: 'extractContent',
            options
        });

        if (!response.success) {
            throw new Error(response.error || 'Failed to extract content');
        }

        const { textContent, hasContent } = response;

        if (!textContent || textContent.length < 50) {
            showStatus('⚠️ Not enough content found on this page', 'warning');
            return;
        }

        // Show what was extracted
        const contentTypes = [];
        if (hasContent.email) contentTypes.push('Email');
        if (hasContent.forms) contentTypes.push('Forms');
        if (hasContent.tables) contentTypes.push('Tables');
        if (hasContent.document) contentTypes.push('Document');

        showStatus(`✅ Extracted: ${contentTypes.join(', ') || 'Content'}`, 'success');

        // Generate workflow via background script
        showStatus('🤖 Generating workflow with AI...', 'loading');

        chrome.runtime.sendMessage({
            action: 'generateWorkflow',
            content: textContent
        }, (result) => {
            if (chrome.runtime.lastError) {
                showStatus('❌ ' + chrome.runtime.lastError.message, 'error');
                return;
            }

            if (result.success && result.workflow) {
                showStatus('✨ Workflow generated! Opening preview...', 'success');

                // Open preview page
                setTimeout(() => {
                    window.location.href = 'preview.html';
                }, 1000);
            } else {
                showStatus('❌ AI generation failed: ' + (result.error || 'Unknown error'), 'error');
            }
        });

    } catch (error) {
        console.error('[Popup] Error:', error);
        showStatus('❌ Error: ' + error.message, 'error');
    }
});

/**
 * Show status message
 */
function showStatus(message, type = 'info') {
    statusSection.style.display = 'block';
    statusContent.textContent = message;
    statusContent.className = `status-content status-${type}`;
}

/**
 * Hide status message
 */
function hideStatus() {
    statusSection.style.display = 'none';
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'workflowGenerated') {
        showStatus('✨ Workflow generated! Opening preview...', 'success');
        setTimeout(() => {
            window.location.href = 'preview.html';
        }, 1000);
    }
});
