/**
 * Workflow Preview Logic
 * Displays generated workflow and handles save/regenerate
 */

// DOM Elements
const backBtn = document.getElementById('backBtn');
const loadingState = document.getElementById('loadingState');
const workflowPreview = document.getElementById('workflowPreview');
const errorState = document.getElementById('errorState');
const goBackBtn = document.getElementById('goBackBtn');

const workflowTitle = document.getElementById('workflowTitle');
const workflowDescription = document.getElementById('workflowDescription');
const stepCount = document.getElementById('stepCount');
const stepsContainer = document.getElementById('stepsContainer');

const saveBtn = document.getElementById('saveBtn');
const regenerateBtn = document.getElementById('regenerateBtn');
const saveStatus = document.getElementById('saveStatus');

let currentWorkflow = null;

// Load workflow on page load
loadWorkflow();

async function loadWorkflow() {
    try {
        const result = await chrome.storage.local.get(['pending_workflow']);

        if (!result.pending_workflow) {
            showError();
            return;
        }

        currentWorkflow = result.pending_workflow;
        displayWorkflow(currentWorkflow);

    } catch (error) {
        console.error('[Preview] Error loading workflow:', error);
        showError();
    }
}

function displayWorkflow(workflow) {
    // Hide loading, show preview
    loadingState.style.display = 'none';
    workflowPreview.style.display = 'block';
    errorState.style.display = 'none';

    // Set title and description
    workflowTitle.textContent = workflow.title || 'Untitled Workflow';
    workflowDescription.textContent = workflow.description || 'No description provided';

    // Display steps
    const steps = workflow.steps || [];
    stepCount.textContent = steps.length;

    if (steps.length === 0) {
        stepsContainer.innerHTML = '<p class="no-steps">No steps generated</p>';
    } else {
        stepsContainer.innerHTML = steps.map((step, index) => `
      <div class="step-card">
        <div class="step-number">${index + 1}</div>
        <div class="step-content">
          <h4 class="step-title">${step.title || `Step ${index + 1}`}</h4>
          <p class="step-description">${step.description || 'No description'}</p>
          ${step.role ? `<span class="step-role">👤 ${step.role}</span>` : ''}
        </div>
      </div>
    `).join('');
    }
}

function showError() {
    loadingState.style.display = 'none';
    workflowPreview.style.display = 'none';
    errorState.style.display = 'block';
}

// Back button
backBtn.addEventListener('click', () => {
    window.location.href = 'popup.html';
});

goBackBtn.addEventListener('click', () => {
    window.location.href = 'popup.html';
});

// Save workflow
saveBtn.addEventListener('click', async () => {
    if (!currentWorkflow) {
        showSaveStatus('❌ No workflow to save', 'error');
        return;
    }

    setSaveLoading(true);
    showSaveStatus('💾 Saving workflow...', 'loading');

    try {
        // Send to background script to save via API
        chrome.runtime.sendMessage({
            action: 'saveWorkflow',
            workflow: currentWorkflow
        }, async (result) => {
            setSaveLoading(false);

            if (chrome.runtime.lastError) {
                showSaveStatus('❌ ' + chrome.runtime.lastError.message, 'error');
                return;
            }

            if (result.success) {
                showSaveStatus('✅ Saved! Opening dashboard...', 'success');

                // Clear pending workflow
                await chrome.storage.local.remove(['pending_workflow']);

                // Open dashboard in new tab
                const dashboardUrl = (typeof CONFIG !== 'undefined' && CONFIG.DASHBOARD_URL)
                    ? CONFIG.DASHBOARD_URL : 'http://localhost:3000';
                setTimeout(() => {
                    chrome.tabs.create({
                        url: dashboardUrl + '/workflows'
                    });
                    window.close();
                }, 1500);
            } else {
                showSaveStatus('❌ Save failed: ' + (result.error || 'Unknown error'), 'error');
            }
        });

    } catch (error) {
        setSaveLoading(false);
        console.error('[Preview] Save error:', error);
        showSaveStatus('❌ Error: ' + error.message, 'error');
    }
});

// Regenerate workflow
regenerateBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to regenerate? This will replace the current workflow.')) {
        // Go back to popup to regenerate
        window.location.href = 'popup.html';
    }
});

function setSaveLoading(isLoading) {
    saveBtn.disabled = isLoading;
    const btnText = saveBtn.querySelector('.btn-text');
    const btnLoader = saveBtn.querySelector('.btn-loader');

    if (isLoading) {
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-flex';
    } else {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
}

function showSaveStatus(message, type) {
    saveStatus.textContent = message;
    saveStatus.className = `save-status save-status-${type}`;
    saveStatus.style.display = 'block';
}
