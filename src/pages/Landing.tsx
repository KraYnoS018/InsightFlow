import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart3, UploadCloud, ShieldCheck, Zap, ArrowRight, Sun, Moon } from 'lucide-react'
import { Background } from '../components/ui/Background'
import { GlassCard } from '../components/ui/GlassCard'
import { GlassButton } from '../components/ui/GlassButton'
import { useTheme } from '../contexts/ThemeContext'

export const Landing: React.FC = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <Background>
      {/* Top Navbar */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/25 border border-sky-400/30">
            <BarChart3 className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-slate-100">InsightFlow</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          <Link to="/login">
            <GlassButton variant="secondary" size="sm">
              Sign In
            </GlassButton>
          </Link>
          <Link to="/signup">
            <GlassButton variant="primary" size="sm">
              Get Started
            </GlassButton>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto px-6 pt-12 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 mb-8 backdrop-blur-md"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Next-Generation Retail Analytics Platform</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mb-6 leading-tight"
        >
          Turn Sales Data Into <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-sky-500 via-indigo-500 to-cyan-400 bg-clip-text text-transparent">
            Actionable Decisions.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mb-10 leading-relaxed font-normal"
        >
          Upload your retail sales data and transform it into clear analytics, insights, and reports with Apple-level precision and security.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <Link to="/signup" className="w-full sm:w-auto">
            <GlassButton variant="primary" size="lg" className="w-full sm:w-auto">
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </GlassButton>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <GlassButton variant="secondary" size="lg" className="w-full sm:w-auto">
              Sign In to Account
            </GlassButton>
          </Link>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left w-full"
        >
          <GlassCard interactive glow className="flex flex-col gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/20">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Drag & Drop CSV</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Instant local parsing, column header detection, row validation, and preview before secure cloud storage.
            </p>
          </GlassCard>

          <GlassCard interactive glow className="flex flex-col gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Dataset Workspace</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Organize, track, and manage all your historical sales dataset uploads in a clean visionOS table view.
            </p>
          </GlassCard>

          <GlassCard interactive glow className="flex flex-col gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Private & Secure</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Row Level Security ensures your business data is strictly isolated and accessible only to your authenticated account.
            </p>
          </GlassCard>
        </motion.div>
      </section>
    </Background>
  )
}
