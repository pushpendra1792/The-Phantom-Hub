import { useState, useEffect } from 'react'
import { FiGrid, FiAward, FiTarget, FiCheckCircle, FiActivity } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { getAnalytics, getTeamActivity } from '../../api'
import StatCard from '../../components/ui/StatCard'
import DoughnutChart from '../../components/charts/DoughnutChart'
import BarChart from '../../components/charts/BarChart'
import LineChart from '../../components/charts/LineChart'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null)
  const [teamActivity, setTeamActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = () => {
    setLoading(true)
    setError(null)
    Promise.all([getAnalytics(), getTeamActivity()])
      .then(([analyticsRes, activityRes]) => {
        setAnalytics(analyticsRes.data)
        setTeamActivity(activityRes.data || [])
      })
      .catch(() => {
        setError('Failed to load analytics')
        toast.error('Failed to load analytics')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading analytics..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-red-400">{error}</p>
        <button onClick={fetchData} className="btn-primary">Retry</button>
      </div>
    )
  }

  const taskDistributionData = analytics?.taskDistribution || analytics?.teamProgress
    ? {
        labels: ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'],
        values: [
          analytics.taskDistribution?.backlog ?? analytics.teamProgress?.backlog ?? 0,
          analytics.taskDistribution?.todo ?? analytics.teamProgress?.todo ?? 0,
          analytics.taskDistribution?.in_progress ?? analytics.teamProgress?.in_progress ?? 0,
          analytics.taskDistribution?.review ?? analytics.teamProgress?.review ?? 0,
          analytics.taskDistribution?.done ?? analytics.teamProgress?.done ?? 0,
        ],
        colors: ['#6b7280', '#3b82f6', '#a855f7', '#f59e0b', '#22c55e'],
      }
    : null

  const monthlyTrends = analytics?.monthlyTrends || analytics?.monthlyTasks || []
  const monthlyLabels = monthlyTrends.map((m) => m.label || m.month || '')
  const monthlyValues = monthlyTrends.map((m) => m.count || m.tasks || 0)

  const tasksByUser = analytics?.tasksByUser || analytics?.userContributions || []
  const userLabels = tasksByUser.map((u) => u.name || u.user?.name || 'Unknown')
  const userValues = userLabels.length > 0
    ? [
        {
          label: 'Tasks',
          data: tasksByUser.map((u) => u.total || u.count || u.tasks || 0),
          backgroundColor: 'rgba(168, 85, 247, 0.8)',
        },
      ]
    : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-phantom-gray mt-1">Track your team's performance and productivity</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Hackathons"
          value={analytics?.totalHackathons ?? 0}
          icon={FiGrid}
          color="purple"
        />
        <StatCard
          title="Hackathons Won"
          value={analytics?.hackathonsWon ?? 0}
          icon={FiAward}
          color="green"
        />
        <StatCard
          title="Win Rate"
          value={analytics?.winRate != null ? `${Math.round(analytics.winRate)}%` : '0%'}
          icon={FiTarget}
          color="yellow"
        />
        <StatCard
          title="Tasks Completed"
          value={analytics?.completedTasks ?? 0}
          icon={FiCheckCircle}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DoughnutChart
          title="Task Distribution"
          data={taskDistributionData || { labels: [], values: [], colors: [] }}
          size={220}
        />
        <LineChart
          title="Monthly Productivity Trends"
          labels={monthlyLabels}
          datasets={monthlyLabels.length > 0 ? [{
            label: 'Tasks Created',
            data: monthlyValues,
            borderColor: '#a855f7',
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
          }] : []}
          height={250}
        />
      </div>

      {userLabels.length > 0 && (
        <BarChart
          title="Contributions by Teammate"
          labels={userLabels}
          datasets={userValues}
          height={250}
        />
      )}

      <div className="card">
        <h3 className="text-base font-semibold text-white mb-4">Recent Team Activity</h3>
        {teamActivity.length === 0 ? (
          <p className="text-phantom-gray text-sm py-4 text-center">No recent activity</p>
        ) : (
          <div className="space-y-1">
            {teamActivity.slice(0, 20).map((item, idx) => (
              <div key={item._id || idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-phantom-dark transition-colors">
                <div className="p-2 rounded-lg bg-phantom-purple/10 text-phantom-purple-light mt-0.5">
                  <FiActivity size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">
                    {item.user?.name || item.user || 'Someone'}{' '}
                    {item.action || 'updated'}{' '}
                    {item.task?.title || item.task || 'a task'}{' '}
                    {item.hackathon?.name || item.hackathon ? `in ${item.hackathon?.name || item.hackathon}` : ''}
                  </p>
                  <p className="text-xs text-phantom-gray mt-0.5">
                    {formatDistanceToNow(new Date(item.createdAt || item.timestamp || Date.now()), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
