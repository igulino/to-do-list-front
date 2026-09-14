import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { login, register } from '../services/auth'
import type { User } from '../services/auth'
import { Brand, Icon } from './Icons'

type Field = 'name' | 'email' | 'password'
type Feedback = { type: 'error' | 'success'; message: string } | null
const rememberedEmailKey = 'tdl.remembered-email'

function readRememberedEmail() {
  try { return localStorage.getItem(rememberedEmailKey) || '' } catch { return '' }
}

interface AuthPanelProps {
  onAuthenticated: (user: User) => void
  initialMessage?: string
}

export default function AuthPanel({ onAuthenticated, initialMessage }: AuthPanelProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState(readRememberedEmail)
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(() => Boolean(readRememberedEmail()))
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const [feedback, setFeedback] = useState<Feedback>(initialMessage ? { type: 'error', message: initialMessage } : null)
  const [pending, setPending] = useState(false)
  const feedbackRef = useRef<HTMLDivElement>(null)
  const isRegister = mode === 'register'

  function changeMode() {
    setMode(isRegister ? 'login' : 'register')
    setPassword('')
    setShowPassword(false)
    setErrors({})
    setFeedback(null)
  }

  function clearError(field: Field) {
    setErrors(current => ({ ...current, [field]: undefined }))
    if (feedback?.type === 'error') setFeedback(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    const nextErrors: Partial<Record<Field, string>> = {}
    const normalizedEmail = email.trim().toLowerCase()
    if (isRegister && (!name.trim() || name.trim().length > 100)) nextErrors.name = 'Informe seu nome, com até 100 caracteres.'
    if (normalizedEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) nextErrors.email = 'Informe um e-mail válido.'
    if (password.length < 8) nextErrors.password = 'Sua senha precisa ter pelo menos 8 caracteres.'
    else if (new TextEncoder().encode(password).length > 72) nextErrors.password = 'Sua senha é longa demais. Use até 72 bytes de texto.'
    setErrors(nextErrors)
    setFeedback(null)
    if (Object.keys(nextErrors).length) {
      const field = Object.keys(nextErrors)[0]
      document.getElementById(`auth-${field}`)?.focus()
      return
    }

    setPending(true)
    try {
      if (isRegister) {
        await register({ name: name.trim(), email: normalizedEmail, password })
        setMode('login')
        setPassword('')
        setShowPassword(false)
        setFeedback({ type: 'success', message: 'Conta criada! Agora é só entrar com seu e-mail e senha.' })
        requestAnimationFrame(() => feedbackRef.current?.focus())
      } else {
        const authenticatedUser = await login({ email: normalizedEmail, password })
        try {
          if (remember) localStorage.setItem(rememberedEmailKey, normalizedEmail)
          else localStorage.removeItem(rememberedEmailKey)
        } catch { /* O login também funciona quando o armazenamento está bloqueado. */ }
        setPassword('')
        onAuthenticated(authenticatedUser)
      }
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Algo deu errado. Tente novamente.' })
      requestAnimationFrame(() => feedbackRef.current?.focus())
    } finally {
      setPending(false)
    }
  }

  return <section className={`auth-panel ${isRegister ? 'register-panel' : ''}`} aria-labelledby="auth-heading">
    <Brand />
    <div className="form-content">
      <header className="form-heading">
        
         <p className="eyebrow">{'To-Do-List'}</p>
        <p className="eyebrow">{isRegister ? 'UM NOVO COMEÇO' : 'SEU DIA, MAIS LEVE'}</p>
        <h1 id="auth-heading">{isRegister ? <>GRANDES PLANOS.<br />PRIMEIRO PASSO.</> : <>BEM-VINDO<br />DE VOLTA.</>}</h1>
        <p className="intro">{isRegister ? 'Crie sua conta e dê espaço ao que importa.' : 'Entre na sua conta. O resto, um passo de cada vez.'}</p>
      </header>

      <form onSubmit={handleSubmit} noValidate aria-busy={pending}>
        {feedback && <div ref={feedbackRef} className={`feedback feedback-${feedback.type}`} role={feedback.type === 'error' ? 'alert' : 'status'} tabIndex={-1}>{feedback.message}</div>}
        <fieldset disabled={pending}>
          {isRegister && <div className="form-field">
            <label htmlFor="auth-name">Seu nome</label>
            <div className={`input-wrap ${errors.name ? 'is-invalid' : ''}`}><input id="auth-name" name="name" type="text" autoComplete="name" maxLength={100} required placeholder="Como podemos te chamar?" value={name} onChange={event => { setName(event.target.value); clearError('name') }} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error' : undefined} /></div>
            {errors.name && <span className="field-error" id="name-error">{errors.name}</span>}
          </div>}
          <div className="form-field">
            <label htmlFor="auth-email">E-mail</label>
            <div className={`input-wrap ${errors.email ? 'is-invalid' : ''}`}><input id="auth-email" name="email" type="email" autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false} maxLength={254} required placeholder="voce@exemplo.com" value={email} onChange={event => { setEmail(event.target.value); clearError('email') }} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} /><Icon name="mail" className="input-icon" /></div>
            {errors.email && <span className="field-error" id="email-error">{errors.email}</span>}
          </div>
          <div className="form-field">
            <label htmlFor="auth-password">Senha</label>
            <div className={`input-wrap ${errors.password ? 'is-invalid' : ''}`}><input id="auth-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete={isRegister ? 'new-password' : 'current-password'} required placeholder={isRegister ? 'Crie uma senha com 8 ou mais caracteres' : 'Digite sua senha'} value={password} onChange={event => { setPassword(event.target.value); clearError('password') }} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'password-error' : undefined} /><button className="password-toggle" type="button" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}><Icon name={showPassword ? 'eye-off' : 'eye'} /></button></div>
            {errors.password && <span className="field-error" id="password-error">{errors.password}</span>}
          </div>
          {!isRegister && <label className="remember"><input type="checkbox" checked={remember} onChange={event => {
            setRemember(event.target.checked)
            if (!event.target.checked) { try { localStorage.removeItem(rememberedEmailKey) } catch { /* Preferência opcional. */ } }
          }} /><span>Lembrar meu e-mail</span></label>}
          <button className="button button-primary" type="submit">{pending ? <><span className="spinner" />{isRegister ? 'Criando sua conta…' : 'Entrando…'}</> : <>{isRegister ? 'Criar minha conta' : 'Entrar na minha conta'}<Icon name="arrow" /></>}</button>
        </fieldset>
      </form>

      <div className="form-divider"><span>{isRegister ? 'já faz parte?' : 'primeira vez por aqui?'}</span></div>
      <button className="button button-secondary" type="button" disabled={pending} onClick={changeMode}>{isRegister ? 'Voltar para o login' : 'Criar uma conta'}<Icon name={isRegister ? 'arrow' : 'sparkle'} /></button>
    </div>
    <p className="panel-note"><Icon name="lock" />Um espaço só seu. Um dia de cada vez.</p>
  </section>
}
