import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardTitle, CardContent, Button, Badge } from '@/components/ui'

type Tab = 'users' | 'districts' | 'system'

export function Admin() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('users')

  const tabs: { key: Tab; labelKey: string }[] = [
    { key: 'users', labelKey: 'admin.users' },
    { key: 'districts', labelKey: 'admin.districts' },
    { key: 'system', labelKey: 'admin.systemHealth' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-800 tracking-tight">Admin Panel</h1>
          <p className="text-sm text-surface-400 mt-1">System administration</p>
        </div>
        <Button variant="outline">{t('admin.export')}</Button>
      </div>

      <div className="flex gap-2">
        {tabs.map((t) => (
          <Button
            key={t.key}
            variant={tab === t.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTab(t.key)}
          >
            {t.labelKey}
          </Button>
        ))}
      </div>

      {tab === 'users' && <UserManagement />}
      {tab === 'districts' && <DistrictManagement />}
      {tab === 'system' && <SystemHealth />}
    </div>
  )
}

function UserManagement() {
  const { t } = useTranslation()

  const users = [
    { id: 1, name: 'Priya Sharma', role: 'asha', district: 'D001', active: true },
    { id: 2, name: 'Dr. Rajesh Kumar', role: 'nurse', district: 'D001', active: true },
    { id: 3, name: 'Sunita Verma', role: 'asha', district: 'D001', active: false },
    { id: 4, name: 'Dr. Amit Singh', role: 'nurse', district: 'D001', active: true },
  ]

  return (
    <Card>
      <CardTitle>{t('admin.users')}</CardTitle>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-200">
                <th className="text-left py-3 px-2 text-surface-400 font-medium text-xs uppercase tracking-wider">Name</th>
                <th className="text-left py-3 px-2 text-surface-400 font-medium text-xs uppercase tracking-wider">Role</th>
                <th className="text-left py-3 px-2 text-surface-400 font-medium text-xs uppercase tracking-wider">Status</th>
                <th className="text-right py-3 px-2 text-surface-400 font-medium text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-surface-100 hover:bg-surface-50 transition-colors">
                  <td className="py-3 px-2 font-medium text-surface-800">{u.name}</td>
                  <td className="py-3 px-2 text-surface-500 capitalize">{u.role}</td>
                  <td className="py-3 px-2">
                    <Badge variant={u.active ? 'primary' : 'outline'}>
                      {u.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="ghost">{t('common.edit')}</Button>
                      <Button size="sm" variant="destructive">{t('common.delete')}</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function DistrictManagement() {
  const { t } = useTranslation()
  const districts = [
    { id: 'D001', name: 'Nagpur Rural', population: 245000, facilities: 12, alerts: 3 },
    { id: 'D002', name: 'Wardha', population: 189000, facilities: 8, alerts: 1 },
    { id: 'D003', name: 'Gondia', population: 132000, facilities: 5, alerts: 0 },
    { id: 'D004', name: 'Chandrapur', population: 210000, facilities: 10, alerts: 2 },
  ]

  return (
    <Card>
      <CardTitle>{t('admin.districts')}</CardTitle>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-200">
                <th className="text-left py-3 px-2 text-surface-400 font-medium text-xs uppercase tracking-wider">District</th>
                <th className="text-left py-3 px-2 text-surface-400 font-medium text-xs uppercase tracking-wider">Population</th>
                <th className="text-left py-3 px-2 text-surface-400 font-medium text-xs uppercase tracking-wider">Facilities</th>
                <th className="text-left py-3 px-2 text-surface-400 font-medium text-xs uppercase tracking-wider">Active Alerts</th>
                <th className="text-right py-3 px-2 text-surface-400 font-medium text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {districts.map((d) => (
                <tr key={d.id} className="border-b border-surface-100 hover:bg-surface-50 transition-colors">
                  <td className="py-3 px-2 font-medium text-surface-800">{d.name}</td>
                  <td className="py-3 px-2 text-surface-500">{d.population.toLocaleString()}</td>
                  <td className="py-3 px-2 text-surface-500">{d.facilities}</td>
                  <td className="py-3 px-2">
                    <Badge variant={d.alerts > 0 ? 'danger' : 'primary'}>{d.alerts}</Badge>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <Button size="sm" variant="ghost">{t('common.edit')}</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function SystemHealth() {
  const metrics = [
    { label: 'API Latency', value: '45ms', status: 'healthy' as const },
    { label: 'Model Inference Time', value: '120ms', status: 'healthy' as const },
    { label: 'Alert Delivery Rate', value: '99.8%', status: 'healthy' as const },
    { label: 'Symptom Reports (24h)', value: '1,247', status: 'healthy' as const },
    { label: 'Active Users', value: '342', status: 'healthy' as const },
    { label: 'Queue Depth', value: '12', status: 'warning' as const },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.map((m) => (
        <Card key={m.label}>
          <div className="text-center">
            <p className="text-sm text-surface-400 mb-2">{m.label}</p>
            <p className="text-3xl font-bold text-surface-800 mb-2">{m.value}</p>
            <Badge variant={m.status === 'healthy' ? 'primary' : 'warning'}>
              {m.status}
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  )
}
