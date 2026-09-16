import React from 'react'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { AnomalyItem, CurrencyMetadata } from '../../types'
import { GlassCard } from '../ui/GlassCard'
import { GlassBadge } from '../ui/GlassBadge'
import { formatCurrency, formatNumber } from '../../lib/utils'

interface AnomaliesListProps {
  anomalies: AnomalyItem[]
  currency: CurrencyMetadata
}

export const AnomaliesList: React.FC<AnomaliesListProps> = ({ anomalies, currency }) => {
  if (!anomalies || anomalies.length === 0) {
    return (
      <GlassCard className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-900/60">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">No Revenue Anomalies Detected</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sales performance & order trends follow expected patterns with zero statistical anomalies.
            </p>
          </div>
        </div>
        <GlassBadge variant="success">
          Healthy Signal
        </GlassBadge>
      </GlassCard>
    )
  }

  const getSeverityBadge = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return <GlassBadge variant="error">High Severity</GlassBadge>
      case 'medium':
        return <GlassBadge variant="warning">Medium Severity</GlassBadge>
      case 'low':
      default:
        return <GlassBadge variant="info">Low Severity</GlassBadge>
    }
  }

  return (
    <GlassCard className="p-5 md:p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-900/60">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Detected Business Anomalies
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Automated outlier detection flagging unusual spikes or dips
            </p>
          </div>
        </div>
        <GlassBadge variant="error">
          {anomalies.length} Flagged
        </GlassBadge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {anomalies.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between gap-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {item.period} • {item.metric}
                </span>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {item.reason}
                </h4>
              </div>
              {getSeverityBadge(item.severity)}
            </div>

            <div className="flex items-center gap-6 text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-slate-400 block text-[10px]">Observed Value</span>
                <span className="font-extrabold text-rose-600 dark:text-rose-400">
                  {item.metric.includes('revenue')
                    ? formatCurrency(item.value, currency)
                    : formatNumber(item.value)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Expected Range</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  ~{item.metric.includes('revenue')
                    ? formatCurrency(item.expected, currency)
                    : formatNumber(item.expected)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

