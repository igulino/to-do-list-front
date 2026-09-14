import { useEffect, useRef, useState } from 'react'
import { getTasks, SessionExpiredError, updateTaskStatus } from '../services/tasks'
import type { TasksPage } from '../services/tasks'
import type { PendingTaskChange, SaveFeedback } from '../types/taskBoard'
import { getBoardPagination, groupTasks } from '../utils/taskBoard'
import useTaskDrag from './useTaskDrag'

interface TaskBoardState {
  data: TasksPage | null
  statuses: string[]
  loading: boolean
  error: string | null
}

export default function useTaskBoard(onSessionExpired: () => void) {
  const [request, setRequest] = useState({ page: 1, version: 0 })
  const [state, setState] = useState<TaskBoardState>({
    data: null, statuses: [], loading: true, error: null,
  })
  const [changes, setChanges] = useState<Map<string, PendingTaskChange>>(() => new Map())
  const [saving, setSaving] = useState(false)
  const [saveFeedback, setSaveFeedback] = useState<SaveFeedback | null>(null)
  const [moveAnnouncement, setMoveAnnouncement] = useState('')
  const saveControllerRef = useRef<AbortController | null>(null)
  const boardRef = useRef<HTMLDivElement>(null)

  const { data, loading, error } = state
  const groups = groupTasks(data?.tasks ?? [], state.statuses, changes)
  const busy = loading || saving
  const drag = useTaskDrag({ canDrag: canEdit, onMoveTask: moveTask })

  useEffect(() => () => saveControllerRef.current?.abort(), [])

  useEffect(() => {
    if (changes.size === 0) return
    const handleBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [changes.size])

  useEffect(() => {
    const controller = new AbortController()

    getTasks(request.page, controller.signal).then(pageData => {
      if (controller.signal.aborted) return
      const lastPage = Math.max(1, pageData.pagination.totalPages)
      if (pageData.pagination.page > lastPage) {
        setRequest(current => ({ page: lastPage, version: current.version + 1 }))
        return
      }
      setState({ data: pageData, statuses: [...new Set(pageData.tasks.map(task => task.status))], loading: false, error: null })
      boardRef.current?.scrollTo({ left: 0 })
    }).catch(error => {
      if (controller.signal.aborted) return
      if (error instanceof SessionExpiredError) {
        onSessionExpired()
        return
      }
      setState(current => ({ ...current, loading: false, error: error instanceof Error ? error.message : 'Não foi possível carregar suas tarefas. Tente novamente.' }))
    })

    return () => controller.abort()
  }, [request, onSessionExpired])

  function canEdit() {
    return !loading && !saving && !saveControllerRef.current
  }

  function loadPage(page: number) {
    if (!canEdit()) return
    drag.endDrag()
    setState(current => ({ ...current, loading: true, error: null }))
    setRequest(current => ({ page, version: current.version + 1 }))
  }

  function moveTask(taskId: string, status: string) {
    if (!canEdit()) return
    const task = data?.tasks.find(item => item.id === taskId)
    if (!task || !groups.some(group => group.status === status)) return
    const currentStatus = changes.get(taskId)?.status ?? task.status
    if (currentStatus === status) return

    setChanges(current => {
      const next = new Map(current)
      const originalStatus = current.get(taskId)?.originalStatus ?? task.status
      next.delete(taskId)
      if (status !== originalStatus) next.set(taskId, { originalStatus, status, title: task.title })
      return next
    })
    setSaveFeedback(null)
    setMoveAnnouncement(`${task.title} movida para ${status || 'Sem status'}. Clique em Salvar alterações para confirmar.`)
  }

  function discardChanges() {
    if (saving || saveControllerRef.current) return
    setChanges(new Map())
    setSaveFeedback(null)
    setMoveAnnouncement('Alterações desfeitas. As tarefas voltaram aos status salvos.')
    drag.endDrag()
  }

  async function saveChanges() {
    if (!canEdit() || changes.size === 0) return
    const controller = new AbortController()
    saveControllerRef.current = controller
    const pending = [...changes.entries()]
    setSaving(true)
    setSaveFeedback(null)
    drag.endDrag()
    let saved = 0
    const failures: string[] = []

    try {
      for (const [taskId, change] of pending) {
        try {
          const task = await updateTaskStatus(taskId, change.status, controller.signal)
          if (controller.signal.aborted) return
          saved++
          setState(current => ({
            ...current,
            data: current.data ? {
              ...current.data,
              tasks: current.data.tasks.some(item => item.id === task.id)
                ? [...current.data.tasks.filter(item => item.id !== task.id), task]
                : current.data.tasks,
            } : null,
          }))
          setChanges(current => {
            const next = new Map(current)
            next.delete(taskId)
            return next
          })
        } catch (error) {
          if (controller.signal.aborted) return
          if (error instanceof SessionExpiredError) {
            onSessionExpired()
            return
          }
          failures.push(`${change.title}: ${error instanceof Error ? error.message : 'Não foi possível salvar.'}`)
        }
      }

      setSaveFeedback(failures.length ? {
        type: 'error',
        message: `${saved > 0 ? `${saved} ${saved === 1 ? 'alteração salva' : 'alterações salvas'}. ` : ''}${failures.length} ${failures.length === 1 ? 'tarefa continua pendente' : 'tarefas continuam pendentes'}. Tente salvar novamente. ${failures[0]}`,
      } : {
        type: 'success',
        message: `${saved} ${saved === 1 ? 'alteração salva' : 'alterações salvas'}. Tudo no seu lugar!`,
      })
    } finally {
      saveControllerRef.current = null
      if (!controller.signal.aborted) setSaving(false)
    }
  }

  return {
    groups,
    pagination: getBoardPagination(data),
    requestedPage: request.page,
    loading,
    error,
    busy,
    saving,
    pendingTaskIds: new Set(changes.keys()),
    pendingCount: changes.size,
    saveFeedback,
    moveAnnouncement,
    boardRef,
    drag,
    loadPage,
    moveTask,
    discardChanges,
    saveChanges,
  }
}
