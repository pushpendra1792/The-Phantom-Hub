import { useState, useEffect, useRef } from 'react'
import { FiSearch, FiPlus, FiTrash2, FiDownload, FiUpload, FiFile, FiMonitor, FiFileText, FiLayout, FiImage, FiPackage, FiBookmark, FiGrid } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { getResources, getResourcesByHackathon, uploadResource, deleteResource, getHackathons } from '../../api'
import Modal from '../../components/ui/Modal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import Badge from '../../components/ui/Badge'

const TYPE_ICONS = {
  PDF: FiFile,
  PPT: FiMonitor,
  Documentation: FiFileText,
  Research: FiBookmark,
  UI: FiLayout,
  Image: FiImage,
  ZIP: FiPackage,
  Other: FiFile,
}

const TYPE_OPTIONS = ['All', 'PDF', 'PPT', 'Documentation', 'Research', 'UI', 'Image', 'ZIP', 'Other']

const EXTENSION_MAP = {
  pdf: 'PDF',
  ppt: 'PPT',
  pptx: 'PPT',
  doc: 'Documentation',
  docx: 'Documentation',
  txt: 'Documentation',
  md: 'Documentation',
  csv: 'Documentation',
  xls: 'Documentation',
  xlsx: 'Documentation',
  js: 'Documentation',
  jsx: 'Documentation',
  ts: 'Documentation',
  tsx: 'Documentation',
  py: 'Documentation',
  java: 'Documentation',
  cpp: 'Documentation',
  json: 'Documentation',
  xml: 'Documentation',
  research: 'Research',
  paper: 'Research',
  fig: 'UI',
  sketch: 'UI',
  psd: 'UI',
  ai: 'UI',
  png: 'Image',
  jpg: 'Image',
  jpeg: 'Image',
  gif: 'Image',
  svg: 'Image',
  webp: 'Image',
  ico: 'Image',
  zip: 'ZIP',
  rar: 'ZIP',
  gz: 'ZIP',
  '7z': 'ZIP',
  tar: 'ZIP',
  pptm: 'PPT',
  potx: 'PPT',
  pot: 'PPT',
  pps: 'PPT',
  ppsx: 'PPT',
}

function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function detectTypeFromName(name) {
  const ext = (name || '').split('.').pop().toLowerCase()
  return EXTENSION_MAP[ext] || 'Other'
}

