/**
 * Selection Mode UI
 * Floating toolbar and text highlighting for selection mode
 */

const SelectionMode = {
    isActive: false,
    toolbar: null,
    highlights: [],

    /**
     * Enable selection mode
     */
    enable() {
        if (this.isActive) return;
        this.isActive = true;

        // Change cursor
        document.body.style.cursor = 'text';
        document.body.classList.add('workflow-selection-mode');

        // Create floating toolbar
        this.createToolbar();

        // Listen for text selection
        document.addEventListener('mouseup', this.handleMouseUp);
        document.addEventListener('keydown', this.handleKeyDown);

        console.log('[Workflow Extension] Selection mode enabled');
    },

    /**
     * Disable selection mode
     */
    disable() {
        if (!this.isActive) return;
        this.isActive = false;

        // Reset cursor
        document.body.style.cursor = '';
        document.body.classList.remove('workflow-selection-mode');

        // Remove toolbar
        this.removeToolbar();

        // Clear highlights
        this.clearHighlights();

        // Remove listeners
        document.removeEventListener('mouseup', this.handleMouseUp);
        document.removeEventListener('keydown', this.handleKeyDown);

        console.log('[Workflow Extension] Selection mode disabled');
    },

    /**
     * Create floating toolbar
     */
    createToolbar() {
        if (this.toolbar) return;

        this.toolbar = document.createElement('div');
        this.toolbar.id = 'workflow-selection-toolbar';
        this.toolbar.innerHTML = `
      <div class="wst-header">
        <span class="wst-icon">⚡</span>
        <span class="wst-title">Selection Mode Active</span>
      </div>
      <div class="wst-hint">Select text on the page to capture</div>
      <div class="wst-selection-preview" id="wst-preview" style="display:none;">
        <div class="wst-preview-label">Selected:</div>
        <div class="wst-preview-text" id="wst-preview-text"></div>
      </div>
      <div class="wst-actions">
        <button id="wst-generate" class="wst-btn wst-btn-primary" disabled>
          Generate Workflow
        </button>
        <button id="wst-cancel" class="wst-btn wst-btn-secondary">
          Cancel
        </button>
      </div>
    `;

        document.body.appendChild(this.toolbar);

        // Add event listeners
        document.getElementById('wst-cancel').addEventListener('click', () => {
            this.disable();
            // Notify popup
            chrome.runtime.sendMessage({ action: 'selectionModeCancelled' });
        });

        document.getElementById('wst-generate').addEventListener('click', async () => {
            const selection = window.getSelection().toString().trim();
            if (selection) {
                const generateBtn = document.getElementById('wst-generate');
                generateBtn.textContent = '⏳ Generating...';
                generateBtn.disabled = true;

                try {
                    // Check if extension context is still valid
                    if (!chrome.runtime?.id) {
                        throw new Error('Extension reloaded. Please refresh the page.');
                    }

                    // Send selection to background for processing
                    const result = await new Promise((resolve, reject) => {
                        chrome.runtime.sendMessage({
                            action: 'generateAndSave',
                            content: selection
                        }, (response) => {
                            if (chrome.runtime.lastError) {
                                reject(new Error(chrome.runtime.lastError.message || 'Connection failed. Refresh the page.'));
                            } else {
                                resolve(response);
                            }
                        });
                    });

                    if (result && result.success) {
                        generateBtn.textContent = '✅ Saved!';
                        // Show success notification
                        this.showNotification('Workflow saved! Opening dashboard...');

                        // Open dashboard after short delay
                        setTimeout(() => {
                            window.open(result.dashboardUrl || 'http://localhost:3000/workflows', '_blank');
                        }, 1000);
                    } else {
                        generateBtn.textContent = '❌ Failed';
                        this.showNotification('Error: ' + (result?.error || 'Unknown error'));
                    }
                } catch (error) {
                    console.error('[Workflow Extension] Error:', error);
                    generateBtn.textContent = '❌ Error';

                    // Show helpful error message
                    let errorMsg = error.message;
                    if (errorMsg.includes('Receiving end does not exist') || errorMsg.includes('Connection failed')) {
                        errorMsg = 'Extension reloaded. Please refresh this page and try again.';
                    }
                    this.showNotification(errorMsg);
                }

                setTimeout(() => this.disable(), 2000);
            }
        });
    },

    /**
     * Remove floating toolbar
     */
    removeToolbar() {
        if (this.toolbar) {
            this.toolbar.remove();
            this.toolbar = null;
        }
    },

    /**
     * Handle mouse up - check for selection
     */
    handleMouseUp: function (e) {
        // Use arrow function in class context
        const self = SelectionMode;
        if (!self.isActive) return;

        // Ignore clicks on toolbar
        if (e.target.closest('#workflow-selection-toolbar')) return;

        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        const preview = document.getElementById('wst-preview');
        const previewText = document.getElementById('wst-preview-text');
        const generateBtn = document.getElementById('wst-generate');

        if (selectedText.length > 0) {
            // Show preview
            preview.style.display = 'block';
            previewText.textContent = selectedText.length > 200
                ? selectedText.substring(0, 200) + '...'
                : selectedText;
            generateBtn.disabled = false;

            // Store in chrome storage
            chrome.storage.local.set({ pending_selection: selectedText });
        } else {
            // Hide preview
            preview.style.display = 'none';
            previewText.textContent = '';
            generateBtn.disabled = true;
        }
    },

    /**
     * Handle keyboard shortcuts
     */
    handleKeyDown: function (e) {
        const self = SelectionMode;
        if (!self.isActive) return;

        // ESC to cancel
        if (e.key === 'Escape') {
            self.disable();
            chrome.runtime.sendMessage({ action: 'selectionModeCancelled' });
        }

        // Enter to generate (if text selected)
        if (e.key === 'Enter') {
            const selection = window.getSelection().toString().trim();
            if (selection) {
                chrome.runtime.sendMessage({
                    action: 'generateFromSelection',
                    content: selection
                });
                self.disable();
            }
        }
    },

    /**
     * Show notification to user
     */
    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.id = 'workflow-notification';
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 14px;
            font-weight: 600;
            z-index: 2147483647;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            animation: slideUp 0.3s ease;
        `;
        notification.textContent = message;

        // Add animation keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 3000);
    },

    /**
     * Clear highlight elements
     */
    clearHighlights() {
        this.highlights.forEach(el => {
            if (el.parentNode) {
                const text = document.createTextNode(el.textContent);
                el.parentNode.replaceChild(text, el);
            }
        });
        this.highlights = [];
    }
};

// Bind the handlers properly
SelectionMode.handleMouseUp = SelectionMode.handleMouseUp.bind(SelectionMode);
SelectionMode.handleKeyDown = SelectionMode.handleKeyDown.bind(SelectionMode);

// Make available globally
window.SelectionMode = SelectionMode;
