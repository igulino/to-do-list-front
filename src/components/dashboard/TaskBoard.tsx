import type { Ref } from 'react'
import type { TaskEditingHandlers } from '../../hooks/useTaskEditing'
import type { TaskDragHandlers } from '../../hooks/useTaskDrag'
import type { BoardPagination as Pagination, TaskGroup } from '../../types/taskBoard'
import { Icon } from '../Icons'
import BoardPagination from './BoardPagination'
import { BoardEmptyState, BoardSkeleton } from './BoardStates'
import StatusColumn from './StatusColumn'

interface TaskBoardProps {
  groups: TaskGroup[]
  pagination: Pagination
  requestedPage: number
  loading: boolean
  error: string | null
  disabled: boolean
  pendingTaskIds: ReadonlySet<string>
  deletingTaskId: string | null
  editing: TaskEditingHandlers
  moveAnnouncement: string
  boardRef: Ref<HTMLDivElement>
  drag: TaskDragHandlers
  onMoveTask: (taskId: string, status: string) => void
  onDeleteTask: (taskId: string) => Promise<void>
  onLoadPage: (page: number) => void
  onCreateTask: () => void
}

export default function TaskBoard({ groups, pagination, requestedPage, loading, error, disabled, pendingTaskIds, deletingTaskId, editing, moveAnnouncement, boardRef, drag, onMoveTask, onDeleteTask, onLoadPage, onCreateTask }: TaskBoardProps) {
  const { hasData, page, totalPages, total, taskCount } = pagination
  const statuses = groups.map(group => group.status)
  let content = null

  if (!hasData && loading) {
    content = <BoardSkeleton />
  } else if (hasData && groups.length > 0) {
    content = <div className={`task-board ${loading ? 'board-is-loading' : ''} ${drag.draggedTaskId ? 'board-is-dragging' : ''}`} ref={boardRef} role="region" aria-label="Tarefas agrupadas por status" tabIndex={0}>
      {groups.map((group, index) => <StatusColumn
        key={group.status}
        group={group}
        headingId={`status-${index}`}
        statuses={statuses}
        pendingTaskIds={pendingTaskIds}
        deletingTaskId={deletingTaskId}
        editing={editing}
        disabled={disabled}
        drag={drag}
        onMoveTask={onMoveTask}
        onDeleteTask={onDeleteTask}
      />)}
    </div>
  } else if (hasData && !error) {
    content = <BoardEmptyState type={total === 0 ? 'empty' : 'empty-page'} />
  } else if (!hasData && error) {
    content = <BoardEmptyState type="error" />
  }

  return <section className="board-panel" aria-labelledby="board-heading">
    <header className="board-header">
      <div className="board-title">
        <span className="board-symbol"><Icon name="board" /></span>
        <div><h2 id="board-heading">Minhas tarefas</h2><p>Cada passo no seu lugar.</p></div>
      </div>
      <div className="board-actions">
        <button className="refresh-button" type="button" aria-label="Atualizar tarefas" disabled={disabled} onClick={() => onLoadPage(page)}>
          <Icon name="refresh" className={loading ? 'is-spinning' : ''} /><span>Atualizar</span>
        </button>
        <button className="create-task-button" type="button" disabled={disabled} onClick={onCreateTask} aria-haspopup="dialog">
          <Icon name="plus" />Criar task
        </button>
      </div>
    </header>

    <div className="board-meta">
      <span className="board-view"><Icon name="board" />Quadro por status</span>
      {hasData && <span>{total} {total === 1 ? 'tarefa no total' : 'tarefas no total'}<span className="meta-dot" aria-hidden="true">·</span>{groups.length} status nesta página</span>}
    </div>

    <p className="visually-hidden" role="status" aria-live="polite">
      {loading ? `Carregando página ${requestedPage}.` : error ? '' : `Página ${page} de ${totalPages}. ${taskCount} tarefas em ${groups.length} status.`}
    </p>
    <p className="visually-hidden" role="status" aria-live="polite">{moveAnnouncement}</p>

    {error && <div className="board-error" role="alert">
      <Icon name="alert" /><p>{error}</p>
      <button type="button" disabled={disabled} onClick={() => onLoadPage(requestedPage)}>Tentar novamente<Icon name="refresh" /></button>
    </div>}

    <div className="board-content" aria-busy={loading}>{content}</div>
    <BoardPagination pagination={pagination} disabled={disabled} onPageChange={onLoadPage} />
  </section>
}
