import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  FiArrowLeft, FiEdit2, FiTrash2, FiExternalLink, FiThumbsUp,
  FiMessageSquare, FiPlus, FiChevronLeft, FiChevronRight, FiUpload, FiCalendar, FiCheckSquare,
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import {
  getHackathon, updateHackathon, deleteHackathon,
  getIdeas, createIdea, voteIdea, selectIdea, addComment,
  getTasks, createTask, updateTask, updateTaskStatus, deleteTask,
  getResourcesByHackathon, uploadResource, deleteResource,
  getNotesByHackathon, createNote, deleteNote,
  getEvents, getTeamMembers,
} from '../../api'
import Modal from '../../components/ui/Modal'
import StatusBadge from '../../components/ui/StatusBadge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import ProgressBar from '../../components/ui/ProgressBar'
import CountdownTimer from '../../components/ui/CountdownTimer'
import StatCard from '../../components/ui/StatCard'
import PriorityIndicator from '../../components/ui/PriorityIndicator'
import CalendarView from '../../components/calendar/CalendarView'

const TABS = ['Overview', 'Ideas', 'Tasks', 'Resources', 'Notes', 'Calendar']

const TASK_STATUSES = ['backlog', 'todo', 'in_progress', 'review', 'done']
const TASK_COLUMNS = [
  { key: 'backlog', label: 'Backlog' },
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'review', label: 'Review' },
  { key: 'done', label: 'Done' },
]

function calcDateProgress(start, end) {
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  const n = Date.now()
  if (n <= s) return 0
  if (n >= e) return 100
  return ((n - s) / (e - s)) * 100
}

