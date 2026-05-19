import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardTitle, CardContent, Button, Input, Select, Badge } from '@/components/ui'
import { AlertFeed } from '@/components/AlertFeed'
import { useAlerts, useCreateAlert } from '@/hooks/useAlerts'
import { useAuthStore } from '@/stores/authStore'
import { formatDate, formatTime } from '@/lib/utils'

export function Alerts() {
  const { t } = useTranslation()
  const role = useAuthStore((s) => s.role)
  const [showCreate, setShowCreate] = useState(false)
  const [historyFilter, setHistoryFilter] = useState('all')
  const { data: alerts } = useAlerts(role ?? undefined)
  const createAlert = useCreateAlert()

  const [newAlert, setNewAlert] = useState({ title: '', message: '', type: 'outbreak', severity: 'moderate' })

  const handleCreateAlert = () => {
    createAlert.mutate(newAlert as any)
    setShowCreate(false)
    setNewAlert({ title: '', message: '', type: 'outbreak', severity: 'moderate' })
  }

  const filteredAlerts = (alerts || []).filter((a) => {
    if (historyFilter === 'active') return !a.acknowledged
    if (historyFilter === 'resolved') return a.acknowledged
    return true
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-800 tracking-tight">{t('nav.alerts')}</h1>
          <p className="text-sm text-surface-400 mt-1">Unified alert hub</p>
        </div>
        {(role === 'officer' || role === 'admin') && (
          <Button onClick={() => setShowCreate(!showCreate)}>
            {t('alert.create')}
          </Button>
        )}
      </div>

      {showCreate && (
        <Card>
          <CardTitle>{t('alert.create')}</CardTitle>
          <CardContent>
            <div className="space-y-3">
              <Input
                placeholder="Alert Title"
                value={newAlert.title}
                onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
              />
              <Input
                placeholder="Alert Message"
                value={newAlert.message}
                onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
              />
              <div className="flex gap-3">
                <Select value={newAlert.type} onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value })}>
                  <option value="outbreak">Outbreak</option>
                  <option value="high_risk">High Risk</option>
                  <option value="resource_shortage">Resource Shortage</option>
                </Select>
                <Select value={newAlert.severity} onChange={(e) => setNewAlert({ ...newAlert, severity: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </Select>
              </div>
              <Button onClick={handleCreateAlert}>{t('alert.broadcast')}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertFeed role={role ?? undefined} />

        <div>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <CardTitle>Alert History</CardTitle>
              <Select value={historyFilter} onChange={(e) => setHistoryFilter(e.target.value)} className="w-32">
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="resolved">Resolved</option>
              </Select>
            </div>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredAlerts.length === 0 && (
                  <p className="text-surface-400 text-sm py-8 text-center">{t('common.noData')}</p>
                )}
                {filteredAlerts.map((a) => (
                  <div key={a.id} className="flex items-center justify-between bg-surface-50 rounded-xl p-3 border border-surface-100">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${a.acknowledged ? 'bg-primary' : 'bg-warning'}`} />
                      <div>
                        <p className="text-sm font-medium text-surface-800">{a.title}</p>
                        <p className="text-xs text-surface-400">{formatDate(a.timestamp)} • {formatTime(a.timestamp)}</p>
                      </div>
                    </div>
                    <Badge variant={a.severity === 'high' || a.severity === 'critical' ? 'danger' : 'warning'}>
                      {a.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
