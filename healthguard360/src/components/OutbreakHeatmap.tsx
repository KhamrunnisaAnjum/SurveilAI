import { useTranslation } from 'react-i18next'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { useOutbreakData } from '@/hooks/useOutbreakData'
import { formatDate } from '@/lib/utils'
import 'leaflet/dist/leaflet.css'

interface OutbreakHeatmapProps {
  districtId: string
  days?: 7 | 14 | 30
  height?: number
}

const getSeverityColor = (severity: number) => {
  if (severity < 30) return { color: '#10b981', fill: 'rgba(16,185,129,0.3)' }
  if (severity <= 70) return { color: '#f59e0b', fill: 'rgba(245,158,11,0.3)' }
  return { color: '#ef4444', fill: 'rgba(239,68,68,0.3)' }
}

export function OutbreakHeatmap({ districtId, days = 7, height = 400 }: OutbreakHeatmapProps) {
  const { t } = useTranslation()
  const { data: reports } = useOutbreakData(districtId, days)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('map.heatmap')} ({days}-day)</CardTitle>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-primary" />{t('risk.low')}</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-warning" />{t('risk.moderate')}</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-danger" />{t('risk.high')}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ height }} className="rounded-xl overflow-hidden border border-surface-200">
          <MapContainer center={[20.5937, 78.9629]} zoom={10} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {reports?.map((r) => {
              const { color, fill } = getSeverityColor(r.severity)
              const radius = Math.max(8, r.severity / 2)
              return (
                <CircleMarker key={r.id} center={[r.lat, r.lng]} radius={radius} pathOptions={{ color, fillColor: fill, fillOpacity: 0.6, weight: 1 }}>
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold">{r.bodyPart}</p>
                      <p>{r.symptoms.join(', ')}</p>
                      <p>Severity: {r.severity}</p>
                      <p className="text-xs text-gray-500">{formatDate(r.timestamp)}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              )
            })}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  )
}
