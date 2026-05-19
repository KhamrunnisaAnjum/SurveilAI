import { cn } from '@/lib/utils'
import type { InputHTMLAttributes } from 'react'

export function Slider({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="range"
      className={cn(
        'w-full h-2 rounded-full appearance-none cursor-pointer bg-surface-200 accent-primary',
        '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-sm',
        className,
      )}
      {...props}
    />
  )
}