export default function Resources() {
  const [resources, setResources] = useState([])
  const [hackathons, setHackathons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [hackathonFilter, setHackathonFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [uploadModal, setUploadModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', type: 'Other', hackathon: '' })
  const [uploadFile, setUploadFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef(null)

  const fetchResources = () => {
    setLoading(true)
    setError(null)
    const promise = hackathonFilter
      ? getResourcesByHackathon(hackathonFilter)
      : getResources()

    Promise.all([
      promise,
      getHackathons(),
    ])
      .then(([res, hackRes]) => {
        setResources(res.data)
        setHackathons(hackRes.data)
      })
      .catch(() => {
        setError('Failed to load resources')
        toast.error('Failed to load resources')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchResources()
  }, [hackathonFilter])

  const filtered = resources.filter((r) => {
    const matchesSearch = r.name?.toLowerCase().includes(search.toLowerCase()) || r.fileName?.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === 'All' || r.type === typeFilter
    return matchesSearch && matchesType
  })

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadFile(file)
    setForm((prev) => ({
      ...prev,
      name: prev.name || file.name,
      type: detectTypeFromName(file.name),
    }))
  }

  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleUpload = (e) => {
    e.preventDefault()
    if (!uploadFile) {
      toast.error('Please select a file')
      return
    }
    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }
    setSubmitting(true)
    const formData = new FormData()
    formData.append('file', uploadFile)
    formData.append('name', form.name.trim())
    if (form.description) formData.append('description', form.description)
    formData.append('type', form.type)
    if (form.hackathon) formData.append('hackathon', form.hackathon)

    uploadResource(formData)
      .then((res) => {
        setResources((prev) => [res.data, ...prev])
        toast.success('Resource uploaded')
        setUploadModal(false)
        setUploadFile(null)
        setForm({ name: '', description: '', type: 'Other', hackathon: '' })
        if (fileInputRef.current) fileInputRef.current.value = ''
      })
      .catch(() => toast.error('Failed to upload resource'))
      .finally(() => setSubmitting(false))
  }

  const handleDelete = (id) => {
    if (!window.confirm('Delete this resource?')) return
    deleteResource(id)
      .then(() => {
        setResources((prev) => prev.filter((r) => r._id !== id))
        toast.success('Resource deleted')
      })
      .catch(() => toast.error('Failed to delete resource'))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading resources..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-red-400">{error}</p>
        <button onClick={fetchResources} className="btn-primary">Retry</button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Resource Repository</h1>
          <p className="text-phantom-gray mt-1">Store and share project resources</p>
        </div>
        <button onClick={() => setUploadModal(true)} className="btn-primary flex items-center gap-2">
          <FiUpload size={16} />
          Upload Resource
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
        <div className="relative w-full sm:w-56">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-phantom-gray" size={16} />
          <input
            type="text"
            placeholder="Search resources..."
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
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="input-field w-full sm:w-40"
        >
          {TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FiGrid size={48} />}
          title="No resources found"
          description={search || hackathonFilter || typeFilter !== 'All' ? 'Try adjusting your filters' : 'Upload your first resource to get started'}
          action={!search && !hackathonFilter && typeFilter === 'All' ? { label: 'Upload Resource', onClick: () => setUploadModal(true) } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((resource) => {
            const TypeIcon = TYPE_ICONS[resource.type] || FiFile
            return (
              <div key={resource._id} className="card flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-lg bg-phantom-purple/10 text-phantom-purple-light border border-phantom-purple/30">
                    <TypeIcon size={24} />
                  </div>
                  <button
                    onClick={() => handleDelete(resource._id)}
                    className="text-phantom-gray hover:text-red-400 transition-colors p-1"
                    title="Delete"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate" title={resource.name}>{resource.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="purple">{resource.type || 'Other'}</Badge>
                    {resource.size && (
                      <span className="text-xs text-phantom-gray">{formatFileSize(resource.size)}</span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-phantom-gray space-y-1">
                  <p className="flex items-center gap-1.5">
                    User: {resource.uploadedBy?.name || 'Unknown'}
                  </p>
                  <p className="flex items-center gap-1.5">
                    {resource.createdAt ? formatDistanceToNow(new Date(resource.createdAt), { addSuffix: true }) : ''}
                  </p>
                  {resource.hackathon && (
                    <p className="text-phantom-purple-light">{resource.hackathon.name}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-phantom-border mt-auto">
                  <a
                    href={resource.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary flex items-center gap-2 text-sm flex-1 justify-center"
                  >
                    <FiDownload size={14} />
                    Download
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal isOpen={uploadModal} onClose={() => { setUploadModal(false); setUploadFile(null); setForm({ name: '', description: '', type: 'Other', hackathon: '' }); if (fileInputRef.current) fileInputRef.current.value = '' }} title="Upload Resource" size="md">
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="label">File *</label>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="btn-secondary flex items-center gap-2 cursor-pointer"
              >
                <FiUpload size={14} />
                {uploadFile ? uploadFile.name : 'Choose File'}
              </label>
              {uploadFile && (
                <span className="text-xs text-phantom-gray">{formatFileSize(uploadFile.size)}</span>
              )}
            </div>
          </div>
          <div>
            <label className="label">Name *</label>
            <input name="name" value={form.name} onChange={handleFormChange} className="input-field w-full" placeholder="Resource name" required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea name="description" value={form.description} onChange={handleFormChange} className="input-field w-full" rows={2} placeholder="Optional description..." />
          </div>
          <div>
            <label className="label">Type</label>
            <select name="type" value={form.type} onChange={handleFormChange} className="input-field w-full">
              {TYPE_OPTIONS.filter((t) => t !== 'All').map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
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
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setUploadModal(false); setUploadFile(null); setForm({ name: '', description: '', type: 'Other', hackathon: '' }); if (fileInputRef.current) fileInputRef.current.value = '' }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={submitting || !uploadFile} className="btn-primary">
              {submitting ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
