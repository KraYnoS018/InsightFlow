import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '../../lib/utils'

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  icon?: React.ReactNode
  isPassword?: boolean
}

export const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  ({ label, error, helperText, icon, isPassword, className, type = 'text', id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            type={inputType}
            className={cn(
              'w-full rounded-xl px-4 py-2.5 text-sm transition-all duration-200',
              'bg-slate-100/80 dark:bg-slate-950/60 backdrop-blur-md',
              'text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500',
              'border border-slate-200 dark:border-white/10',
              'focus:outline-none focus:border-sky-500 dark:focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20',
              icon && 'pl-10',
              isPassword && 'pr-10',
              error && 'border-rose-500 dark:border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
        {error ? (
          <p className="text-xs text-rose-500 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        ) : null}
      </div>
    )
  }
)

GlassInput.displayName = 'GlassInput'
