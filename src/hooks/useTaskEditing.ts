import { useEffect, useRef, useState } from 'react'
import { SessionExpiredError, updateTask } from '../services/tasks'
import type { Task } from '../services/tasks'

export type TaskEditableFieldName = 'title' | 'description'

interface TaskEditSession {
  taskId: string
  field: TaskEditableFieldName
}

interface UseTaskEditingOptions {
  canStart: () => boolean
  onStart: () => void
  onUpdated: (task: Task) => void
  onSessionExpired: () => void
}

export default function useTaskEditing({ canStart, onStart, onUpdated, onSessionExpired }: UseTaskEditingOptions) {
  const [session, setSession] = useState<TaskEditSession | null>(null)
  const sessionRef = useRef<TaskEditSession | null>(null)
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => () => controllerRef.current?.abort(), [])

  function isEditing() {
    return sessionRef.current !== null || controllerRef.current !== null
  }

  function begin(taskId: string, field: TaskEditableFieldName) {
    if (isEditing() || !canStart()) return false
    const nextSession = { taskId, field }
    sessionRef.current = nextSession
    setSession(nextSession)
    onStart()
    return true
  }

  function cancel(taskId: string) {
    if (controllerRef.current || sessionRef.current?.taskId !== taskId) return
    sessionRef.current = null
    setSession(null)
  }

  async function save(taskId: string, field: TaskEditableFieldName, value: string) {
    if (controllerRef.current || sessionRef.current?.taskId !== taskId || sessionRef.current.field !== field) return false
    const controller = new AbortController()
    controllerRef.current = controller

    try {
      const input = field === 'title' ? { title: value } : { description: value || null }
      const task = await updateTask(taskId, input, controller.signal)
      if (controller.signal.aborted) return false
      onUpdated(task)
      sessionRef.current = null
      setSession(null)
      return true
    } catch (error) {
      if (controller.signal.aborted) return false
      if (error instanceof SessionExpiredError) {
        onSessionExpired()
        return false
      }
      throw error
    } finally {
      controllerRef.current = null
    }
  }

  return { session, isEditing, begin, cancel, save }
}

export type TaskEditingHandlers = ReturnType<typeof useTaskEditing>
