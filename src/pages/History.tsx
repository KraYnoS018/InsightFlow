import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { History as HistoryIcon, FileText, UploadCloud, RefreshCw, AlertCircle, Calendar, Layers, Columns } from 'lucide-react'
import { GlassCard } from '../components/ui/GlassCard'
import { GlassButton } from '../components/ui/GlassButton'
import { GlassBadge } from '../components/ui/GlassBadge'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { formatDate, formatFileSize } from '../lib/utils'
import type { Dataset } from '../types'

export const History: React.FC = () => {
  const { user } = useAuth()
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await (supabase as any)
        .from('datasets')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      setDatasets(data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load dataset upload history.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [user])

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
            <span>Upload History</span>
            {datasets.length > 0 && (
              <span className="text-xs font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 px-2.5 py-0.5 rounded-full border border-sky-500/20">
                {datasets.length}
              </span>
            )}
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">
            View all uploaded retail sales datasets and their metadata records.
          </p>
        </div>

        <Link to="/upload">
          <GlassButton variant="primary" size="sm">
            <UploadCloud className="w-4 h-4" />
            <span className="hidden sm:inline">Upload CSV</span>
          </GlassButton>
        </Link>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        /* Error State */
        <GlassCard className="p-8 flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20">
            <AlertCircle className="w-6 h-6" />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">{error}</p>
          <GlassButton variant="secondary" size="sm" onClick={fetchHistory}>
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </GlassButton>
        </GlassCard>
      ) : datasets.length === 0 ? (
        /* Empty State */
        <GlassCard className="p-12 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/20">
            <HistoryIcon className="w-8 h-8" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No datasets yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
              You haven't uploaded any sales CSV files to InsightFlow.
            </p>
          </div>
          <Link to="/upload">
            <GlassButton variant="primary">
              <UploadCloud className="w-4 h-4" />
              <span>Upload your first CSV</span>
            </GlassButton>
          </Link>
        </GlassCard>
      ) : (
        /* Datasets List */
        <div className="flex flex-col gap-3">
          {datasets.map((dataset, index) => (
            <motion.div
              key={dataset.id || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard interactive className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-500/15 to-indigo-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20">
                    <FileText className="w-5 h-5" />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {dataset.file_name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        {dataset.row_count.toLocaleString()} rows
                      </span>
                      <span className="flex items-center gap-1">
                        <Columns className="w-3.5 h-3.5 text-slate-400" />
                        {dataset.column_count} columns
                      </span>
                      <span>{formatFileSize(dataset.file_size)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200/50 dark:border-white/5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatDate(dataset.created_at)}</span>
                  </div>

                  <GlassBadge variant={dataset.status === 'uploaded' ? 'success' : 'error'}>
                    {dataset.status === 'uploaded' ? 'Uploaded' : 'Failed'}
                  </GlassBadge>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
