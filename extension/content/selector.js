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

        document.getElementById('wst-generate').addEventListener('click', () => {
            const selection = window.getSelection().toString().trim();
            if (selection) {
                // Send selection to background for processing
                chrome.runtime.sendMessage({
                    action: 'generateFromSelection',
                    content: selection
                });
                this.disable();
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
