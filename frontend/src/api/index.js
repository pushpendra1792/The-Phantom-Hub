import API from './axios'

export const registerUser = (data) => API.post('/auth/register', data)
export const loginUser = (data) => API.post('/auth/login', data)
export const getUserProfile = () => API.get('/auth/me')
export const updateUserProfile = (data) => API.put('/auth/me', data)

export const getHackathons = (params) => API.get('/hackathons', { params })
export const getHackathon = (id) => API.get(`/hackathons/${id}`)
export const createHackathon = (data) => API.post('/hackathons', data)
export const updateHackathon = (id, data) => API.put(`/hackathons/${id}`, data)
export const deleteHackathon = (id) => API.delete(`/hackathons/${id}`)
export const archiveHackathon = (id) => API.put(`/hackathons/${id}/archive`)

export const getIdeas = (hackathonId) => API.get(`/ideas/${hackathonId}`)
export const createIdea = (hackathonId, data) => API.post(`/ideas/${hackathonId}`, data)
export const updateIdea = (id, data) => API.put(`/ideas/${id}`, data)
export const deleteIdea = (id) => API.delete(`/ideas/${id}`)
export const voteIdea = (id) => API.post(`/ideas/${id}/vote`)
export const selectIdea = (id) => API.post(`/ideas/${id}/select`)
export const addComment = (id, data) => API.post(`/ideas/${id}/comments`, data)

export const getTasks = (params) => API.get('/tasks', { params })
export const getTask = (id) => API.get(`/tasks/${id}`)
export const createTask = (data) => API.post('/tasks', data)
export const updateTask = (id, data) => API.put(`/tasks/${id}`, data)
export const updateTaskStatus = (id, data) => API.patch(`/tasks/${id}/status`, data)
export const deleteTask = (id) => API.delete(`/tasks/${id}`)
export const addTaskComment = (id, data) => API.post(`/tasks/${id}/comments`, data)
export const addTaskAttachment = (id, data) => API.post(`/tasks/${id}/attachments`, data, { headers: { 'Content-Type': 'multipart/form-data' } })

export const getResources = () => API.get('/resources')
export const getResourcesByHackathon = (hackathonId) => API.get(`/resources/hackathon/${hackathonId}`)
export const uploadResource = (data) => API.post('/resources', data, { headers: { 'Content-Type': 'multipart/form-data' } })
export const deleteResource = (id) => API.delete(`/resources/${id}`)

export const getEvents = (params) => API.get('/calendar', { params })
export const createEvent = (data) => API.post('/calendar', data)
export const updateEvent = (id, data) => API.put(`/calendar/${id}`, data)
export const deleteEvent = (id) => API.delete(`/calendar/${id}`)
export const syncCalendar = () => API.post('/calendar/sync')

export const getNotes = () => API.get('/notes')
export const getNotesByHackathon = (hackathonId) => API.get(`/notes/hackathon/${hackathonId}`)
export const createNote = (data) => API.post('/notes', data)
export const updateNote = (id, data) => API.put(`/notes/${id}`, data)
export const deleteNote = (id) => API.delete(`/notes/${id}`)

export const getNotifications = () => API.get('/notifications')
export const markAsRead = (id) => API.put(`/notifications/${id}/read`)
export const markAllAsRead = () => API.put('/notifications/read-all')
export const deleteNotification = (id) => API.delete(`/notifications/${id}`)

export const getDashboardStats = () => API.get('/analytics/dashboard')
export const getAnalytics = () => API.get('/analytics/data')
export const getTeamActivity = () => API.get('/analytics/team-activity')

export const getTeamMembers = () => API.get('/users/team')
export const getUserById = (id) => API.get(`/users/${id}`)
