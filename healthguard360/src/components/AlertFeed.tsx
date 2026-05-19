import { useTranslation } from 'react-i18next'
import { Card, CardTitle, CardContent, Badge, Button } from '@/components/ui'
import { useAlertStore } from '@/stores/alertStore'
import { useAlerts } from '@/hooks/useAlerts'
import { formatDate, formatTime } from '@/lib/utils'
import { useEffect } from 'react'
import type { Role } from '@/lib/types'

interface AlertFeedProps {
  role?: Role
  showCreate?: boolean
}

const severityVariants: Record<string, 'danger' | 'warning' | 'info' | 'primary'> = {
  critical: 'danger', high: 'danger', moderate: 'warning', low: 'info',
}

const typeIcons: Record<string, string> = {
  outbreak: '', high_risk: '⚠️', resource_shortage: '',
}

export function AlertFeed({ role, showCreate }: AlertFeedProps) {
  const { t } = useTranslation()
  const { data: apiAlerts } = useAlerts(role)
  const { alerts, setAlerts, markRead, dismissAlert } = useAlertStore()

  useEffect(() => {
    if (apiAlerts) setAlerts(apiAlerts)
  }, [apiAlerts, setAlerts])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-surface-800">Alert Feed</h3>
        {showCreate && <Button size="sm">{t('alert.create')}</Button>}
      </div>
      {alerts.length === 0 && (
        <p className="text-surface-400 text-sm py-8 text-center">{t('common.noData')}</p>
      )}
      {alerts.map((alert) => (
        <Card key={alert.id} className="hover:border-primary/20 transition-all">
          <div className="flex items-start gap-3">
            <span className="text-xl">{typeIcons[alert.type] || '🔔'}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={severityVariants[alert.severity] || 'default'}>{alert.severity}</Badge>
                <span className="text-xs text-surface-400">{formatDate(alert.timestamp)} • {formatTime(alert.timestamp)}</span>
              </div>
              <p className="text-sm font-medium text-surface-800">{alert.title}</p>
              <p className="text-xs text-surface-500 mt-1">{alert.message}</p>
              <div className="flex gap-2 mt-3">
                {!alert.acknowledged && (
                  <Button size="sm" variant="outline" onClick={() => markRead(alert.id)}>
                    {t('alert.acknowledge')}
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => dismissAlert(alert.id)}>
                  {t('alert.dismiss')}
                </Button>
                <Button size="sm" variant="destructive">
                  {t('alert.escalate')}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
