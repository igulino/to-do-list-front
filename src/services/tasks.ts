import { apiUrl } from './api'

export interface Task {
  id: string
  title: string
  description: string | null
  status: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface TasksPage {
  tasks: Task[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export class SessionExpiredError extends Error {
  constructor() {
    super('Sua sessão expirou. Entre novamente para continuar.')
  }
}

function isTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') return false
  const task = value as Task
  return typeof task.id === 'string' && typeof task.title === 'string'
    && typeof task.status === 'string'
    && (task.description === null || typeof task.description === 'string')
}

export async function getTasks(page: number, signal: AbortSignal): Promise<TasksPage> {
  const timeout = AbortSignal.timeout(15_000)

  try {
    const response = await fetch(`${apiUrl}/api/tasks?page=${page}`, {
      credentials: 'include',
      signal: AbortSignal.any([signal, timeout]),
    })

    if (response.status === 401) throw new SessionExpiredError()

    const result = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(result?.message || 'Não foi possível carregar suas tarefas. Tente novamente.')
    }

    if (!Array.isArray(result?.tasks) || !result.tasks.every(isTask)
      || !Number.isInteger(result?.pagination?.page) || result.pagination.page < 1
      || !Number.isInteger(result?.pagination?.limit) || result.pagination.limit < 1
      || !Number.isInteger(result?.pagination?.total) || result.pagination.total < 0
      || !Number.isInteger(result?.pagination?.totalPages) || result.pagination.totalPages < 0) {
      throw new Error('Não foi possível ler suas tarefas. Tente novamente.')
    }

    return result as TasksPage
  } catch (error) {
    if (signal.aborted) throw error
    if (timeout.aborted) throw new Error('A conexão demorou um pouco. Tente novamente em instantes.', { cause: error })
    if (error instanceof TypeError) throw new Error('Não conseguimos conectar. Confira sua conexão e tente novamente.', { cause: error })
    throw error
  }
}

export async function updateTaskStatus(taskId: string, status: string, signal: AbortSignal): Promise<Task> {
  const timeout = AbortSignal.timeout(15_000)

  try {
    const response = await fetch(`${apiUrl}/api/tasks/${encodeURIComponent(taskId)}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
      signal: AbortSignal.any([signal, timeout]),
    })

    if (response.status === 401) throw new SessionExpiredError()

    const result = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(result?.message || 'Não foi possível salvar esta tarefa. Tente novamente.')
    }
    if (!isTask(result?.task) || result.task.id !== taskId || result.task.status !== status) {
      throw new Error('Não foi possível confirmar a alteração desta tarefa. Tente novamente.')
    }

    return result.task
  } catch (error) {
    if (signal.aborted) throw error
    if (timeout.aborted) throw new Error('A conexão demorou um pouco. Tente salvar novamente.', { cause: error })
    if (error instanceof TypeError) throw new Error('Não conseguimos conectar. Suas alterações continuam pendentes.', { cause: error })
    throw error
  }
}
