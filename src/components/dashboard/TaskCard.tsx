import type { TaskDragHandlers } from '../../hooks/useTaskDrag'
import type { Task } from '../../services/tasks'
import { Icon } from '../Icons'

interface TaskCardProps {
  task: Task
  statuses: string[]
  pending: boolean
  disabled: boolean
  dragging: boolean
  onMoveTask: (taskId: string, status: string) => void
  onDragStart: TaskDragHandlers['startDrag']
  onDragEnd: TaskDragHandlers['endDrag']
}

export default function TaskCard({ task, statuses, pending, disabled, dragging, onMoveTask, onDragStart, onDragEnd }: TaskCardProps) {
  const hasDescription = Boolean(task.description?.trim())

  return <li className={`task-card ${pending ? 'task-is-pending' : ''} ${dragging ? 'task-is-dragging' : ''}`}
    draggable={!disabled} onDragStart={event => onDragStart(event, task.id)} onDragEnd={onDragEnd}>
    <article>
      <div className="task-card-heading">
        <h4>{task.title}</h4>
        <span className="task-grip" title="Arraste para outro status"><Icon name="grip" /></span>
      </div>
      {pending && <span className="task-pending-label">Alteração pendente</span>}
      <p className={hasDescription ? 'task-description' : 'task-description no-description'}>{hasDescription ? task.description : 'Sem descrição.'}</p>
      <label className="task-move-control">
        <span>Mover para</span>
        <select aria-label={`Mover ${task.title} para outro status`} value={task.status} disabled={disabled || statuses.length < 2} onChange={event => onMoveTask(task.id, event.target.value)}>
          {statuses.map(status => <option key={status} value={status}>{status || 'Sem status'}</option>)}
        </select>
      </label>
    </article>
  </li>
}
