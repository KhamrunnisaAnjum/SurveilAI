import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Input } from '@/components/ui'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { SOSButton } from '@/components/SOSButton'
import { ChatBot } from '@/components/ChatBot'
import { useAuthStore } from '@/stores/authStore'
import type { Role, User } from '@/lib/types'

const roles: { role: Role; labelKey: string; icon: string; description: string }[] = [
  { role: 'patient', labelKey: 'auth.role.patient', icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z', description: 'Report symptoms & find facilities' },
  { role: 'asha', labelKey: 'auth.role.asha', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z', description: 'Community health worker' },
  { role: 'nurse', labelKey: 'auth.role.nurse', icon: 'M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z', description: 'Clinical risk monitoring' },
  { role: 'officer', labelKey: 'auth.role.officer', icon: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z', description: 'Public health administration' },
  { role: 'admin', labelKey: 'auth.role.admin', icon: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z', description: 'System administration' },
]

export function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)
  const [step, setStep] = useState<'role' | 'otp'>('role')
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role)
    setStep('otp')
  }

  const handleSendOTP = () => {
    if (mobile.length === 10) {
      setOtpSent(true)
    }
  }

  const handleVerifyOTP = () => {
    if (otp.length === 6) {
      const mockUser: User = {
        id: `U-${Date.now()}`,
        name: selectedRole === 'patient' ? 'Demo Patient'
          : selectedRole === 'asha' ? 'ASHA Worker'
          : selectedRole === 'nurse' ? 'Nurse Clinician'
          : selectedRole === 'officer' ? 'Health Officer'
          : 'Admin User',
        role: selectedRole!,
        mobile,
        districtId: 'D001',
      }
      setUser(mockUser, 'mock-token-12345')
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <SOSButton />
      <ChatBot />
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-surface-800 tracking-tight">Surveil</h1>
          <p className="text-sm text-surface-400 mt-1">{t('app.tagline')}</p>
        </div>

        <Card className="shadow-md border-surface-200/40">
          {step === 'role' && (
            <div className="space-y-3">
              <p className="text-sm text-surface-500 text-center mb-4 font-medium">{t('auth.selectRole')}</p>
              {roles.map((r) => (
                <button
                  key={r.role}
                  onClick={() => handleRoleSelect(r.role)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-surface-50 border border-surface-200/60 hover:border-primary/40 hover:bg-primary-50/50 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-surface-200 flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary-50 transition-all">
                    <svg className="w-5 h-5 text-surface-400 group-hover:text-primary-600 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d={r.icon} />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-surface-800">{t(r.labelKey)}</p>
                    <p className="text-xs text-surface-400">{r.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-4">
              <button
                onClick={() => setStep('role')}
                className="text-sm text-surface-400 hover:text-surface-600 transition-colors font-medium"
              >
                ← {t('common.cancel')}
              </button>

              {!otpSent ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-surface-600 mb-2">{t('auth.mobileNumber')}</label>
                    <Input
                      type="tel"
                      maxLength={10}
                      placeholder="9876543210"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                  <Button className="w-full" disabled={mobile.length !== 10} onClick={handleSendOTP}>
                    {t('auth.sendOTP')}
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-primary-600 text-center font-medium">{t('auth.otpSent', { mobile })}</p>
                  <div>
                    <label className="block text-sm font-medium text-surface-600 mb-2">{t('auth.verifyOTP')}</label>
                    <Input
                      type="tel"
                      maxLength={6}
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                  <Button className="w-full" disabled={otp.length !== 6} onClick={handleVerifyOTP}>
                    {t('auth.verifyOTP')}
                  </Button>
                </>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
