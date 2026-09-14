import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import AuthPanel from './components/AuthPanel'
import Dashboard from './components/Dashboard'
import { Icon } from './components/Icons'
import type { User } from './services/auth'
import './App.css'

function subscribeToNavigation(onChange: () => void) {
  window.addEventListener('popstate', onChange)
  return () => window.removeEventListener('popstate', onChange)
}

function navigate(path: string, replace = false) {
  window.history[replace ? 'replaceState' : 'pushState'](null, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

function App() {
  const path = useSyncExternalStore(subscribeToNavigation, () => window.location.pathname)
  const [user, setUser] = useState<User | null>(null)
  const [authMessage, setAuthMessage] = useState('')
  const isDashboard = path === '/dashboard' || path === '/dashboard/'

  useEffect(() => {
    document.title = isDashboard ? 'Meu quadro — TDL' : 'TDL — Seu dia mais leve'
  }, [isDashboard])

  const handleSessionExpired = useCallback(() => {
    setUser(null)
    setAuthMessage('Sua sessão expirou. Entre novamente para continuar.')
    navigate('/', true)
  }, [])

  function handleAuthenticated(authenticatedUser: User) {
    setUser(authenticatedUser)
    setAuthMessage('')
    navigate('/dashboard')
  }

  if (isDashboard) return <Dashboard user={user} onSessionExpired={handleSessionExpired} />

  return <main className="login-page">
    <div className="auth-card">
      <aside className="mascot-panel" aria-label="Seu dia pode ser mais leve">
        <img className="mascot-image" src="/mascot.png" alt="Um pequeno yeti azul e peludo acenando em uma colina, sob um céu de nuvens." fetchPriority="high" />
        <div className="hero-topline"><span className="little-star"><Icon name="sparkle" /></span>UM PASSO DE CADA VEZ</div>
        <div className="hero-copy"><h2>ORGANIZE.<br />RESPIRE.<br />CONQUISTE.</h2><p>Seu mundo, um pouco mais leve.</p></div>
        <span className="hero-corner" aria-hidden="true"><Icon name="arrow" /></span>
      </aside>
      <AuthPanel onAuthenticated={handleAuthenticated} initialMessage={authMessage} />
    </div>
    <p className="page-caption">Pequenos passos também te levam longe.</p>
  </main>
}

export default App
