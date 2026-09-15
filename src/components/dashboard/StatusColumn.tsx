import type { TaskEditingHandlers } from '../../hooks/useTaskEditing'
import type { TaskDragHandlers } from '../../hooks/useTaskDrag'
import type { TaskGroup } from '../../types/taskBoard'
import { statusTone } from '../../utils/taskBoard'
import TaskCard from './TaskCard'

interface StatusColumnProps {
  group: TaskGroup
  headingId: string
  statuses: string[]
  pendingTaskIds: ReadonlySet<string>
  deletingTaskId: string | null
  editing: TaskEditingHandlers
  disabled: boolean
  drag: TaskDragHandlers
  onMoveTask: (taskId: string, status: string) => void
  onDeleteTask: (taskId: string) => Promise<void>
}

export default function StatusColumn({ group, headingId, statuses, pendingTaskIds, deletingTaskId, editing, disabled, drag, onMoveTask, onDeleteTask }: StatusColumnProps) {
  const { status, tasks } = group

  return <section className={`status-column tone-${statusTone(status)} ${drag.dropStatus === status ? 'is-drop-target' : ''}`} aria-labelledby={headingId}
    onDragOver={event => drag.dragOver(event, status)} onDragLeave={drag.dragLeave} onDrop={event => drag.dropTask(event, status)}>
    <header className="status-header">
      <span className="status-dot" aria-hidden="true" />
      <h3 id={headingId}>{status || 'Sem status'}</h3>
      <span className="status-count" aria-label={`${tasks.length} ${tasks.length === 1 ? 'tarefa' : 'tarefas'}`}>{tasks.length}</span>
    </header>
    <ul className="status-tasks">
      {tasks.map(task => <TaskCard
        key={task.id}
        task={task}
        statuses={statuses}
        pending={pendingTaskIds.has(task.id)}
        deleting={deletingTaskId === task.id}
        editing={editing}
        disabled={disabled}
        dragging={drag.draggedTaskId === task.id}
        onMoveTask={onMoveTask}
        onDeleteTask={onDeleteTask}
        onDragStart={drag.startDrag}
        onDragEnd={drag.endDrag}
      />)}
    </ul>
    {tasks.length === 0 && <p className="status-empty">Arraste uma tarefa para cá.</p>}
  </section>
}
