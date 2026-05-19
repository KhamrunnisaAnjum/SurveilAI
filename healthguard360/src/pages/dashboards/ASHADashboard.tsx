import { useTranslation } from 'react-i18next'
import { Card, CardTitle, CardContent, Badge } from '@/components/ui'
import { OutbreakHeatmap } from '@/components/OutbreakHeatmap'
import { RiskBadge } from '@/components/RiskBadge'

export function ASHADashboard() {
  const { t } = useTranslation()

  const pendingReports = [
    { id: 1, name: 'Village A', reports: 3, time: '2h ago' },
    { id: 2, name: 'Village B', reports: 7, time: '1h ago' },
    { id: 3, name: 'Village C', reports: 1, time: '30m ago' },
  ]

  const highRiskMembers = [
    { name: 'Sarla Devi', age: 65, riskScore: 82, village: 'Village A' },
    { name: 'Mohan Lal', age: 58, riskScore: 75, village: 'Village B' },
    { name: 'Geeta Bai', age: 70, riskScore: 68, village: 'Village A' },
  ]

  const visits = [
    { name: 'Ram Kumar', time: '10:00 AM', village: 'Village A', type: 'Follow-up' },
    { name: 'Pushpa Devi', time: '11:30 AM', village: 'Village B', type: 'Screening' },
    { name: 'Krishna Murari', time: '2:00 PM', village: 'Village C', type: 'Vaccination' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-800 tracking-tight">{t('dashboard.asha')}</h1>
        <p className="text-sm text-surface-400 mt-1">Your assigned zone overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardTitle>{t('pending.reports')}</CardTitle>
          <CardContent>
            <div className="space-y-2">
              {pendingReports.map((r) => (
                <div key={r.id} className="flex items-center justify-between bg-surface-50 rounded-xl p-3 border border-surface-100">
                  <div>
                    <p className="text-sm font-medium text-surface-800">{r.name}</p>
                    <p className="text-xs text-surface-400">{r.reports} pending • {r.time}</p>
                  </div>
                  <Badge variant="warning">{r.reports}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardTitle>{t('high.risk.members')}</CardTitle>
          <CardContent>
            <div className="space-y-2">
              {highRiskMembers.map((m) => (
                <div key={m.name} className="flex items-center justify-between bg-surface-50 rounded-xl p-3 border border-surface-100">
                  <div>
                    <p className="text-sm font-medium text-surface-800">{m.name}, {m.age}</p>
                    <p className="text-xs text-surface-400">{m.village}</p>
                  </div>
                  <RiskBadge score={m.riskScore} size="sm" showLabel={false} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardTitle>{t('visit.schedule')}</CardTitle>
          <CardContent>
            <div className="space-y-2">
              {visits.map((v) => (
                <div key={v.name} className="bg-surface-50 rounded-xl p-3 border border-surface-100">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-surface-800">{v.name}</p>
                    <span className="text-xs text-primary-600 font-medium">{v.time}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-surface-400">{v.village}</span>
                    <Badge variant="outline">{v.type}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <OutbreakHeatmap districtId="D001" days={7} height={300} />
    </div>
  )
}
