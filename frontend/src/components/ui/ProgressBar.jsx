const colorClasses = {
  purple: 'bg-phantom-purple',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
  cyan: 'bg-cyan-500',
}

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
}

export default function ProgressBar({ value, label, color = 'purple', size = 'md' }) {
  const clampedValue = Math.min(100, Math.max(0, value))

  return (
    <div className="w-full">
      {(label || value !== undefined) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-sm text-phantom-gray">{label}</span>
          )}
          <span className="text-sm text-phantom-gray-light">{Math.round(clampedValue)}%</span>
        </div>
      )}
      <div className={`w-full bg-phantom-border rounded-full ${sizeClasses[size] || sizeClasses.md}`}>
        <div
          className={`${colorClasses[color] || colorClasses.purple} ${sizeClasses[size] || sizeClasses.md} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  )
}
