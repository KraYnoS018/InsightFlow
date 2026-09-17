import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sun,
  Moon,
  LogOut,
  User,
  Shield,
  Palette,
  Check,
  Mail,
  Key,
} from 'lucide-react'
import { GlassCard } from '../components/ui/GlassCard'
import { GlassButton } from '../components/ui/GlassButton'
import { GlassBadge } from '../components/ui/GlassBadge'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'

export const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const userEmail = user?.email || 'user@example.com'
  const userName = user?.user_metadata?.full_name || userEmail.split('@')[0]
  const userId = user?.id || 'N/A'
  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A'
  const provider = user?.app_metadata?.provider || 'email'

  return (
    <div className="flex flex-col gap-6 py-2 pb-12 max-w-4xl mx-auto">
      {/* Page Header */}
      <GlassCard className="p-5 md:p-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-900/60">
              System Settings
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Preferences & Account Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage your display preferences and active account credentials.
          </p>
        </div>
      </GlassCard>

      {/* 1. Appearance Section */}
      <GlassCard className="p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-900/60">
              <Palette className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Appearance</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Customize the visual workspace theme</p>
            </div>
          </div>
          <GlassBadge variant="neutral" className="text-[10px]">
            Active: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </GlassBadge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Light Theme Option Card */}
          <div
            onClick={() => {
              if (theme !== 'light') toggleTheme()
            }}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
              theme === 'light'
                ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20 text-slate-900'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                <Sun className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Light Mode</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Clean, high-contrast workspace</span>
              </div>
            </div>
            {theme === 'light' && <Check className="w-4 h-4 text-blue-600" />}
          </div>

          {/* Dark Theme Option Card */}
          <div
            onClick={() => {
              if (theme !== 'dark') toggleTheme()
            }}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
              theme === 'dark'
                ? 'border-blue-500 bg-blue-950/40 ring-2 ring-blue-500/20 text-slate-100'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 text-blue-400 flex items-center justify-center">
                <Moon className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Dark Mode</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Sleek, eye-friendly glassmorphic UI</span>
              </div>
            </div>
            {theme === 'dark' && <Check className="w-4 h-4 text-blue-400" />}
          </div>
        </div>
      </GlassCard>

      {/* 2. Account Information Section */}
      <GlassCard className="p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-900/60">
              <User className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Account Profile</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Authenticated user details and session metadata</p>
            </div>
          </div>
          <GlassBadge variant="success" className="text-[10px]">
            Authenticated
          </GlassBadge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Full Name</span>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{userName}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Email Address</span>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{userEmail}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Key className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">User ID</span>
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 truncate">{userId}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Auth Provider / Created</span>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {provider} ({createdAt})
              </span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* 3. Session & Security Section */}
      <GlassCard className="p-6 flex flex-col gap-4 border-rose-200/60 dark:border-rose-900/40">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Active Session</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Sign out of your account on this device.
            </p>
          </div>

          <GlassButton variant="danger" size="md" onClick={handleSignOut}>
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  )
}

export default Settings
