import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import useTaskCreation from '../../hooks/useTaskCreation'
import { Icon } from '../Icons'
import './CreateTaskModal.css'

type StatusMode = 'existing' | 'new'
type FieldErrors = { title?: string; status?: string }

interface CreateTaskModalProps {
  onClose: () => void
  onCreated: () => void
  onSessionExpired: () => void
}

export default function CreateTaskModal({ onClose, onCreated, onSessionExpired }: CreateTaskModalProps) {
  const creation = useTaskCreation(onCreated, onSessionExpired)
  const { statuses, loading: loadingStatuses, error: statusError } = creation.statusState
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [mode, setMode] = useState<StatusMode>('existing')
  const [existingStatus, setExistingStatus] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)
  const errorRef = useRef<HTMLDivElement>(null)
  const existingUnavailable = mode === 'existing' && (loadingStatuses || Boolean(statusError) || statuses.length === 0)

  useEffect(() => {
    const dialog = dialogRef.current
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    dialog?.showModal()
    document.body.style.overflow = 'hidden'
    titleRef.current?.focus()

    return () => {
      dialog?.close()
      document.body.style.overflow = previousOverflow
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus()
    }
  }, [])

  useEffect(() => {
    if (creation.error) errorRef.current?.focus()
  }, [creation.error])

  function changeMode(nextMode: StatusMode) {
    setMode(nextMode)
    setErrors(current => ({ ...current, status: undefined }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (creation.saving || existingUnavailable) return
    const normalizedTitle = title.trim()
    const status = mode === 'existing' ? existingStatus : newStatus.trim()
    const nextErrors: FieldErrors = {}

    if (!normalizedTitle || normalizedTitle.length > 200) nextErrors.title = 'Informe um título com até 200 caracteres.'
    if (!status.trim() || status.trim().length > 100) {
      nextErrors.status = mode === 'existing' ? 'Escolha um status para a tarefa.' : 'Informe um status com até 100 caracteres.'
    } else if (mode === 'existing' && !statuses.includes(status)) {
      nextErrors.status = 'Escolha um dos status disponíveis.'
    }

    setErrors(nextErrors)
    if (nextErrors.title || nextErrors.status) {
      document.getElementById(nextErrors.title ? 'task-title' : 'task-status')?.focus()
      return
    }

    void creation.submitTask({ title: normalizedTitle, description: description.trim() || null, status })
  }

  return <dialog ref={dialogRef} className="create-task-modal" aria-labelledby="create-task-heading" aria-describedby="create-task-description" onCancel={event => {
    event.preventDefault()
    if (!creation.saving) onClose()
  }}>
    <header className="task-modal-header">
      <div>
        <p className="eyebrow"><Icon name="sparkle" />UM NOVO PASSO</p>
        <h2 id="create-task-heading">Criar task</h2>
        <p id="create-task-description">Dê um nome ao seu próximo passo e escolha onde ele começa.</p>
      </div>
      <button className="task-modal-close" type="button" onClick={onClose} disabled={creation.saving} aria-label="Fechar criação de task"><Icon name="close" /></button>
    </header>

    <form onSubmit={handleSubmit} noValidate aria-busy={creation.saving}>
      {creation.error && <div ref={errorRef} className="feedback feedback-error" role="alert" tabIndex={-1}>{creation.error}</div>}
      <fieldset disabled={creation.saving}>
        <div className="task-form-field">
          <label htmlFor="task-title">Título</label>
          <input ref={titleRef} id="task-title" name="title" type="text" placeholder="O que você quer fazer?" maxLength={200} required value={title} onChange={event => {
            setTitle(event.target.value)
            setErrors(current => ({ ...current, title: undefined }))
          }} aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? 'task-title-error' : undefined} />
          {errors.title && <span className="field-error" id="task-title-error">{errors.title}</span>}
        </div>
        <div className="task-form-field">
          <label htmlFor="task-description">Descrição <span>opcional</span></label>
          <textarea id="task-description" name="description" rows={3} placeholder="Adicione detalhes que ajudem você depois." value={description} onChange={event => setDescription(event.target.value)} />
        </div>

        <fieldset className="task-status-fieldset">
          <legend>Status da task</legend>
          <div className="task-status-modes" role="group" aria-label="Como escolher o status">
            <button type="button" aria-pressed={mode === 'existing'} aria-controls="task-status-panel" onClick={() => changeMode('existing')}>
              <Icon name="list" />Status já existentes
              {mode === 'existing' && <Icon name="check" className="status-mode-check" />}
            </button>
            <button type="button" aria-pressed={mode === 'new'} aria-controls="task-status-panel" onClick={() => changeMode('new')}>
              <Icon name="plus" />Inserir novo status
              {mode === 'new' && <Icon name="check" className="status-mode-check" />}
            </button>
          </div>

          <div id="task-status-panel" className="task-status-panel">
            {mode === 'existing' ? <>
              <div className="task-form-field">
                <label htmlFor="task-status">Escolha um status</label>
                <select id="task-status" name="status" required value={existingStatus} disabled={existingUnavailable} onChange={event => {
                  setExistingStatus(event.target.value)
                  setErrors(current => ({ ...current, status: undefined }))
                }} aria-invalid={Boolean(errors.status)} aria-describedby={errors.status ? 'task-status-error' : undefined}>
                  <option value="" disabled>{loadingStatuses ? 'Carregando status…' : 'Selecione um status'}</option>
                  {statuses.map(status => <option key={status} value={status}>{status}</option>)}
                </select>
                {errors.status && <span className="field-error" id="task-status-error">{errors.status}</span>}
              </div>
              {loadingStatuses && <p className="task-status-hint" role="status">Buscando os status das suas tarefas…</p>}
              {statusError && <div className="task-status-error" role="alert">
                <p>{statusError}</p>
                <button type="button" onClick={creation.reloadStatuses}>Tentar novamente<Icon name="refresh" /></button>
              </div>}
              {!loadingStatuses && !statusError && statuses.length === 0 && <p className="task-status-hint" role="status">Você ainda não tem status cadastrados. Escolha “Inserir novo status” para começar.</p>}
            </> : <div className="task-form-field">
              <label htmlFor="task-status">Novo status</label>
              <input id="task-status" name="status" type="text" placeholder="Ex.: Em andamento" maxLength={100} required value={newStatus} onChange={event => {
                setNewStatus(event.target.value)
                setErrors(current => ({ ...current, status: undefined }))
              }} aria-invalid={Boolean(errors.status)} aria-describedby={errors.status ? 'task-status-error' : 'task-status-hint'} />
              {errors.status && <span className="field-error" id="task-status-error">{errors.status}</span>}
              <p className="task-status-hint" id="task-status-hint">A task será criada com este status.</p>
            </div>}
          </div>
        </fieldset>

        <footer className="task-modal-actions">
          <button className="button button-secondary" type="button" onClick={onClose}>Cancelar</button>
          <button className="button button-primary" type="submit" disabled={existingUnavailable}>
            {creation.saving ? <><span className="spinner" />Criando task…</> : <>Criar task<Icon name="plus" /></>}
          </button>
        </footer>
      </fieldset>
    </form>
  </dialog>
}
