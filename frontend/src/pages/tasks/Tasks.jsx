import { useState } from 'react'
import { FiSearch, FiPlus, FiTrash2, FiEdit2, FiMessageSquare, FiPaperclip, FiUser, FiClock, FiFilter, FiChevronLeft, FiChevronRight, FiList, FiGrid } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { format, formatDistanceToNow, isBefore } from 'date-fns'
import { useQueryClient } from '@tanstack/react-query'
import { getTasks, getTask, createTask, updateTask, updateTaskStatus, deleteTask, addTaskComment, addTaskAttachment, getHackathons, getTeamMembers } from '../../api'
import { useTasks, useHackathons, useTeam, keys } from '../../hooks'
import Modal from '../../components/ui/Modal'
import StatusBadge from '../../components/ui/StatusBadge'
import PriorityIndicator from '../../components/ui/PriorityIndicator'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import Badge from '../../components/ui/Badge'

const STATUSES = ['backlog', 'todo', 'in_progress', 'review', 'done']

const STATUS_LABELS = {
  backlog: 'Backlog',
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
}

const STATUS_HEADER_COLORS = {
  backlog: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  todo: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  in_progress: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  review: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  done: 'bg-green-500/20 text-green-400 border-green-500/30',
}

const PRIORITY_OPTIONS = ['All', 'Low', 'Medium', 'High', 'Urgent']

function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const initialForm = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  assignee: '',
  deadline: '',
  labels: [],
  hackathon: '',
}

