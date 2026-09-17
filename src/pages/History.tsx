import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  History as HistoryIcon,
  FileText,
  UploadCloud,
  RefreshCw,
  AlertCircle,
  Calendar,
  Layers,
  Columns,
  BarChart2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Coins,
  ShoppingBag,
  Box,
} from 'lucide-react'
import { GlassCard } from '../components/ui/GlassCard'
import { GlassButton } from '../components/ui/GlassButton'
import { GlassBadge } from '../components/ui/GlassBadge'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { formatDate, formatFileSize } from '../lib/utils'
import { fetchDatasetAnalytics } from '../lib/api'
import type { Dataset, AnalyticsResponse } from '../types'

const formatCurrency = (
  value: number | null,
  currency: AnalyticsResponse['currency']
): string => {
  if (value === null) return 'N/A'

  if (currency.code === 'UNKNOWN') {
    return value.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })
  }

  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency.code,
    currencyDisplay: 'symbol',
    maximumFractionDigits: 2,
  }).format(value)
}

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

  const fetchHistory = React.useCallback(async () => {
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
  }, [user])

  useEffect(() => {
    let isMounted = true
    if (user) {
      void (async () => {
        if (isMounted) await fetchHistory()
      })()
    }
    return () => {
      isMounted = false
    }
  }, [user, fetchHistory])

  const handleFetchAnalytics = async (datasetId: string) => {
    if (!session?.access_token) {
      setAnalyticsError((prev) => ({
        ...prev,
        [datasetId]: 'No active authentication session token available.',
      }))
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
      setAnalyticsError((prev) => ({
        ...prev,
        [datasetId]: err.message || 'Failed to fetch analytics.',
      }))
    } finally {
      setAnalyticsLoading((prev) => ({ ...prev, [datasetId]: false }))
    }
  }

  return (
    <div className="flex flex-col gap-6 py-2">
      {/* Page Header */}
      <GlassCard className="p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
              <span>Upload History</span>
              {datasets.length > 0 && (
                <span className="text-xs font-semibold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
                  {datasets.length} files
                </span>
              )}
            </h1>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              View all uploaded retail sales datasets and inspect analytical summaries directly from the backend API.
            </p>
          </div>

          <Link to="/upload" className="self-start sm:self-auto">
            <GlassButton variant="primary" size="sm">
              <UploadCloud className="w-4 h-4" />
              <span>Upload CSV</span>
            </GlassButton>
          </Link>
        </div>
      </GlassCard>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        /* Error State */
        <GlassCard className="p-8 flex flex-col items-center text-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-900">
            <AlertCircle className="w-5 h-5" />
          </div>

          <p className="text-xs font-medium text-slate-600 dark:text-slate-300">{error}</p>

          <GlassButton variant="secondary" size="sm" onClick={fetchHistory}>
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </GlassButton>
        </GlassCard>
      ) : datasets.length === 0 ? (
        /* Empty State */
        <GlassCard className="p-10 flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-900/60">
            <HistoryIcon className="w-6 h-6" />
          </div>

          <div className="flex flex-col gap-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              No datasets yet
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
              You haven't uploaded any sales CSV files to InsightFlow yet.
            </p>
          </div>

          <Link to="/upload">
            <GlassButton variant="primary" size="sm">
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
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <GlassCard className="p-4 md:p-5 flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-900/60">
                        <FileText className="w-5 h-5" />
                      </div>

                      <div className="flex flex-col min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                          {dataset.file_name}
                        </h4>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1 font-mono">
                            <Layers className="w-3.5 h-3.5 text-slate-400" />
                            {dataset.row_count.toLocaleString()} rows
                          </span>

                          <span className="flex items-center gap-1 font-mono">
                            <Columns className="w-3.5 h-3.5 text-slate-400" />
                            {dataset.column_count} columns
                          </span>

                          <span className="font-mono">{formatFileSize(dataset.file_size)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
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
                        <BarChart2 className="w-3.5 h-3.5" />
                        <span>
                          {result
                            ? isSelected
                              ? 'Hide Details'
                              : 'View Analytics'
                            : 'Fetch Analytics'}
                        </span>
                        {isSelected ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
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
                        className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3 overflow-hidden"
                      >
                        {isFetching ? (
                          <div className="flex items-center justify-center p-5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Requesting dataset analytics from FastAPI backend...</span>
                            </div>
                          </div>
                        ) : fetchError ? (
                          <div className="flex items-center justify-between p-3.5 bg-rose-50 dark:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-400">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              <span>{fetchError}</span>
                            </div>

                            <GlassButton
                              variant="outline"
                              size="sm"
                              onClick={() => handleFetchAnalytics(dataset.id)}
                            >
                              Retry
                            </GlassButton>
                          </div>
                        ) : result ? (
                          <div className="flex flex-col gap-3 bg-slate-50 dark:bg-slate-900/80 p-4 rounded-lg border border-slate-200/80 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                Analytics Payload Received
                              </span>

                              <span className="text-[11px] text-slate-400 font-mono">
                                Dataset ID: {result.dataset_id}
                              </span>
                            </div>

                            {/* Summary Cards Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div className="p-3 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col gap-0.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                  <Coins className="w-3 h-3 text-emerald-500" /> Revenue
                                </span>

                                <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                                  {formatCurrency(
                                    result.summary.total_revenue,
                                    result.currency
                                  )}
                                </span>
                              </div>

                              <div className="p-3 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col gap-0.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                  <ShoppingBag className="w-3 h-3 text-blue-500" /> Orders
                                </span>

                                <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                                  {result.summary.total_orders.toLocaleString()}
                                </span>
                              </div>

                              <div className="p-3 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col gap-0.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                  <Box className="w-3 h-3 text-indigo-500" /> Units Sold
                                </span>

                                <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                                  {result.summary.total_units.toLocaleString()}
                                </span>
                              </div>

                              <div className="p-3 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col gap-0.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  Avg Order Value
                                </span>

                                <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                                  {formatCurrency(
                                    result.summary.average_order_value,
                                    result.currency
                                  )}
                                </span>
                              </div>
                            </div>

                            {/* Data Quality & Categories Pill Info */}
                            <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-800 font-mono">
                              <span>
                                Valid rows:{' '}
                                <strong className="text-emerald-600 dark:text-emerald-400">
                                  {result.data_quality.valid_rows}
                                </strong>{' '}
                                / {result.data_quality.total_rows}
                              </span>

                              <span>
                                Categories detected:{' '}
                                <strong>{result.categories.length}</strong>
                              </span>

                              <span>
                                Anomalies detected:{' '}
                                <strong>{result.anomalies.length}</strong>
                              </span>
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