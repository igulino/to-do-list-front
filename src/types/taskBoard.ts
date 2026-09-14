import type { Task } from '../services/tasks'

export interface PendingTaskChange {
  originalStatus: string
  status: string
  title: string
}

export interface TaskGroup {
  status: string
  tasks: Task[]
}

export interface BoardPagination {
  hasData: boolean
  page: number
  totalPages: number
  total: number
  taskCount: number
  firstTask: number
  lastTask: number
}

export interface SaveFeedback {
  type: 'success' | 'error'
  message: string
}
