import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui'
import type { Facility } from '@/lib/types'

interface FacilityCardProps {
  facility: Facility
}

const typeColors: Record<string, 'primary' | 'info' | 'warning' | 'default' | 'danger'> = {
  hospital: 'primary', blood_bank: 'danger', ambulance: 'warning', clinic: 'info',
}

export function FacilityCard({ facility }: FacilityCardProps) {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>{facility.name}</CardTitle>
          <Badge variant={typeColors[facility.type] || 'default'}>
            {facility.type.replace('_', ' ')}
          </Badge>
        </div>
        {facility.distance && (
          <span className="text-xs text-surface-400">{(facility.distance / 1000).toFixed(1)} km</span>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-surface-500">{facility.address}</p>
          <div className="grid grid-cols-2 gap-3">
            {facility.type !== 'blood_bank' && facility.type !== 'ambulance' && (
              <>
                <div className="bg-primary-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-primary-700">{facility.availableBeds}</p>
                  <p className="text-xs text-primary-600/70">{t('facility.beds')}</p>
                </div>
                <div className="bg-info-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-cyan-700">{facility.icuBedsAvailable}</p>
                  <p className="text-xs text-cyan-600/70">{t('facility.icu')}</p>
                </div>
              </>
            )}
            {facility.bloodUnits.length > 0 && (
              <div className="col-span-2 bg-danger-50 rounded-xl p-3">
                <p className="text-xs text-red-600/70 mb-2">{t('facility.blood')}</p>
                <div className="flex flex-wrap gap-2">
                  {facility.bloodUnits.map((b) => (
                    <span key={b.type} className="bg-white text-red-700 text-xs px-2 py-1 rounded-lg font-medium">
                      {b.type}: {b.units}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          {facility.oxygenSupply && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-primary-700 font-medium">{t('facility.oxygen')}</span>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lng}`, '_blank')}
            >
              {t('facility.navigate')}
            </Button>
            <Button size="sm" variant="default" onClick={() => window.open(`tel:${facility.contact}`, '_self')}>
              {t('facility.call')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
