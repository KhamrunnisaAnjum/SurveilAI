import { useTranslation } from 'react-i18next'
import { SymptomForm } from '@/components/SymptomForm'
import { OutbreakHeatmap } from '@/components/OutbreakHeatmap'
import { FacilityCard } from '@/components/FacilityCard'
import { Card, CardTitle, CardContent, Badge } from '@/components/ui'
import { useFacilities } from '@/hooks/useFacilities'
import { useAlerts } from '@/hooks/useAlerts'
import { useAlertStore } from '@/stores/alertStore'
import { useLocationStore } from '@/stores/locationStore'
import { useEffect } from 'react'

export function Community() {
  const { t } = useTranslation()
  const coords = useLocationStore((s) => s.coords)
  const { data: facilities } = useFacilities(coords)
  const { data: apiAlerts } = useAlerts()
  const { alerts, setAlerts } = useAlertStore()

  useEffect(() => {
    if (apiAlerts) setAlerts(apiAlerts)
  }, [apiAlerts, setAlerts])

  const outbreakAlerts = alerts.filter((a) => a.type === 'outbreak' && !a.acknowledged)

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-800 tracking-tight">{t('nav.community')}</h1>
        <p className="text-sm text-surface-400 mt-1">Report symptoms and view community health data</p>
      </div>

      {outbreakAlerts.length > 0 && (
        <div className="bg-danger-50 border border-danger-100 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-xl"></span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700">Outbreak Alert</p>
            <p className="text-xs text-red-600/70">{outbreakAlerts[0].title}: {outbreakAlerts[0].message}</p>
          </div>
          <Badge variant="danger">{outbreakAlerts[0].severity}</Badge>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SymptomForm onSubmit={(data) => console.log('Community report:', data)} />
        <div className="space-y-4">
          <OutbreakHeatmap districtId="D001" days={7} height={300} />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-surface-800 mb-4">{t('facility.nearest')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {facilities?.map((f) => (
            <FacilityCard key={f.id} facility={f} />
          ))}
        </div>
      </div>
    </div>
  )
}
