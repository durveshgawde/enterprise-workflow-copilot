import axios, { AxiosInstance } from 'axios'
import {
  Workflow,
  CreateWorkflowRequest,
  WorkflowStep,
  UpdateWorkflowStepRequest,
  Comment,
  ActivityLog,
  AIGenerateSopRequest,
  AIGenerateSopResponse,
} from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ============ WORKFLOWS ============

export const workflowApi = {
  // Get all workflows
  list: (organizationId: string) =>
    api.get<Workflow[]>(`/workflows?org_id=${organizationId}`),

  // Get single workflow
  get: (id: string) =>
    api.get<Workflow>(`/workflows/${id}`),

  // Create workflow
  create: (data: CreateWorkflowRequest) =>
    api.post<Workflow>('/workflows', data),

  // Update workflow
  update: (id: string, data: Partial<Workflow>) =>
    api.put<Workflow>(`/workflows/${id}`, data),

  // Delete workflow
  delete: (id: string) =>
    api.delete(`/workflows/${id}`),

  // Get workflow with steps
  getWithSteps: (id: string) =>
    api.get<Workflow>(`/workflows/${id}?include=steps`),

  // Duplicate workflow
  duplicate: (id: string) =>
    api.post<Workflow>(`/workflows/${id}/duplicate`, {}),

  // Archive workflow
  archive: (id: string) =>
    api.patch<Workflow>(`/workflows/${id}`, { status: 'archived' }),

  // Restore workflow
  restore: (id: string) =>
    api.patch<Workflow>(`/workflows/${id}`, { status: 'active' }),
}

// ============ WORKFLOW STEPS ============

export const stepApi = {
  // Get all steps for workflow
  list: (workflowId: string) =>
    api.get<WorkflowStep[]>(`/workflows/${workflowId}/steps`),

  // Get single step
  get: (workflowId: string, stepId: string) =>
    api.get<WorkflowStep>(`/workflows/${workflowId}/steps/${stepId}`),

  // Add step to workflow
  create: (workflowId: string, data: Partial<WorkflowStep>) =>
    api.post<WorkflowStep>(`/workflows/${workflowId}/steps`, data),

  // Update step
  update: (workflowId: string, stepId: string, data: Partial<WorkflowStep>) =>
    api.put<WorkflowStep>(`/workflows/${workflowId}/steps/${stepId}`, data),

  // Delete step
  delete: (workflowId: string, stepId: string) =>
    api.delete(`/workflows/${workflowId}/steps/${stepId}`),

  // Complete step
  complete: (workflowId: string, stepId: string, data: UpdateWorkflowStepRequest) =>
    api.post<WorkflowStep>(`/workflows/${workflowId}/steps/${stepId}/complete`, data),

  // Reorder steps
  reorder: (workflowId: string, data: Array<{ id: string; order: number }>) =>
    api.post(`/workflows/${workflowId}/steps/reorder`, data),

  // Assign step to user
  assign: (workflowId: string, stepId: string, userId: string) =>
    api.patch<WorkflowStep>(`/workflows/${workflowId}/steps/${stepId}`, { assigned_to: userId }),
}

// ============ COMMENTS ============

export const commentApi = {
  // Get all comments for workflow
  list: (workflowId: string) =>
    api.get<Comment[]>(`/workflows/${workflowId}/comments`),

  // Get all comments for step
  listForStep: (workflowId: string, stepId: string) =>
    api.get<Comment[]>(`/workflows/${workflowId}/steps/${stepId}/comments`),

  // Create comment
  create: (workflowId: string, data: { content: string; step_id?: string }) =>
    api.post<Comment>(`/workflows/${workflowId}/comments`, data),

  // Update comment
  update: (workflowId: string, commentId: string, data: { content: string }) =>
    api.put<Comment>(`/workflows/${workflowId}/comments/${commentId}`, data),

  // Delete comment
  delete: (workflowId: string, commentId: string) =>
    api.delete(`/workflows/${workflowId}/comments/${commentId}`),
}

// ============ ACTIVITY LOGS ============

export const activityApi = {
  // Get organization activity
  list: (organizationId: string, limit: number = 50) =>
    api.get<ActivityLog[]>(`/activity?org_id=${organizationId}&limit=${limit}`),

  // Get workflow activity
  forWorkflow: (workflowId: string) =>
    api.get<ActivityLog[]>(`/activity/workflows/${workflowId}`),

  // Get user activity
  forUser: (userId: string) =>
    api.get<ActivityLog[]>(`/activity/users/${userId}`),
}

// ============ AI COPILOT ============

export const aiApi = {
  // Generate SOP from text
  generateSop: (data: AIGenerateSopRequest) =>
    api.post<AIGenerateSopResponse>('/ai/generate-sop', data),

  // Refine step description
  refineStep: (data: { title: string; description: string }) =>
    api.post<{ refined: string }>('/ai/refine-step', data),

  // Get AI suggestions
  getSuggestions: (workflowId: string) =>
    api.get(`/ai/suggestions/${workflowId}`),
}

// ============ USERS ============

export const userApi = {
  // Get current user
  getCurrent: () =>
    api.get('/users/me'),

  // Update user profile
  updateProfile: (data: { name?: string; avatar_url?: string }) =>
    api.put('/users/me', data),

  // Get user by ID
  get: (id: string) =>
    api.get(`/users/${id}`),

  // Search users
  search: (query: string) =>
    api.get(`/users/search?q=${query}`),

  // Get organization members
  getOrgMembers: (orgId: string) =>
    api.get(`/organizations/${orgId}/members`),
}

// ============ ORGANIZATIONS ============

export const organizationApi = {
  // Get current organization
  getCurrent: () =>
    api.get('/organizations/current'),

  // Get organization by ID
  get: (id: string) =>
    api.get(`/organizations/${id}`),

  // Update organization
  update: (id: string, data: { name?: string; description?: string }) =>
    api.put(`/organizations/${id}`, data),

  // List organizations
  list: () =>
    api.get('/organizations'),

  // Create organization
  create: (data: { name: string; description?: string }) =>
    api.post('/organizations', data),

  // Get organization settings
  getSettings: (id: string) =>
    api.get(`/organizations/${id}/settings`),

  // Update organization settings
  updateSettings: (id: string, data: any) =>
    api.put(`/organizations/${id}/settings`, data),
}

// ============ HEALTH CHECK ============

export const healthApi = {
  check: () =>
    api.get('/health'),
}

export default api
