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
  glow = false,
  className,
  children,
  ...props
}) => {
  return (
    <motion.div
      className={cn(
        'relative rounded-2xl p-6 transition-all duration-300',
        'bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl',
        'border border-slate-200/80 dark:border-white/10',
        'shadow-xl shadow-slate-900/5 dark:shadow-black/40',
        glow && 'before:absolute before:inset-0 before:-z-10 before:rounded-2xl before:bg-gradient-to-r before:from-sky-500/10 before:to-indigo-500/10 before:blur-xl',
        interactive && 'hover:bg-white/85 dark:hover:bg-slate-900/75 hover:border-slate-300 dark:hover:border-white/20 hover:-translate-y-0.5 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}
