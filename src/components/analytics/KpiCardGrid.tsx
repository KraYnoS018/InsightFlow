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
      <GlassBadge variant={isPositive ? 'success' : 'error'} className="flex items-center gap-1 font-semibold">
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
      color: 'from-emerald-500 to-teal-600',
      badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    },
    {
      id: 'orders',
      title: 'Total Orders',
      value: formatNumber(summary.total_orders),
      growth: growth.orders,
      icon: ShoppingBag,
      color: 'from-sky-500 to-blue-600',
      badgeBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    },
    {
      id: 'units',
      title: 'Total Units Sold',
      value: formatNumber(summary.total_units),
      growth: growth.units,
      icon: Package,
      color: 'from-indigo-500 to-purple-600',
      badgeBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    },
    {
      id: 'aov',
      title: 'Average Order Value (AOV)',
      value: formatCurrency(summary.average_order_value, currency),
      growth: null,
      icon: Calculator,
      color: 'from-purple-500 to-pink-600',
      badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    },
    {
      id: 'customers',
      title: 'Unique Customers',
      value: summary.unique_customers !== null ? formatNumber(summary.unique_customers) : 'N/A',
      growth: null,
      icon: Users,
      color: 'from-amber-500 to-orange-600',
      badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {kpis.map((kpi, index) => (
        <motion.div
          key={kpi.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
        >
          <GlassCard interactive glow className="p-5 flex flex-col justify-between h-full gap-3">
            <div className="flex items-center justify-between gap-2">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${kpi.badgeBg}`}>
                <kpi.icon className="w-4 h-4" />
              </div>
              {renderGrowthBadge(kpi.growth)}
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
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
