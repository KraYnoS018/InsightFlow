import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { History as HistoryIcon, FileText, UploadCloud, RefreshCw, AlertCircle, Calendar, Layers, Columns, BarChart2, CheckCircle2, ChevronDown, ChevronUp, DollarSign, ShoppingBag, Box } from 'lucide-react'
import { GlassCard } from '../components/ui/GlassCard'
import { GlassButton } from '../components/ui/GlassButton'
import { GlassBadge } from '../components/ui/GlassBadge'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { formatDate, formatFileSize } from '../lib/utils'
import { fetchDatasetAnalytics } from '../lib/api'
import type { Dataset, AnalyticsResponse } from '../types'

export const History: React.FC = () => {
  const { user, session } = useAuth()
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Analytics API integration state
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null)
  const [analyticsData, setAnalyticsData] = useState<Record<string, AnalyticsResponse>>({})
  const [analyticsLoading, setAnalyticsLoading] = useState<Record<string, boolean>>({})
  const [analyticsError, setAnalyticsError] = useState<Record<string, string | null>>({})

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

  const handleFetchAnalytics = async (datasetId: string) => {
    if (!session?.access_token) {
      setAnalyticsError((prev) => ({ ...prev, [datasetId]: 'No active authentication session token available.' }))
      return
    }

    if (selectedDatasetId === datasetId && analyticsData[datasetId]) {
      setSelectedDatasetId(null)
      return
    }

    setSelectedDatasetId(datasetId)

    if (analyticsData[datasetId]) return

    setAnalyticsLoading((prev) => ({ ...prev, [datasetId]: true }))
    setAnalyticsError((prev) => ({ ...prev, [datasetId]: null }))

    try {
      const data = await fetchDatasetAnalytics(datasetId, session.access_token)
      setAnalyticsData((prev) => ({ ...prev, [datasetId]: data }))
    } catch (err: any) {
      setAnalyticsError((prev) => ({ ...prev, [datasetId]: err.message || 'Failed to fetch analytics.' }))
    } finally {
      setAnalyticsLoading((prev) => ({ ...prev, [datasetId]: false }))
    }
  }

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
            View all uploaded retail sales datasets and analyze metrics from the backend.
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
          {datasets.map((dataset, index) => {
            const isSelected = selectedDatasetId === dataset.id
            const isFetching = analyticsLoading[dataset.id]
            const fetchError = analyticsError[dataset.id]
            const result = analyticsData[dataset.id]

            return (
              <motion.div
                key={dataset.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard interactive className="p-5 flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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

                    <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200/50 dark:border-white/5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(dataset.created_at)}</span>
                      </div>

                      <GlassBadge variant={dataset.status === 'uploaded' ? 'success' : 'error'}>
                        {dataset.status === 'uploaded' ? 'Uploaded' : 'Failed'}
                      </GlassBadge>

                      <GlassButton
                        variant={result ? 'secondary' : 'primary'}
                        size="sm"
                        onClick={() => handleFetchAnalytics(dataset.id)}
                        isLoading={isFetching}
                      >
                        <BarChart2 className="w-4 h-4" />
                        <span>{result ? (isSelected ? 'Hide Analytics' : 'View Analytics') : 'Fetch Analytics'}</span>
                        {isSelected ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </GlassButton>
                    </div>
                  </div>

                  {/* Collapsible Analytics Results Panel */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-4 border-t border-slate-200/60 dark:border-white/10 flex flex-col gap-4 overflow-hidden"
                      >
                        {isFetching ? (
                          <div className="flex items-center justify-center p-6 bg-sky-500/5 rounded-xl border border-sky-500/10">
                            <div className="flex items-center gap-3 text-xs font-semibold text-sky-600 dark:text-sky-400">
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Requesting dataset analytics from FastAPI backend...</span>
                            </div>
                          </div>
                        ) : fetchError ? (
                          <div className="flex items-center justify-between p-4 bg-rose-500/10 rounded-xl border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              <span>{fetchError}</span>
                            </div>
                            <GlassButton variant="outline" size="sm" onClick={() => handleFetchAnalytics(dataset.id)}>
                              Retry
                            </GlassButton>
                          </div>
                        ) : result ? (
                          <div className="flex flex-col gap-4 bg-slate-900/5 dark:bg-white/5 p-4 rounded-xl border border-slate-200/50 dark:border-white/10">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                Analytics JSON Payload Received
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                                Dataset ID: {result.dataset_id}
                              </span>
                            </div>

                            {/* Summary Cards Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div className="p-3 bg-white/60 dark:bg-slate-900/60 rounded-lg border border-slate-200/50 dark:border-white/5 flex flex-col gap-1">
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                  <DollarSign className="w-3 h-3 text-emerald-500" /> Revenue
                                </span>
                                <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                                  ${result.summary.total_revenue.toLocaleString()}
                                </span>
                              </div>

                              <div className="p-3 bg-white/60 dark:bg-slate-900/60 rounded-lg border border-slate-200/50 dark:border-white/5 flex flex-col gap-1">
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                  <ShoppingBag className="w-3 h-3 text-sky-500" /> Orders
                                </span>
                                <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                                  {result.summary.total_orders.toLocaleString()}
                                </span>
                              </div>

                              <div className="p-3 bg-white/60 dark:bg-slate-900/60 rounded-lg border border-slate-200/50 dark:border-white/5 flex flex-col gap-1">
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                  <Box className="w-3 h-3 text-indigo-500" /> Units Sold
                                </span>
                                <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                                  {result.summary.total_units.toLocaleString()}
                                </span>
                              </div>

                              <div className="p-3 bg-white/60 dark:bg-slate-900/60 rounded-lg border border-slate-200/50 dark:border-white/5 flex flex-col gap-1">
                                <span className="text-[11px] text-slate-500 dark:text-slate-400">Avg Order Value</span>
                                <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                                  {result.summary.average_order_value !== null ? `$${result.summary.average_order_value}` : 'N/A'}
                                </span>
                              </div>
                            </div>

                            {/* Data Quality & Categories Pill Info */}
                            <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200/40 dark:border-white/5">
                              <span>
                                Valid rows: <strong className="text-emerald-600 dark:text-emerald-400">{result.data_quality.valid_rows}</strong> / {result.data_quality.total_rows}
                              </span>
                              <span>Categories detected: <strong>{result.categories.length}</strong></span>
                              <span>Anomalies detected: <strong>{result.anomalies.length}</strong></span>
                            </div>
                          </div>
                        ) : null}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

