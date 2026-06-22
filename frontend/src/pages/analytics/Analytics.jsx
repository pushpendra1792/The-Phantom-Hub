import { FiTarget, FiAward, FiTrendingUp, FiCheckSquare, FiActivity, FiClock, FiUser } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import { useAnalytics, useTeamActivity } from '../../hooks'
import BarChart from '../../components/charts/BarChart'
import LineChart from '../../components/charts/LineChart'
import StatCard from '../../components/ui/StatCard'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import StatusBadge from '../../components/ui/StatusBadge'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function Analytics() {
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics()
  const { data: teamActivity = [], isLoading: activityLoading } = useTeamActivity()

  if (analyticsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading analytics..." />
      </div>
    )
  }

  const completionRate = analytics?.totalTasks > 0
    ? Math.round((analytics.completedTasks / analytics.totalTasks) * 100)
    : 0

  const userChartLabels = (analytics?.tasksByUser || []).map((u) => u.user?.name || 'Unassigned')
  const userChartDatasets = [
    {
      label: 'Backlog',
      data: (analytics?.tasksByUser || []).map((u) => u.backlog || 0),
      backgroundColor: '#6b7280',
    },
    {
      label: 'To Do',
      data: (analytics?.tasksByUser || []).map((u) => u.todo || 0),
      backgroundColor: '#3b82f6',
    },
    {
      label: 'In Progress',
      data: (analytics?.tasksByUser || []).map((u) => u.in_progress || 0),
      backgroundColor: '#a855f7',
    },
    {
      label: 'Review',
      data: (analytics?.tasksByUser || []).map((u) => u.review || 0),
      backgroundColor: '#f59e0b',
    },
    {
      label: 'Done',
      data: (analytics?.tasksByUser || []).map((u) => u.done || 0),
      backgroundColor: '#22c55e',
    },
  ]

  const trendLabels = (analytics?.monthlyTrends || []).map(
    (m) => `${MONTH_NAMES[m._id.month - 1]} ${m._id.year}`
  )
  const trendDatasets = [
    {
      label: 'Tasks Created',
      data: (analytics?.monthlyTrends || []).map((m) => m.count),
      borderColor: '#a855f7',
      backgroundColor: 'rgba(168, 85, 247, 0.1)',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-phantom-gray mt-1">Insights into your team's productivity</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard title="Total Hackathons" value={analytics?.totalHackathons ?? 0} icon={FiTarget} color="purple" />
        <StatCard title="Hackathons Won" value={analytics?.hackathonsWon ?? 0} icon={FiAward} color="green" />
        <StatCard title="Win Rate" value={`${analytics?.winRate ?? 0}%`} icon={FiTrendingUp} color="yellow" />
        <StatCard title="Total Tasks" value={analytics?.totalTasks ?? 0} icon={FiCheckSquare} color="blue" />
        <StatCard title="Completion Rate" value={`${completionRate}%`} icon={FiActivity} color="cyan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart
          title="Tasks by Team Member"
          labels={userChartLabels}
          datasets={userChartDatasets}
          height={300}
        />
        <LineChart
          title="Monthly Task Trends"
          labels={trendLabels}
          datasets={trendDatasets}
          height={300}
        />
      </div>

      <div className="card">
        <h3 className="text-base font-semibold text-white mb-4">Recent Team Activity</h3>
        {activityLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="md" text="Loading activity..." />
          </div>
        ) : teamActivity.length === 0 ? (
          <p className="text-phantom-gray text-sm py-4 text-center">No recent activity</p>
        ) : (
          <div className="space-y-2">
            {teamActivity.map((task) => (
              <div key={task._id} className="flex items-center gap-4 p-3 rounded-lg bg-phantom-dark hover:bg-phantom-card/50 transition-colors">
                <div className="p-2 rounded-lg bg-phantom-purple/10 text-phantom-purple-light shrink-0">
                  <FiClock size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{task.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-phantom-gray">
                    {task.assignee && (
                      <span className="flex items-center gap-1">
                        <FiUser size={12} />
                        {task.assignee.name || task.assignee.email}
                      </span>
                    )}
                    {task.hackathon && (
                      <span>{task.hackathon.name}</span>
                    )}
                    <span>{formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}</span>
                  </div>
                </div>
                <StatusBadge status={task.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
