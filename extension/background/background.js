/**
 * Background Service Worker
 * Handles API calls and message routing between popup and content scripts
 */

// Default API URL - will be overridden if config is available
let API_BASE_URL = 'http://localhost:3001/api/v1';

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('[Background] Received message:', request.action);

    // Handle async operations
    handleMessage(request, sender)
        .then(sendResponse)
        .catch(error => {
            console.error('[Background] Error:', error);
            sendResponse({ success: false, error: error.message });
        });

    // Return true to indicate async response
    return true;
});

async function handleMessage(request, sender) {
    switch (request.action) {
        case 'generateWorkflow':
            return await generateWorkflow(request.content);

        case 'saveWorkflow':
            return await saveWorkflow(request.workflow);

        case 'verifyAuth':
            return await verifyAuth();

        case 'getWorkflows':
            return await getWorkflows();

        case 'generateFromSelection':
            // Content script sent a selection - generate workflow
            return await generateWorkflow(request.content);

        case 'selectionModeCancelled':
            // Just acknowledge
            return { success: true };

        case 'setConfig':
            // Allow popup to send config to background
            if (request.apiBaseUrl) {
                API_BASE_URL = request.apiBaseUrl;
            }
            return { success: true };

        default:
            return { success: false, error: 'Unknown action' };
    }
}

/**
 * Get JWT from storage
 */
async function getJWT() {
    const result = await chrome.storage.local.get(['jwt_token']);
    return result.jwt_token;
}

/**
 * Get API base URL from storage or default
 */
async function getApiBaseUrl() {
    const result = await chrome.storage.local.get(['api_base_url']);
    return result.api_base_url || API_BASE_URL;
}

/**
 * Make authenticated API request
 */
async function apiRequest(endpoint, options = {}) {
    const token = await getJWT();
    const baseUrl = await getApiBaseUrl();

    if (!token && !options.skipAuth) {
        throw new Error('Not authenticated. Please login first.');
    }

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers
    };

    try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
            ...options,
            headers
        });

        if (response.status === 401) {
            await chrome.storage.local.remove(['jwt_token', 'user_data']);
            throw new Error('Session expired. Please login again.');
        }

        return await response.json();
    } catch (error) {
        if (error.message === 'Failed to fetch') {
            throw new Error('Cannot connect to server. Make sure the backend is running on localhost:8000');
        }
        throw error;
    }
}

/**
 * Generate workflow from raw text
 */
async function generateWorkflow(rawText) {
    console.log('[Background] Generating workflow from:', rawText.substring(0, 100) + '...');

    const result = await apiRequest('/ai/convert', {
        method: 'POST',
        body: JSON.stringify({ raw_text: rawText })
    });

    if (result.success && result.workflow) {
        // Store for later use in popup
        await chrome.storage.local.set({ pending_workflow: result.workflow });
    }

    return result;
}

/**
 * Save workflow to database
 */
async function saveWorkflow(workflow) {
    console.log('[Background] Saving workflow:', workflow.title);

    return await apiRequest('/ai/save-workflow', {
        method: 'POST',
        body: JSON.stringify({
            title: workflow.title,
            description: workflow.description,
            steps: workflow.steps
        })
    });
}

/**
 * Verify authentication
 */
async function verifyAuth() {
    try {
        const result = await apiRequest('/users/me');
        return { success: true, user: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Get user's workflows
 */
async function getWorkflows() {
    return await apiRequest('/workflows');
}

// Extension install/update handler
chrome.runtime.onInstalled.addListener((details) => {
    console.log('[Background] Extension installed/updated:', details.reason);
});

console.log('[Background] Service worker started');
