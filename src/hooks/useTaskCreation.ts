import { useEffect, useRef, useState } from 'react'
import { createTask, getTaskStatuses, SessionExpiredError } from '../services/tasks'
import type { CreateTaskInput } from '../services/tasks'

export default function useTaskCreation(onCreated: () => void, onSessionExpired: () => void) {
  const [statusRequest, setStatusRequest] = useState(0)
  const [statusState, setStatusState] = useState<{
    statuses: string[]
    loading: boolean
    error: string | null
  }>({ statuses: [], loading: true, error: null })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const createControllerRef = useRef<AbortController | null>(null)

  useEffect(() => () => createControllerRef.current?.abort(), [])

  useEffect(() => {
    const controller = new AbortController()

    getTaskStatuses(controller.signal).then(statuses => {
      if (!controller.signal.aborted) setStatusState({ statuses, loading: false, error: null })
    }).catch(error => {
      if (controller.signal.aborted) return
      if (error instanceof SessionExpiredError) {
        onSessionExpired()
        return
      }
      setStatusState({ statuses: [], loading: false, error: error instanceof Error ? error.message : 'Não foi possível carregar os status.' })
    })

    return () => controller.abort()
  }, [statusRequest, onSessionExpired])

  function reloadStatuses() {
    if (statusState.loading) return
    setStatusState({ statuses: [], loading: true, error: null })
    setStatusRequest(current => current + 1)
  }

  async function submitTask(input: CreateTaskInput) {
    if (createControllerRef.current) return
    const controller = new AbortController()
    createControllerRef.current = controller
    setSaving(true)
    setError(null)

    try {
      await createTask(input, controller.signal)
      if (!controller.signal.aborted) onCreated()
    } catch (error) {
      if (controller.signal.aborted) return
      if (error instanceof SessionExpiredError) {
        onSessionExpired()
        return
      }
      setError(error instanceof Error ? error.message : 'Não foi possível criar sua tarefa. Tente novamente.')
    } finally {
      createControllerRef.current = null
      if (!controller.signal.aborted) setSaving(false)
    }
  }

  return { statusState, saving, error, reloadStatuses, submitTask }
}
