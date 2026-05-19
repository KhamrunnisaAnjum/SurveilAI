import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardTitle, CardContent, Badge, Button } from '@/components/ui'
import { RiskBadge } from '@/components/RiskBadge'
import { PatientRiskDrawer } from '@/components/PatientRiskDrawer'
import { usePatients } from '@/hooks/usePatients'
import type { Patient } from '@/lib/types'

export function NurseDashboard() {
  const { t } = useTranslation()
  const { data: patients } = usePatients()
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  const topRisk = patients ? [...patients].sort((a, b) => b.riskScore - a.riskScore).slice(0, 5) : []
  const wardRisk = [
    { ward: 'Ward A', high: 5, moderate: 8, low: 12 },
    { ward: 'Ward B', high: 2, moderate: 6, low: 15 },
    { ward: 'Ward C', high: 8, moderate: 10, low: 7 },
    { ward: 'Ward D', high: 1, moderate: 4, low: 20 },
  ]

  const handleEscalate = (id: string) => {
    console.log('Escalate patient:', id)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-800 tracking-tight">{t('dashboard.nurse')}</h1>
        <p className="text-sm text-surface-400 mt-1">Clinical risk monitoring</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardTitle>{t('ward.overview')}</CardTitle>
          <CardContent>
            <div className="space-y-2">
              {wardRisk.map((w) => (
                <div key={w.ward} className="bg-surface-50 rounded-xl p-4 border border-surface-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-surface-800">{w.ward}</span>
                    <span className="text-xs text-surface-400">{w.high + w.moderate + w.low} patients</span>
                  </div>
                  <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-surface-100">
                    <div className="bg-danger transition-all rounded-l-full" style={{ width: `${(w.high / (w.high + w.moderate + w.low)) * 100}%` }} />
                    <div className="bg-warning transition-all" style={{ width: `${(w.moderate / (w.high + w.moderate + w.low)) * 100}%` }} />
                    <div className="bg-primary transition-all rounded-r-full" style={{ width: `${(w.low / (w.high + w.moderate + w.low)) * 100}%` }} />
                  </div>
                  <div className="flex gap-3 text-xs text-surface-400 mt-2">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-danger" />{w.high} High</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning" />{w.moderate} Mod</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" />{w.low} Low</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardTitle>Top 5 Highest Risk Patients</CardTitle>
          <CardContent>
            <div className="space-y-2">
              {topRisk.map((p, i) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between bg-surface-50 rounded-xl p-3 border border-surface-100 cursor-pointer hover:border-primary/30 hover:bg-primary-50/30 transition-all"
                  onClick={() => setSelectedPatient(p)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-surface-400 font-medium w-5">#{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-surface-800">{p.name}</p>
                      <p className="text-xs text-surface-400">Ward {p.ward} • {p.gender === 'M' ? 'Male' : 'Female'}, {p.age}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <RiskBadge score={p.riskScore} size="sm" showLabel={false} />
                    <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); handleEscalate(p.id) }}>
                      Escalate
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardTitle>Active Clinical Alerts</CardTitle>
          <CardContent>
            <div className="space-y-2">
              <div className="bg-danger-50 border border-danger-100 rounded-xl p-3">
                <p className="text-sm font-semibold text-red-700">⚠️ P002 - BP Critical</p>
                <p className="text-xs text-red-600/70 mt-1">Patient Ram Prasad - BP 180/110. Immediate attention needed.</p>
                <Badge variant="danger" className="mt-2">Urgent</Badge>
              </div>
              <div className="bg-warning-50 border border-warning-100 rounded-xl p-3">
                <p className="text-sm font-semibold text-amber-700">⚠️ P004 - O2 Saturation Low</p>
                <p className="text-xs text-amber-600/70 mt-1">Patient Geeta Devi - SpO2 at 88%. Monitor closely.</p>
                <Badge variant="warning" className="mt-2">Monitoring</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardTitle>{t('shift.handover')}</CardTitle>
          <CardContent>
            <div className="bg-surface-50 rounded-xl p-4 space-y-2 border border-surface-100">
              <p className="text-sm font-semibold text-surface-800">ML-Predicted Summary</p>
              <div className="text-xs text-surface-500 space-y-1">
                <p>• 3 patients likely to need ICU transfer in next 24h</p>
                <p>• Ward C has highest deterioration risk (+18%)</p>
                <p>• 2 discharge-ready patients identified</p>
                <p>• Medication adherence alert for Ward A patients</p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="info">ML Generated</Badge>
                <span className="text-xs text-surface-400">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
