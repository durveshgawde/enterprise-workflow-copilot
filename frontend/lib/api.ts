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


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'


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
  list: async (organizationId: string) => {
    const response = await api.get(`/workflows/?org_id=${organizationId}`)
    console.log('Workflows API raw response:', response.data)
    // Backend returns { success: true, workflows: [...] }
    // Extract the workflows array
    let workflows: Workflow[] = []
    if (Array.isArray(response.data)) {
      workflows = response.data
    } else if (response.data?.workflows && Array.isArray(response.data.workflows)) {
      workflows = response.data.workflows
    }
    return { ...response, data: workflows }
  },


  // Get single workflow
  get: async (id: string) => {
    const response = await api.get(`/workflows/${id}`)
    // backend may return { workflow: {...} } or { data: {...} }
    const wf = response.data?.workflow ?? response.data?.data ?? null
    return { ...response, data: wf }
  },


  // Create workflow
  create: async (data: CreateWorkflowRequest) => {
    const response = await api.post('/workflows/', data)
    // backend returns { success, workflow_id, data: created }
    const created = response.data?.data ?? response.data?.workflow ?? null
    return { ...response, data: created }
  },


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
  list: async (workflowId: string) => {
    const response = await api.get(`/steps?workflow_id=${workflowId}`)
    const steps = response.data?.steps ?? response.data ?? []
    return { ...response, data: steps }
  },


  // Get single step
  get: (workflowId: string, stepId: string) =>
    api.get<WorkflowStep>(`/steps/${stepId}`),


  // Add step to workflow
  create: async (workflowId: string, data: Partial<WorkflowStep>) => {
    const response = await api.post(`/steps`, { ...data, workflow_id: workflowId })
    const created = response.data?.step ?? response.data?.data ?? response.data ?? null
    return { ...response, data: created }
  },


  // Update step
  update: (workflowId: string, stepId: string, data: Partial<WorkflowStep>) =>
    api.put<WorkflowStep>(`/steps/${stepId}`, data),


  // Delete step
  delete: (workflowId: string, stepId: string) =>
    api.delete(`/steps/${stepId}`),


  // Complete step
  complete: (workflowId: string, stepId: string, data: UpdateWorkflowStepRequest) =>
    api.patch<WorkflowStep>(`/steps/${stepId}/status`, { status: 'completed' }),


  // Reorder steps
  reorder: (workflowId: string, data: Array<{ id: string; order: number }>) =>
    api.post(`/steps/reorder`, data),


  // Assign step to user
  assign: (workflowId: string, stepId: string, userId: string) =>
    api.patch<WorkflowStep>(`/steps/${stepId}`, { assigned_to: userId }),
}


// ============ COMMENTS ============


export const commentApi = {
  // Get all comments for workflow
  list: async (workflowId: string) => {
    const response = await api.get(`/comments?workflow_id=${workflowId}`)
    const comments = response.data?.comments ?? response.data ?? []
    return { ...response, data: comments }
  },


  // Get all comments for step
  listForStep: async (workflowId: string, stepId: string) => {
    const response = await api.get(`/comments?step_id=${stepId}`)
    const comments = response.data?.comments ?? response.data ?? []
    return { ...response, data: comments }
  },


  // Create comment
  create: async (workflowId: string, data: { content: string; step_id?: string }) => {
    const response = await api.post(`/comments`, { ...data, workflow_id: workflowId })
    const created = response.data?.data ?? response.data?.comment ?? response.data ?? null
    return { ...response, data: created }
  },


  // Update comment
  update: (workflowId: string, commentId: string, data: { content: string }) =>
    api.put<Comment>(`/comments/${commentId}`, data),


  // Delete comment
  delete: (workflowId: string, commentId: string) =>
    api.delete(`/comments/${commentId}`),
}


// ============ ACTIVITY LOGS ============


export const activityApi = {
  // Get organization activity
  list: async (organizationId: string, limit: number = 50) => {
    const response = await api.get(`/activity-logs?org_id=${organizationId}&limit=${limit}`)
    console.log('Activity API raw response:', response.data)
    // Backend returns { success: true, activities: [...] }
    let activities: ActivityLog[] = []
    if (Array.isArray(response.data)) {
      activities = response.data
    } else if (response.data?.activities && Array.isArray(response.data.activities)) {
      activities = response.data.activities
    }
    return { ...response, data: activities }
  },


  // Get workflow activity
  forWorkflow: async (workflowId: string) => {
    const response = await api.get(`/activity-logs?workflow_id=${workflowId}`)
    const activities = response.data?.activities ?? response.data ?? []
    return { ...response, data: activities }
  },


  // Get user activity
  forUser: (userId: string) =>
    api.get<ActivityLog[]>(`/activity-logs?user_id=${userId}`),
}


// ============ AI COPILOT ============


export const aiApi = {
  // Generate SOP from text
  generateSop: async (data: AIGenerateSopRequest) => {
    const response = await api.post('/ai/convert', { raw_text: data.text })
    console.log('AI API raw response:', response.data)

    // Backend returns { success: boolean, workflow: {...}, error?: string }
    if (!response.data?.success) {
      // Return error info if AI failed
      return {
        ...response,
        data: {
          error: response.data?.error || 'AI generation failed',
          title: null
        }
      }
    }

    const workflow = response.data?.workflow
    if (!workflow || !workflow.title) {
      return {
        ...response,
        data: {
          error: 'AI could not parse the text into a workflow',
          title: null
        }
      }
    }

    return { ...response, data: workflow }
  },


  // Save AI-generated workflow with steps
  saveWorkflow: async (data: { title: string; description: string; steps: Array<{ title: string; description: string; role?: string }> }) => {
    console.log('Calling /ai/save-workflow with:', data)
    const response = await api.post('/ai/save-workflow', data)
    console.log('save-workflow response:', response.data)
    return response
  },


  // Refine step description
  refineStep: (data: { title: string; description: string }) =>
    api.post<{ refined: string }>('/ai/rewrite', data),


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
  updateProfile: (data: { name?: string; avatar_url?: string; phone?: string }) =>
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
