import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-primary-600 shadow-sm hover:shadow-md hover:shadow-primary/20',
        destructive: 'bg-danger text-white hover:bg-red-600 shadow-sm',
        outline: 'border border-surface-200 bg-white text-surface-800 hover:bg-surface-50 hover:border-primary/30',
        ghost: 'text-surface-800/60 hover:text-surface-800 hover:bg-surface-100',
        link: 'text-primary underline-offset-4 hover:underline',
        soft: 'bg-primary-50 text-primary-700 hover:bg-primary-100',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  children: ReactNode
}

export function Button({ className, variant, size, children, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {children}
    </button>
  )
}
