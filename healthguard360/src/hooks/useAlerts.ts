import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Alert, Role } from '@/lib/types'

export function useAlerts(role?: Role) {
  return useQuery<Alert[]>({
    queryKey: ['alerts', role],
    queryFn: async () => {
      const { data } = await api.get('/alerts', { params: { role } })
      return data?.alerts ?? mockAlerts
    },
    refetchInterval: 15000,
  })
}

export function useCreateAlert() {
  return useMutation({
    mutationFn: async (alert: Partial<Alert>) => {
      const { data } = await api.post('/alerts', alert)
      return data
    },
  })
}

const mockAlerts: Alert[] = [
  {
    id: 'A001', type: 'outbreak', severity: 'high',
    title: 'Dengue Outbreak Detected',
    message: '15 cases reported in Ward A in the last 48 hours. Immediate vector control required.',
    districtId: 'D001', timestamp: new Date().toISOString(), acknowledged: false,
  },
  {
    id: 'A002', type: 'resource_shortage', severity: 'critical',
    title: 'Oxygen Supply Critical',
    message: 'District Hospital oxygen reserves at 12%. Emergency resupply needed within 4 hours.',
    districtId: 'D001', timestamp: new Date(Date.now() - 3600000).toISOString(), acknowledged: false,
  },
  {
    id: 'A003', type: 'high_risk', severity: 'moderate',
    title: 'High Risk Patient Alert',
    message: 'Patient Ram Prasad (P002) risk score elevated to 72 in Ward B.',
    districtId: 'D001', timestamp: new Date(Date.now() - 7200000).toISOString(), acknowledged: true,
  },
  {
    id: 'A004', type: 'outbreak', severity: 'low',
    title: 'Malaria Surveillance Alert',
    message: 'Seasonal increase in malaria cases expected. Proactive testing recommended.',
    districtId: 'D001', timestamp: new Date(Date.now() - 86400000).toISOString(), acknowledged: false,
  },
]
