import React from 'react'
import { ShieldCheck } from 'lucide-react'
import type { DataQualityMetrics } from '../../types'
import { GlassCard } from '../ui/GlassCard'
import { GlassBadge } from '../ui/GlassBadge'
import { formatNumber } from '../../lib/utils'

interface DataQualityCardProps {
  metrics: DataQualityMetrics
}

export const DataQualityCard: React.FC<DataQualityCardProps> = ({ metrics }) => {
  const cleanPercentage =
    metrics.total_rows > 0
      ? Math.round((metrics.valid_rows / metrics.total_rows) * 100)
      : 100

  return (
    <GlassCard className="p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center border border-sky-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Data Cleaning & Quality Audit
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Automatic validation and normalization report for uploaded CSV rows
            </p>
          </div>
        </div>

        <GlassBadge variant={cleanPercentage >= 90 ? 'success' : 'warning'}>
          {cleanPercentage}% Valid Rows
        </GlassBadge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-3 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Raw Rows</span>
          <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
            {formatNumber(metrics.total_rows)}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex flex-col gap-1">
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Valid Parsed Rows</span>
          <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatNumber(metrics.valid_rows)}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 flex flex-col gap-1">
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Duplicates Cleaned</span>
          <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400">
            {formatNumber(metrics.duplicate_rows_removed)}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Excluded Rows</span>
          <span className="text-lg font-extrabold text-slate-700 dark:text-slate-300">
            {formatNumber(metrics.removed_rows)}
          </span>
        </div>
      </div>
    </GlassCard>
  )
}
