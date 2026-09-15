import type { Task, TasksPage } from '../services/tasks'
import type { BoardPagination, PendingTaskChange, TaskGroup } from '../types/taskBoard'

export function groupTasks(tasks: Task[], statuses: string[], changes: ReadonlyMap<string, PendingTaskChange>): TaskGroup[] {
  const groups = new Map<string, Task[]>(statuses.map(status => [status, []]))
  const visibleTasks = new Map(tasks.map(task => [task.id, task]))

  for (const task of tasks) {
    if (changes.has(task.id)) continue
    const group = groups.get(task.status)
    if (group) group.push(task)
    else groups.set(task.status, [task])
  }

  for (const [id, change] of changes) {
    const task = visibleTasks.get(id)
    if (!task) continue
    const movedTask = { ...task, status: change.status }
    const group = groups.get(change.status)
    if (group) group.push(movedTask)
    else groups.set(change.status, [movedTask])
  }

  return [...groups.entries()].map(([status, groupedTasks]) => ({ status, tasks: groupedTasks }))
}

export function getBoardPagination(data: TasksPage | null): BoardPagination {
  const page = data?.pagination.page ?? 1

  return {
    hasData: data !== null,
    page,
    totalPages: Math.max(1, data?.pagination.totalPages ?? 1),
    total: data?.pagination.total ?? 0,
    taskCount: data?.tasks.length ?? 0,
    statusCount: new Set(data?.tasks.map(task => task.status) ?? []).size,
    totalStatuses: data?.pagination.totalStatuses ?? 0,
  }
}

export function statusTone(status: string) {
  const hash = Array.from(status).reduce((value, character) => (value * 31 + character.charCodeAt(0)) >>> 0, 0)
  return ['blue', 'sage', 'lavender', 'sand'][hash % 4]
}
