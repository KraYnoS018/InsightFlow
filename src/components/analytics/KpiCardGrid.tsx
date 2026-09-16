import React from 'react'
import { motion } from 'framer-motion'
import { Coins, ShoppingBag, Package, TrendingUp, TrendingDown, Users, Calculator } from 'lucide-react'
import type { SummaryMetrics, GrowthMetrics, CurrencyMetadata } from '../../types'
import { GlassCard } from '../ui/GlassCard'
import { GlassBadge } from '../ui/GlassBadge'
import { formatCurrency, formatNumber } from '../../lib/utils'

interface KpiCardGridProps {
  summary: SummaryMetrics
  growth: GrowthMetrics
  currency: CurrencyMetadata
}

export const KpiCardGrid: React.FC<KpiCardGridProps> = ({ summary, growth, currency }) => {
  const renderGrowthBadge = (value: number | null) => {
    if (value === null || value === undefined) return null

    const isPositive = value >= 0
    const Icon = isPositive ? TrendingUp : TrendingDown

    return (
      <GlassBadge variant={isPositive ? 'success' : 'error'} className="flex items-center gap-1 text-[11px] font-semibold py-0.5 px-2">
        <Icon className="w-3 h-3" />
        <span>{isPositive ? '+' : ''}{value.toFixed(1)}%</span>
      </GlassBadge>
    )
  }

  const kpis = [
    {
      id: 'revenue',
      title: 'Total Revenue',
      value: formatCurrency(summary.total_revenue, currency),
      growth: growth.revenue,
      icon: Coins,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60',
    },
    {
      id: 'orders',
      title: 'Total Orders',
      value: formatNumber(summary.total_orders),
      growth: growth.orders,
      icon: ShoppingBag,
      iconBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/60',
    },
    {
      id: 'units',
      title: 'Total Units Sold',
      value: formatNumber(summary.total_units),
      growth: growth.units,
      icon: Package,
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60',
    },
    {
      id: 'aov',
      title: 'Average Order Value (AOV)',
      value: formatCurrency(summary.average_order_value, currency),
      growth: null,
      icon: Calculator,
      iconBg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/60',
    },
    {
      id: 'customers',
      title: 'Unique Customers',
      value: summary.unique_customers !== null ? formatNumber(summary.unique_customers) : 'N/A',
      growth: null,
      icon: Users,
      iconBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {kpis.map((kpi, index) => (
        <motion.div
          key={kpi.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04, duration: 0.2 }}
        >
          <GlassCard className="p-4 md:p-5 flex flex-col justify-between h-full gap-3">
            <div className="flex items-center justify-between gap-2">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${kpi.iconBg}`}>
                <kpi.icon className="w-4.5 h-4.5 text-current" />
              </div>
              {renderGrowthBadge(kpi.growth)}
            </div>

            <div className="flex flex-col gap-1 mt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {kpi.title}
              </span>
              <span className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {kpi.value}
              </span>
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  )
}

