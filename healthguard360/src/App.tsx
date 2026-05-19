import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'
import { useLocationStore } from '@/stores/locationStore'
import { Layout } from '@/components/Layout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Login } from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'
import { Community } from '@/pages/Community'
import { Clinical } from '@/pages/Clinical'
import { Emergency } from '@/pages/Emergency'
import { Alerts } from '@/pages/Alerts'
import { Admin } from '@/pages/Admin'
import './i18n'
import type { Role } from '@/lib/types'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 10000, refetchOnWindowFocus: false },
  },
})

function AppContent() {
  const { i18n } = useTranslation()
  const language = useAuthStore((s) => s.language)
  const refreshLocation = useLocationStore((s) => s.refresh)

  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language)
    }
  }, [language, i18n])

  useEffect(() => {
    refreshLocation()
  }, [refreshLocation])

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route element={<ProtectedRoute allowedRoles={['patient', 'asha', 'officer']} />}>
            <Route path="/community" element={<Community />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['nurse']} />}>
            <Route path="/clinical" element={<Clinical />} />
          </Route>
          <Route path="/emergency" element={<Emergency />} />
          <Route element={<ProtectedRoute allowedRoles={['asha', 'officer', 'admin']} />}>
            <Route path="/alerts" element={<Alerts />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
