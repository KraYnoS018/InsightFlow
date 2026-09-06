import React from 'react'
import { cn } from '../../lib/utils'

interface GlassBadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'neutral' | 'info'
  children: React.ReactNode
  className?: string
}

export const GlassBadge: React.FC<GlassBadgeProps> = ({
  variant = 'neutral',
  children,
  className,
}) => {
  const variantStyles = {
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    error: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    info: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    neutral: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold backdrop-blur-md border',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
