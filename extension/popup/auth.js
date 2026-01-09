/**
 * Authentication Handler
 * Handles Supabase login and JWT storage
 */

// Load config from separate file
// CONFIG is loaded from config.js via script tag in auth.html

// Initialize Supabase client
const { createClient } = supabase;
let supabaseClient = null;

function initSupabase() {
    if (typeof CONFIG === 'undefined') {
        console.error('[Auth] CONFIG not loaded. Make sure config.js exists.');
        showError('Configuration missing. See README for setup instructions.');
        return false;
    }

    if (CONFIG.SUPABASE_URL === 'YOUR_SUPABASE_URL') {
        showError('Please configure your Supabase credentials in extension/config.js');
        return false;
    }

    supabaseClient = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    return true;
}

const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const errorMessage = document.getElementById('errorMessage');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!initSupabase()) return;

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Show loading state
    setLoading(true);
    hideError();

    try {
        // Sign in with Supabase
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            throw error;
        }

        if (!data.session) {
            throw new Error('No session returned from login');
        }

        // Get JWT token
        const token = data.session.access_token;
        const user = data.user;

        console.log('[Auth] Login successful:', user.email);

        // Store in Chrome storage
        await chrome.storage.local.set({
            jwt_token: token,
            user_data: {
                id: user.id,
                email: user.email,
                created_at: user.created_at
            }
        });

        // Redirect to main popup
        window.location.href = 'popup.html';

    } catch (error) {
        console.error('[Auth] Login error:', error);
        showError(error.message || 'Login failed. Please try again.');
    } finally {
        setLoading(false);
    }
});

function setLoading(isLoading) {
    loginBtn.disabled = isLoading;
    const btnText = loginBtn.querySelector('.btn-text');
    const btnLoader = loginBtn.querySelector('.btn-loader');

    if (isLoading) {
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-flex';
    } else {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function hideError() {
    errorMessage.style.display = 'none';
}

// Check if already logged in
chrome.storage.local.get(['jwt_token'], (result) => {
    if (result.jwt_token) {
        window.location.href = 'popup.html';
    }
});
