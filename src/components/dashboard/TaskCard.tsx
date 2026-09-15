import type { TaskEditingHandlers } from '../../hooks/useTaskEditing'
import type { TaskDragHandlers } from '../../hooks/useTaskDrag'
import type { Task } from '../../services/tasks'
import { Icon } from '../Icons'
import TaskEditableField from './TaskEditableField'

interface TaskCardProps {
  task: Task
  statuses: string[]
  pending: boolean
  deleting: boolean
  editing: TaskEditingHandlers
  disabled: boolean
  dragging: boolean
  onMoveTask: (taskId: string, status: string) => void
  onDeleteTask: (taskId: string) => Promise<void>
  onDragStart: TaskDragHandlers['startDrag']
  onDragEnd: TaskDragHandlers['endDrag']
}

export default function TaskCard({ task, statuses, pending, deleting, editing, disabled, dragging, onMoveTask, onDeleteTask, onDragStart, onDragEnd }: TaskCardProps) {
  return <li className={`task-card ${pending ? 'task-is-pending' : ''} ${dragging ? 'task-is-dragging' : ''}`}
    draggable={!disabled} onDragStart={event => onDragStart(event, task.id)} onDragEnd={onDragEnd}>
    <article>
      <div className="task-card-heading">
        <TaskEditableField task={task} field="title" disabled={disabled} editing={editing} />
        <div className="task-card-actions">
          <span className="task-grip" title="Arraste para outro status"><Icon name="grip" /></span>
          <button className="task-delete-button" type="button" disabled={disabled} draggable={false}
            aria-label={`${deleting ? 'Excluindo' : 'Excluir'} ${task.title}`} aria-busy={deleting}
            title={deleting ? 'Excluindo tarefa…' : 'Excluir tarefa'} onClick={() => void onDeleteTask(task.id)}
            onDragStart={event => event.preventDefault()}>
            <Icon name={deleting ? 'refresh' : 'trash'} className={deleting ? 'is-spinning' : ''} />
          </button>
        </div>
      </div>
      {pending && <span className="task-pending-label">Alteração pendente</span>}
      <TaskEditableField task={task} field="description" disabled={disabled} editing={editing} />
      <label className="task-move-control">
        <span>Mover para</span>
        <select aria-label={`Mover ${task.title} para outro status`} value={task.status} disabled={disabled || statuses.length < 2} onChange={event => onMoveTask(task.id, event.target.value)}>
          {statuses.map(status => <option key={status} value={status}>{status || 'Sem status'}</option>)}
        </select>
      </label>
    </article>
  </li>
}
