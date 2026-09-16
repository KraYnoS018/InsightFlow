import React, { useState } from 'react'
import { Table, ArrowUpDown, ArrowUp, ArrowDown, PackageCheck } from 'lucide-react'
import type { TopProduct, CurrencyMetadata } from '../../types'
import { GlassCard } from '../ui/GlassCard'
import { GlassBadge } from '../ui/GlassBadge'
import { formatCurrency, formatNumber } from '../../lib/utils'

interface DataTableProps {
  products: TopProduct[]
  currency: CurrencyMetadata
}

type SortField = 'description' | 'stock_code' | 'units' | 'revenue'

export const DataTable: React.FC<DataTableProps> = ({ products, currency }) => {
  const [sortField, setSortField] = useState<SortField>('revenue')
  const [sortAsc, setSortAsc] = useState(false)

  if (!products || products.length === 0) return null

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(false)
    }
  }

  const sortedProducts = [...products].sort((a, b) => {
    let aVal = a[sortField] ?? ''
    let bVal = b[sortField] ?? ''

    if (typeof aVal === 'string') aVal = aVal.toLowerCase()
    if (typeof bVal === 'string') bVal = bVal.toLowerCase()

    if (aVal < bVal) return sortAsc ? -1 : 1
    if (aVal > bVal) return sortAsc ? 1 : -1
    return 0
  })

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-slate-400" />
    return sortAsc ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
  }

  return (
    <GlassCard className="p-5 md:p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-900/60">
            <Table className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Product Performance Ledger
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Detailed breakdown of items, stock identifiers, order volume, and gross revenue
            </p>
          </div>
        </div>

        <GlassBadge variant="neutral" className="gap-1 font-mono">
          <PackageCheck className="w-3 h-3" /> {products.length} Items Indexed
        </GlassBadge>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-4 py-3 cursor-pointer select-none" onClick={() => handleSort('stock_code')}>
                <div className="flex items-center gap-1.5">
                  <span>SKU / Code</span>
                  {getSortIcon('stock_code')}
                </div>
              </th>
              <th className="px-4 py-3 cursor-pointer select-none" onClick={() => handleSort('description')}>
                <div className="flex items-center gap-1.5">
                  <span>Product Description</span>
                  {getSortIcon('description')}
                </div>
              </th>
              <th className="px-4 py-3 text-right cursor-pointer select-none" onClick={() => handleSort('units')}>
                <div className="flex items-center justify-end gap-1.5">
                  <span>Units Sold</span>
                  {getSortIcon('units')}
                </div>
              </th>
              <th className="px-4 py-3 text-right cursor-pointer select-none" onClick={() => handleSort('revenue')}>
                <div className="flex items-center justify-end gap-1.5">
                  <span>Gross Revenue</span>
                  {getSortIcon('revenue')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-[#0f172a]">
            {sortedProducts.slice(0, 10).map((prod, idx) => (
              <tr key={prod.stock_code || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-2.5 font-mono text-slate-600 dark:text-slate-400">
                  {prod.stock_code || 'N/A'}
                </td>
                <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-slate-100 max-w-xs truncate">
                  {prod.description || 'Unknown Item'}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-slate-700 dark:text-slate-300">
                  {formatNumber(prod.units)}
                </td>
                <td className="px-4 py-2.5 text-right font-extrabold text-slate-900 dark:text-slate-100">
                  {formatCurrency(prod.revenue, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  )
}
