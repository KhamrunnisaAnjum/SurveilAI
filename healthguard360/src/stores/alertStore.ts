import { create } from 'zustand'
import type { Alert } from '@/lib/types'

interface AlertState {
  alerts: Alert[]
  unreadCount: number
  setAlerts: (alerts: Alert[]) => void
  markRead: (id: string) => void
  addAlert: (alert: Alert) => void
  dismissAlert: (id: string) => void
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  unreadCount: 0,
  setAlerts: (alerts) => set({ alerts, unreadCount: alerts.filter((a) => !a.acknowledged).length }),
  markRead: (id) =>
    set((s) => {
      const alerts = s.alerts.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
      return { alerts, unreadCount: alerts.filter((a) => !a.acknowledged).length }
    }),
  addAlert: (alert) => set((s) => ({ alerts: [alert, ...s.alerts], unreadCount: s.unreadCount + 1 })),
  dismissAlert: (id) =>
    set((s) => {
      const alerts = s.alerts.filter((a) => a.id !== id)
      return { alerts, unreadCount: alerts.filter((a) => !a.acknowledged).length }
    }),
}))
