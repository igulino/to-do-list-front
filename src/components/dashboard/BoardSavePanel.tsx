import type { SaveFeedback } from '../../types/taskBoard'
import { Icon } from '../Icons'

interface BoardSavePanelProps {
  pendingCount: number
  saving: boolean
  disabled: boolean
  feedback: SaveFeedback | null
  onSave: () => Promise<void>
  onDiscard: () => void
}

export default function BoardSavePanel({ pendingCount, saving, disabled, feedback, onSave, onDiscard }: BoardSavePanelProps) {
  const summary = saving ? 'Salvando suas alterações…' : pendingCount > 0
    ? `${pendingCount} ${pendingCount === 1 ? 'tarefa com alteração pendente' : 'tarefas com alterações pendentes'}`
    : 'Cada tarefa, no seu lugar.'

  return <section className={`board-save-panel ${pendingCount > 0 || saving ? 'has-pending-changes' : ''}`} aria-label="Salvar alterações de status" aria-busy={saving}>
    {feedback && <p className={`save-feedback save-feedback-${feedback.type}`} role={feedback.type === 'error' ? 'alert' : 'status'}>
      <Icon name={feedback.type === 'error' ? 'alert' : 'check'} />{feedback.message}
    </p>}
    <div className="board-save-bar">
      <div className="save-copy">
        <strong>{summary}</strong>
        <p>Arraste entre os status e salve quando estiver tudo pronto.</p>
      </div>
      <div className="save-actions">
        {pendingCount > 0 && <button className="discard-changes" type="button" disabled={disabled} onClick={onDiscard}>Desfazer alterações</button>}
        <button className="button button-primary save-changes" type="button" disabled={disabled || pendingCount === 0} onClick={onSave}>
          {saving ? <><span className="spinner" />Salvando…</> : <>Salvar alterações<Icon name="check" /></>}
        </button>
      </div>
    </div>
  </section>
}
