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
  '#2563eb', // blue-600
  '#4f46e5', // indigo-600
  '#7c3aed', // violet-600
  '#db2777', // pink-600
  '#059669', // emerald-600
  '#d97706', // amber-600
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
      <GlassCard className="p-5 md:p-6 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-900/60">
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
                <BarChart data={categories.slice(0, 6)} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
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
                    cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item: CategoryMetric = payload[0].payload
                        return (
                          <div className="bg-slate-900/95 dark:bg-[#0b0f19]/95 border border-slate-700/80 p-3 rounded-lg text-xs text-slate-100 shadow-xl">
                            <span className="font-bold text-blue-400">{item.category}</span>
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
                  <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                    {categories.slice(0, 6).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* List breakdown summary */}
            <div className="flex flex-col gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
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
                    <GlassBadge variant="neutral" className="font-mono text-[10px] py-0">
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
      <GlassCard className="p-5 md:p-6 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200 dark:border-purple-900/60">
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
          <div className="flex flex-col gap-2.5">
            {topProducts.slice(0, 5).map((prod, idx) => (
              <div
                key={prod.stock_code || idx}
                className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-md bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-200 dark:border-blue-900">
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
        <GlassCard className="p-5 md:p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-900/60">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Store Locations
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Sales density across store locations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {locations.slice(0, 4).map((loc) => (
              <div key={loc.store_location} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{loc.store_location}</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(loc.revenue, currency)}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Countries */}
      {countries.length > 0 && (
        <GlassCard className="p-5 md:p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-900/60">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Geographic Markets
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Sales breakdown by country</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {countries.slice(0, 4).map((c) => (
              <div key={c.country} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex justify-between items-center">
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

