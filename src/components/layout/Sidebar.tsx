import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, UploadCloud, History, LogOut, BarChart3, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { cn } from '../../lib/utils'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload Data', path: '/upload', icon: UploadCloud },
    { name: 'Upload History', path: '/history', icon: History },
  ]

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const userEmail = user?.email || 'user@example.com'
  const userName = user?.user_metadata?.full_name || userEmail.split('@')[0]

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-4">
      <div>
        {/* Logo & Brand */}
        <div className="flex items-center justify-between px-3 py-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/25 border border-sky-400/30">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-100">InsightFlow</h1>
            </div>
          </div>
          
          {/* Mobile close button */}
          <button 
            onClick={onClose}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'text-sky-600 dark:text-sky-400 font-semibold bg-sky-500/10 border border-sky-500/20 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn('w-4 h-4', isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500')} />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Profile & Logout */}
      <div className="pt-4 border-t border-slate-200/60 dark:border-white/10 flex flex-col gap-2">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-white/5">
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-semibold text-xs border border-slate-300 dark:border-slate-700">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{userName}</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{userEmail}</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Floating visionOS Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed left-6 top-6 bottom-6 z-30 rounded-3xl bg-white/45 dark:bg-slate-900/40 backdrop-blur-3xl border border-slate-200/80 dark:border-white/10 shadow-2xl shadow-slate-900/5 dark:shadow-black/50">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl border-r border-slate-200 dark:border-white/10 z-50 md:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
