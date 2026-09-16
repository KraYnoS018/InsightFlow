import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UploadCloud,
  BarChart3,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Download,
} from 'lucide-react'

import { GlassCard } from '../components/ui/GlassCard'
import { GlassButton } from '../components/ui/GlassButton'
import { GlassBadge } from '../components/ui/GlassBadge'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { fetchDatasetAnalytics } from '../lib/api'
import type { Dataset, AnalyticsResponse } from '../types'

import { DatasetSelector } from '../components/analytics/DatasetSelector'
import { KpiCardGrid } from '../components/analytics/KpiCardGrid'
import { TimeSeriesChart } from '../components/analytics/TimeSeriesChart'
import { BreakdownCharts } from '../components/analytics/BreakdownCharts'
import { AnomaliesList } from '../components/analytics/AnomaliesList'
import { DataQualityCard } from '../components/analytics/DataQualityCard'
import { DataTable } from '../components/analytics/DataTable'

export const Dashboard: React.FC = () => {
  const { user, session } = useAuth()
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [datasetsLoading, setDatasetsLoading] = useState<boolean>(true)
  const [datasetsError, setDatasetsError] = useState<string | null>(null)

  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState<boolean>(false)
  const [analyticsError, setAnalyticsError] = useState<string | null>(null)

  // Fetch list of user datasets from Supabase
  const loadDatasets = async () => {
    if (!user) return
    setDatasetsLoading(true)
    setDatasetsError(null)

    try {
      const { data, error } = await (supabase as any)
        .from('datasets')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const list: Dataset[] = data || []
      setDatasets(list)

      // Auto-select latest dataset if available and not already selected
      if (list.length > 0 && !selectedDatasetId) {
        setSelectedDatasetId(list[0].id)
      }
    } catch (err: any) {
      setDatasetsError(err.message || 'Failed to fetch uploaded datasets.')
    } finally {
      setDatasetsLoading(false)
    }
  }

  // Fetch analytics payload when selected dataset changes
  const loadAnalytics = async (datasetId: string) => {
    if (!session?.access_token) {
      setAnalyticsError('No active user session. Please sign in again.')
      return
    }

    setAnalyticsLoading(true)
    setAnalyticsError(null)

    try {
      const result = await fetchDatasetAnalytics(datasetId, session.access_token)
      setAnalytics(result)
    } catch (err: any) {
      setAnalyticsError(err.message || 'Failed to compute dataset analytics.')
      setAnalytics(null)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  useEffect(() => {
    loadDatasets()
  }, [user])

  useEffect(() => {
    if (selectedDatasetId) {
      loadAnalytics(selectedDatasetId)
    }
  }, [selectedDatasetId, session])

  return (
    <div className="flex flex-col gap-6 py-2 pb-12">
      {/* Top Title & Header Actions Banner */}
      <GlassCard className="p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-900/60">
                Retail Intelligence
              </span>
              {analytics?.currency && (
                <GlassBadge variant="neutral" className="font-mono text-[11px]">
                  Currency: {analytics.currency.symbol} ({analytics.currency.code})
                </GlassBadge>
              )}
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Welcome back, <span className="text-blue-600 dark:text-blue-400">{userName}</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Explore automated KPIs, revenue trends, outlier detection, and categorical breakdowns for your retail datasets.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
            {selectedDatasetId && (
              <GlassButton
                variant="secondary"
                size="sm"
                onClick={() => loadAnalytics(selectedDatasetId)}
                disabled={analyticsLoading}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${analyticsLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </GlassButton>
            )}

            {analytics && (
              <GlassButton variant="outline" size="sm" onClick={() => window.print()}>
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </GlassButton>
            )}

            <Link to="/upload">
              <GlassButton variant="primary" size="sm">
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload CSV</span>
              </GlassButton>
            </Link>
          </div>
        </div>
      </GlassCard>

      {/* Dataset Selector Component */}
      <DatasetSelector
        datasets={datasets}
        selectedDatasetId={selectedDatasetId}
        onSelectDataset={(id) => setSelectedDatasetId(id)}
        loading={datasetsLoading}
      />

      {/* Datasets Loading or Error States */}
      {datasetsError && (
        <GlassCard className="p-4 border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 flex items-center gap-3 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{datasetsError}</span>
        </GlassCard>
      )}

      {/* Main Analytics Content */}
      <AnimatePresence mode="wait">
        {analyticsLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-6 py-6"
          >
            <GlassCard className="p-10 text-center flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-900/60">
                <RefreshCw className="w-5 h-5 animate-spin" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Computing Dataset Analytics...
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Parsing revenue metrics, generating time-series curves, and scanning for statistical anomalies.
                </p>
              </div>
            </GlassCard>
          </motion.div>
        ) : analyticsError ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GlassCard className="p-8 border-rose-200 dark:border-rose-900 bg-rose-50/30 dark:bg-rose-950/20 text-center flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-800">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-1 max-w-md">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Analytics Computation Failed
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {analyticsError}
                </p>
              </div>

              {selectedDatasetId && (
                <GlassButton
                  variant="primary"
                  size="sm"
                  onClick={() => loadAnalytics(selectedDatasetId)}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Request</span>
                </GlassButton>
              )}
            </GlassCard>
          </motion.div>
        ) : analytics ? (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-6"
          >
            {/* 1. KPI Summary Cards Grid */}
            <KpiCardGrid
              summary={analytics.summary}
              growth={analytics.growth}
              currency={analytics.currency}
            />

            {/* 2. Main Time-Series Area Chart */}
            <TimeSeriesChart
              data={analytics.time_series}
              currency={analytics.currency}
            />

            {/* Key Insights Banner based on calculated data */}
            {analytics.categories.length > 0 && (
              <GlassCard className="p-4 bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-transparent dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-transparent border-blue-200/80 dark:border-blue-900/40">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Key Business Insight</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300">
                      Top performing category <strong className="text-slate-900 dark:text-slate-100">{analytics.categories[0].category}</strong> represents <strong className="text-blue-600 dark:text-blue-400">{analytics.categories[0].revenue_share}%</strong> of gross revenue. Total parsed dataset contains <strong className="text-slate-900 dark:text-slate-100">{analytics.summary.total_orders.toLocaleString()}</strong> orders.
                    </p>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* 3. Category & Product Breakdowns */}
            <BreakdownCharts
              categories={analytics.categories}
              topProducts={analytics.top_products}
              locations={analytics.locations}
              countries={analytics.countries}
              currency={analytics.currency}
            />

            {/* 4. Product Performance Ledger Table */}
            <DataTable
              products={analytics.top_products}
              currency={analytics.currency}
            />

            {/* 5. Automated Anomalies Alert Section */}
            <AnomaliesList
              anomalies={analytics.anomalies}
              currency={analytics.currency}
            />

            {/* 6. Data Quality Audit Card */}
            <DataQualityCard metrics={analytics.data_quality} />
          </motion.div>
        ) : !datasetsLoading && datasets.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <GlassCard className="p-10 text-center flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-900/60">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1 max-w-md">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  No Sales Data Available Yet
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Upload a retail dataset CSV in the Upload tab to generate real-time analytics, revenue trends, and business insights.
                </p>
              </div>

              <Link to="/upload" className="mt-2">
                <GlassButton variant="primary" size="md">
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload Your First Dataset</span>
                </GlassButton>
              </Link>
            </GlassCard>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}


