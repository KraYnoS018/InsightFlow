import React from 'react'
import { Database, FileSpreadsheet, ChevronDown, AlertCircle } from 'lucide-react'
import type { Dataset } from '../../types'
import { GlassCard } from '../ui/GlassCard'
import { GlassBadge } from '../ui/GlassBadge'
import { formatFileSize } from '../../lib/utils'

interface DatasetSelectorProps {
  datasets: Dataset[]
  selectedDatasetId: string | null
  onSelectDataset: (id: string) => void
  loading: boolean
}

export const DatasetSelector: React.FC<DatasetSelectorProps> = ({
  datasets,
  selectedDatasetId,
  onSelectDataset,
  loading,
}) => {
  const selectedDataset = datasets.find((d) => d.id === selectedDatasetId)

  if (datasets.length === 0 && !loading) {
    return (
      <GlassCard className="p-6 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">No Datasets Found</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
          Please upload a retail sales CSV file first to populate the analytics dashboard.
        </p>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/30">
          <Database className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Active Dataset
          </span>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            {selectedDataset ? selectedDataset.file_name : 'Select a Dataset'}
            {selectedDataset && (
              <GlassBadge variant="success">
                Ready
              </GlassBadge>
            )}
          </h2>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Dropdown Select */}
        <div className="relative min-w-[220px]">
          <select
            value={selectedDatasetId || ''}
            onChange={(e) => onSelectDataset(e.target.value)}
            disabled={loading || datasets.length === 0}
            className="w-full appearance-none bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-white/10 rounded-xl px-4 py-2.5 pr-10 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 cursor-pointer disabled:opacity-50"
          >
            {datasets.map((dataset) => (
              <option key={dataset.id} value={dataset.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                {dataset.file_name} ({dataset.row_count.toLocaleString()} rows)
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {selectedDataset && (
          <div className="hidden lg:flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pl-3 border-l border-slate-200 dark:border-slate-800">
            <span className="flex items-center gap-1">
              <FileSpreadsheet className="w-3.5 h-3.5 text-sky-500" />
              {formatFileSize(selectedDataset.file_size)}
            </span>
            <span>•</span>
            <span>{selectedDataset.row_count.toLocaleString()} rows</span>
            <span>•</span>
            <span>{selectedDataset.column_count} cols</span>
          </div>
        )}
      </div>
    </GlassCard>
  )
}
