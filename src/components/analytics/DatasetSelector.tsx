import React from 'react'
import { Database, FileSpreadsheet, ChevronDown, AlertCircle, CheckCircle2 } from 'lucide-react'
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
      <GlassCard className="p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">No Datasets Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload a retail sales CSV file to populate the analytics dashboard.
            </p>
          </div>
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-900/60">
          <Database className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Dataset
            </span>
            {selectedDataset && (
              <GlassBadge variant="success" className="gap-1 py-0 text-[10px]">
                <CheckCircle2 className="w-3 h-3" /> Ready
              </GlassBadge>
            )}
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {selectedDataset ? selectedDataset.file_name : 'Select a Dataset'}
          </h2>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Dropdown Select */}
        <div className="relative min-w-[240px]">
          <select
            value={selectedDatasetId || ''}
            onChange={(e) => onSelectDataset(e.target.value)}
            disabled={loading || datasets.length === 0}
            className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2 pr-9 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xs focus:outline-none focus:border-blue-600 cursor-pointer disabled:opacity-50"
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
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pl-3 border-l border-slate-200 dark:border-slate-800">
            <span className="flex items-center gap-1 font-mono">
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-500" />
              {formatFileSize(selectedDataset.file_size)}
            </span>
            <span>•</span>
            <span className="font-mono">{selectedDataset.row_count.toLocaleString()} rows</span>
            <span>•</span>
            <span className="font-mono">{selectedDataset.column_count} cols</span>
          </div>
        )}
      </div>
    </GlassCard>
  )
}

