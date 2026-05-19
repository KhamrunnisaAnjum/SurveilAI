import { cn } from '@/lib/utils'
import type { HTMLAttributes, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-surface-100 text-surface-800',
        primary: 'bg-primary-50 text-primary-700',
        warning: 'bg-warning-50 text-amber-700',
        danger: 'bg-danger-50 text-red-700',
        info: 'bg-info-50 text-cyan-700',
        outline: 'border border-surface-200 text-surface-600',
        destructive: 'bg-danger-50 text-red-700',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  children: ReactNode
}

export function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </span>
  )
}
