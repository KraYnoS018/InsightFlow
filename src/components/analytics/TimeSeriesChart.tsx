import React, { useState } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { TrendingUp, Coins, ShoppingBag, Package } from 'lucide-react'
import type { TimeSeriesPoint, CurrencyMetadata } from '../../types'
import { GlassCard } from '../ui/GlassCard'
import { formatCurrency, formatNumber } from '../../lib/utils'

interface TimeSeriesChartProps {
  data: TimeSeriesPoint[]
  currency: CurrencyMetadata
}

type MetricType = 'revenue' | 'orders' | 'units'

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ data, currency }) => {
  const [metric, setMetric] = useState<MetricType>('revenue')

  if (!data || data.length === 0) {
    return (
      <GlassCard className="p-8 text-center text-slate-500 dark:text-slate-400">
        No time-series trends available for this dataset.
      </GlassCard>
    )
  }

  const metricConfig = {
    revenue: {
      label: 'Revenue Trend',
      stroke: '#0284c7', // sky-600
      fill: 'url(#revenueGradient)',
      formatter: (val: number) => formatCurrency(val, currency),
    },
    orders: {
      label: 'Order Volume',
      stroke: '#6366f1', // indigo-500
      fill: 'url(#ordersGradient)',
      formatter: (val: number) => `${formatNumber(val)} orders`,
    },
    units: {
      label: 'Units Sold',
      stroke: '#a855f7', // purple-500
      fill: 'url(#unitsGradient)',
      formatter: (val: number) => `${formatNumber(val)} units`,
    },
  }

  const currentConfig = metricConfig[metric]

  // Custom glass tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const point: TimeSeriesPoint = payload[0].payload
      return (
        <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-2xl text-xs flex flex-col gap-1.5 text-slate-100 min-w-[150px]">
          <span className="font-bold text-sky-400 text-sm">{label}</span>
          <div className="flex items-center justify-between gap-4 pt-1 border-t border-white/10">
            <span className="text-slate-400 flex items-center gap-1">
              <Coins className="w-3 h-3 text-emerald-400" /> Revenue
            </span>
            <span className="font-semibold text-emerald-400">{formatCurrency(point.revenue, currency)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400 flex items-center gap-1">
              <ShoppingBag className="w-3 h-3 text-sky-400" /> Orders
            </span>
            <span className="font-semibold text-sky-300">{formatNumber(point.orders)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400 flex items-center gap-1">
              <Package className="w-3 h-3 text-purple-400" /> Units
            </span>
            <span className="font-semibold text-purple-300">{formatNumber(point.units)}</span>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <GlassCard className="p-6 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center border border-sky-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Sales Performance Over Time
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive timeline of business throughput and order density
            </p>
          </div>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/50 dark:bg-slate-900/60 backdrop-blur-md rounded-xl border border-slate-300/40 dark:border-white/10 self-start sm:self-auto">
          {(['revenue', 'orders', 'units'] as MetricType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setMetric(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-200 ${
                metric === tab
                  ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-72 md:h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="unitsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />

            <XAxis
              dataKey="period"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              dy={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={(val) =>
                metric === 'revenue'
                  ? val >= 1000000
                    ? `${(val / 1000000).toFixed(1)}M`
                    : val >= 1000
                    ? `${(val / 1000).toFixed(0)}k`
                    : `${val}`
                  : val >= 1000
                  ? `${(val / 1000).toFixed(0)}k`
                  : `${val}`
              }
              dx={-5}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey={metric}
              stroke={currentConfig.stroke}
              strokeWidth={3}
              fillOpacity={1}
              fill={currentConfig.fill}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  )
}
