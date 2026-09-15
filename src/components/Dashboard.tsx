import { useState } from 'react'
import type { User } from '../services/auth'
import useTaskBoard from '../hooks/useTaskBoard'
import BoardSavePanel from './dashboard/BoardSavePanel'
import CreateTaskModal from './dashboard/CreateTaskModal'
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
  const [creatingTask, setCreatingTask] = useState(false)

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
        deletingTaskId={board.deletingTaskId}
        editing={board.editing}
        moveAnnouncement={board.moveAnnouncement}
        boardRef={board.boardRef}
        drag={board.drag}
        onMoveTask={board.moveTask}
        onDeleteTask={board.removeTask}
        onLoadPage={board.loadPage}
        onCreateTask={() => setCreatingTask(true)}
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
    {creatingTask && <CreateTaskModal
      onClose={() => setCreatingTask(false)}
      onCreated={() => {
        setCreatingTask(false)
        board.taskCreated()
      }}
      onSessionExpired={onSessionExpired}
    />}
  </main>
}
