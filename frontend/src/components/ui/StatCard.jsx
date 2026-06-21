import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi'

const colorMap = {
  purple: 'bg-phantom-purple/20 text-phantom-purple-light border-phantom-purple/30',
  green: 'bg-green-500/20 text-green-400 border-green-500/30',
  blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  red: 'bg-red-500/20 text-red-400 border-red-500/30',
  cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
}

export default function StatCard({ title, value, icon: Icon, color = 'purple', trend }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg border ${colorMap[color] || colorMap.purple}`}>
          {Icon && <Icon size={20} />}
        </div>
      </div>
      <p className="text-sm text-phantom-gray mb-1">{title}</p>
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold text-white">{value}</span>
        {trend && (
          <span
            className={`flex items-center gap-1 text-xs font-medium ${
              trend.isUp ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {trend.isUp ? <FiTrendingUp size={14} /> : <FiTrendingDown size={14} />}
            {trend.value}
          </span>
        )}
      </div>
    </div>
  )
}
