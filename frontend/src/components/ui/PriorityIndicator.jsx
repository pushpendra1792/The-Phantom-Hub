const priorityConfig = {
  low: { dot: 'bg-green-500', label: 'Low', icon: null },
  medium: { dot: 'bg-yellow-500', label: 'Medium', icon: null },
  high: { dot: 'bg-orange-500', label: 'High', icon: null },
  urgent: { dot: 'bg-red-500', label: 'Urgent', icon: '!' },
}

export default function PriorityIndicator({ priority }) {
  const config = priorityConfig[priority] || priorityConfig.low

  return (
    <div className="flex items-center gap-2">
      <span className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
      <span className="text-sm text-phantom-gray-light">{config.label}</span>
      {config.icon && (
        <span className="text-xs font-bold text-red-400 animate-pulse">{config.icon}</span>
      )}
    </div>
  )
}
