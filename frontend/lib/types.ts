export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  created_at: string
}

export interface Organization {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Workflow {
  id: string
  organization_id: string
  created_by: string
  title: string
  description?: string
  status: 'active' | 'completed' | 'archived'
  created_at: string
  updated_at: string
  steps?: WorkflowStep[]
  comments_count?: number
}

export interface WorkflowStep {
  id: string
  workflow_id: string
  title: string
  description?: string
  step_order: number
  status: 'pending' | 'in_progress' | 'completed'
  assigned_to?: string
  context_url?: string
  context_text?: string
  completed_at?: string
  completed_by?: string
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  workflow_id: string
  step_id?: string
  created_by: string
  content: string
  created_at: string
  updated_at: string
  author?: User
}

export interface ActivityLog {
  id: string
  organization_id: string
  user_id?: string
  entity_type: 'workflow' | 'step' | 'comment'
  entity_id: string
  action: 'created' | 'updated' | 'completed' | 'deleted'
  details?: string
  created_at: string
}

export interface AuthUser {
  id: string
  email: string
  user_metadata?: {
    name?: string
    avatar_url?: string
  }
}

export interface AuthState {
  user: AuthUser | null
  loading: boolean
  error: string | null
}

export interface CreateWorkflowRequest {
  title: string
  description?: string
}

export interface UpdateWorkflowStepRequest {
  status: 'pending' | 'in_progress' | 'completed'
  context_url?: string
  context_text?: string
}

export interface AIGenerateSopRequest {
  text: string
}

export interface AIGenerateSopResponse {
  workflow_id: string
  title: string
  steps: Array<{
    title: string
    description: string
  }>
}

export interface PaginationParams {
  page: number
  limit: number
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}
