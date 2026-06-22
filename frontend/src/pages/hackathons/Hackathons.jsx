import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiSearch, FiPlus, FiTrash2, FiExternalLink, FiGrid } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { format, differenceInDays } from 'date-fns'
import { useQueryClient } from '@tanstack/react-query'
import { getHackathons, createHackathon, archiveHackathon } from '../../api'
import { useHackathons, keys } from '../../hooks'
import Modal from '../../components/ui/Modal'
import StatusBadge from '../../components/ui/StatusBadge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import ProgressBar from '../../components/ui/ProgressBar'
import CountdownTimer from '../../components/ui/CountdownTimer'

const STATUS_TABS = ['All', 'planning', 'registered', 'building', 'submitted', 'completed', 'won']

function calcDateProgress(start, end) {
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  const n = Date.now()
  if (n <= s) return 0
  if (n >= e) return 100
  return ((n - s) / (e - s)) * 100
}

const initialForm = {
  name: '',
  organizer: '',
  website: '',
  description: '',
  theme: '',
  status: 'planning',
  registrationDeadline: '',
  startDate: '',
  endDate: '',
  submissionDeadline: '',
  githubRepo: '',
  figmaLink: '',
}

export default function Hackathons() {
  const queryClient = useQueryClient()
  const { data: hackathons = [], isLoading, isError, error } = useHackathons()
  const [search, setSearch] = useState('')
  const [statusTab, setStatusTab] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)

  const filtered = hackathons.filter((h) => {
    const matchesSearch = h.name?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusTab === 'All' || h.status === statusTab
    return matchesSearch && matchesStatus
  })

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleCreate = (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }
    setSubmitting(true)
    createHackathon(form)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: keys.hackathons })
        toast.success('Hackathon created')
        setModalOpen(false)
        setForm(initialForm)
      })
      .catch(() => toast.error('Failed to create hackathon'))
      .finally(() => setSubmitting(false))
  }

  const handleArchive = (id) => {
    if (!window.confirm('Archive this hackathon?')) return
    archiveHackathon(id)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: keys.hackathons })
        toast.success('Hackathon archived')
      })
      .catch(() => toast.error('Failed to archive hackathon'))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading hackathons..." />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-red-400">{error?.message || 'Failed to load hackathons'}</p>
        <button onClick={() => queryClient.invalidateQueries({ queryKey: keys.hackathons })} className="btn-primary">Retry</button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Hackathons</h1>
          <p className="text-phantom-gray mt-1">Manage your hackathon projects</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
          <FiPlus size={16} />
          Create Hackathon
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-phantom-gray" size={16} />
          <input
            type="text"
            placeholder="Search hackathons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
        <div className="flex flex-wrap gap-2">
                  {STATUS_TABS.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setStatusTab(tab)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        statusTab === tab
                          ? 'bg-phantom-purple text-white'
                          : 'bg-phantom-dark text-phantom-gray hover:text-white hover:bg-phantom-card'
                      }`}
                    >
                      {tab === 'All' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FiGrid size={48} />}
          title="No hackathons found"
          description={search || statusTab !== 'All' ? 'Try adjusting your filters' : 'Create your first hackathon to get started'}
          action={!search && statusTab === 'All' ? { label: 'Create Hackathon', onClick: () => setModalOpen(true) } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((h) => (
            <div key={h._id} className="card flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <StatusBadge status={h.status} />
                <button
                  onClick={() => handleArchive(h._id)}
                  className="text-phantom-gray hover:text-red-400 transition-colors p-1"
                  title="Archive"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{h.name}</h3>
                {h.organizer && (
                  <p className="text-sm text-phantom-gray mt-1">{h.organizer}</p>
                )}
                {h.theme && (
                  <p className="text-xs text-phantom-purple-light bg-phantom-purple/10 px-2 py-0.5 rounded inline-block mt-1">
                    {h.theme}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1 text-xs text-phantom-gray">
                {h.startDate && h.endDate ? (
                  <p>
                    {format(new Date(h.startDate), 'MMM d')} - {format(new Date(h.endDate), 'MMM d, yyyy')}
                  </p>
                ) : h.startDate ? (
                  <p>Starts {format(new Date(h.startDate), 'MMM d, yyyy')}</p>
                ) : null}
              </div>
              {h.submissionDeadline && (
                <CountdownTimer deadline={h.submissionDeadline} label="Deadline" />
              )}
              {!h.submissionDeadline && h.startDate && differenceInDays(new Date(h.startDate), new Date()) > 0 && (
                <p className="text-sm text-phantom-gray-light">
                  {differenceInDays(new Date(h.startDate), new Date())} days until start
                </p>
              )}
              {['building', 'submitted'].includes(h.status) && h.startDate && h.endDate && (
                <ProgressBar value={calcDateProgress(h.startDate, h.endDate)} size="sm" />
              )}
              <div className="flex items-center justify-between pt-3 border-t border-phantom-border mt-auto">
                <Link
                  to={`/hackathons/${h._id}`}
                  className="flex items-center gap-1.5 text-sm text-phantom-purple-light hover:text-phantom-purple transition-colors font-medium"
                >
                  View Workspace
                  <FiExternalLink size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setForm(initialForm) }} title="Create Hackathon" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Name *</label>
              <input name="name" value={form.name} onChange={handleChange} className="input-field w-full" placeholder="Hackathon name" required />
            </div>
            <div>
              <label className="label">Organizer</label>
              <input name="organizer" value={form.organizer} onChange={handleChange} className="input-field w-full" placeholder="Organizer name" />
            </div>
            <div>
              <label className="label">Website</label>
              <input name="website" value={form.website} onChange={handleChange} className="input-field w-full" placeholder="https://..." />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} className="input-field w-full" rows={3} placeholder="Describe the hackathon..." />
            </div>
            <div>
              <label className="label">Theme</label>
              <input name="theme" value={form.theme} onChange={handleChange} className="input-field w-full" placeholder="Theme" />
            </div>
            <div>
              <label className="label">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="input-field w-full">
                <option value="planning">Planning</option>
                <option value="registered">Registered</option>
                <option value="building">Building</option>
                <option value="submitted">Submitted</option>
                <option value="completed">Completed</option>
                <option value="won">Won</option>
              </select>
            </div>
            <div>
              <label className="label">Registration Deadline</label>
              <input type="date" name="registrationDeadline" value={form.registrationDeadline} onChange={handleChange} className="input-field w-full" />
            </div>
            <div>
              <label className="label">Start Date</label>
              <input type="date" name="startDate" value={form.startDate} onChange={handleChange} className="input-field w-full" />
            </div>
            <div>
              <label className="label">End Date</label>
              <input type="date" name="endDate" value={form.endDate} onChange={handleChange} className="input-field w-full" />
            </div>
            <div>
              <label className="label">Submission Deadline</label>
              <input type="date" name="submissionDeadline" value={form.submissionDeadline} onChange={handleChange} className="input-field w-full" />
            </div>
            <div>
              <label className="label">GitHub Repo</label>
              <input name="githubRepo" value={form.githubRepo} onChange={handleChange} className="input-field w-full" placeholder="https://github.com/..." />
            </div>
            <div>
              <label className="label">Figma Link</label>
              <input name="figmaLink" value={form.figmaLink} onChange={handleChange} className="input-field w-full" placeholder="https://figma.com/..." />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setModalOpen(false); setForm(initialForm) }} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Creating...' : 'Create Hackathon'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
