import { useTranslation } from 'react-i18next'
import { Card, CardTitle, CardContent, Button, Badge } from '@/components/ui'
import { RiskBadge } from '@/components/RiskBadge'
import { formatDate, formatTime } from '@/lib/utils'
import type { Patient } from '@/lib/types'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface PatientRiskDrawerProps {
  patient: Patient
  onClose: () => void
  onEscalate: (id: string) => void
}

export function PatientRiskDrawer({ patient, onClose, onEscalate }: PatientRiskDrawerProps) {
  const { t } = useTranslation()

  const vitalsChart = patient.vitals.map((v) => ({
    time: formatTime(v.timestamp),
    hr: v.heartRate,
    sys: v.bloodPressureSystolic,
    dia: v.bloodPressureDiastolic,
    spo2: v.oxygenSaturation,
    temp: v.temperature,
  })).reverse()

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white border-l border-surface-200 overflow-y-auto animate-slide-in shadow-xl">
        <div className="p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-surface-800">{patient.name}</h2>
              <p className="text-surface-400 text-sm">
                {patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other'}, {patient.age} yrs
              </p>
              <p className="text-surface-400 text-xs mt-1">Ward: {patient.ward} | Admitted: {formatDate(patient.admissionDate)}</p>
            </div>
            <div className="flex items-center gap-2">
              <RiskBadge score={patient.riskScore} size="sm" />
              <Button variant="ghost" size="icon" onClick={onClose}>✕</Button>
            </div>
          </div>

          <Card>
            <CardTitle>Vitals Timeline</CardTitle>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={vitalsChart}>
                  <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                  <Line type="monotone" dataKey="hr" stroke="#10b981" name="Heart Rate" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="spo2" stroke="#06b6d4" name="SpO2" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardTitle>SHAP Explanation</CardTitle>
            <CardContent>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={patient.shapExplanation} layout="vertical">
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis type="category" dataKey="feature" tick={{ fill: '#94a3b8', fontSize: 10 }} width={80} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                  <Bar dataKey="impact" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {patient.alerts.length > 0 && (
            <Card>
              <CardTitle>Alert History</CardTitle>
              <CardContent>
                <div className="space-y-2">
                  {patient.alerts.map((a) => (
                    <div key={a.id} className="flex items-center justify-between bg-surface-50 rounded-xl p-3 border border-surface-100">
                      <div>
                        <p className="text-sm font-medium text-surface-800">{a.title}</p>
                        <p className="text-xs text-surface-400">{formatDate(a.timestamp)}</p>
                      </div>
                      <Badge variant={a.severity === 'high' || a.severity === 'critical' ? 'danger' : 'warning'}>
                        {a.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Button className="w-full" variant="destructive" onClick={() => onEscalate(patient.id)}>
            {t('alert.escalate')}
          </Button>
        </div>
      </div>
    </div>
  )
}
