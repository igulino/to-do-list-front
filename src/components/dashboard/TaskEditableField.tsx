import { useEffect, useId, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { TaskEditableFieldName, TaskEditingHandlers } from '../../hooks/useTaskEditing'
import type { Task } from '../../services/tasks'
import { Icon } from '../Icons'
import './TaskEditableField.css'

interface TaskEditableFieldProps {
  task: Task
  field: TaskEditableFieldName
  disabled: boolean
  editing: TaskEditingHandlers
}

export default function TaskEditableField({ task, field, disabled, editing }: TaskEditableFieldProps) {
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const submittingRef = useRef(false)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const inputId = useId()
  const isTitle = field === 'title'
  const label = isTitle ? 'Título' : 'Descrição'
  const value = task[field]
  const active = editing.session?.taskId === task.id && editing.session.field === field

  useEffect(() => {
    if (!active) return
    inputRef.current?.focus()
    if (field === 'title') inputRef.current?.select()
  }, [active, field])

  function restoreFocus() {
    requestAnimationFrame(() => buttonRef.current?.focus())
  }

  function begin() {
    if (disabled || !editing.begin(task.id, field)) return
    setDraft(value ?? '')
    setError(null)
  }

  function cancel() {
    if (submittingRef.current) return
    editing.cancel(task.id)
    setError(null)
    restoreFocus()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submittingRef.current) return
    const normalized = draft.trim()
    if (isTitle && (!normalized || normalized.length > 200)) {
      setError('Informe um título com até 200 caracteres.')
      inputRef.current?.focus()
      return
    }
    if (normalized === (value ?? '')) {
      cancel()
      return
    }

    submittingRef.current = true
    setSaving(true)
    setError(null)
    try {
      if (await editing.save(task.id, field, normalized)) restoreFocus()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Não foi possível salvar. Tente novamente.')
      requestAnimationFrame(() => inputRef.current?.focus())
    } finally {
      submittingRef.current = false
      setSaving(false)
    }
  }

  return <div className={`task-editable-field ${isTitle ? 'task-title-field' : 'task-description-field'}`}>
    {active ? <form className="task-field-editor" onSubmit={handleSubmit} noValidate aria-label={`Editar ${label.toLowerCase()} de ${task.title}`} aria-busy={saving} onKeyDown={event => {
      if (event.nativeEvent.isComposing) return
      if (event.key === 'Escape') {
        event.preventDefault()
        cancel()
      } else if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        event.currentTarget.requestSubmit()
      }
    }}>
      <label htmlFor={inputId}>{label}</label>
      {isTitle ? <input ref={element => { inputRef.current = element }} id={inputId} name="title" type="text" value={draft}
        maxLength={200} required disabled={saving} aria-invalid={Boolean(error)} aria-describedby={error ? inputId + '-error' : undefined}
        onChange={event => { setDraft(event.target.value); setError(null) }} /> :
        <textarea ref={element => { inputRef.current = element }} id={inputId} name="description" rows={4} value={draft}
          placeholder="Adicione uma descrição" disabled={saving} aria-invalid={Boolean(error)} aria-describedby={error ? inputId + '-error' : undefined}
          onChange={event => { setDraft(event.target.value); setError(null) }} />}
      {error && <p className="task-field-error" id={inputId + '-error'} role="alert">{error}</p>}
      <div className="task-field-actions">
        <button type="button" disabled={saving} onClick={cancel}>Cancelar</button>
        <button className="task-field-save" type="submit" disabled={saving}>
          <Icon name={saving ? 'refresh' : 'check'} className={saving ? 'is-spinning' : ''} />{saving ? 'Salvando…' : 'Salvar'}
        </button>
      </div>
    </form> : <>
      {isTitle ? <h4>{value}</h4> : <p className={value?.trim() ? 'task-description' : 'task-description no-description'}>{value?.trim() ? value : 'Sem descrição.'}</p>}
      <button ref={buttonRef} className="task-edit-button" type="button" disabled={disabled} draggable={false}
        aria-label={`Editar ${label.toLowerCase()} de ${task.title}`} title={`Editar ${label.toLowerCase()}`}
        onClick={begin} onDragStart={event => event.preventDefault()}><Icon name="pencil" /></button>
    </>}
  </div>
}
