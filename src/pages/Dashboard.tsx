import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UploadCloud,
  BarChart3,
  RefreshCw,
  AlertCircle,
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
    <div className="flex flex-col gap-8 py-4 pb-12">
      {/* Welcome & Action Banner */}
      <GlassCard glow className="p-6 md:p-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full w-fit border border-sky-500/20">
                Analytics Hub
              </span>
              {analytics?.currency && (
                <GlassBadge variant="neutral" className="font-mono">
                  Detected Currency: {analytics.currency.symbol} ({analytics.currency.code})
                </GlassBadge>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Retail Intelligence for <span className="bg-gradient-to-r from-sky-500 to-indigo-500 bg-clip-text text-transparent">{userName}</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Explore automated KPIs, revenue trends, outlier detection, and categorical breakdowns for your datasets.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {selectedDatasetId && (
              <GlassButton
                variant="secondary"
                size="md"
                onClick={() => loadAnalytics(selectedDatasetId)}
                disabled={analyticsLoading}
              >
                <RefreshCw className={`w-4 h-4 ${analyticsLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Data</span>
              </GlassButton>
            )}

            <Link to="/upload">
              <GlassButton variant="primary" size="md" className="shadow-lg">
                <UploadCloud className="w-4 h-4" />
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
        <GlassCard className="p-5 border-rose-500/30 bg-rose-500/5 text-rose-600 dark:text-rose-400 flex items-center gap-3 text-xs font-medium">
          <AlertCircle className="w-5 h-5 shrink-0" />
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
            className="flex flex-col gap-6 py-8"
          >
            <GlassCard className="p-12 text-center flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center border border-sky-500/20">
                <RefreshCw className="w-6 h-6 animate-spin text-sky-500" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
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
            <GlassCard className="p-8 border-rose-500/30 bg-rose-500/5 text-center flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1 max-w-md">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
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
                  <RefreshCw className="w-4 h-4" />
                  <span>Retry Request</span>
                </GlassButton>
              )}
            </GlassCard>
          </motion.div>
        ) : analytics ? (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-8"
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

            {/* 3. Category & Product Breakdowns */}
            <BreakdownCharts
              categories={analytics.categories}
              topProducts={analytics.top_products}
              locations={analytics.locations}
              countries={analytics.countries}
              currency={analytics.currency}
            />

            {/* 4. Automated Anomalies Alert Section */}
            <AnomaliesList
              anomalies={analytics.anomalies}
              currency={analytics.currency}
            />

            {/* 5. Data Quality Audit Card */}
            <DataQualityCard metrics={analytics.data_quality} />
          </motion.div>
        ) : !datasetsLoading && datasets.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <GlassCard className="p-10 text-center flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center border border-sky-500/20">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1 max-w-md">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  No Sales Data Available Yet
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Upload a retail dataset CSV in the Upload tab to generate real-time analytics, revenue trends, and automated business insights.
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
