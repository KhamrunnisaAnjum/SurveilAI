import { useTranslation } from 'react-i18next'
import { cn, getRiskColor } from '@/lib/utils'

interface RiskBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function RiskBadge({ score, size = 'md', showLabel = true }: RiskBadgeProps) {
  const { t } = useTranslation()
  const color = getRiskColor(score)
  const sizeMap = { sm: 'w-12 h-12 text-sm', md: 'w-16 h-16 text-lg', lg: 'w-20 h-20 text-xl' }
  const strokeWidth = size === 'sm' ? 4 : 6
  const radius = size === 'sm' ? 20 : size === 'md' ? 28 : 36
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const label = score < 30 ? t('risk.low') : score <= 70 ? t('risk.moderate') : t('risk.high')

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={cn('relative', sizeMap[size])}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${(radius + strokeWidth) * 2} ${(radius + strokeWidth) * 2}`}>
          <circle cx={radius + strokeWidth} cy={radius + strokeWidth} r={radius} stroke="#e2e8f0" strokeWidth={strokeWidth} fill="none" />
          <circle
            cx={radius + strokeWidth} cy={radius + strokeWidth} r={radius}
            stroke={color} strokeWidth={strokeWidth} fill="none"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-bold text-surface-800">
          {score}
        </span>
      </div>
      {showLabel && (
        <span className="text-xs font-medium" style={{ color }}>{label}</span>
      )}
    </div>
  )
}
