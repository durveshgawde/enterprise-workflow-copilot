/**
 * Chrome Storage Utilities
 * Handles JWT, user data, and pending workflow storage
 */

const StorageKeys = {
    JWT: 'jwt_token',
    USER: 'user_data',
    PENDING_WORKFLOW: 'pending_workflow',
    PENDING_CONTENT: 'pending_content',
    SETTINGS: 'extension_settings'
};

/**
 * Get value from Chrome local storage
 */
async function storageGet(key) {
    return new Promise((resolve) => {
        chrome.storage.local.get([key], (result) => {
            resolve(result[key] || null);
        });
    });
}

/**
 * Set value in Chrome local storage
 */
async function storageSet(key, value) {
    return new Promise((resolve) => {
        chrome.storage.local.set({ [key]: value }, () => {
            resolve();
        });
    });
}

/**
 * Remove value from Chrome local storage
 */
async function storageRemove(key) {
    return new Promise((resolve) => {
        chrome.storage.local.remove([key], () => {
            resolve();
        });
    });
}

/**
 * Clear all extension storage
 */
async function storageClearAll() {
    return new Promise((resolve) => {
        chrome.storage.local.clear(() => {
            resolve();
        });
    });
}

// JWT specific helpers
async function getJWT() {
    return await storageGet(StorageKeys.JWT);
}

async function setJWT(token) {
    return await storageSet(StorageKeys.JWT, token);
}

async function removeJWT() {
    return await storageRemove(StorageKeys.JWT);
}

// User data helpers
async function getUser() {
    return await storageGet(StorageKeys.USER);
}

async function setUser(userData) {
    return await storageSet(StorageKeys.USER, userData);
}

async function removeUser() {
    return await storageRemove(StorageKeys.USER);
}

// Auth status check
async function isAuthenticated() {
    const jwt = await getJWT();
    return !!jwt;
}

// Pending workflow helpers
async function setPendingWorkflow(workflow) {
    return await storageSet(StorageKeys.PENDING_WORKFLOW, workflow);
}

async function getPendingWorkflow() {
    return await storageGet(StorageKeys.PENDING_WORKFLOW);
}

async function clearPendingWorkflow() {
    return await storageRemove(StorageKeys.PENDING_WORKFLOW);
}

// Pending content helpers
async function setPendingContent(content) {
    return await storageSet(StorageKeys.PENDING_CONTENT, content);
}

async function getPendingContent() {
    return await storageGet(StorageKeys.PENDING_CONTENT);
}

// Logout - clear all auth data
async function logout() {
    await removeJWT();
    await removeUser();
    await clearPendingWorkflow();
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.ExtStorage = {
        StorageKeys,
        storageGet,
        storageSet,
        storageRemove,
        storageClearAll,
        getJWT,
        setJWT,
        removeJWT,
        getUser,
        setUser,
        removeUser,
        isAuthenticated,
        setPendingWorkflow,
        getPendingWorkflow,
        clearPendingWorkflow,
        setPendingContent,
        getPendingContent,
        logout
    };
}
