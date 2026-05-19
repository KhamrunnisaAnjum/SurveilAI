import { create } from 'zustand'
import type { User, Role } from '@/lib/types'

interface AuthState {
  user: User | null
  role: Role | null
  token: string | null
  language: string
  setUser: (user: User, token: string) => void
  setLanguage: (lang: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('auth-user') || 'null'),
  role: (localStorage.getItem('auth-role') as Role) || null,
  token: localStorage.getItem('auth-token'),
  language: localStorage.getItem('i18nextLng') || 'en',
  setUser: (user, token) => {
    localStorage.setItem('auth-user', JSON.stringify(user))
    localStorage.setItem('auth-role', user.role)
    localStorage.setItem('auth-token', token)
    set({ user, role: user.role, token })
  },
  setLanguage: (lang) => {
    localStorage.setItem('i18nextLng', lang)
    set({ language: lang })
  },
  logout: () => {
    localStorage.removeItem('auth-user')
    localStorage.removeItem('auth-role')
    localStorage.removeItem('auth-token')
    set({ user: null, role: null, token: null })
  },
}))
