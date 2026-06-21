import Badge from './Badge'

const statusMap = {
  planning: 'yellow',
  registered: 'blue',
  building: 'purple',
  submitted: 'cyan',
  completed: 'green',
  won: 'green',
  backlog: 'gray',
  todo: 'blue',
  in_progress: 'purple',
  review: 'yellow',
  done: 'green',
  low: 'green',
  medium: 'yellow',
  high: 'red',
  urgent: 'red',
}

export default function StatusBadge({ status }) {
  const variant = statusMap[status] || 'gray'
  const label = status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <Badge variant={variant}>
      {status === 'won' && (
        <span className="mr-1">✨</span>
      )}
      {status === 'urgent' && (
        <span className="mr-1 animate-pulse">!</span>
      )}
      {label}
    </Badge>
  )
}
