import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiSearch, FiBell, FiUser, FiLogOut, FiMenu } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { getNotifications } from '../../api'

const pageTitles = {
  '/': 'Dashboard',
  '/hackathons': 'Hackathons',
  '/tasks': 'Tasks',
  '/resources': 'Resources',
  '/calendar': 'Calendar',
  '/team': 'Team',
  '/notes': 'Notes',
  '/notifications': 'Notifications',
  '/analytics': 'Analytics',
  '/profile': 'Profile',
}

export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const currentTitle = Object.entries(pageTitles).find(([path]) =>
    location.pathname === path ? true :
    path !== '/' && location.pathname.startsWith(path)
  )?.[1] || 'Dashboard'

  useEffect(() => {
    getNotifications()
      .then((res) => {
        const unread = res.data.filter((n) => !n.read).length
        setUnreadCount(unread)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/tasks?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-phantom-dark border-b border-phantom-border z-30 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden text-phantom-gray hover:text-white transition-colors"
        >
          <FiMenu size={22} />
        </button>
        <h1 className="text-lg font-semibold text-white">{currentTitle}</h1>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <div className="relative hidden sm:block">
          <FiSearch
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-phantom-gray"
          />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="pl-9 pr-4 py-2 w-48 md:w-64 bg-phantom-black border border-phantom-border rounded-lg text-sm text-white placeholder-phantom-gray focus:outline-none focus:border-phantom-purple transition-colors"
          />
        </div>

        <Link
          to="/notifications"
          className="relative p-2 text-phantom-gray hover:text-white transition-colors"
        >
          <FiBell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-phantom-purple text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-phantom-card transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-phantom-purple/20 border border-phantom-purple/30 flex items-center justify-center">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt=""
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <FiUser size={16} className="text-phantom-purple-light" />
              )}
            </div>
            <span className="hidden md:block text-sm text-white max-w-[100px] truncate">
              {user?.name || 'User'}
            </span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-phantom-card border border-phantom-border rounded-xl shadow-xl py-2">
              <Link
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-phantom-gray hover:text-white hover:bg-phantom-dark transition-colors"
              >
                <FiUser size={16} />
                Profile
              </Link>
              <hr className="border-phantom-border my-1" />
              <button
                onClick={() => {
                  setDropdownOpen(false)
                  logout()
                }}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-phantom-gray hover:text-red-400 hover:bg-phantom-dark transition-colors w-full text-left"
              >
                <FiLogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
