import { FiBell, FiCheck, FiCheckSquare, FiClock, FiMessageSquare, FiUpload, FiGrid, FiTrash2, FiCheckCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { useQueryClient } from '@tanstack/react-query'
import { markAsRead, markAllAsRead, deleteNotification } from '../../api'
import { useNotifications, keys } from '../../hooks'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'

const NOTIFICATION_ICONS = {
  task: FiCheckSquare,
  deadline: FiClock,
  comment: FiMessageSquare,
  upload: FiUpload,
  hackathon: FiGrid,
  general: FiBell,
}

export default function Notifications() {
  const queryClient = useQueryClient()
  const { data: notifications = [], isLoading, isError } = useNotifications()

  const handleMarkAsRead = (id) => {
    markAsRead(id)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: keys.notifications })
        toast.success('Marked as read')
      })
      .catch(() => toast.error('Failed to mark as read'))
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead()
      .then(() => {
        queryClient.invalidateQueries({ queryKey: keys.notifications })
        toast.success('All notifications marked as read')
      })
      .catch(() => toast.error('Failed to mark all as read'))
  }

  const handleDelete = (id) => {
    if (!window.confirm('Delete this notification?')) return
    deleteNotification(id)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: keys.notifications })
        toast.success('Notification deleted')
      })
      .catch(() => toast.error('Failed to delete notification'))
  }

  const sorted = [...notifications].sort((a, b) => new Date(b.createdAt || b.timestamp || 0) - new Date(a.createdAt || a.timestamp || 0))

  const unreadCount = notifications.filter((n) => !n.isRead).length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading notifications..." />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-red-400">Failed to load notifications</p>
        <button onClick={() => queryClient.invalidateQueries({ queryKey: keys.notifications })} className="btn-primary">Retry</button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-phantom-gray mt-1">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'No unread notifications'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllAsRead} className="btn-primary flex items-center gap-2">
            <FiCheckCircle size={16} />
            Mark All as Read
          </button>
        )}
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={<FiBell size={48} />}
          title="No notifications"
          description="You're all caught up! Notifications will appear here when there's activity."
        />
      ) : (
        <div className="space-y-2">
          {sorted.map((notification) => {
            const IconComponent = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.general
            return (
              <div
                key={notification._id}
                className={`card flex items-start gap-4 p-4 transition-all duration-200 group ${
                  !notification.isRead ? 'border-l-4 border-l-phantom-purple bg-phantom-card/80' : 'border-l-4 border-l-gray-600'
                }`}
              >
                <div className={`p-2.5 rounded-lg flex-shrink-0 ${
                  !notification.isRead ? 'bg-phantom-purple/20 text-phantom-purple-light' : 'bg-phantom-dark text-phantom-gray'
                }`}>
                  <IconComponent size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`text-sm ${!notification.isRead ? 'text-white font-semibold' : 'text-phantom-gray-light'}`}>
                        {notification.title}
                      </p>
                      {notification.message && (
                        <p className="text-sm text-phantom-gray mt-0.5">{notification.message}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="p-1.5 text-phantom-gray hover:text-phantom-purple-light transition-colors opacity-0 group-hover:opacity-100"
                          title="Mark as read"
                        >
                          <FiCheck size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification._id)}
                        className="p-1.5 text-phantom-gray hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-phantom-gray mt-1.5">
                    {formatDistanceToNow(new Date(notification.createdAt || notification.timestamp || Date.now()), { addSuffix: true })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
