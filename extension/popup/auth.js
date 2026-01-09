/**
 * Authentication Handler
 * Uses Supabase REST API directly (no SDK needed)
 * This avoids CSP issues with external CDN scripts
 */

const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const errorMessage = document.getElementById('errorMessage');

// Check config on load
if (typeof CONFIG === 'undefined') {
    showError('Configuration missing. Copy config.example.js to config.js and add your credentials.');
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (typeof CONFIG === 'undefined') {
        showError('Configuration missing. See README for setup instructions.');
        return;
    }

    if (CONFIG.SUPABASE_URL === 'YOUR_SUPABASE_URL' || !CONFIG.SUPABASE_URL) {
        showError('Please configure your Supabase URL in config.js');
        return;
    }

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    setLoading(true);
    hideError();

    try {
        // Call Supabase Auth REST API directly
        const response = await fetch(`${CONFIG.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': CONFIG.SUPABASE_ANON_KEY
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error_description || data.msg || 'Login failed');
        }

        if (!data.access_token) {
            throw new Error('No access token received');
        }

        console.log('[Auth] Login successful:', data.user?.email);

        // Store JWT and user data in Chrome storage
        await chrome.storage.local.set({
            jwt_token: data.access_token,
            refresh_token: data.refresh_token,
            user_data: {
                id: data.user?.id,
                email: data.user?.email,
                created_at: data.user?.created_at
            }
        });

        // Redirect to main popup
        window.location.href = 'popup.html';

    } catch (error) {
        console.error('[Auth] Login error:', error);
        showError(error.message || 'Login failed. Please check your credentials.');
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
