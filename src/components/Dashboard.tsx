import type { User } from '../services/auth'
import useTaskBoard from '../hooks/useTaskBoard'
import BoardSavePanel from './dashboard/BoardSavePanel'
import DashboardHeader from './dashboard/DashboardHeader'
import DashboardWelcome from './dashboard/DashboardWelcome'
import TaskBoard from './dashboard/TaskBoard'
import { Icon } from './Icons'
import './Dashboard.css'

interface DashboardProps {
  user: User | null
  onSessionExpired: () => void
}

export default function Dashboard({ user, onSessionExpired }: DashboardProps) {
  const board = useTaskBoard(onSessionExpired)

  return <main className="dashboard-page">
    <div className="dashboard-shell">
      <DashboardHeader user={user} />
      <DashboardWelcome name={user?.name} />
      <TaskBoard
        groups={board.groups}
        pagination={board.pagination}
        requestedPage={board.requestedPage}
        loading={board.loading}
        error={board.error}
        disabled={board.busy}
        pendingTaskIds={board.pendingTaskIds}
        moveAnnouncement={board.moveAnnouncement}
        boardRef={board.boardRef}
        drag={board.drag}
        onMoveTask={board.moveTask}
        onLoadPage={board.loadPage}
      />
      <BoardSavePanel
        pendingCount={board.pendingCount}
        saving={board.saving}
        disabled={board.busy}
        feedback={board.saveFeedback}
        onSave={board.saveChanges}
        onDiscard={board.discardChanges}
      />
      <p className="dashboard-caption"><Icon name="sparkle" />Pequenos passos também te levam longe.</p>
    </div>
  </main>
}
