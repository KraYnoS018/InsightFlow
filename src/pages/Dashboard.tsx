import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UploadCloud, BarChart3, Sparkles, ArrowRight } from 'lucide-react'
import { GlassCard } from '../components/ui/GlassCard'
import { GlassButton } from '../components/ui/GlassButton'
import { useAuth } from '../contexts/AuthContext'

export const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

  return (
    <div className="flex flex-col gap-8 py-4">
      {/* Welcome Banner */}
      <GlassCard glow className="p-8 md:p-10 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full w-fit border border-sky-500/20">
              Overview
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Welcome to InsightFlow, <span className="bg-gradient-to-r from-sky-500 to-indigo-500 bg-clip-text text-transparent">{userName}</span>.
            </h1>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Upload your first sales dataset to begin discovering insights and optimizing retail sales decisions.
            </p>
          </div>

          <Link to="/upload" className="shrink-0">
            <GlassButton variant="primary" size="lg" className="shadow-xl">
              <UploadCloud className="w-5 h-5" />
              <span>Upload CSV</span>
            </GlassButton>
          </Link>
        </div>
      </GlassCard>

      {/* Informational Cards */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          How InsightFlow Works
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <GlassCard interactive className="h-full flex flex-col justify-between gap-4 p-6">
              <div className="flex flex-col gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/20">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">1. Upload</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Drag and drop retail sales CSV files. Automatic local parsing validates columns and row structure securely.
                </p>
              </div>

              <Link to="/upload" className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 hover:gap-2.5 transition-all">
                <span>Start Upload</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <GlassCard className="h-full flex flex-col justify-between gap-4 p-6">
              <div className="flex flex-col gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">2. Analyze</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Automated metric evaluation, KPI summary calculations, product breakdown, and revenue trend analysis.
                </p>
              </div>

              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Coming soon in next phase</span>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <GlassCard className="h-full flex flex-col justify-between gap-4 p-6">
              <div className="flex flex-col gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">3. Discover</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  AI-driven automated business insights, sales anomaly detection, and downloadable PDF reports.
                </p>
              </div>

              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Coming soon in next phase</span>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
