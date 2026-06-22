import { useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from '../api'

export const keys = {
  hackathons: ['hackathons'],
  hackathon: (id) => ['hackathons', id],
  tasks: (filters) => ['tasks', filters],
  task: (id) => ['tasks', id],
  team: ['team'],
  resources: (hackathonId) => hackathonId ? ['resources', hackathonId] : ['resources'],
  notes: ['notes'],
  events: (filters) => ['events', filters],
  notifications: ['notifications'],
  dashboard: ['dashboard'],
  analytics: ['analytics'],
  teamActivity: ['teamActivity'],
}

const TIMES = {
  HACKATHONS: 5 * 60 * 1000,
  TASKS: 2 * 60 * 1000,
  TEAM: 5 * 60 * 1000,
  RESOURCES: 5 * 60 * 1000,
  NOTES: 5 * 60 * 1000,
  EVENTS: 5 * 60 * 1000,
  NOTIFICATIONS: 30 * 1000,
  DASHBOARD: 2 * 60 * 1000,
  ANALYTICS: 5 * 60 * 1000,
}

export function useHackathons() {
  return useQuery({
    queryKey: keys.hackathons,
    queryFn: () => api.getHackathons().then(r => r.data),
    staleTime: TIMES.HACKATHONS,
  })
}

export function useHackathon(id) {
  return useQuery({
    queryKey: keys.hackathon(id),
    queryFn: () => api.getHackathon(id).then(r => r.data),
    staleTime: TIMES.HACKATHONS,
    enabled: !!id,
  })
}

export function useTasks(filters) {
  return useQuery({
    queryKey: keys.tasks(filters),
    queryFn: () => api.getTasks(filters || {}).then(r => r.data),
    staleTime: TIMES.TASKS,
  })
}

export function useTask(id) {
  return useQuery({
    queryKey: keys.task(id),
    queryFn: () => api.getTask(id).then(r => r.data),
    staleTime: TIMES.TASKS,
    enabled: !!id,
  })
}

export function useTeam() {
  return useQuery({
    queryKey: keys.team,
    queryFn: () => api.getTeamMembers().then(r => r.data),
    staleTime: TIMES.TEAM,
  })
}

export function useResources(hackathonId) {
  const queryFn = hackathonId
    ? () => api.getResourcesByHackathon(hackathonId).then(r => r.data)
    : () => api.getResources().then(r => r.data)
  return useQuery({
    queryKey: keys.resources(hackathonId),
    queryFn,
    staleTime: TIMES.RESOURCES,
  })
}

export function useNotes() {
  return useQuery({
    queryKey: keys.notes,
    queryFn: () => api.getNotes().then(r => r.data),
    staleTime: TIMES.NOTES,
  })
}

export function useEvents(filters) {
  return useQuery({
    queryKey: keys.events(filters),
    queryFn: () => api.getEvents(filters || {}).then(r => r.data),
    staleTime: TIMES.EVENTS,
  })
}

export function useNotifications() {
  return useQuery({
    queryKey: keys.notifications,
    queryFn: () => api.getNotifications().then(r => r.data),
    staleTime: TIMES.NOTIFICATIONS,
  })
}

export function useDashboard() {
  return useQuery({
    queryKey: keys.dashboard,
    queryFn: () => api.getDashboardStats().then(r => r.data),
    staleTime: TIMES.DASHBOARD,
  })
}

export function useAnalytics() {
  return useQuery({
    queryKey: keys.analytics,
    queryFn: () => api.getAnalytics().then(r => r.data),
    staleTime: TIMES.ANALYTICS,
  })
}

export function useTeamActivity() {
  return useQuery({
    queryKey: keys.teamActivity,
    queryFn: () => api.getTeamActivity().then(r => r.data),
    staleTime: TIMES.ANALYTICS,
  })
}

export function useInvalidate() {
  const qc = useQueryClient()
  return (queryKeys) => qc.invalidateQueries({ queryKey: queryKeys })
}
