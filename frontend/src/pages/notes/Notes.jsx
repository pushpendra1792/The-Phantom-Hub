import { useState } from 'react'
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiFileText } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { useQueryClient } from '@tanstack/react-query'
import { getNotes, createNote, updateNote, deleteNote, getHackathons } from '../../api'
import { useNotes, useHackathons, keys } from '../../hooks'
import Modal from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'

const NOTE_TYPES = ['meeting_minutes', 'decision', 'planning', 'retrospective', 'general']

const TYPE_LABELS = {
  meeting_minutes: 'Meeting Minutes',
  decision: 'Decision',
  planning: 'Planning',
  retrospective: 'Retrospective',
  general: 'General',
}

const TYPE_COLORS = {
  meeting_minutes: 'blue',
  decision: 'purple',
  planning: 'green',
  retrospective: 'yellow',
  general: 'gray',
}

const initialForm = {
  title: '',
  type: 'general',
  content: '',
  hackathon: '',
  tags: [],
}

export default function Notes() {
  const queryClient = useQueryClient()
  const { data: notes = [], isLoading, isError } = useNotes()
  const { data: hackathons = [] } = useHackathons()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [hackathonFilter, setHackathonFilter] = useState('')
  const [selectedNote, setSelectedNote] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [formModal, setFormModal] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [tagInput, setTagInput] = useState('')

  const filtered = notes.filter((n) => {
    const matchesSearch = n.title?.toLowerCase().includes(search.toLowerCase()) || n.content?.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === 'All' || n.type === typeFilter
    const matchesHackathon = !hackathonFilter || n.hackathon?._id === hackathonFilter || n.hackathon === hackathonFilter
    return matchesSearch && matchesType && matchesHackathon
  })

  const openDetail = (note) => {
    setSelectedNote(note)
    setDetailOpen(true)
  }

  const openCreate = () => {
    setEditingNote(null)
    setForm(initialForm)
    setTagInput('')
    setFormModal(true)
  }

  const openEdit = (note) => {
    setEditingNote(note)
    setForm({
      title: note.title || '',
      type: note.type || 'general',
      content: note.content || '',
      hackathon: note.hackathon?._id || '',
      tags: note.tags || [],
    })
    setTagInput('')
    setFormModal(true)
  }

  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      const tag = tagInput.trim()
      if (!form.tags.includes(tag)) {
        setForm((prev) => ({ ...prev, tags: [...prev.tags, tag] }))
      }
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag) => {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('Title is required')
      return
    }
    if (!form.content.trim()) {
      toast.error('Content is required')
      return
    }
    setSubmitting(true)
    const payload = { ...form, hackathon: form.hackathon || null }
    const promise = editingNote ? updateNote(editingNote._id, payload) : createNote(payload)

    promise
      .then(() => {
        queryClient.invalidateQueries({ queryKey: keys.notes })
        toast.success(editingNote ? 'Note updated' : 'Note created')
        setFormModal(false)
        setEditingNote(null)
        setForm(initialForm)
      })
      .catch(() => toast.error(editingNote ? 'Failed to update note' : 'Failed to create note'))
      .finally(() => setSubmitting(false))
  }

  const handleDelete = (id) => {
    if (!window.confirm('Delete this note?')) return
    deleteNote(id)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: keys.notes })
        setDetailOpen(false)
        setSelectedNote(null)
        toast.success('Note deleted')
      })
      .catch(() => toast.error('Failed to delete note'))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading notes..." />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-red-400">Failed to load notes</p>
        <button onClick={() => queryClient.invalidateQueries({ queryKey: keys.notes })} className="btn-primary">Retry</button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Notes & Meeting Logs</h1>
          <p className="text-phantom-gray mt-1">Document your team meetings and decisions</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <FiPlus size={16} />
          New Note
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
        <div className="relative w-full sm:w-56">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-phantom-gray" size={16} />
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
        <select value={hackathonFilter} onChange={(e) => setHackathonFilter(e.target.value)} className="input-field w-full sm:w-48">
          <option value="">All Hackathons</option>
          {hackathons.map((h) => (
            <option key={h._id} value={h._id}>{h.name}</option>
          ))}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-field w-full sm:w-44">
          <option value="All">All Types</option>
          {NOTE_TYPES.map((t) => (
            <option key={t} value={t}>{TYPE_LABELS[t]}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FiFileText size={48} />}
          title="No notes yet"
          description={search || typeFilter !== 'All' || hackathonFilter ? 'Try adjusting your filters' : 'Create your first note to document your meetings'}
          action={!search && typeFilter === 'All' && !hackathonFilter ? { label: 'New Note', onClick: openCreate } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((note) => (
            <div
              key={note._id}
              onClick={() => openDetail(note)}
              className="card flex flex-col cursor-pointer hover:border-phantom-purple/50 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <Badge variant={TYPE_COLORS[note.type] || 'gray'}>{TYPE_LABELS[note.type] || note.type}</Badge>
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => openEdit(note)} className="p-1.5 text-phantom-gray hover:text-phantom-purple-light transition-colors" title="Edit">
                    <FiEdit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(note._id)} className="p-1.5 text-phantom-gray hover:text-red-400 transition-colors" title="Delete">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
              <h3 className="text-base font-bold text-white mb-2">{note.title}</h3>
              <p className="text-sm text-phantom-gray flex-1 line-clamp-3">
                {note.content?.length > 150 ? note.content.substring(0, 150) + '...' : note.content}
              </p>
              <div className="mt-3 pt-3 border-t border-phantom-border space-y-1.5">
                {note.hackathon?.name && (
                  <p className="text-xs text-phantom-purple-light">{note.hackathon.name}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-phantom-gray">{note.createdBy?.name || 'Unknown'}</span>
                  <span className="text-xs text-phantom-gray">{note.createdAt ? formatDistanceToNow(new Date(note.createdAt), { addSuffix: true }) : ''}</span>
                </div>
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {note.tags.map((tag) => (
                      <Badge key={tag} variant="gray">{tag}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={detailOpen} onClose={() => { setDetailOpen(false); setSelectedNote(null) }} title="Note Details" size="lg">
        {selectedNote && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={TYPE_COLORS[selectedNote.type] || 'gray'}>{TYPE_LABELS[selectedNote.type] || selectedNote.type}</Badge>
            </div>
            <h3 className="text-xl font-bold text-white">{selectedNote.title}</h3>
            <div className="flex flex-wrap gap-4 text-xs text-phantom-gray">
              {selectedNote.hackathon?.name && <span>Hackathon: {selectedNote.hackathon.name}</span>}
              <span>By: {selectedNote.createdBy?.name || 'Unknown'}</span>
              <span>{selectedNote.createdAt ? formatDistanceToNow(new Date(selectedNote.createdAt), { addSuffix: true }) : ''}</span>
            </div>
            {selectedNote.content && (
              <div className="p-4 rounded-lg bg-phantom-dark">
                {selectedNote.content.split('\n').map((line, i) => (
                  <p key={i} className="text-sm text-phantom-gray-light whitespace-pre-wrap mb-1">{line}</p>
                ))}
              </div>
            )}
            {selectedNote.tags && selectedNote.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedNote.tags.map((tag) => (
                  <Badge key={tag} variant="gray">{tag}</Badge>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between pt-3 border-t border-phantom-border">
              <button onClick={() => handleDelete(selectedNote._id)} className="btn-danger flex items-center gap-2">
                <FiTrash2 size={14} />
                Delete
              </button>
              <button onClick={() => { setDetailOpen(false); openEdit(selectedNote) }} className="btn-primary flex items-center gap-2">
                <FiEdit2 size={14} />
                Edit
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={formModal} onClose={() => { setFormModal(false); setEditingNote(null); setForm(initialForm); setTagInput('') }} title={editingNote ? 'Edit Note' : 'New Note'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Title *</label>
            <input name="title" value={form.title} onChange={handleFormChange} className="input-field w-full" placeholder="Note title" required />
          </div>
          <div>
            <label className="label">Type</label>
            <select name="type" value={form.type} onChange={handleFormChange} className="input-field w-full">
              {NOTE_TYPES.map((t) => (
                <option key={t} value={t}>{TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Content *</label>
            <textarea name="content" value={form.content} onChange={handleFormChange} className="input-field w-full" rows={6} placeholder="Write your notes here..." required />
          </div>
          <div>
            <label className="label">Hackathon (optional)</label>
            <select name="hackathon" value={form.hackathon} onChange={handleFormChange} className="input-field w-full">
              <option value="">None</option>
              {hackathons.map((h) => (
                <option key={h._id} value={h._id}>{h.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Tags (press Enter to add)</label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="input-field w-full"
              placeholder="Type tag and press Enter..."
            />
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.tags.map((tag) => (
                  <span key={tag} className="badge-purple flex items-center gap-1 cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                    {tag}
                    <FiTrash2 size={10} />
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setFormModal(false); setEditingNote(null); setForm(initialForm); setTagInput('') }} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Saving...' : editingNote ? 'Save Note' : 'Create Note'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
