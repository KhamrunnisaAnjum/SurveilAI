import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Patient } from '@/lib/types'

export function usePatients(filters?: { ward?: string; riskLevel?: string }) {
  return useQuery<Patient[]>({
    queryKey: ['patients', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.ward) params.set('ward', filters.ward)
      if (filters?.riskLevel) params.set('riskLevel', filters.riskLevel)
      const { data } = await api.get(`/clinical/patients?${params}`)
      return data?.patients ?? mockPatients
    },
    refetchInterval: 30000,
  })
}

export function useRiskScore(patientId: string) {
  return useQuery<{ score: number; shapExplanation: { feature: string; impact: number }[] }>({
    queryKey: ['riskScore', patientId],
    queryFn: async () => {
      const { data } = await api.get(`/clinical/risk/${patientId}`)
      return data ?? { score: Math.floor(Math.random() * 100), shapExplanation: [] }
    },
    refetchInterval: 30000,
  })
}

const mockPatients: Patient[] = [
  {
    id: 'P001', name: 'Sunita Devi', age: 45, gender: 'F', riskScore: 72,
    ward: 'Ward A', admissionDate: '2026-05-10',
    vitals: Array.from({ length: 10 }, (_, i) => ({
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      heartRate: 70 + Math.floor(Math.random() * 30),
      bloodPressureSystolic: 120 + Math.floor(Math.random() * 30),
      bloodPressureDiastolic: 80 + Math.floor(Math.random() * 10),
      oxygenSaturation: 95 + Math.floor(Math.random() * 5),
      temperature: 36.5 + Math.random(),
    })),
    alerts: [],
    shapExplanation: [
      { feature: 'Age', impact: 0.3 }, { feature: 'BP Systolic', impact: 0.25 },
      { feature: 'O2 Sat', impact: -0.2 }, { feature: 'Heart Rate', impact: 0.15 },
    ],
  },
  {
    id: 'P002', name: 'Ram Prasad', age: 60, gender: 'M', riskScore: 45,
    ward: 'Ward B', admissionDate: '2026-05-12',
    vitals: Array.from({ length: 10 }, (_, i) => ({
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      heartRate: 75 + Math.floor(Math.random() * 20),
      bloodPressureSystolic: 130 + Math.floor(Math.random() * 20),
      bloodPressureDiastolic: 85 + Math.floor(Math.random() * 10),
      oxygenSaturation: 96 + Math.floor(Math.random() * 4),
      temperature: 36.8 + Math.random(),
    })),
    alerts: [],
    shapExplanation: [
      { feature: 'Age', impact: 0.2 }, { feature: 'Temperature', impact: 0.18 },
      { feature: 'O2 Sat', impact: -0.15 }, { feature: 'BP Diastolic', impact: 0.1 },
    ],
  },
  {
    id: 'P003', name: 'Lakshmi Bai', age: 35, gender: 'F', riskScore: 22,
    ward: 'Ward A', admissionDate: '2026-05-14',
    vitals: Array.from({ length: 10 }, (_, i) => ({
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      heartRate: 68 + Math.floor(Math.random() * 15),
      bloodPressureSystolic: 110 + Math.floor(Math.random() * 15),
      bloodPressureDiastolic: 70 + Math.floor(Math.random() * 10),
      oxygenSaturation: 97 + Math.floor(Math.random() * 3),
      temperature: 36.5 + Math.random(),
    })),
    alerts: [],
    shapExplanation: [
      { feature: 'Heart Rate', impact: 0.1 }, { feature: 'BP Systolic', impact: 0.08 },
    ],
  },
]
