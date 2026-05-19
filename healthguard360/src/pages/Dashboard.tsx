import { useAuthStore } from '@/stores/authStore'
import { PatientDashboard } from './dashboards/PatientDashboard'
import { ASHADashboard } from './dashboards/ASHADashboard'
import { NurseDashboard } from './dashboards/NurseDashboard'
import { PHODashboard } from './dashboards/PHODashboard'

export function Dashboard() {
  const role = useAuthStore((s) => s.role)

  switch (role) {
    case 'patient':
      return <PatientDashboard />
    case 'asha':
      return <ASHADashboard />
    case 'nurse':
      return <NurseDashboard />
    case 'officer':
    case 'admin':
      return <PHODashboard />
    default:
      return <PatientDashboard />
  }
}
