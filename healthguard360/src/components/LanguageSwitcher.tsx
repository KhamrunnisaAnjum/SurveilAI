import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'
import { useState, useEffect } from 'react'

const languages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
]

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const setLanguage = useAuthStore((s) => s.setLanguage)
  const [open, setOpen] = useState(false)
  const [currentLang, setCurrentLang] = useState(i18n.language || 'en')

  useEffect(() => {
    setCurrentLang(i18n.language)
  }, [i18n.language])

  const handleChange = (code: string) => {
    i18n.changeLanguage(code)
    setLanguage(code)
    setCurrentLang(code)
    setOpen(false)
  }

  const currentLabel = languages.find((l) => l.code === currentLang)?.label || 'English'

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-surface-50 border border-surface-200 rounded-xl px-3 py-2 text-sm text-surface-800 hover:bg-surface-100 transition-colors"
      >
        <svg className="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-medium">{currentLabel}</span>
        <svg className={`w-3 h-3 text-surface-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-surface-200 shadow-lg z-50 py-1 animate-fade-in">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => handleChange(l.code)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-surface-50 transition-colors ${
                  l.code === currentLang ? 'text-primary-700 font-medium bg-primary-50' : 'text-surface-600'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
