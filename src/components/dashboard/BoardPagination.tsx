import type { BoardPagination as Pagination } from '../../types/taskBoard'
import { Icon } from '../Icons'

interface BoardPaginationProps {
  pagination: Pagination
  disabled: boolean
  onPageChange: (page: number) => void
}

export default function BoardPagination({ pagination, disabled, onPageChange }: BoardPaginationProps) {
  const { hasData, page, totalPages, total, firstTask, lastTask } = pagination
  const summary = hasData
    ? total === 0 ? 'Nenhuma tarefa por enquanto' : `Mostrando ${firstTask}–${lastTask} de ${total} tarefas`
    : 'Seu dia, um passo de cada vez'

  return <footer className="board-footer">
    <p>{summary}</p>
    <nav className="board-pagination" aria-label="Paginação das tarefas">
      <button type="button" aria-label="Página anterior" title="Página anterior" disabled={disabled || !hasData || page <= 1} onClick={() => onPageChange(page - 1)}><Icon name="chevron-left" /></button>
      <span>Página <strong>{page}</strong> de <strong>{totalPages}</strong></span>
      <button type="button" aria-label="Próxima página" title="Próxima página" disabled={disabled || !hasData || page >= totalPages} onClick={() => onPageChange(page + 1)}><Icon name="chevron-right" /></button>
    </nav>
  </footer>
}
