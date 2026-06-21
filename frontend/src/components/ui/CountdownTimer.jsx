import { useState, useEffect } from 'react'
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns'

export default function CountdownTimer({ deadline, onExpired, label }) {
  const [timeLeft, setTimeLeft] = useState(null)

  useEffect(() => {
    function calc() {
      const now = new Date()
      const end = new Date(deadline)

      if (end <= now) {
        setTimeLeft(null)
        if (onExpired) onExpired()
        return
      }

      const days = differenceInDays(end, now)
      const hours = differenceInHours(end, now) % 24
      const minutes = differenceInMinutes(end, now) % 60
      const seconds = differenceInSeconds(end, now) % 60

      setTimeLeft({ days, hours, minutes, seconds })
    }

    calc()
    const interval = setInterval(calc, 1000)
    return () => clearInterval(interval)
  }, [deadline, onExpired])

  const isExpired = timeLeft === null

  if (isExpired) {
    return (
      <div className="flex items-center gap-2">
        {label && <span className="text-sm text-phantom-gray">{label}:</span>}
        <span className="text-sm font-semibold text-red-400">OVERDUE</span>
      </div>
    )
  }

  const { days, hours, minutes } = timeLeft
  const isUrgent = days < 1
  const colorClass = isUrgent ? 'text-red-400' : 'text-phantom-gray-light'

  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-sm text-phantom-gray">{label}:</span>}
      <span className={`text-sm font-mono font-semibold ${colorClass}`}>
        {days > 0 && `${days}d `}
        {hours > 0 && `${hours}h `}
        {minutes}m
      </span>
      {isUrgent && (
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      )}
    </div>
  )
}
