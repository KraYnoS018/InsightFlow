import React from 'react'
import { FileSpreadsheet, Layers, Columns, AlertTriangle } from 'lucide-react'
import type { CsvValidationResult } from '../../types'
import { GlassCard } from '../ui/GlassCard'
import { GlassBadge } from '../ui/GlassBadge'

interface CsvPreviewProps {
  validationResult: CsvValidationResult
  fileName: string
}

export const CsvPreview: React.FC<CsvPreviewProps> = ({ validationResult, fileName }) => {
  const { rowCount, columnCount, columns, previewRows, warnings } = validationResult

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Warnings banner if any */}
      {warnings && warnings.length > 0 && (
        <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            {warnings.map((warning, idx) => (
              <p key={idx}>{warning}</p>
            ))}
          </div>
        </div>
      )}

      {/* Dataset Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="p-4 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>File Name</span>
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{fileName}</p>
        </GlassCard>

        <GlassCard className="p-4 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
            <Layers className="w-3.5 h-3.5" />
            <span>Total Rows</span>
          </div>
          <p className="text-base font-bold text-sky-600 dark:text-sky-400">{rowCount.toLocaleString()}</p>
        </GlassCard>

        <GlassCard className="p-4 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
            <Columns className="w-3.5 h-3.5" />
            <span>Columns</span>
          </div>
          <p className="text-base font-bold text-indigo-600 dark:text-indigo-400">{columnCount}</p>
        </GlassCard>

        <GlassCard className="p-4 flex flex-col gap-1 justify-center">
          <span className="text-xs text-slate-500 dark:text-slate-400 mb-1">Status</span>
          <GlassBadge variant="success">Validated CSV</GlassBadge>
        </GlassCard>
      </div>

      {/* Detected Columns List */}
      <GlassCard className="p-5 flex flex-col gap-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          Detected Column Headers ({columns.length})
        </h4>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
          {columns.map((col, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300"
            >
              {col}
            </span>
          ))}
        </div>
      </GlassCard>

      {/* Data Preview Table (First 5 Rows) */}
      <GlassCard className="p-5 flex flex-col gap-3 overflow-hidden">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Preview (First {previewRows.length} rows)
          </h4>
          <span className="text-[11px] text-slate-400">Showing sample data</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200/70 dark:border-white/10">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 font-semibold border-b border-slate-200/70 dark:border-white/10">
              <tr>
                <th className="px-4 py-2.5 w-12 text-slate-400">#</th>
                {columns.map((col, idx) => (
                  <th key={idx} className="px-4 py-2.5 whitespace-nowrap font-medium">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-white/5">
              {previewRows.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-slate-100/40 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-2.5 text-slate-400 font-mono">{rowIdx + 1}</td>
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="px-4 py-2.5 whitespace-nowrap max-w-xs truncate">
                      {row[col] !== undefined && row[col] !== null ? String(row[col]) : '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  )
}
