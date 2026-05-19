import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { SymptomReport } from '@/lib/types'

export function useOutbreakData(districtId: string, days = 7) {
  return useQuery<SymptomReport[]>({
    queryKey: ['outbreaks', districtId, days],
    queryFn: async () => {
      const { data } = await api.get('/community/outbreaks', {
        params: { districtId, days },
      })
      return data?.reports ?? mockReports
    },
  })
}

const mockReports: SymptomReport[] = Array.from({ length: 30 }, (_, i) => ({
  id: `R${i}`,
  bodyPart: ['Head', 'Chest', 'Abdomen', 'Limbs'][Math.floor(Math.random() * 4)],
  symptoms: ['Fever', 'Cough', 'Pain', 'Fatigue'].slice(0, Math.floor(Math.random() * 3) + 1),
  severity: Math.floor(Math.random() * 100),
  lat: 20.57 + Math.random() * 0.08,
  lng: 78.92 + Math.random() * 0.1,
  districtId: 'D001',
  timestamp: new Date(Date.now() - i * 3600000).toISOString(),
  reportedBy: 'mock',
}))
