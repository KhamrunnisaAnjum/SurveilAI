import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import { Card, CardTitle, CardContent, Button, Select, Badge } from '@/components/ui'
import { FacilityCard } from '@/components/FacilityCard'
import { useFacilities } from '@/hooks/useFacilities'
import { useLocationStore } from '@/stores/locationStore'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const typeIcons: Record<string, string> = {
  hospital: '🏥', blood_bank: '🩸', ambulance: '🚑', clinic: '',
}

export function Emergency() {
  const { t } = useTranslation()
  const coords = useLocationStore((s) => s.coords)
  const [radius, setRadius] = useState(5000)
  const [filter, setFilter] = useState('')
  const { data: facilities } = useFacilities(coords, radius)

  const filteredFacilities = (facilities || []).filter((f) => {
    if (filter && f.type !== filter) return false
    return true
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-800 tracking-tight">{t('emergency.title')}</h1>
          <p className="text-sm text-surface-400 mt-1">Find nearby emergency resources</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => useLocationStore.getState().refresh()}>
          {t('emergency.myLocation')}
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">{t('emergency.filter')}</option>
          <option value="hospital">Hospitals</option>
          <option value="blood_bank">Blood Banks</option>
          <option value="ambulance">Ambulances</option>
          <option value="clinic">Clinics</option>
        </Select>
        <Select value={String(radius)} onChange={(e) => setRadius(Number(e.target.value))}>
          <option value="500">500m</option>
          <option value="1000">1km</option>
          <option value="5000">5km</option>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0 overflow-hidden">
          <div style={{ height: 450 }} className="rounded-2xl overflow-hidden">
            <MapContainer center={[coords?.lat || 20.5937, coords?.lng || 78.9629]} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {coords && (
                <>
                  <Marker position={[coords.lat, coords.lng]}>
                    <Popup>Your Location</Popup>
                  </Marker>
                  <Circle center={[coords.lat, coords.lng]} radius={radius} pathOptions={{ color: '#10b981', fillOpacity: 0.1 }} />
                </>
              )}
              {filteredFacilities.map((f) => (
                <Marker key={f.id} position={[f.lat, f.lng]}>
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold">{typeIcons[f.type]} {f.name}</p>
                      <p className="text-xs text-gray-500">{f.address}</p>
                      {f.availableBeds > 0 && <p>Beds: {f.availableBeds}</p>}
                      <p className="text-xs text-blue-500">{f.contact}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFacilities.map((f) => (
          <FacilityCard key={f.id} facility={f} />
        ))}
      </div>
    </div>
  )
}
