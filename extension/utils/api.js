/**
 * API Client for Backend Communication
 * Handles authenticated requests to FastAPI backend
 */

// Get API URL from config or use default
function getApiBaseUrl() {
    if (typeof CONFIG !== 'undefined' && CONFIG.API_BASE_URL) {
        return CONFIG.API_BASE_URL;
    }
    return 'http://localhost:3001/api/v1';
}

/**
 * Make authenticated request to backend
 */
async function apiRequest(endpoint, options = {}) {
    // Get JWT from storage
    const result = await chrome.storage.local.get(['jwt_token']);
    const token = result.jwt_token;

    if (!token && !options.skipAuth) {
        throw new Error('Not authenticated');
    }

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers
    };

    try {
        const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
            ...options,
            headers
        });

        if (response.status === 401) {
            // Token expired or invalid
            await chrome.storage.local.remove(['jwt_token', 'user_data']);
            throw new Error('Session expired. Please login again.');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        if (error.message === 'Failed to fetch') {
            throw new Error('Cannot connect to server. Is the backend running?');
        }
        throw error;
    }
}

/**
 * Generate workflow from content using AI
 */
async function generateWorkflow(rawText) {
    return apiRequest('/ai/convert', {
        method: 'POST',
        body: JSON.stringify({ raw_text: rawText })
    });
}

/**
 * Save workflow to database
 */
async function saveWorkflow(workflow) {
    return apiRequest('/ai/save-workflow', {
        method: 'POST',
        body: JSON.stringify({
            title: workflow.title,
            description: workflow.description,
            steps: workflow.steps
        })
    });
}

/**
 * Get list of user's workflows
 */
async function getWorkflows() {
    return apiRequest('/workflows', {
        method: 'GET'
    });
}

/**
 * Verify current user token
 */
async function verifyAuth() {
    return apiRequest('/users/me', {
        method: 'GET'
    });
}

/**
 * Get dashboard URL from config
 */
function getDashboardUrl() {
    if (typeof CONFIG !== 'undefined' && CONFIG.DASHBOARD_URL) {
        return CONFIG.DASHBOARD_URL;
    }
    return 'http://localhost:3000';
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.API = {
        apiRequest,
        generateWorkflow,
        saveWorkflow,
        getWorkflows,
        verifyAuth,
        getApiBaseUrl,
        getDashboardUrl
    };
}
