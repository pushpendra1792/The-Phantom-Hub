import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/dashboard/Dashboard'
import Hackathons from './pages/hackathons/Hackathons'
import HackathonDetails from './pages/hackathons/HackathonDetails'
import Tasks from './pages/tasks/Tasks'
import Resources from './pages/resources/Resources'
import CalendarPage from './pages/calendar/CalendarPage'
import Team from './pages/team/Team'
import Notes from './pages/notes/Notes'
import Notifications from './pages/notifications/Notifications'
import Analytics from './pages/analytics/Analytics'
import Profile from './pages/auth/Profile'
import MainLayout from './components/layout/MainLayout'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-phantom-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-phantom-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-phantom-gray font-mono text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
      <Route path="/" element={user ? <MainLayout /> : <Navigate to="/login" />}>
        <Route index element={<Dashboard />} />
        <Route path="hackathons" element={<Hackathons />} />
        <Route path="hackathons/:id" element={<HackathonDetails />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="resources" element={<Resources />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="team" element={<Team />} />
        <Route path="notes" element={<Notes />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
