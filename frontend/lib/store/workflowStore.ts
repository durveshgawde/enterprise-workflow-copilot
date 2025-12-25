import { create } from 'zustand'
import { Workflow, WorkflowStep } from '../types'

interface WorkflowStoreState {
  workflows: Workflow[]
  currentWorkflow: Workflow | null
  loading: boolean
  error: string | null

  setWorkflows: (workflows: Workflow[]) => void
  setCurrentWorkflow: (workflow: Workflow | null) => void
  addWorkflow: (workflow: Workflow) => void
  updateWorkflow: (id: string, workflow: Partial<Workflow>) => void
  deleteWorkflow: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useWorkflowStore = create<WorkflowStoreState>((set) => ({
  workflows: [],
  currentWorkflow: null,
  loading: false,
  error: null,

  setWorkflows: (workflows) => set({ workflows }),
  setCurrentWorkflow: (workflow) => set({ currentWorkflow: workflow }),
  
  addWorkflow: (workflow) =>
    set((state) => ({
      workflows: [workflow, ...state.workflows],
    })),

  updateWorkflow: (id, workflow) =>
    set((state) => ({
      workflows: state.workflows.map((w) =>
        w.id === id ? { ...w, ...workflow } : w
      ),
      currentWorkflow:
        state.currentWorkflow?.id === id
          ? { ...state.currentWorkflow, ...workflow }
          : state.currentWorkflow,
    })),

  deleteWorkflow: (id) =>
    set((state) => ({
      workflows: state.workflows.filter((w) => w.id !== id),
      currentWorkflow: state.currentWorkflow?.id === id ? null : state.currentWorkflow,
    })),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))

