import { NavLink } from 'react-router-dom'
import { FiHome, FiGrid, FiCheckSquare, FiFolder, FiCalendar, FiUsers, FiFileText, FiBell, FiBarChart2, FiUser, FiLogOut, FiX } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { useState, useEffect } from 'react'
import { getNotifications } from '../../api'

const links = [
  { to: '/', icon: FiHome, label: 'Dashboard' },
  { to: '/hackathons', icon: FiGrid, label: 'Hackathons' },
  { to: '/tasks', icon: FiCheckSquare, label: 'Tasks' },
  { to: '/resources', icon: FiFolder, label: 'Resources' },
  { to: '/calendar', icon: FiCalendar, label: 'Calendar' },
  { to: '/team', icon: FiUsers, label: 'Team' },
  { to: '/notes', icon: FiFileText, label: 'Notes' },
  { to: '/notifications', icon: FiBell, label: 'Notifications' },
  { to: '/analytics', icon: FiBarChart2, label: 'Analytics' },
]

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    getNotifications()
      .then((res) => {
        const unread = res.data.filter((n) => !n.read).length
        setUnreadCount(unread)
      })
      .catch(() => {})
  }, [])

  return (
    <aside
      className={`fixed top-0 left-0 z-40 w-64 h-full bg-phantom-black border-r border-phantom-border transform transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-6 py-5 border-b border-phantom-border">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👻</span>
            <span className="text-lg font-bold text-gradient tracking-wider">PHANTOMS HUB</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-phantom-gray hover:text-white transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <link.icon size={18} />
              <span className="flex-1">{link.label}</span>
              {link.to === '/notifications' && unreadCount > 0 && (
                <span className="bg-phantom-purple text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-phantom-border space-y-1">
          <NavLink
            to="/profile"
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <FiUser size={18} />
            <span className="flex-1">
              {user?.name || 'Profile'}
            </span>
          </NavLink>
          <button
            onClick={logout}
            className="sidebar-link w-full text-left"
          >
            <FiLogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
