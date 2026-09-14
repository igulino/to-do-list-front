import type { User } from '../../services/auth'
import { Brand, Icon } from '../Icons'

export default function DashboardHeader({ user }: { user: User | null }) {
  const initial = user?.name.trim().slice(0, 1).toUpperCase()

  return <header className="dashboard-header">
    <div className="dashboard-identity">
      <Brand />
      <span className="header-divider" aria-hidden="true" />
      <span className="workspace-label">Meu espaço</span>
    </div>
    <div className="dashboard-account">
      <span className="private-label"><Icon name="lock" />Só seu</span>
      <span className="account-avatar" aria-label={user ? `Conta de ${user.name}` : 'Sua conta'} title={user?.name}>
        {initial || <Icon name="sparkle" />}
      </span>
    </div>
  </header>
}