function TagInput({ tags, onChange, placeholder }) {
  const [input, setInput] = useState('')
  const add = () => {
    const val = input.trim()
    if (val && !tags.includes(val)) {
      onChange([...tags, val])
    }
    setInput('')
  }
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((t) => (
          <span key={t} className="flex items-center gap-1 text-xs bg-phantom-purple/20 text-phantom-purple-light px-2 py-0.5 rounded-full">
            {t}
            <button type="button" onClick={() => onChange(tags.filter((x) => x !== t))} className="hover:text-white">&times;</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder={placeholder || 'Add...'}
          className="input-field flex-1 text-sm"
        />
        <button type="button" onClick={add} className="btn-primary text-sm px-3 py-1">Add</button>
      </div>
    </div>
  )
}

export default function HackathonDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [hackathon, setHackathon] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Overview')
  const [editModal, setEditModal] = useState(false)
  const [ideas, setIdeas] = useState([])
  const [tasks, setTasks] = useState([])
  const [team, setTeam] = useState([])
  const [resources, setResources] = useState([])
  const [notes, setNotes] = useState([])
  const [events, setEvents] = useState([])
  const [expandedIdea, setExpandedIdea] = useState(null)
  const [ideaModal, setIdeaModal] = useState(false)
  const [taskModal, setTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [commentText, setCommentText] = useState({})
  const [uploading, setUploading] = useState(false)
  const [noteModal, setNoteModal] = useState(false)
  const [noteForm, setNoteForm] = useState({ title: '', content: '' })

  const [form, setForm] = useState({
    name: '', organizer: '', website: '', description: '', theme: '', status: 'planning',
    registrationDeadline: '', startDate: '', endDate: '', submissionDeadline: '', githubRepo: '', figmaLink: '',
  })

  const [taskForm, setTaskForm] = useState({
    title: '', description: '', status: 'backlog', priority: 'medium', assignee: '', deadline: '', labels: [],
  })

  const [ideaForm, setIdeaForm] = useState({
    title: '', description: '', researchLinks: [], references: [], notes: '',
  })

  const fetchHackathon = useCallback(() => {
    setLoading(true)
    getHackathon(id)
      .then((res) => {
        setHackathon(res.data)
        const h = res.data
        setForm({
          name: h.name || '', organizer: h.organizer || '', website: h.website || '',
          description: h.description || '', theme: h.theme || '', status: h.status || 'planning',
          registrationDeadline: h.registrationDeadline ? h.registrationDeadline.slice(0, 10) : '',
          startDate: h.startDate ? h.startDate.slice(0, 10) : '',
          endDate: h.endDate ? h.endDate.slice(0, 10) : '',
          submissionDeadline: h.submissionDeadline ? h.submissionDeadline.slice(0, 10) : '',
          githubRepo: h.githubRepo || '', figmaLink: h.figmaLink || '',
        })
      })
      .catch(() => toast.error('Failed to load hackathon'))
      .finally(() => setLoading(false))
  }, [id])

  const fetchIdeas = useCallback(() => {
    getIdeas(id).then((res) => setIdeas(res.data)).catch(() => {})
  }, [id])

  const fetchTasks = useCallback(() => {
    getTasks({ hackathon: id }).then((res) => setTasks(res.data)).catch(() => {})
  }, [id])

  const fetchResources = useCallback(() => {
    getResourcesByHackathon(id).then((res) => setResources(res.data)).catch(() => {})
  }, [id])

  const fetchNotes = useCallback(() => {
    getNotesByHackathon(id).then((res) => setNotes(res.data)).catch(() => {})
  }, [id])

  const fetchEvents = useCallback(() => {
    getEvents({ hackathon: id }).then((res) => setEvents(res.data)).catch(() => {})
  }, [id])

  const fetchTeam = useCallback(() => {
    getTeamMembers().then((res) => setTeam(res.data)).catch(() => {})
  }, [])

  useEffect(() => { fetchHackathon() }, [fetchHackathon])

  useEffect(() => {
    if (activeTab === 'Ideas') fetchIdeas()
    else if (activeTab === 'Tasks') { fetchTasks(); fetchTeam() }
    else if (activeTab === 'Resources') fetchResources()
    else if (activeTab === 'Notes') fetchNotes()
    else if (activeTab === 'Calendar') fetchEvents()
  }, [activeTab, fetchIdeas, fetchTasks, fetchResources, fetchNotes, fetchEvents, fetchTeam])

  const handleEdit = (e) => {
    e.preventDefault()
    updateHackathon(id, form)
      .then((res) => {
        setHackathon(res.data)
        toast.success('Hackathon updated')
        setEditModal(false)
      })
      .catch(() => toast.error('Failed to update hackathon'))
  }

  const handleDelete = () => {
    if (!window.confirm('Delete this hackathon permanently?')) return
    deleteHackathon(id)
      .then(() => {
        toast.success('Hackathon deleted')
        navigate('/hackathons')
      })
      .catch(() => toast.error('Failed to delete hackathon'))
  }

  const handleCreateIdea = (e) => {
    e.preventDefault()
    if (!ideaForm.title.trim()) { toast.error('Title is required'); return }
    createIdea(id, ideaForm)
      .then((res) => {
        setIdeas((prev) => [...prev, res.data])
        toast.success('Idea created')
        setIdeaModal(false)
        setIdeaForm({ title: '', description: '', researchLinks: [], references: [], notes: '' })
      })
      .catch(() => toast.error('Failed to create idea'))
  }

  const handleVote = (ideaId) => {
    voteIdea(ideaId)
      .then((res) => {
        setIdeas((prev) => prev.map((i) => (i._id === ideaId ? { ...i, votes: res.data.votes, voteCount: res.data.voteCount } : i)))
      })
      .catch(() => toast.error('Failed to vote'))
  }

  const handleSelectIdea = (ideaId) => {
    selectIdea(ideaId)
      .then((res) => {
        setIdeas((prev) => prev.map((i) => (i._id === ideaId ? { ...i, isSelected: res.data.isSelected } : i)))
        toast.success(res.data.isSelected ? 'Idea selected' : 'Idea unselected')
      })
      .catch(() => toast.error('Failed to update idea selection'))
  }

  const handleAddComment = (ideaId) => {
    const text = commentText[ideaId]
    if (!text?.trim()) return
    addComment(ideaId, { text })
      .then((res) => {
        setIdeas((prev) => prev.map((i) => (i._id === ideaId ? { ...i, comments: [...(i.comments || []), res.data] } : i)))
        setCommentText((prev) => ({ ...prev, [ideaId]: '' }))
        toast.success('Comment added')
      })
      .catch(() => toast.error('Failed to add comment'))
  }

  const handleCreateTask = (e) => {
    e.preventDefault()
    if (!taskForm.title.trim()) { toast.error('Title is required'); return }
    const data = { ...taskForm, hackathon: id }
    createTask(data)
      .then((res) => {
        setTasks((prev) => [...prev, res.data])
        toast.success('Task created')
        setTaskModal(false)
        setEditingTask(null)
        setTaskForm({ title: '', description: '', status: 'backlog', priority: 'medium', assignee: '', deadline: '', labels: [] })
      })
      .catch(() => toast.error('Failed to create task'))
  }

  const handleUpdateTask = (e) => {
    e.preventDefault()
    if (!taskForm.title.trim()) { toast.error('Title is required'); return }
    updateTask(editingTask, taskForm)
      .then((res) => {
        setTasks((prev) => prev.map((t) => (t._id === editingTask ? res.data : t)))
        toast.success('Task updated')
        setTaskModal(false)
        setEditingTask(null)
        setTaskForm({ title: '', description: '', status: 'backlog', priority: 'medium', assignee: '', deadline: '', labels: [] })
      })
      .catch(() => toast.error('Failed to update task'))
  }

  const handleMoveTask = (taskId, direction) => {
    const task = tasks.find((t) => t._id === taskId)
    if (!task) return
    const idx = TASK_STATUSES.indexOf(task.status)
    const newIdx = idx + direction
    if (newIdx < 0 || newIdx >= TASK_STATUSES.length) return
    const newStatus = TASK_STATUSES[newIdx]
    updateTaskStatus(taskId, { status: newStatus })
      .then(() => {
        setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t)))
        toast.success(`Moved to ${newStatus.replace('_', ' ')}`)
      })
      .catch(() => toast.error('Failed to move task'))
  }

  const handleDeleteTask = (taskId) => {
    if (!window.confirm('Delete this task?')) return
    deleteTask(taskId)
      .then(() => {
        setTasks((prev) => prev.filter((t) => t._id !== taskId))
        toast.success('Task deleted')
      })
      .catch(() => toast.error('Failed to delete task'))
  }

  const handleUploadResource = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const data = new FormData()
    data.append('file', file)
    data.append('hackathon', id)
    uploadResource(data)
      .then((res) => {
        setResources((prev) => [...prev, res.data])
        toast.success('Resource uploaded')
      })
      .catch(() => toast.error('Failed to upload resource'))
      .finally(() => { setUploading(false); e.target.value = '' })
  }

  const handleDeleteResource = (resourceId) => {
    if (!window.confirm('Delete this resource?')) return
    deleteResource(resourceId)
      .then(() => {
        setResources((prev) => prev.filter((r) => r._id !== resourceId))
        toast.success('Resource deleted')
      })
      .catch(() => toast.error('Failed to delete resource'))
  }

  const handleCreateNote = (e) => {
    e.preventDefault()
    if (!noteForm.title.trim()) { toast.error('Title is required'); return }
    createNote({ ...noteForm, hackathon: id })
      .then((res) => {
        setNotes((prev) => [...prev, res.data])
        toast.success('Note created')
        setNoteModal(false)
        setNoteForm({ title: '', content: '' })
      })
      .catch(() => toast.error('Failed to create note'))
  }

  const handleDeleteNote = (noteId) => {
    if (!window.confirm('Delete this note?')) return
    deleteNote(noteId)
      .then(() => {
        setNotes((prev) => prev.filter((n) => n._id !== noteId))
        toast.success('Note deleted')
      })
      .catch(() => toast.error('Failed to delete note'))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading hackathon..." />
      </div>
    )
  }

  if (!hackathon) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-phantom-gray">Hackathon not found</p>
        <Link to="/hackathons" className="btn-primary">Back to Hackathons</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center flex-wrap gap-4">
        <Link to="/hackathons" className="text-phantom-gray hover:text-white transition-colors p-1">
          <FiArrowLeft size={20} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-white truncate">{hackathon.name}</h1>
            <StatusBadge status={hackathon.status} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setEditModal(true)} className="btn-secondary flex items-center gap-2">
            <FiEdit2 size={14} />
            Edit
          </button>
          <button onClick={handleDelete} className="btn-secondary text-red-400 hover:text-red-300 flex items-center gap-2">
            <FiTrash2 size={14} />
            Delete
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-phantom-border pb-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab
                ? 'text-phantom-purple-light border-b-2 border-phantom-purple bg-phantom-dark'
                : 'text-phantom-gray hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card space-y-4">
              <h3 className="text-base font-semibold text-white">Details</h3>
              <div className="space-y-3 text-sm">
                {hackathon.organizer && (
                  <div><span className="text-phantom-gray">Organizer:</span> <span className="text-white ml-2">{hackathon.organizer}</span></div>
                )}
                {hackathon.website && (
                  <div>
                    <span className="text-phantom-gray">Website:</span>
                    <a href={hackathon.website} target="_blank" rel="noopener noreferrer" className="text-phantom-purple-light hover:underline ml-2 inline-flex items-center gap-1">
                      {hackathon.website} <FiExternalLink size={12} />
                    </a>
                  </div>
                )}
                {hackathon.theme && (
                  <div><span className="text-phantom-gray">Theme:</span> <span className="text-phantom-purple-light ml-2">{hackathon.theme}</span></div>
                )}
                {hackathon.description && (
                  <div>
                    <span className="text-phantom-gray">Description:</span>
                    <p className="text-white mt-1 whitespace-pre-wrap">{hackathon.description}</p>
                  </div>
                )}
                {hackathon.startDate && (
                  <div><span className="text-phantom-gray">Start:</span> <span className="text-white ml-2">{format(new Date(hackathon.startDate), 'MMM d, yyyy')}</span></div>
                )}
                {hackathon.endDate && (
                  <div><span className="text-phantom-gray">End:</span> <span className="text-white ml-2">{format(new Date(hackathon.endDate), 'MMM d, yyyy')}</span></div>
                )}
                {hackathon.registrationDeadline && (
                  <div><span className="text-phantom-gray">Registration Deadline:</span> <span className="text-white ml-2">{format(new Date(hackathon.registrationDeadline), 'MMM d, yyyy')}</span></div>
                )}
                {hackathon.githubRepo && (
                  <div>
                    <span className="text-phantom-gray">GitHub:</span>
                    <a href={hackathon.githubRepo} target="_blank" rel="noopener noreferrer" className="text-phantom-purple-light hover:underline ml-2 inline-flex items-center gap-1">
                      {hackathon.githubRepo} <FiExternalLink size={12} />
                    </a>
                  </div>
                )}
                {hackathon.figmaLink && (
                  <div>
                    <span className="text-phantom-gray">Figma:</span>
                    <a href={hackathon.figmaLink} target="_blank" rel="noopener noreferrer" className="text-phantom-purple-light hover:underline ml-2 inline-flex items-center gap-1">
                      {hackathon.figmaLink} <FiExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>
            </div>
            <div className="card space-y-4">
              <h3 className="text-base font-semibold text-white">Progress</h3>
              {hackathon.startDate && hackathon.endDate ? (
                <ProgressBar value={calcDateProgress(hackathon.startDate, hackathon.endDate)} label="Overall Progress" />
              ) : (
                <p className="text-sm text-phantom-gray">Set start and end dates to track progress</p>
              )}
              <div>
                <span className="text-sm text-phantom-gray">Status:</span>
                <div className="mt-1"><StatusBadge status={hackathon.status} /></div>
              </div>
              {hackathon.submissionDeadline && (
                <CountdownTimer deadline={hackathon.submissionDeadline} label="Submission Deadline" />
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Total Ideas" value={ideas.length} icon={FiThumbsUp} color="purple" />
            <StatCard title="Total Tasks" value={tasks.length} icon={FiCheckSquare} color="blue" />
            <StatCard title="Resources" value={resources.length} icon={FiUpload} color="cyan" />
          </div>
        </div>
      )}

      {activeTab === 'Ideas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Idea Vault</h2>
            <button onClick={() => setIdeaModal(true)} className="btn-primary flex items-center gap-2">
              <FiPlus size={16} />
              New Idea
            </button>
          </div>
          {ideas.length === 0 ? (
            <EmptyState icon={<FiThumbsUp size={48} />} title="No ideas yet" description="Brainstorm and add your first idea" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {ideas.map((idea) => {
                const isExpanded = expandedIdea === idea._id
                const userVoted = idea.votes?.includes(user?._id)
                return (
                  <div key={idea._id} className="card flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-semibold text-white flex-1">{idea.title}</h3>
                      <div className="flex items-center gap-2 shrink-0">
                        {idea.isSelected && (
                          <span className="text-xs bg-phantom-purple text-white px-2 py-0.5 rounded-full font-medium">SELECTED</span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-phantom-gray line-clamp-2">{idea.description}</p>
                    {idea.researchLinks?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {idea.researchLinks.map((link, i) => (
                          <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="text-xs text-phantom-purple-light hover:underline truncate max-w-[200px]">
                            {link}
                          </a>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-sm mt-auto">
                      <button
                        onClick={() => handleVote(idea._id)}
                        className={`flex items-center gap-1.5 transition-colors ${userVoted ? 'text-phantom-purple-light' : 'text-phantom-gray hover:text-phantom-purple-light'}`}
                      >
                        <FiThumbsUp size={14} />
                        {idea.voteCount || idea.votes?.length || 0}
                      </button>
                      <button
                        onClick={() => setExpandedIdea(isExpanded ? null : idea._id)}
                        className="flex items-center gap-1.5 text-phantom-gray hover:text-white transition-colors"
                      >
                        <FiMessageSquare size={14} />
                        {idea.comments?.length || 0}
                      </button>
                      <button
                        onClick={() => handleSelectIdea(idea._id)}
                        className={`ml-auto text-xs font-medium px-2 py-1 rounded transition-colors ${idea.isSelected ? 'bg-phantom-purple text-white' : 'bg-phantom-dark text-phantom-gray hover:text-white'}`}
                      >
                        {idea.isSelected ? 'Selected' : 'Select'}
                      </button>
                    </div>
                    {isExpanded && (
                      <div className="border-t border-phantom-border pt-3 space-y-3">
                        {idea.notes && (
                          <p className="text-sm text-phantom-gray">{idea.notes}</p>
                        )}
                        {idea.references?.length > 0 && (
                          <div>
                            <span className="text-xs text-phantom-gray">References:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {idea.references.map((ref, i) => (
                                <span key={i} className="text-xs bg-phantom-dark text-phantom-gray px-2 py-0.5 rounded">{ref}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="space-y-2">
                          <span className="text-xs text-phantom-gray font-medium">Comments</span>
                          {(idea.comments || []).map((c, i) => (
                            <div key={i} className="bg-phantom-dark rounded-lg p-2">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-white">{c.user?.name || 'User'}</span>
                                <span className="text-xs text-phantom-gray">{c.createdAt ? format(new Date(c.createdAt), 'MMM d, h:mm a') : ''}</span>
                              </div>
                              <p className="text-sm text-phantom-gray">{c.text}</p>
                            </div>
                          ))}
                          <div className="flex gap-2">
                            <input
                              value={commentText[idea._id] || ''}
                              onChange={(e) => setCommentText((prev) => ({ ...prev, [idea._id]: e.target.value }))}
                              placeholder="Add a comment..."
                              className="input-field flex-1 text-sm"
                              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddComment(idea._id) } }}
                            />
                            <button onClick={() => handleAddComment(idea._id)} className="btn-primary text-sm px-3 py-1">Send</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
          <Modal isOpen={ideaModal} onClose={() => { setIdeaModal(false); setIdeaForm({ title: '', description: '', researchLinks: [], references: [], notes: '' }) }} title="New Idea" size="lg">
            <form onSubmit={handleCreateIdea} className="space-y-4">
              <div>
                <label className="label">Title *</label>
                <input name="title" value={ideaForm.title} onChange={(e) => setIdeaForm((p) => ({ ...p, title: e.target.value }))} className="input-field w-full" placeholder="Idea title" required />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea name="description" value={ideaForm.description} onChange={(e) => setIdeaForm((p) => ({ ...p, description: e.target.value }))} className="input-field w-full" rows={3} placeholder="Describe your idea..." />
              </div>
              <div>
                <label className="label">Research Links</label>
                <TagInput tags={ideaForm.researchLinks} onChange={(v) => setIdeaForm((p) => ({ ...p, researchLinks: v }))} placeholder="https://..." />
              </div>
              <div>
                <label className="label">References</label>
                <TagInput tags={ideaForm.references} onChange={(v) => setIdeaForm((p) => ({ ...p, references: v }))} placeholder="Reference name" />
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea name="notes" value={ideaForm.notes} onChange={(e) => setIdeaForm((p) => ({ ...p, notes: e.target.value }))} className="input-field w-full" rows={2} placeholder="Additional notes..." />
              </div>
              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={() => { setIdeaModal(false); setIdeaForm({ title: '', description: '', researchLinks: [], references: [], notes: '' }) }} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Create Idea</button>
              </div>
            </form>
          </Modal>
        </div>
      )}

      {activeTab === 'Tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Kanban Board</h2>
            <button onClick={() => { setEditingTask(null); setTaskForm({ title: '', description: '', status: 'backlog', priority: 'medium', assignee: '', deadline: '', labels: [] }); setTaskModal(true) }} className="btn-primary flex items-center gap-2">
              <FiPlus size={16} />
              Add Task
            </button>
          </div>
          {tasks.length === 0 ? (
            <EmptyState icon={<FiCheckSquare size={48} />} title="No tasks yet" description="Add your first task to get started" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {TASK_COLUMNS.map((col) => {
                const colTasks = tasks.filter((t) => t.status === col.key)
                return (
                  <div key={col.key} className="card p-3">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-white">{col.label}</h4>
                      <span className="text-xs text-phantom-gray bg-phantom-dark px-2 py-0.5 rounded-full">{colTasks.length}</span>
                    </div>
                    <div className="space-y-2 min-h-[100px]">
                      {colTasks.map((task) => {
                        const statusIdx = TASK_STATUSES.indexOf(task.status)
                        const assignee = team.find((m) => m._id === task.assignee)
                        return (
                          <div key={task._id} className="bg-phantom-dark rounded-lg p-3 space-y-2 border border-phantom-border/50">
                            <div className="flex items-start justify-between gap-1">
                              <span className="text-sm font-medium text-white flex-1">{task.title}</span>
                              <button
                                onClick={() => handleDeleteTask(task._id)}
                                className="text-phantom-gray hover:text-red-400 shrink-0"
                              >
                                <FiTrash2 size={12} />
                              </button>
                            </div>
                            <PriorityIndicator priority={task.priority} />
                            {assignee && (
                              <p className="text-xs text-phantom-gray">{assignee.name || 'Unknown'}</p>
                            )}
                            {task.deadline && (
                              <p className="text-xs text-phantom-gray">{format(new Date(task.deadline), 'MMM d')}</p>
                            )}
                            {task.labels?.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {task.labels.map((l) => (
                                  <span key={l} className="text-xs bg-phantom-purple/20 text-phantom-purple-light px-1.5 py-0.5 rounded">{l}</span>
                                ))}
                              </div>
                            )}
                            <div className="flex items-center justify-between pt-1">
                              <div className="flex gap-1">
                                {statusIdx > 0 && (
                                  <button onClick={() => handleMoveTask(task._id, -1)} className="text-phantom-gray hover:text-white p-1" title="Move left">
                                    <FiChevronLeft size={14} />
                                  </button>
                                )}
                                {statusIdx < TASK_STATUSES.length - 1 && (
                                  <button onClick={() => handleMoveTask(task._id, 1)} className="text-phantom-gray hover:text-white p-1" title="Move right">
                                    <FiChevronRight size={14} />
                                  </button>
                                )}
                              </div>
                              <button
                                onClick={() => {
                                  setEditingTask(task._id)
                                  setTaskForm({
                                    title: task.title || '',
                                    description: task.description || '',
                                    status: task.status || 'backlog',
                                    priority: task.priority || 'medium',
                                    assignee: task.assignee || '',
                                    deadline: task.deadline ? task.deadline.slice(0, 10) : '',
                                    labels: task.labels || [],
                                  })
                                  setTaskModal(true)
                                }}
                                className="text-xs text-phantom-purple-light hover:underline"
                              >
                                Edit
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          <Modal isOpen={taskModal} onClose={() => { setTaskModal(false); setEditingTask(null); setTaskForm({ title: '', description: '', status: 'backlog', priority: 'medium', assignee: '', deadline: '', labels: [] }) }} title={editingTask ? 'Edit Task' : 'Add Task'} size="lg">
            <form onSubmit={editingTask ? handleUpdateTask : handleCreateTask} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="label">Title *</label>
                  <input name="title" value={taskForm.title} onChange={(e) => setTaskForm((p) => ({ ...p, title: e.target.value }))} className="input-field w-full" placeholder="Task title" required />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Description</label>
                  <textarea name="description" value={taskForm.description} onChange={(e) => setTaskForm((p) => ({ ...p, description: e.target.value }))} className="input-field w-full" rows={2} placeholder="Task description..." />
                </div>
                <div>
                  <label className="label">Status</label>
                  <select name="status" value={taskForm.status} onChange={(e) => setTaskForm((p) => ({ ...p, status: e.target.value }))} className="input-field w-full">
                    {TASK_STATUSES.map((s) => (
                      <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Priority</label>
                  <select name="priority" value={taskForm.priority} onChange={(e) => setTaskForm((p) => ({ ...p, priority: e.target.value }))} className="input-field w-full">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="label">Assignee</label>
                  <select name="assignee" value={taskForm.assignee} onChange={(e) => setTaskForm((p) => ({ ...p, assignee: e.target.value }))} className="input-field w-full">
                    <option value="">Unassigned</option>
                    {team.map((m) => (
                      <option key={m._id} value={m._id}>{m.name || m.email}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Deadline</label>
                  <input type="date" name="deadline" value={taskForm.deadline} onChange={(e) => setTaskForm((p) => ({ ...p, deadline: e.target.value }))} className="input-field w-full" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Labels</label>
                  <TagInput tags={taskForm.labels} onChange={(v) => setTaskForm((p) => ({ ...p, labels: v }))} placeholder="Label name" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={() => { setTaskModal(false); setEditingTask(null); setTaskForm({ title: '', description: '', status: 'backlog', priority: 'medium', assignee: '', deadline: '', labels: [] }) }} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editingTask ? 'Update' : 'Create'} Task</button>
              </div>
            </form>
          </Modal>
        </div>
      )}

      {activeTab === 'Resources' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Resources</h2>
            <label className="btn-primary flex items-center gap-2 cursor-pointer">
              <FiUpload size={16} />
              {uploading ? 'Uploading...' : 'Upload'}
              <input type="file" onChange={handleUploadResource} className="hidden" disabled={uploading} />
            </label>
          </div>
          {resources.length === 0 ? (
            <EmptyState icon={<FiUpload size={48} />} title="No resources" description="Upload files and links for this hackathon" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map((r) => (
                <div key={r._id} className="card flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{r.name || r.originalName || 'Resource'}</p>
                      {r.type && <span className="text-xs text-phantom-gray">{r.type}</span>}
                    </div>
                    <button onClick={() => handleDeleteResource(r._id)} className="text-phantom-gray hover:text-red-400 shrink-0">
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                  {r.url && (
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs text-phantom-purple-light hover:underline flex items-center gap-1 truncate">
                      {r.url} <FiExternalLink size={12} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'Notes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Notes</h2>
            <button onClick={() => setNoteModal(true)} className="btn-primary flex items-center gap-2">
              <FiPlus size={16} />
              New Note
            </button>
          </div>
          {notes.length === 0 ? (
            <EmptyState icon={<FiCheckSquare size={48} />} title="No notes yet" description="Create notes for this hackathon" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map((n) => (
                <div key={n._id} className="card flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white flex-1">{n.title}</h3>
                    <button onClick={() => handleDeleteNote(n._id)} className="text-phantom-gray hover:text-red-400 shrink-0">
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                  {n.content && <p className="text-sm text-phantom-gray line-clamp-3 whitespace-pre-wrap">{n.content}</p>}
                  {n.createdAt && (
                    <p className="text-xs text-phantom-gray mt-auto">{format(new Date(n.createdAt), 'MMM d, yyyy')}</p>
                  )}
                </div>
              ))}
            </div>
          )}
          <Modal isOpen={noteModal} onClose={() => { setNoteModal(false); setNoteForm({ title: '', content: '' }) }} title="New Note" size="md">
            <form onSubmit={handleCreateNote} className="space-y-4">
              <div>
                <label className="label">Title *</label>
                <input name="title" value={noteForm.title} onChange={(e) => setNoteForm((p) => ({ ...p, title: e.target.value }))} className="input-field w-full" placeholder="Note title" required />
              </div>
              <div>
                <label className="label">Content</label>
                <textarea name="content" value={noteForm.content} onChange={(e) => setNoteForm((p) => ({ ...p, content: e.target.value }))} className="input-field w-full" rows={5} placeholder="Write your notes here..." />
              </div>
              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={() => { setNoteModal(false); setNoteForm({ title: '', content: '' }) }} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Create Note</button>
              </div>
            </form>
          </Modal>
        </div>
      )}

      {activeTab === 'Calendar' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Calendar</h2>
          {events.length === 0 ? (
            <EmptyState icon={<FiCalendar size={48} />} title="No events" description="Events for this hackathon will appear here" />
          ) : (
            <CalendarView events={events} />
          )}
        </div>
      )}

      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Edit Hackathon" size="lg">
        <form onSubmit={handleEdit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Name *</label>
              <input name="name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="input-field w-full" required />
            </div>
            <div>
              <label className="label">Organizer</label>
              <input name="organizer" value={form.organizer} onChange={(e) => setForm((p) => ({ ...p, organizer: e.target.value }))} className="input-field w-full" />
            </div>
            <div>
              <label className="label">Website</label>
              <input name="website" value={form.website} onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))} className="input-field w-full" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea name="description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="input-field w-full" rows={3} />
            </div>
            <div>
              <label className="label">Theme</label>
              <input name="theme" value={form.theme} onChange={(e) => setForm((p) => ({ ...p, theme: e.target.value }))} className="input-field w-full" />
            </div>
            <div>
              <label className="label">Status</label>
              <select name="status" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className="input-field w-full">
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
              <input type="date" name="registrationDeadline" value={form.registrationDeadline} onChange={(e) => setForm((p) => ({ ...p, registrationDeadline: e.target.value }))} className="input-field w-full" />
            </div>
            <div>
              <label className="label">Start Date</label>
              <input type="date" name="startDate" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} className="input-field w-full" />
            </div>
            <div>
              <label className="label">End Date</label>
              <input type="date" name="endDate" value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))} className="input-field w-full" />
            </div>
            <div>
              <label className="label">Submission Deadline</label>
              <input type="date" name="submissionDeadline" value={form.submissionDeadline} onChange={(e) => setForm((p) => ({ ...p, submissionDeadline: e.target.value }))} className="input-field w-full" />
            </div>
            <div>
              <label className="label">GitHub Repo</label>
              <input name="githubRepo" value={form.githubRepo} onChange={(e) => setForm((p) => ({ ...p, githubRepo: e.target.value }))} className="input-field w-full" />
            </div>
            <div>
              <label className="label">Figma Link</label>
              <input name="figmaLink" value={form.figmaLink} onChange={(e) => setForm((p) => ({ ...p, figmaLink: e.target.value }))} className="input-field w-full" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={() => setEditModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Changes</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
