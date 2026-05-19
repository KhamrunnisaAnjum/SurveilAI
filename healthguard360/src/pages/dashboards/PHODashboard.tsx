import { useTranslation } from 'react-i18next'
import { Card, CardTitle, CardContent, Button, Badge } from '@/components/ui'
import { OutbreakHeatmap } from '@/components/OutbreakHeatmap'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

export function PHODashboard() {
  const { t } = useTranslation()

  const trendData = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    fever: Math.floor(Math.random() * 20),
    cough: Math.floor(Math.random() * 15),
    pain: Math.floor(Math.random() * 10),
  }))

  const clusterData = [
    { name: 'Ward A', cases: 45, beds: 30 },
    { name: 'Ward B', cases: 28, beds: 45 },
    { name: 'Ward C', cases: 62, beds: 20 },
    { name: 'Ward D', cases: 15, beds: 55 },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-800 tracking-tight">{t('dashboard.officer')}</h1>
          <p className="text-sm text-surface-400 mt-1">District health overview</p>
        </div>
        <Button>{t('alert.broadcast')}</Button>
      </div>

      <OutbreakHeatmap districtId="D001" days={7} height={350} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardTitle>{t('trend.charts')}</CardTitle>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={trendData}>
                <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                <Bar dataKey="fever" fill="#ef4444" radius={[4, 4, 0, 0]} name="Fever" />
                <Bar dataKey="cough" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Cough" />
                <Bar dataKey="pain" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Pain" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardTitle>{t('resource.summary')}</CardTitle>
          <CardContent>
            <div className="space-y-3">
              {clusterData.map((c) => (
                <div key={c.name} className="bg-surface-50 rounded-xl p-3 border border-surface-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-surface-800">{c.name}</span>
                    <Badge variant={c.cases > c.beds ? 'danger' : 'primary'}>
                      {c.cases > c.beds ? 'Overloaded' : 'Stable'}
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-xs text-surface-400">
                    <span>Cases: <strong className="text-surface-800">{c.cases}</strong></span>
                    <span>Beds: <strong className="text-surface-800">{c.beds}</strong></span>
                    <span>Ratio: <strong className={c.cases / c.beds > 1 ? 'text-danger' : 'text-primary'}>
                      {(c.cases / c.beds).toFixed(1)}
                    </strong></span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-surface-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${c.cases > c.beds ? 'bg-danger' : 'bg-primary'}`}
                      style={{ width: `${Math.min(100, (c.cases / c.beds) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