export default function Tasks() {
  const queryClient = useQueryClient()
  const [hackathonFilter, setHackathonFilter] = useState('')
  const filters = hackathonFilter ? { hackathon: hackathonFilter } : {}
  const { data: tasks = [], isLoading, isError } = useTasks(filters)
  const { data: hackathons = [] } = useHackathons()
  const { data: teamMembers = [] } = useTeam()
  const [search, setSearch] = useState('')
  const [assigneeFilter, setAssigneeFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [viewMode, setViewMode] = useState('board')
  const [sortField, setSortField] = useState('')
  const [sortDir, setSortDir] = useState('asc')
  const [selectedTask, setSelectedTask] = useState(null)
  const [detailModal, setDetailModal] = useState(false)
  const [formModal, setFormModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [commentText, setCommentText] = useState('')

  const filtered = tasks.filter((t) => {
    const matchesSearch = t.title?.toLowerCase().includes(search.toLowerCase())
    const matchesAssignee = !assigneeFilter || t.assignee?._id === assigneeFilter
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter.toLowerCase()
    return matchesSearch && matchesAssignee && matchesPriority
  })

  const groupedByStatus = {}
  STATUSES.forEach((s) => { groupedByStatus[s] = [] })
  filtered.forEach((t) => {
    if (groupedByStatus[t.status]) groupedByStatus[t.status].push(t)
    else groupedByStatus[t.status] = [t]
  })

  const sorted = [...filtered]
  if (sortField) {
    sorted.sort((a, b) => {
      let aVal = a[sortField]
      let bVal = b[sortField]
      if (sortField === 'deadline' && aVal && bVal) {
        aVal = new Date(aVal).getTime()
        bVal = new Date(bVal).getTime()
      }
      if (sortField === 'assignee') {
        aVal = a.assignee?.name || ''
        bVal = b.assignee?.name || ''
      }
      if (sortField === 'labels') {
        aVal = (a.labels || []).join(',')
        bVal = (b.labels || []).join(',')
      }
      if (typeof aVal === 'string') aVal = aVal.toLowerCase()
      if (typeof bVal === 'string') bVal = bVal.toLowerCase()
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const handleMoveStatus = (taskId, newStatus) => {
    updateTaskStatus(taskId, { status: newStatus })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: keys.tasks(filters) })
        toast.success('Task moved')
      })
      .catch(() => toast.error('Failed to move task'))
  }

  const openDetail = (task) => {
    getTask(task._id)
      .then((res) => {
        setSelectedTask(res.data)
        setDetailModal(true)
      })
      .catch(() => toast.error('Failed to load task details'))
  }

  const openEdit = (task) => {
    setEditingTask(task)
    setForm({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'todo',
      priority: task.priority || 'medium',
      assignee: task.assignee?._id || '',
      deadline: task.deadline ? format(new Date(task.deadline), "yyyy-MM-dd'T'HH:mm") : '',
      labels: task.labels || [],
      hackathon: task.hackathon?._id || '',
    })
    setFormModal(true)
  }

  const openCreate = () => {
    setEditingTask(null)
    setForm(initialForm)
    setFormModal(true)
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddLabel = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault()
      const label = e.target.value.trim()
      if (!form.labels.includes(label)) {
        setForm((prev) => ({ ...prev, labels: [...prev.labels, label] }))
      }
      e.target.value = ''
    }
  }

  const handleRemoveLabel = (label) => {
    setForm((prev) => ({ ...prev, labels: prev.labels.filter((l) => l !== label) }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('Title is required')
      return
    }
    setSubmitting(true)
    const payload = {
      ...form,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
      assignee: form.assignee || null,
      hackathon: form.hackathon || null,
    }
    const promise = editingTask
      ? updateTask(editingTask._id, payload)
      : createTask(payload)

    promise
      .then(() => {
        queryClient.invalidateQueries({ queryKey: keys.tasks(filters) })
        toast.success(editingTask ? 'Task updated' : 'Task created')
        setFormModal(false)
        setForm(initialForm)
        setEditingTask(null)
      })
      .catch(() => toast.error(editingTask ? 'Failed to update task' : 'Failed to create task'))
      .finally(() => setSubmitting(false))
  }

  const handleDelete = (id) => {
    if (!window.confirm('Delete this task?')) return
    deleteTask(id)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: keys.tasks(filters) })
        setDetailModal(false)
        setSelectedTask(null)
        toast.success('Task deleted')
      })
      .catch(() => toast.error('Failed to delete task'))
  }

  const handleAddComment = () => {
    if (!commentText.trim() || !selectedTask) return
    addTaskComment(selectedTask._id, { text: commentText })
      .then((res) => {
        setSelectedTask((prev) => ({
          ...prev,
          comments: [...(prev.comments || []), res.data],
        }))
        setCommentText('')
        toast.success('Comment added')
      })
      .catch(() => toast.error('Failed to add comment'))
  }

  const handleUploadAttachment = (e) => {
    if (!selectedTask) return
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    addTaskAttachment(selectedTask._id, formData)
      .then((res) => {
        setSelectedTask((prev) => ({
          ...prev,
          attachments: [...(prev.attachments || []), res.data],
        }))
        toast.success('Attachment uploaded')
      })
      .catch(() => toast.error('Failed to upload attachment'))
    e.target.value = ''
  }

  const renderSortIcon = (field) => {
    if (sortField !== field) return null
    return <span className="ml-1">{sortDir === 'asc' ? '\u25B2' : '\u25BC'}</span>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading tasks..." />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-red-400">Failed to load tasks</p>
        <button onClick={() => queryClient.invalidateQueries({ queryKey: keys.tasks(filters) })} className="btn-primary">Retry</button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Tasks</h1>
          <p className="text-phantom-gray mt-1">Manage your team tasks</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-phantom-dark border border-phantom-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('board')}
              className={`p-2.5 transition-colors ${viewMode === 'board' ? 'bg-phantom-purple text-white' : 'text-phantom-gray hover:text-white'}`}
              title="Board View"
            >
              <FiGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-phantom-purple text-white' : 'text-phantom-gray hover:text-white'}`}
              title="List View"
            >
              <FiList size={16} />
            </button>
          </div>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <FiPlus size={16} />
            New Task
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
        <div className="relative w-full sm:w-56">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-phantom-gray" size={16} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
        <select
          value={hackathonFilter}
          onChange={(e) => setHackathonFilter(e.target.value)}
          className="input-field w-full sm:w-48"
        >
          <option value="">All Hackathons</option>
          {hackathons.map((h) => (
            <option key={h._id} value={h._id}>{h.name}</option>
          ))}
        </select>
        <select
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          className="input-field w-full sm:w-44"
        >
          <option value="">All Assignees</option>
          {teamMembers.map((m) => (
            <option key={m._id} value={m._id}>{m.name}</option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="input-field w-full sm:w-36"
        >
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FiList size={48} />}
          title="No tasks found"
          description={search || hackathonFilter || assigneeFilter || priorityFilter !== 'All' ? 'Try adjusting your filters' : 'Create your first task to get started'}
          action={!search && !hackathonFilter && !assigneeFilter && priorityFilter === 'All' ? { label: 'New Task', onClick: openCreate } : undefined}
        />
      ) : viewMode === 'board' ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUSES.map((status) => {
            const columnTasks = groupedByStatus[status] || []
            return (
              <div key={status} className="flex-shrink-0 w-72">
                <div className={`flex items-center justify-between px-3 py-2 rounded-lg border mb-3 ${STATUS_HEADER_COLORS[status]}`}>
                  <h3 className="text-sm font-semibold">{STATUS_LABELS[status]}</h3>
                  <span className="text-xs font-medium">{columnTasks.length}</span>
                </div>
                <div className="space-y-3 min-h-[200px]">
                  {columnTasks.map((task) => (
                    <div
                      key={task._id}
                      onClick={() => openDetail(task)}
                      className="card p-4 cursor-pointer hover:border-phantom-purple/50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-bold text-white leading-snug flex-1 pr-2">{task.title}</h4>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <PriorityIndicator priority={task.priority} />
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1.5 text-xs text-phantom-gray">
                          <div className="w-5 h-5 rounded-full bg-phantom-purple/30 flex items-center justify-center text-[10px] font-bold text-phantom-purple-light">
                            {task.assignee?.name?.charAt(0).toUpperCase() || <FiUser size={10} />}
                          </div>
                          <span>{task.assignee?.name || 'Unassigned'}</span>
                        </div>
                      </div>
                      {task.deadline && (
                        <div className={`flex items-center gap-1 text-xs mb-2 ${isBefore(new Date(task.deadline), new Date()) ? 'text-red-400' : 'text-phantom-gray'}`}>
                          <FiClock size={12} />
                          <span>{format(new Date(task.deadline), 'MMM d')}</span>
                        </div>
                      )}
                      {task.labels && task.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {task.labels.map((label) => (
                            <Badge key={label} variant="purple">{label}</Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t border-phantom-border">
                        <div className="flex items-center gap-3 text-xs text-phantom-gray">
                          <span className="flex items-center gap-1"><FiMessageSquare size={12} />{task.comments?.length || 0}</span>
                          <span className="flex items-center gap-1"><FiPaperclip size={12} />{task.attachments?.length || 0}</span>
                        </div>
                        <select
                          value={task.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleMoveStatus(task._id, e.target.value)}
                          className="text-xs bg-phantom-dark border border-phantom-border rounded px-1.5 py-0.5 text-phantom-gray-light cursor-pointer"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-phantom-border">
                <th className="text-left px-4 py-3 text-phantom-gray font-medium cursor-pointer hover:text-white" onClick={() => handleSort('title')}>
                  Title{renderSortIcon('title')}
                </th>
                <th className="text-left px-4 py-3 text-phantom-gray font-medium cursor-pointer hover:text-white" onClick={() => handleSort('status')}>
                  Status{renderSortIcon('status')}
                </th>
                <th className="text-left px-4 py-3 text-phantom-gray font-medium cursor-pointer hover:text-white" onClick={() => handleSort('priority')}>
                  Priority{renderSortIcon('priority')}
                </th>
                <th className="text-left px-4 py-3 text-phantom-gray font-medium cursor-pointer hover:text-white" onClick={() => handleSort('assignee')}>
                  Assignee{renderSortIcon('assignee')}
                </th>
                <th className="text-left px-4 py-3 text-phantom-gray font-medium cursor-pointer hover:text-white" onClick={() => handleSort('deadline')}>
                  Deadline{renderSortIcon('deadline')}
                </th>
                <th className="text-left px-4 py-3 text-phantom-gray font-medium cursor-pointer hover:text-white" onClick={() => handleSort('labels')}>
                  Labels{renderSortIcon('labels')}
                </th>
                <th className="text-right px-4 py-3 text-phantom-gray font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((task) => (
                <tr
                  key={task._id}
                  onClick={() => openDetail(task)}
                  className="border-b border-phantom-border hover:bg-phantom-card/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-white font-medium">{task.title}</td>
                  <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
                  <td className="px-4 py-3"><PriorityIndicator priority={task.priority} /></td>
                  <td className="px-4 py-3 text-phantom-gray-light">{task.assignee?.name || '-'}</td>
                  <td className={`px-4 py-3 ${task.deadline && isBefore(new Date(task.deadline), new Date()) ? 'text-red-400' : 'text-phantom-gray-light'}`}>
                    {task.deadline ? format(new Date(task.deadline), 'MMM d, yyyy') : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(task.labels || []).slice(0, 2).map((label) => (
                        <Badge key={label} variant="purple">{label}</Badge>
                      ))}
                      {(task.labels?.length || 0) > 2 && (
                        <Badge variant="gray">+{task.labels.length - 2}</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); openEdit(task) }}
                        className="p-1.5 text-phantom-gray hover:text-phantom-purple-light transition-colors"
                        title="Edit"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(task._id) }}
                        className="p-1.5 text-phantom-gray hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={detailModal} onClose={() => { setDetailModal(false); setSelectedTask(null) }} title="Task Details" size="lg">
        {selectedTask && (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-bold text-white mb-3">{selectedTask.title}</h3>
              <div className="flex flex-wrap gap-3 mb-3">
                <StatusBadge status={selectedTask.status} />
                <PriorityIndicator priority={selectedTask.priority} />
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-phantom-gray">
                <span className="flex items-center gap-1.5">
                  <FiUser size={14} /> {selectedTask.assignee?.name || 'Unassigned'}
                </span>
                {selectedTask.deadline && (
                  <span className={`flex items-center gap-1.5 ${isBefore(new Date(selectedTask.deadline), new Date()) ? 'text-red-400' : ''}`}>
                    <FiClock size={14} /> {format(new Date(selectedTask.deadline), 'MMM d, yyyy h:mm a')}
                  </span>
                )}
              </div>
              {selectedTask.hackathon && (
                <p className="text-xs text-phantom-gray mt-2">Hackathon: {selectedTask.hackathon.name}</p>
              )}
              {selectedTask.labels && selectedTask.labels.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {selectedTask.labels.map((label) => (
                    <Badge key={label} variant="purple">{label}</Badge>
                  ))}
                </div>
              )}
            </div>

            {selectedTask.description && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-1">Description</h4>
                <p className="text-sm text-phantom-gray-light whitespace-pre-wrap">{selectedTask.description}</p>
              </div>
            )}

            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Comments</h4>
              <div className="space-y-3 mb-3 max-h-48 overflow-y-auto">
                {(selectedTask.comments || []).length === 0 ? (
                  <p className="text-sm text-phantom-gray">No comments yet</p>
                ) : (
                  selectedTask.comments.map((c, idx) => (
                    <div key={c._id || idx} className="flex gap-3 p-3 rounded-lg bg-phantom-dark">
                      <div className="w-7 h-7 rounded-full bg-phantom-purple/30 flex items-center justify-center text-xs font-bold text-phantom-purple-light flex-shrink-0">
                        {c.user?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium text-white">{c.user?.name || 'Unknown'}</span>
                          <span className="text-xs text-phantom-gray">{c.createdAt ? formatDistanceToNow(new Date(c.createdAt), { addSuffix: true }) : ''}</span>
                        </div>
                        <p className="text-sm text-phantom-gray-light">{c.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment() } }}
                  placeholder="Add a comment..."
                  className="input-field flex-1"
                />
                <button onClick={handleAddComment} className="btn-primary px-4" disabled={!commentText.trim()}>
                  <FiMessageSquare size={16} />
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Attachments</h4>
              <div className="space-y-2 mb-3">
                {(selectedTask.attachments || []).length === 0 ? (
                  <p className="text-sm text-phantom-gray">No attachments</p>
                ) : (
                  selectedTask.attachments.map((att, idx) => (
                    <div key={att._id || idx} className="flex items-center justify-between p-3 rounded-lg bg-phantom-dark">
                      <div className="flex items-center gap-2 min-w-0">
                        <FiPaperclip size={14} className="text-phantom-gray" />
                        <span className="text-sm text-white truncate">{att.fileName || 'Attachment'}</span>
                        {att.fileSize && (
                          <span className="text-xs text-phantom-gray">{formatFileSize(att.fileSize)}</span>
                        )}
                      </div>
                      <a
                        href={att.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-phantom-purple-light hover:text-phantom-purple transition-colors p-1"
                        title="Download"
                      >
                        <FiPaperclip size={14} />
                      </a>
                    </div>
                  ))
                )}
              </div>
              <label className="btn-secondary flex items-center gap-2 cursor-pointer w-fit text-sm">
                <FiUpload size={14} />
                Upload Attachment
                <input type="file" onChange={handleUploadAttachment} className="hidden" />
              </label>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-phantom-border">
              <button onClick={() => handleDelete(selectedTask._id)} className="btn-danger flex items-center gap-2">
                <FiTrash2 size={14} />
                Delete
              </button>
              <button onClick={() => { setDetailModal(false); openEdit(selectedTask) }} className="btn-primary flex items-center gap-2">
                <FiEdit2 size={14} />
                Edit
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={formModal} onClose={() => { setFormModal(false); setEditingTask(null); setForm(initialForm) }} title={editingTask ? 'Edit Task' : 'Create Task'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Title *</label>
            <input name="title" value={form.title} onChange={handleFormChange} className="input-field w-full" placeholder="Task title" required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea name="description" value={form.description} onChange={handleFormChange} className="input-field w-full" rows={3} placeholder="Describe the task..." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Status</label>
              <select name="status" value={form.status} onChange={handleFormChange} className="input-field w-full">
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select name="priority" value={form.priority} onChange={handleFormChange} className="input-field w-full">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="label">Assignee</label>
              <select name="assignee" value={form.assignee} onChange={handleFormChange} className="input-field w-full">
                <option value="">Unassigned</option>
                {teamMembers.map((m) => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Deadline</label>
              <input type="datetime-local" name="deadline" value={form.deadline} onChange={handleFormChange} className="input-field w-full" />
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
            <label className="label">Labels (press Enter to add)</label>
            <input type="text" onKeyDown={handleAddLabel} className="input-field w-full" placeholder="Type label and press Enter..." />
            {form.labels.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.labels.map((label) => (
                  <span key={label} className="badge-purple flex items-center gap-1 cursor-pointer" onClick={() => handleRemoveLabel(label)}>
                    {label}
                    <FiTrash2 size={10} className="cursor-pointer" />
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setFormModal(false); setEditingTask(null); setForm(initialForm) }} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
