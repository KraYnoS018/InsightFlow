import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Tag, Trophy, MapPin, Globe } from 'lucide-react'
import type { CategoryMetric, TopProduct, LocationMetric, CountryMetric, CurrencyMetadata } from '../../types'
import { GlassCard } from '../ui/GlassCard'
import { GlassBadge } from '../ui/GlassBadge'
import { formatCurrency, formatNumber } from '../../lib/utils'

interface BreakdownChartsProps {
  categories: CategoryMetric[]
  topProducts: TopProduct[]
  locations: LocationMetric[]
  countries: CountryMetric[]
  currency: CurrencyMetadata
}

const BAR_COLORS = [
  '#0284c7', // sky-600
  '#6366f1', // indigo-500
  '#a855f7', // purple-500
  '#ec4899', // pink-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#3b82f6', // blue-500
]

export const BreakdownCharts: React.FC<BreakdownChartsProps> = ({
  categories,
  topProducts,
  locations,
  countries,
  currency,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Category Revenue Breakdown */}
      <GlassCard className="p-6 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Revenue by Category
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Product category distribution and total sales share
            </p>
          </div>
        </div>

        {categories.length > 0 ? (
          <div className="flex flex-col gap-4">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categories.slice(0, 6)} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    width={90}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item: CategoryMetric = payload[0].payload
                        return (
                          <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 p-3 rounded-xl text-xs text-slate-100 shadow-xl">
                            <span className="font-bold text-sky-400">{item.category}</span>
                            <div className="mt-1 flex flex-col gap-0.5">
                              <span>Revenue: <strong className="text-emerald-400">{formatCurrency(item.revenue, currency)}</strong></span>
                              <span>Share: <strong className="text-indigo-400">{item.revenue_share}%</strong></span>
                              <span>Orders: <strong>{formatNumber(item.orders)}</strong></span>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="revenue" radius={[0, 8, 8, 0]}>
                    {categories.slice(0, 6).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* List breakdown summary */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-200/60 dark:border-white/10">
              {categories.slice(0, 4).map((cat, idx) => (
                <div key={cat.category} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: BAR_COLORS[idx % BAR_COLORS.length] }}
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                      {cat.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(cat.revenue, currency)}
                    </span>
                    <GlassBadge variant="neutral">
                      {cat.revenue_share}%
                    </GlassBadge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-400">No category breakdown detected</div>
        )}
      </GlassCard>

      {/* Top Products */}
      <GlassCard className="p-6 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Top Performing Products
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Highest revenue-generating SKUs & items
            </p>
          </div>
        </div>

        {topProducts.length > 0 ? (
          <div className="flex flex-col gap-3">
            {topProducts.slice(0, 5).map((prod, idx) => (
              <div
                key={prod.stock_code || idx}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 hover:border-sky-500/30 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-xs shrink-0">
                    #{idx + 1}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {prod.description || 'Unknown Product'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      SKU: {prod.stock_code || 'N/A'} • {formatNumber(prod.units)} units sold
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                    {formatCurrency(prod.revenue, currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-400">No top products available</div>
        )}
      </GlassCard>

      {/* Store Locations */}
      {locations.length > 0 && (
        <GlassCard className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Store Locations
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Sales density across store locations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {locations.slice(0, 4).map((loc) => (
              <div key={loc.store_location} className="p-3 rounded-xl bg-slate-100/60 dark:bg-slate-900/50 border border-slate-200/60 dark:border-white/5 flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{loc.store_location}</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(loc.revenue, currency)}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Countries */}
      {countries.length > 0 && (
        <GlassCard className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Geographic Markets
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Sales breakdown by country</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {countries.slice(0, 4).map((c) => (
              <div key={c.country} className="p-3 rounded-xl bg-slate-100/60 dark:bg-slate-900/50 border border-slate-200/60 dark:border-white/5 flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{c.country}</span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{formatCurrency(c.revenue, currency)}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  )
}
