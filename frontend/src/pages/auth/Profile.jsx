import { useState, useEffect } from 'react'
import { FiUser, FiMail, FiGithub, FiLinkedin, FiPlus, FiSave, FiCamera, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'


export default function Profile() {
  const { user, updateProfile } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: '',
    github: '',
    linkedin: '',
    skills: [],
  })
  const [skillInput, setSkillInput] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        github: user.github || '',
        linkedin: user.linkedin || '',
        skills: user.skills || [],
      })
    }
  }, [user])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const addSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault()
      if (!form.skills.includes(skillInput.trim())) {
        setForm((prev) => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }))
      }
      setSkillInput('')
    }
  }

  const removeSkill = (skill) => {
    setForm((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProfile({
        name: form.name,
        github: form.github,
        linkedin: form.linkedin,
        skills: form.skills,
      })
      toast.success('Profile updated successfully')
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to update profile'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const avatarUrl = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=a855f7&color=fff&size=128`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Profile</h1>
        <p className="text-phantom-gray mt-1">Manage your personal information and links</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="relative group mb-4">
              <img src={avatarUrl} alt={form.name} className="w-28 h-28 rounded-full object-cover border-2 border-phantom-purple/30" />
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <FiCamera size={24} className="text-white" />
              </div>
            </div>
            <h2 className="text-lg font-semibold text-white">{form.name || 'Your Name'}</h2>
            <p className="text-phantom-gray text-sm">{form.email}</p>
          </div>
        </div>

        <div className="card lg:col-span-2">
          <div className="space-y-5">
            <div>
              <label className="block text-sm text-phantom-gray mb-1.5">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-phantom-gray" size={18} />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-phantom-gray mb-1.5">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-phantom-gray" size={18} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  disabled
                  className="input-field pl-10 opacity-60 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-phantom-gray mb-1.5">GitHub URL</label>
                <div className="relative">
                  <FiGithub className="absolute left-3 top-1/2 -translate-y-1/2 text-phantom-gray" size={18} />
                  <input
                    type="url"
                    name="github"
                    value={form.github}
                    onChange={handleChange}
                    placeholder="https://github.com/username"
                    className="input-field pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-phantom-gray mb-1.5">LinkedIn URL</label>
                <div className="relative">
                  <FiLinkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-phantom-gray" size={18} />
                  <input
                    type="url"
                    name="linkedin"
                    value={form.linkedin}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/username"
                    className="input-field pl-10"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-phantom-gray mb-1.5">Skills</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {form.skills.map((skill) => (
                  <span key={skill} className="badge-purple flex items-center gap-1.5">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:text-white transition-colors"
                    >
                      <FiX size={14} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="relative">
                <FiPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-phantom-gray" size={18} />
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={addSkill}
                  placeholder="Type a skill and press Enter"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex items-center gap-2"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiSave size={18} />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
