import { cn } from '@/lib/utils'
import type { SelectHTMLAttributes } from 'react'

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'flex h-10 w-full rounded-xl border border-surface-200 bg-white px-3 py-2 text-sm text-surface-800 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}
