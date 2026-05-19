import { useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import type { SymptomReport } from '@/lib/types'

export function useSubmitSymptoms() {
  return useMutation({
    mutationFn: async (report: Partial<SymptomReport>) => {
      const { data } = await api.post('/community/reports', report)
      return data
    },
  })
}
