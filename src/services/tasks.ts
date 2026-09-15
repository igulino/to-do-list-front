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
    totalStatuses: number
    totalPages: number
  }
}

export interface CreateTaskInput {
  title: string
  description: string | null
  status: string
}

export type UpdateTaskInput = Partial<Pick<Task, 'title' | 'description' | 'status'>>

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
      || !Number.isInteger(result?.pagination?.totalStatuses) || result.pagination.totalStatuses < 0
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

export function updateTaskStatus(taskId: string, status: string, signal: AbortSignal): Promise<Task> {
  return updateTask(taskId, { status }, signal)
}

export async function updateTask(taskId: string, input: UpdateTaskInput, signal: AbortSignal): Promise<Task> {
  const timeout = AbortSignal.timeout(15_000)

  try {
    const response = await fetch(`${apiUrl}/api/tasks/${encodeURIComponent(taskId)}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: AbortSignal.any([signal, timeout]),
    })

    if (response.status === 401) throw new SessionExpiredError()

    const result = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(result?.message || 'Não foi possível salvar esta tarefa. Tente novamente.')
    }
    if (!isTask(result?.task) || result.task.id !== taskId
      || Object.entries(input).some(([field, value]) => result.task[field as keyof UpdateTaskInput] !== value)) {
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

export async function deleteTask(taskId: string, signal: AbortSignal): Promise<void> {
  const timeout = AbortSignal.timeout(15_000)

  try {
    const response = await fetch(`${apiUrl}/api/tasks/${encodeURIComponent(taskId)}`, {
      method: 'DELETE',
      credentials: 'include',
      signal: AbortSignal.any([signal, timeout]),
    })

    if (response.status === 401) throw new SessionExpiredError()
    if (!response.ok) {
      const result = await response.json().catch(() => null)
      throw new Error(result?.message || 'Não foi possível excluir esta tarefa. Tente novamente.')
    }
  } catch (error) {
    if (signal.aborted) throw error
    if (timeout.aborted) throw new Error('A conexão demorou um pouco. Atualize o quadro antes de tentar excluir novamente.', { cause: error })
    if (error instanceof TypeError) throw new Error('Não conseguimos confirmar a exclusão. Confira sua conexão e atualize o quadro antes de tentar novamente.', { cause: error })
    throw error
  }
}

export async function getTaskStatuses(signal: AbortSignal): Promise<string[]> {
  const statuses = new Set<string>()
  let totalPages = 1

  for (let page = 1; page <= totalPages; page++) {
    const result = await getTasks(page, signal)
    totalPages = result.pagination.totalPages
    for (const task of result.tasks) {
      if (task.status.trim()) statuses.add(task.status)
    }
  }

  return [...statuses].sort((a, b) => a.localeCompare(b, 'pt-BR'))
}

export async function createTask(input: CreateTaskInput, signal: AbortSignal): Promise<Task> {
  const timeout = AbortSignal.timeout(15_000)

  try {
    const response = await fetch(apiUrl + '/api/tasks', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: AbortSignal.any([signal, timeout]),
    })

    if (response.status === 401) throw new SessionExpiredError()

    const result = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(result?.message || 'Não foi possível criar sua tarefa. Tente novamente.')
    }
    if (!isTask(result?.task)) {
      throw new Error('Não foi possível confirmar a criação. Atualize o quadro antes de tentar novamente.')
    }

    return result.task
  } catch (error) {
    if (signal.aborted) throw error
    if (timeout.aborted) throw new Error('A conexão demorou um pouco. Atualize o quadro antes de tentar criar novamente.', { cause: error })
    if (error instanceof TypeError) throw new Error('Não conseguimos confirmar a criação. Confira sua conexão e atualize o quadro antes de tentar novamente.', { cause: error })
    throw error
  }
}
