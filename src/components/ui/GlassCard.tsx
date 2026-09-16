import React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '../../lib/utils'

interface GlassCardProps extends HTMLMotionProps<'div'> {
  interactive?: boolean
  glow?: boolean
  className?: string
  children: React.ReactNode
}

export const GlassCard: React.FC<GlassCardProps> = ({
  interactive = false,
  glow: _glow = false,
  className,
  children,
  ...props
}) => {

  return (
    <motion.div
      className={cn(
        'relative rounded-xl p-6 transition-all duration-200',
        'bg-white dark:bg-[#0f172a]',
        'border border-slate-200/80 dark:border-slate-800',
        'shadow-sm hover:shadow-md dark:shadow-none',
        interactive && 'hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}

