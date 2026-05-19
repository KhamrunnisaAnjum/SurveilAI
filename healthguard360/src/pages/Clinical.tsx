import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardTitle, CardContent, Input, Select, Button, Badge } from '@/components/ui'
import { RiskBadge } from '@/components/RiskBadge'
import { PatientRiskDrawer } from '@/components/PatientRiskDrawer'
import { usePatients } from '@/hooks/usePatients'
import type { Patient } from '@/lib/types'

export function Clinical() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [wardFilter, setWardFilter] = useState('')
  const [riskFilter, setRiskFilter] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const { data: patients } = usePatients()

  const filtered = (patients || []).filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    if (wardFilter && p.ward !== wardFilter) return false
    if (riskFilter === 'high' && p.riskScore < 70) return false
    if (riskFilter === 'moderate' && (p.riskScore < 30 || p.riskScore >= 70)) return false
    if (riskFilter === 'low' && p.riskScore >= 30) return false
    return true
  })

  const handleEscalate = (id: string) => {
    console.log('Escalating patient:', id)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-800 tracking-tight">{t('nav.clinical')}</h1>
        <p className="text-sm text-surface-400 mt-1">Real-time patient risk monitoring</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder={t('common.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={wardFilter} onChange={(e) => setWardFilter(e.target.value)}>
          <option value="">All Wards</option>
          <option value="Ward A">Ward A</option>
          <option value="Ward B">Ward B</option>
          <option value="Ward C">Ward C</option>
        </Select>
        <Select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
          <option value="">All Risk Levels</option>
          <option value="high">High Risk</option>
          <option value="moderate">Moderate Risk</option>
          <option value="low">Low Risk</option>
        </Select>
      </div>

      <Card>
        <CardTitle>Patient List</CardTitle>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200">
                  <th className="text-left py-3 px-2 text-surface-400 font-medium text-xs uppercase tracking-wider">Name</th>
                  <th className="text-left py-3 px-2 text-surface-400 font-medium text-xs uppercase tracking-wider">Age/Gender</th>
                  <th className="text-left py-3 px-2 text-surface-400 font-medium text-xs uppercase tracking-wider">Ward</th>
                  <th className="text-left py-3 px-2 text-surface-400 font-medium text-xs uppercase tracking-wider">Risk Score</th>
                  <th className="text-right py-3 px-2 text-surface-400 font-medium text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-surface-100 hover:bg-surface-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedPatient(p)}
                  >
                    <td className="py-3 px-2 font-medium text-surface-800">{p.name}</td>
                    <td className="py-3 px-2 text-surface-500">{p.age} / {p.gender}</td>
                    <td className="py-3 px-2 text-surface-500">{p.ward}</td>
                    <td className="py-3 px-2">
                      <RiskBadge score={p.riskScore} size="sm" />
                    </td>
                    <td className="py-3 px-2 text-right">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => { e.stopPropagation(); handleEscalate(p.id) }}
                      >
                        {t('alert.escalate')}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="text-surface-400 text-center py-8">{t('common.noData')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedPatient && (
        <PatientRiskDrawer
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onEscalate={handleEscalate}
        />
      )}
    </div>
  )
}
