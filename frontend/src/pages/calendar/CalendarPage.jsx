import { useState } from 'react'
import { FiPlus, FiTrash2, FiEdit2, FiCalendar, FiClock, FiFilter, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { useQueryClient } from '@tanstack/react-query'
import { getEvents, createEvent, updateEvent, deleteEvent, getHackathons } from '../../api'
import { useEvents, useHackathons, keys } from '../../hooks'
import CalendarView from '../../components/calendar/CalendarView'
import Modal from '../../components/ui/Modal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import StatusBadge from '../../components/ui/StatusBadge'

const TYPE_OPTIONS = ['All', 'Hackathons', 'Meetings', 'Deadlines', 'Milestones', 'Other']

const TYPE_COLORS = {
  hackathon: '#a855f7',
  meeting: '#22c55e',
  deadline: '#ef4444',
  milestone: '#f59e0b',
  other: '#06b6d4',
}

const PRESET_COLORS = [
  { label: 'Purple', value: '#a855f7' },
  { label: 'Green', value: '#22c55e' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Yellow', value: '#eab308' },
  { label: 'Red', value: '#ef4444' },
  { label: 'Cyan', value: '#06b6d4' },
]

const initialForm = {
  title: '',
  description: '',
  start: '',
  end: '',
  type: 'other',
  color: '#a855f7',
  hackathon: '',
}

function toLocalDatetimeString(date) {
  if (!date) return ''
  const d = new Date(date)
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

export default function CalendarPage() {
  const queryClient = useQueryClient()
  const [typeFilter, setTypeFilter] = useState('All')
  const params = typeFilter !== 'All' ? { type: typeFilter.toLowerCase().slice(0, -1) } : {}
  const { data: events = [], isLoading, isError } = useEvents(params)
  const { data: hackathons = [] } = useHackathons()
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [detailModal, setDetailModal] = useState(false)
  const [formModal, setFormModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)

  const handleSelectEvent = (event) => {
    setSelectedEvent(event)
    setDetailModal(true)
  }

  const handleSelectSlot = (slotInfo) => {
    setEditingEvent(null)
    setForm({
      ...initialForm,
      start: toLocalDatetimeString(slotInfo.start),
      end: toLocalDatetimeString(slotInfo.end),
    })
    setFormModal(true)
  }

  const openCreate = () => {
    setEditingEvent(null)
    setForm(initialForm)
    setFormModal(true)
  }

  const openEdit = (event) => {
    setEditingEvent(event)
    setForm({
      title: event.title || '',
      description: event.description || '',
      start: toLocalDatetimeString(event.start),
      end: toLocalDatetimeString(event.end),
      type: event.type || 'other',
      color: event.color || '#a855f7',
      hackathon: event.hackathon?._id || '',
    })
    setFormModal(true)
    setDetailModal(false)
  }

  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('Title is required')
      return
    }
    if (!form.start || !form.end) {
      toast.error('Start and end times are required')
      return
    }
    setSubmitting(true)
    const payload = {
      ...form,
      hackathon: form.hackathon || null,
    }

    const promise = editingEvent
      ? updateEvent(editingEvent._id, payload)
      : createEvent(payload)

    promise
      .then(() => {
        queryClient.invalidateQueries({ queryKey: keys.events(params) })
        toast.success(editingEvent ? 'Event updated' : 'Event created')
        setFormModal(false)
        setEditingEvent(null)
        setForm(initialForm)
      })
      .catch(() => toast.error(editingEvent ? 'Failed to update event' : 'Failed to create event'))
      .finally(() => setSubmitting(false))
  }

  const handleDelete = (id) => {
    if (!window.confirm('Delete this event?')) return
    deleteEvent(id)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: keys.events(params) })
        setDetailModal(false)
        setSelectedEvent(null)
        toast.success('Event deleted')
      })
      .catch(() => toast.error('Failed to delete event'))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading calendar..." />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-red-400">Failed to load events</p>
        <button onClick={() => queryClient.invalidateQueries({ queryKey: keys.events(params) })} className="btn-primary">Retry</button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <p className="text-phantom-gray mt-1">Manage your schedule and events</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <FiPlus size={16} />
          Add Event
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
        <div className="flex items-center gap-2">
          <FiFilter size={16} className="text-phantom-gray" />
          <div className="flex flex-wrap gap-2">
            {TYPE_OPTIONS.map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  typeFilter === type
                    ? 'bg-phantom-purple text-white'
                    : 'bg-phantom-dark text-phantom-gray hover:text-white hover:bg-phantom-card'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon={<FiCalendar size={48} />}
          title="No events scheduled"
          description={typeFilter !== 'All' ? 'Try changing the event type filter' : 'Add your first event to get started'}
          action={typeFilter === 'All' ? { label: 'Add Event', onClick: openCreate } : undefined}
        />
      ) : (
        <CalendarView
          events={events}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
        />
      )}

      <Modal isOpen={detailModal} onClose={() => { setDetailModal(false); setSelectedEvent(null) }} title="Event Details" size="md">
        {selectedEvent && (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-bold text-white mb-3">{selectedEvent.title}</h3>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: TYPE_COLORS[selectedEvent.type] || selectedEvent.color || '#a855f7' }}
                />
                <StatusBadge status={selectedEvent.type || 'other'} />
              </div>
              <div className="space-y-2 text-sm text-phantom-gray">
                <p className="flex items-center gap-2">
                  <FiCalendar size={14} />
                  <span>Start: {format(new Date(selectedEvent.start), 'MMM d, yyyy h:mm a')}</span>
                </p>
                <p className="flex items-center gap-2">
                  <FiClock size={14} />
                  <span>End: {format(new Date(selectedEvent.end), 'MMM d, yyyy h:mm a')}</span>
                </p>
              </div>
              {selectedEvent.hackathon && (
                <p className="text-xs text-phantom-purple-light mt-2">
                  Hackathon: {selectedEvent.hackathon.name}
                </p>
              )}
            </div>
            {selectedEvent.description && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-1">Description</h4>
                <p className="text-sm text-phantom-gray-light whitespace-pre-wrap">{selectedEvent.description}</p>
              </div>
            )}
            <div className="flex items-center justify-between pt-3 border-t border-phantom-border">
              <button onClick={() => handleDelete(selectedEvent._id)} className="btn-danger flex items-center gap-2">
                <FiTrash2 size={14} />
                Delete
              </button>
              <button onClick={() => openEdit(selectedEvent)} className="btn-primary flex items-center gap-2">
                <FiEdit2 size={14} />
                Edit
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={formModal} onClose={() => { setFormModal(false); setEditingEvent(null); setForm(initialForm) }} title={editingEvent ? 'Edit Event' : 'Create Event'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Title *</label>
            <input name="title" value={form.title} onChange={handleFormChange} className="input-field w-full" placeholder="Event title" required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea name="description" value={form.description} onChange={handleFormChange} className="input-field w-full" rows={2} placeholder="Event description..." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date/Time *</label>
              <input type="datetime-local" name="start" value={form.start} onChange={handleFormChange} className="input-field w-full" required />
            </div>
            <div>
              <label className="label">End Date/Time *</label>
              <input type="datetime-local" name="end" value={form.end} onChange={handleFormChange} className="input-field w-full" required />
            </div>
            <div>
              <label className="label">Type</label>
              <select name="type" value={form.type} onChange={handleFormChange} className="input-field w-full">
                <option value="hackathon">Hackathon</option>
                <option value="meeting">Meeting</option>
                <option value="deadline">Deadline</option>
                <option value="milestone">Milestone</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Hackathon</label>
              <select name="hackathon" value={form.hackathon} onChange={handleFormChange} className="input-field w-full">
                <option value="">None</option>
                {hackathons.map((h) => (
                  <option key={h._id} value={h._id}>{h.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Color</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, color: c.value }))}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    form.color === c.value ? 'border-white scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setFormModal(false); setEditingEvent(null); setForm(initialForm) }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Saving...' : editingEvent ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
