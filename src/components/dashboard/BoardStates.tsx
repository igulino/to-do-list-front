import { Icon } from '../Icons'

export function BoardSkeleton() {
  return <div className="task-board board-skeleton" aria-hidden="true">
    {[2, 1, 2, 1, 1].map((count, index) => <div className="status-column" key={index}>
      <div className="skeleton-line skeleton-heading" />
      {Array.from({ length: count }, (_, taskIndex) => <div className="task-card" key={taskIndex}>
        <div className="skeleton-line" /><div className="skeleton-line" /><div className="skeleton-line skeleton-short" />
      </div>)}
    </div>)}
  </div>
}

export function BoardEmptyState({ type }: { type: 'empty' | 'empty-page' | 'error' }) {
  if (type === 'error') return <div className="board-empty">
    <span className="empty-symbol"><Icon name="board" /></span>
    <h3>Seu quadro estará aqui.</h3>
    <p>Tente carregar suas tarefas novamente.</p>
  </div>

  return <div className="board-empty">
    <span className="empty-symbol"><Icon name="list" /></span>
    <p className="eyebrow">ESPAÇO PARA NOVOS PLANOS</p>
    <h3>{type === 'empty' ? 'Um novo começo por aqui.' : 'Nenhuma tarefa nesta página.'}</h3>
    <p>{type === 'empty' ? 'Suas tarefas aparecerão aqui, cada uma no seu status.' : 'Use a seta abaixo para voltar à página anterior.'}</p>
  </div>
}
