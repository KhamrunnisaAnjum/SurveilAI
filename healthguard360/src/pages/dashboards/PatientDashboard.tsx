import { useTranslation } from 'react-i18next'
import { Card, CardTitle, CardContent, Button, Badge } from '@/components/ui'
import { SymptomForm } from '@/components/SymptomForm'
import { FacilityCard } from '@/components/FacilityCard'
import { useFacilities } from '@/hooks/useFacilities'
import { useAlerts } from '@/hooks/useAlerts'
import { useAlertStore } from '@/stores/alertStore'
import { useLocationStore } from '@/stores/locationStore'
import { useEffect } from 'react'

export function PatientDashboard() {
  const { t } = useTranslation()
  const coords = useLocationStore((s) => s.coords)
  const { data: facilities } = useFacilities(coords)
  const { data: apiAlerts } = useAlerts()
  const { alerts, setAlerts } = useAlertStore()

  useEffect(() => {
    if (apiAlerts) setAlerts(apiAlerts)
  }, [apiAlerts, setAlerts])

  const outbreakAlerts = alerts.filter((a) => a.type === 'outbreak' && !a.acknowledged)

  const healthTips = [
    { title: 'Stay Hydrated', body: 'Drink at least 8 glasses of water daily to maintain good health.', icon: '💧' },
    { title: 'Wash Hands', body: 'Regular hand washing prevents the spread of infections.', icon: '🧼' },
    { title: 'Vaccinate', body: 'Ensure your family vaccinations are up to date.', icon: '💉' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-800 tracking-tight">{t('dashboard.patient')}</h1>
          <p className="text-sm text-surface-400 mt-1">Welcome back</p>
        </div>
        <Badge variant="primary">{t('common.online')}</Badge>
      </div>

      {outbreakAlerts.length > 0 && (
        <div className="bg-danger-50 border border-danger-100 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-xl">🚨</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700">{outbreakAlerts[0].title}</p>
            <p className="text-xs text-red-600/70 mt-0.5">{outbreakAlerts[0].message}</p>
          </div>
          <Badge variant="danger">{outbreakAlerts[0].severity}</Badge>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SymptomForm onSubmit={(data) => console.log('Symptom report:', data)} />

        <div className="space-y-4">
          <Card>
            <CardTitle>{t('health.tip')}</CardTitle>
            <CardContent>
              <div className="space-y-3">
                {healthTips.map((tip, i) => (
                  <div key={i} className="flex gap-3 bg-surface-50 rounded-xl p-3 border border-surface-100">
                    <span className="text-2xl">{tip.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-surface-800">{tip.title}</p>
                      <p className="text-xs text-surface-500 mt-0.5">{tip.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-surface-800 mb-4">{t('facility.nearest')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {facilities?.slice(0, 3).map((f) => (
            <FacilityCard key={f.id} facility={f} />
          ))}
        </div>
      </div>
    </div>
  )
}
