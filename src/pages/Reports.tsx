import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Sparkles,
  Printer,
  Copy,
  Check,
  Trash2,
  BarChart3,
  Calendar,
  AlertCircle,
  TrendingUp,
  Building2,
  Globe,
  Tag,
  PackageCheck,
} from 'lucide-react'
import { GlassCard } from '../components/ui/GlassCard'
import { GlassButton } from '../components/ui/GlassButton'
import { GlassBadge } from '../components/ui/GlassBadge'
import { useAnalytics } from '../contexts/AnalyticsContext'
import { DatasetSelector } from '../components/analytics/DatasetSelector'
import { PrintAnalyticsReport } from '../components/analytics/PrintAnalyticsReport'

interface GeneratedReport {
  id: string
  datasetId: string
  datasetName: string
  createdAt: string
  summary: {
    totalRevenue: string
    totalOrders: number
    totalUnits: number
    aov: string
    currencySymbol: string
    currencyCode: string
  }
  topCategory?: { name: string; share: number }
  topProduct?: { name: string; revenue: string; units: number }
  topLocation?: { name: string; revenue: string }
  topCountry?: { name: string; revenue: string }
  anomaliesCount: number
  dataQualityScore: number
  executiveSummary: string
}

const STORAGE_KEY = 'insightflow_generated_reports'

const loadStoredReports = (): GeneratedReport[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {
    // Ignore parse errors
  }
  return []
}

