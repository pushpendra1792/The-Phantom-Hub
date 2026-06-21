import { useState, useEffect } from 'react'
import { FiSearch, FiUsers, FiGithub, FiLinkedin, FiCheckCircle, FiClock, FiActivity } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { getTeamMembers, getTasks, getHackathons } from '../../api'
import Modal from '../../components/ui/Modal'
import StatusBadge from '../../components/ui/StatusBadge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import Badge from '../../components/ui/Badge'

export default function Team() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [selectedMember, setSelectedMember] = useState(null)
  const [detailData, setDetailData] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)

  const fetchMembers = () => {
    setLoading(true)
    setError(null)
    getTeamMembers()
      .then((res) => setMembers(res.data))
      .catch(() => {
        setError('Failed to load team members')
        toast.error('Failed to load team members')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  const filtered = members.filter((m) =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase())
  )

  const openDetail = (member) => {
    setSelectedMember(member)
    setDetailOpen(true)
    setDetailLoading(true)
    setDetailData(null)

    Promise.all([
      getTasks({ assignee: member._id }),
      getHackathons(),
    ])
      .then(([tasksRes, hackRes]) => {
        const tasks = tasksRes.data || []
        const hackathons = hackRes.data || []
        const currentTasks = tasks.filter((t) => t.status !== 'done')
        const completedTasks = tasks.filter((t) => t.status === 'done')
        const memberHackathons = hackathons.filter(
          (h) => h.createdBy === member._id || (h.teamMembers || []).includes(member._id)
        )
        setDetailData({
          tasks,
          currentTasks,
          completedTasks,
          hackathons: memberHackathons,
          totalTasks: tasks.length,
          completedCount: completedTasks.length,
        })
      })
      .catch(() => toast.error('Failed to load member details'))
      .finally(() => setDetailLoading(false))
  }

  const getAvatarUrl = (member) => {
    if (member.avatar) return member.avatar
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name || '?')}&backgroundColor=7c3aed&textColor=ffffff`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading team members..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-red-400">{error}</p>
        <button onClick={fetchMembers} className="btn-primary">Retry</button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Team Members</h1>
        <p className="text-phantom-gray mt-1">Meet the team behind the projects</p>
      </div>

      <div className="relative w-full sm:w-72">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-phantom-gray" size={16} />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10 w-full"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FiUsers size={48} />}
          title="No members found"
          description={search ? 'Try a different search term' : 'No team members added yet'}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((member) => (
            <div
              key={member._id}
              onClick={() => openDetail(member)}
              className="card flex flex-col items-center text-center p-6 cursor-pointer hover:border-phantom-purple/50 transition-all duration-200"
            >
              <img
                src={getAvatarUrl(member)}
                alt={member.name}
                className="w-20 h-20 rounded-full mb-4 border-2 border-phantom-purple/30"
              />
              <h3 className="text-lg font-bold text-white">{member.name}</h3>
              <p className="text-sm text-phantom-gray mt-1">{member.email}</p>
              {member.skills && member.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                  {member.skills.map((skill) => (
                    <Badge key={skill} variant="purple">{skill}</Badge>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-3 mt-4 pt-3 border-t border-phantom-border w-full justify-center">
                {member.github && (
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-phantom-gray hover:text-white transition-colors"
                  >
                    <FiGithub size={18} />
                  </a>
                )}
                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-phantom-gray hover:text-white transition-colors"
                  >
                    <FiLinkedin size={18} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={detailOpen} onClose={() => { setDetailOpen(false); setSelectedMember(null); setDetailData(null) }} title={selectedMember?.name || 'Member Details'} size="lg">
        {selectedMember && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <img
                src={getAvatarUrl(selectedMember)}
                alt={selectedMember.name}
                className="w-16 h-16 rounded-full border-2 border-phantom-purple/30"
              />
              <div>
                <h3 className="text-xl font-bold text-white">{selectedMember.name}</h3>
                <p className="text-sm text-phantom-gray">{selectedMember.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  {selectedMember.github && (
                    <a href={selectedMember.github} target="_blank" rel="noopener noreferrer" className="text-phantom-gray hover:text-white transition-colors">
                      <FiGithub size={16} />
                    </a>
                  )}
                  {selectedMember.linkedin && (
                    <a href={selectedMember.linkedin} target="_blank" rel="noopener noreferrer" className="text-phantom-gray hover:text-white transition-colors">
                      <FiLinkedin size={16} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {selectedMember.skills && selectedMember.skills.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMember.skills.map((skill) => (
                    <Badge key={skill} variant="purple">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}

            {detailLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="md" text="Loading details..." />
              </div>
            ) : detailData ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-phantom-dark border border-phantom-border">
                    <div className="flex items-center gap-2 text-phantom-purple-light mb-1">
                      <FiActivity size={16} />
                      <span className="text-xs text-phantom-gray">Total Tasks</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{detailData.totalTasks}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-phantom-dark border border-phantom-border">
                    <div className="flex items-center gap-2 text-green-400 mb-1">
                      <FiCheckCircle size={16} />
                      <span className="text-xs text-phantom-gray">Completed</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{detailData.completedCount}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-phantom-dark border border-phantom-border">
                    <div className="flex items-center gap-2 text-yellow-400 mb-1">
                      <FiClock size={16} />
                      <span className="text-xs text-phantom-gray">In Progress</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{detailData.currentTasks.length}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">Current Tasks</h4>
                  {detailData.currentTasks.length === 0 ? (
                    <p className="text-sm text-phantom-gray">No current tasks</p>
                  ) : (
                    <div className="space-y-2">
                      {detailData.currentTasks.slice(0, 5).map((task) => (
                        <div key={task._id} className="flex items-center justify-between p-3 rounded-lg bg-phantom-dark">
                          <span className="text-sm text-white truncate flex-1 mr-3">{task.title}</span>
                          <StatusBadge status={task.status} />
                        </div>
                      ))}
                      {detailData.currentTasks.length > 5 && (
                        <p className="text-xs text-phantom-gray text-center pt-1">+{detailData.currentTasks.length - 5} more</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">Completed Tasks</h4>
                  {detailData.completedTasks.length === 0 ? (
                    <p className="text-sm text-phantom-gray">No completed tasks</p>
                  ) : (
                    <div className="space-y-2">
                      {detailData.completedTasks.slice(0, 5).map((task) => (
                        <div key={task._id} className="flex items-center justify-between p-3 rounded-lg bg-phantom-dark">
                          <span className="text-sm text-white truncate flex-1 mr-3">{task.title}</span>
                          <span className="text-xs text-green-400 flex items-center gap-1"><FiCheckCircle size={12} />Done</span>
                        </div>
                      ))}
                      {detailData.completedTasks.length > 5 && (
                        <p className="text-xs text-phantom-gray text-center pt-1">+{detailData.completedTasks.length - 5} more</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">Active Hackathons</h4>
                  {detailData.hackathons.length === 0 ? (
                    <p className="text-sm text-phantom-gray">No active hackathons</p>
                  ) : (
                    <div className="space-y-2">
                      {detailData.hackathons.map((h) => (
                        <div key={h._id} className="flex items-center justify-between p-3 rounded-lg bg-phantom-dark">
                          <span className="text-sm text-white">{h.name}</span>
                          <StatusBadge status={h.status} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        )}
      </Modal>
    </div>
  )
}
