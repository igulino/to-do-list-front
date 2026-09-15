import { useRef, useState } from 'react'
import type { DragEvent } from 'react'

interface UseTaskDragOptions {
  canDrag: () => boolean
  onMoveTask: (taskId: string, status: string) => void
}

export default function useTaskDrag({ canDrag, onMoveTask }: UseTaskDragOptions) {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [dropStatus, setDropStatus] = useState<string | null>(null)
  const dragTaskRef = useRef<string | null>(null)

  function endDrag() {
    dragTaskRef.current = null
    setDraggedTaskId(null)
    setDropStatus(null)
  }

  function startDrag(event: DragEvent<HTMLLIElement>, taskId: string) {
    if (!canDrag() || (event.target as HTMLElement).closest('button, select, input, textarea, form')) {
      event.preventDefault()
      return
    }
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', taskId)
    dragTaskRef.current = taskId
    setDraggedTaskId(taskId)
  }

  function dragOver(event: DragEvent<HTMLElement>, status: string) {
    if (!dragTaskRef.current || !canDrag()) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setDropStatus(status)
  }

  function dragLeave(event: DragEvent<HTMLElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDropStatus(null)
  }

  function dropTask(event: DragEvent<HTMLElement>, status: string) {
    event.preventDefault()
    const taskId = dragTaskRef.current
    if (canDrag() && taskId && event.dataTransfer.getData('text/plain') === taskId) onMoveTask(taskId, status)
    endDrag()
  }

  return { draggedTaskId, dropStatus, startDrag, dragOver, dragLeave, dropTask, endDrag }
}

export type TaskDragHandlers = ReturnType<typeof useTaskDrag>
