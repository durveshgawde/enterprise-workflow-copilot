export const API_ENDPOINTS = {
  WORKFLOWS: '/workflows',
  STEPS: '/workflows/:id/steps',
  COMMENTS: '/workflows/:id/comments',
  ACTIVITY: '/activity',
  AI: '/ai',
}

export const WORKFLOW_STATUSES = ['active', 'completed', 'archived'] as const
export const STEP_STATUSES = ['pending', 'in_progress', 'completed'] as const
export const ACTIVITY_ACTIONS = ['created', 'updated', 'completed', 'deleted'] as const

export const DEBOUNCE_DELAY = 500
export const TOAST_DURATION = 3000
export const REFRESH_INTERVAL = 10000

export const UI_MESSAGES = {
  SUCCESS_CREATE: 'Successfully created!',
  SUCCESS_UPDATE: 'Successfully updated!',
  SUCCESS_DELETE: 'Successfully deleted!',
  ERROR_GENERIC: 'Something went wrong. Please try again.',
  ERROR_NETWORK: 'Network error. Please check your connection.',
  ERROR_AUTH: 'Unauthorized. Please login again.',
}