export const Reports: React.FC = () => {
  const {
    datasets,
    datasetsLoading,
    selectedDatasetId,
    setSelectedDatasetId,
    analytics,
    analyticsLoading,
    activeDataset,
  } = useAnalytics()

  const [reports, setReports] = useState<GeneratedReport[]>(loadStoredReports)
  const [activeReportId, setActiveReportId] = useState<string | null>(() => {
    const initial = loadStoredReports()
    return initial.length > 0 ? initial[0].id : null
  })
  const [copied, setCopied] = useState<boolean>(false)

  // Save reports to localStorage
  const saveReports = (newReports: GeneratedReport[]) => {
    setReports(newReports)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newReports))
  }

  const handleGenerateReport = () => {
    if (!analytics || !activeDataset) return

    const symbol = analytics.currency?.symbol || '$'
    const code = analytics.currency?.code || 'USD'
    const topCat = analytics.categories?.[0]
    const topProd = analytics.top_products?.[0]
    const topLoc = analytics.locations?.[0]
    const topCtry = analytics.countries?.[0]

    const revStr = `${symbol}${analytics.summary.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    const aovStr = analytics.summary.average_order_value
      ? `${symbol}${analytics.summary.average_order_value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : 'N/A'

    const qualityPercent = analytics.data_quality
      ? Math.round((analytics.data_quality.valid_rows / (analytics.data_quality.total_rows || 1)) * 100)
      : 100

    const execSummary = `Sales Performance Report for ${activeDataset.file_name}: Total revenue generated is ${revStr} ${code} across ${analytics.summary.total_orders.toLocaleString()} orders and ${analytics.summary.total_units.toLocaleString()} units sold (Average Order Value: ${aovStr}). ${topCat ? `The leading category is "${topCat.category}" contributing ${topCat.revenue_share}% of total sales.` : ''
      } ${topProd ? `The top product is "${topProd.description || topProd.stock_code}" generating ${symbol}${topProd.revenue.toLocaleString()} revenue.` : ''
      } ${analytics.anomalies.length > 0 ? `Identified ${analytics.anomalies.length} anomaly flag(s) requiring operational attention.` : 'No critical anomaly spikes detected.'}`

    const newReport: GeneratedReport = {
      id: `rep_${Date.now()}`,
      datasetId: activeDataset.id,
      datasetName: activeDataset.file_name,
      createdAt: new Date().toISOString(),
      summary: {
        totalRevenue: revStr,
        totalOrders: analytics.summary.total_orders,
        totalUnits: analytics.summary.total_units,
        aov: aovStr,
        currencySymbol: symbol,
        currencyCode: code,
      },
      topCategory: topCat ? { name: topCat.category, share: topCat.revenue_share } : undefined,
      topProduct: topProd
        ? {
          name: topProd.description || topProd.stock_code || 'Product',
          revenue: `${symbol}${topProd.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          units: topProd.units,
        }
        : undefined,
      topLocation: topLoc
        ? {
          name: topLoc.store_location,
          revenue: `${symbol}${topLoc.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        }
        : undefined,
      topCountry: topCtry
        ? {
          name: topCtry.country,
          revenue: `${symbol}${topCtry.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        }
        : undefined,
      anomaliesCount: analytics.anomalies.length,
      dataQualityScore: qualityPercent,
      executiveSummary: execSummary,
    }

    const updated = [newReport, ...reports.filter((r) => r.id !== newReport.id)]
    saveReports(updated)
    setActiveReportId(newReport.id)
  }

  const handleDeleteReport = (id: string) => {
    const updated = reports.filter((r) => r.id !== id)
    saveReports(updated)
    if (activeReportId === id) {
      setActiveReportId(updated.length > 0 ? updated[0].id : null)
    }
  }

  const handleCopySummary = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const activeReport = reports.find((r) => r.id === activeReportId)

  return (
    <div className="flex flex-col gap-6 py-2 pb-12">
      {/* Page Header Card */}
      <GlassCard className="p-5 md:p-6 no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-900/60">
                Automated Reporting
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Sales & Executive Reports
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generate structured sales summaries, performance breakdowns, and executive insights from your active dataset.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
            <GlassButton
              variant="primary"
              size="md"
              onClick={handleGenerateReport}
              disabled={!analytics || analyticsLoading}
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Sales Report</span>
            </GlassButton>
          </div>
        </div>
      </GlassCard>

      {/* Dataset Selector */}
      <div className="no-print">
        <DatasetSelector
          datasets={datasets}
          selectedDatasetId={selectedDatasetId}
          onSelectDataset={(id) => setSelectedDatasetId(id)}
          loading={datasetsLoading}
        />
      </div>

      {/* Main Reports Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Report List */}
        <div className="lg:col-span-1 flex flex-col gap-3 no-print">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 px-1 flex items-center justify-between">
            <span>Generated Reports</span>
            <span className="text-xs font-normal text-slate-400">({reports.length})</span>
          </h2>

          {reports.length === 0 ? (
            <GlassCard className="p-6 text-center flex flex-col items-center justify-center gap-3">
              <FileText className="w-8 h-8 text-slate-400" />
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No Reports Generated Yet</p>
                <p className="text-[11px] text-slate-400">
                  Select a dataset above and click "Generate Sales Report" to create your first report.
                </p>
              </div>
            </GlassCard>
          ) : (
            <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto pr-1">
              {reports.map((report) => {
                const isActive = report.id === activeReportId
                return (
                  <GlassCard
                    key={report.id}
                    onClick={() => setActiveReportId(report.id)}
                    className={`p-4.5 cursor-pointer transition-all ${isActive
                        ? 'border-blue-500/80 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-500/40'
                        : 'hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                            {report.datasetName}
                          </h3>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteReport(report.id)
                          }}
                          className="p-1 text-slate-400 hover:text-rose-500 transition-colors rounded-md"
                          title="Delete Report"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {report.summary.totalRevenue}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: Detailed Report View */}
        <div className="lg:col-span-2">
          {activeReport ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeReport.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-6"
              >
                <GlassCard className="p-6 md:p-8 flex flex-col gap-6 relative">
                  {/* Actions Header bar inside card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <GlassBadge variant="info" className="text-[10px]">
                          Sales Analytics Report
                        </GlassBadge>
                        <span className="text-[11px] text-slate-400 font-mono">
                          ID: {activeReport.id.slice(0, 12)}
                        </span>
                      </div>
                      <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100">
                        {activeReport.datasetName}
                      </h2>
                      <p className="text-[11px] text-slate-400">
                        Generated on {new Date(activeReport.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 no-print">
                      <GlassButton
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCopySummary(activeReport.executiveSummary)}
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy Summary'}</span>
                      </GlassButton>
                      <GlassButton variant="primary" size="sm" onClick={() => window.print()}>
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print / Export</span>
                      </GlassButton>
                    </div>
                  </div>

                  {/* Executive Summary Box */}
                  <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 flex flex-col gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Executive Summary
                    </span>
                    <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {activeReport.executiveSummary}
                    </p>
                  </div>

                  {/* Key Financial & Metric Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 flex flex-col gap-1">
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Total Revenue</span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-slate-100 truncate">
                        {activeReport.summary.totalRevenue}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 flex flex-col gap-1">
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Total Orders</span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                        {activeReport.summary.totalOrders.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 flex flex-col gap-1">
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Units Sold</span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                        {activeReport.summary.totalUnits.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 flex flex-col gap-1">
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Avg Order Value</span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                        {activeReport.summary.aov}
                      </span>
                    </div>
                  </div>

                  {/* Detailed Performance Metrics */}
                  <div className="flex flex-col gap-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-blue-500" /> Key Performance Highlights
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeReport.topCategory && (
                        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                            <Tag className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase">Top Category</span>
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {activeReport.topCategory.name}
                            </span>
                            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                              {activeReport.topCategory.share}% share of total sales
                            </span>
                          </div>
                        </div>
                      )}

                      {activeReport.topProduct && (
                        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                            <TrendingUp className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase">Top Performing Product</span>
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {activeReport.topProduct.name}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              {activeReport.topProduct.revenue} ({activeReport.topProduct.units} units)
                            </span>
                          </div>
                        </div>
                      )}

                      {activeReport.topLocation && (
                        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase">Primary Location</span>
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {activeReport.topLocation.name}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              {activeReport.topLocation.revenue} revenue
                            </span>
                          </div>
                        </div>
                      )}

                      {activeReport.topCountry && (
                        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <Globe className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase">Primary Country</span>
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {activeReport.topCountry.name}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              {activeReport.topCountry.revenue} revenue
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Audit & Quality Status */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-100/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <PackageCheck className="w-4 h-4 text-emerald-500" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">Data Integrity Score:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{activeReport.dataQualityScore}%</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">Anomalies Detected:</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">{activeReport.anomaliesCount}</span>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </AnimatePresence>
          ) : (
            <GlassCard className="p-12 text-center flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-900/60">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1 max-w-sm">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Select or Generate a Report
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Select a generated report from the list on the left, or click "Generate Sales Report" to create a new report from your current dataset.
                </p>
              </div>
            </GlassCard>
          )}
        </div>
      </div>

      {/* Printable Analytics Report */}
      {analytics && (
        <PrintAnalyticsReport
          analytics={analytics}
          dataset={activeDataset ?? undefined}
        />
      )}
    </div>
  )
}



export default Reports
