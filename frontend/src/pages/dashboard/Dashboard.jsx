import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiTarget, FiClock, FiCheckSquare, FiTrendingUp, FiCalendar, FiUsers, FiFileText, FiActivity, FiGrid } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { getDashboardStats } from '../../api'
import DoughnutChart from '../../components/charts/DoughnutChart'
import StatCard from '../../components/ui/StatCard'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Badge from '../../components/ui/Badge'

const priorityColors = { high: 'red', medium: 'yellow', low: 'green' }

const eventTypeIcons = {
  hackathon: FiTarget,
  meeting: FiUsers,
  deadline: FiClock,
  default: FiCalendar,
}

const quickActions = [
  { label: 'New Hackathon', icon: FiGrid, path: '/hackathons' },
  { label: 'New Task', icon: FiCheckSquare, path: '/tasks' },
  { label: 'View Team', icon: FiUsers, path: '/team' },
  { label: 'Meeting Notes', icon: FiFileText, path: '/notes' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = () => {
    setLoading(true)
    getDashboardStats()
      .then((res) => setStats(res.data))
      .catch(() => toast.error('Failed to load dashboard data'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-phantom-gray mt-1">Overview of your workspace activity</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Active Hackathons"
          value={stats?.activeHackathons ?? 0}
          icon={FiTarget}
          color="purple"
        />
        <StatCard
          title="Upcoming Deadlines"
          value={stats?.upcomingDeadlines ?? 0}
          icon={FiClock}
          color="yellow"
        />
        <StatCard
          title="Pending Tasks"
          value={stats?.pendingTasks ?? 0}
          icon={FiCheckSquare}
          color="blue"
        />
        <StatCard
          title="Tasks Completed This Week"
          value={stats?.completedThisWeek ?? 0}
          icon={FiTrendingUp}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DoughnutChart
          title="Team Progress"
          data={{
            labels: ['Backlog', 'Todo', 'In Progress', 'Review', 'Done'],
            values: stats?.teamProgress
              ? [stats.teamProgress.backlog, stats.teamProgress.todo, stats.teamProgress.in_progress, stats.teamProgress.review, stats.teamProgress.done]
              : [0, 0, 0, 0, 0],
            colors: ['#6b7280', '#3b82f6', '#a855f7', '#f59e0b', '#22c55e'],
          }}
          size={240}
        />

        <div className="card">
          <h3 className="text-base font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-1 max-h-[320px] overflow-y-auto">
            {(stats?.recentActivity?.length > 0 ? stats.recentActivity : []).map((item, idx) => (
              <button
                key={item._id || idx}
                onClick={() => item.link && navigate(item.link)}
                className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-phantom-dark transition-colors text-left"
              >
                <div className="p-2 rounded-lg bg-phantom-purple/10 text-phantom-purple-light mt-0.5">
                  <FiActivity size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{item.message}</p>
                  <p className="text-xs text-phantom-gray mt-0.5">
                    {formatDistanceToNow(new Date(item.createdAt || item.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </button>
            ))}
            {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
              <p className="text-phantom-gray text-sm py-4 text-center">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-base font-semibold text-white mb-4">Upcoming Deadlines</h3>
          <div className="space-y-3">
            {(stats?.upcomingTasks?.length > 0 ? stats.upcomingTasks.slice(0, 5) : []).map((task, idx) => (
              <div key={task._id || idx} className="flex items-center justify-between p-3 rounded-lg bg-phantom-dark">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white truncate">{task.title}</p>
                  <p className="text-xs text-phantom-gray mt-0.5">
                    {Math.ceil((new Date(task.dueDate || task.deadline) - new Date()) / (1000 * 60 * 60 * 24))} days left
                  </p>
                </div>
                <Badge variant={priorityColors[task.priority] || 'gray'}>
                  {task.priority || 'none'}
                </Badge>
              </div>
            ))}
            {(!stats?.upcomingTasks || stats.upcomingTasks.length === 0) && (
              <p className="text-phantom-gray text-sm py-4 text-center">No upcoming deadlines</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-base font-semibold text-white mb-4">Calendar Events</h3>
          <div className="space-y-3">
            {(stats?.calendarEvents?.length > 0 ? stats.calendarEvents.slice(0, 5) : []).map((event, idx) => {
              const TypeIcon = eventTypeIcons[event.type] || eventTypeIcons.default
              return (
                <div key={event._id || idx} className="flex items-start gap-3 p-3 rounded-lg bg-phantom-dark">
                  <div className="p-2 rounded-lg bg-phantom-purple/10 text-phantom-purple-light">
                    <TypeIcon size={16} />
                  </div>
                  <div>
                    <p className="text-sm text-white">{event.title}</p>
                    <p className="text-xs text-phantom-gray mt-0.5">
                      {new Date(event.date || event.start).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              )
            })}
            {(!stats?.calendarEvents || stats.calendarEvents.length === 0) && (
              <p className="text-phantom-gray text-sm py-4 text-center">No upcoming events</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-base font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg bg-phantom-dark hover:bg-phantom-purple/10 border border-transparent hover:border-phantom-purple/30 transition-all duration-200"
                >
                  <Icon size={22} className="text-phantom-purple-light" />
                  <span className="text-xs text-phantom-gray">{action.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
