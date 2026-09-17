import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  UploadCloud,
  History,
  LogOut,
  BarChart3,
  X,
  FileText,
  Settings as SettingsIcon,
  ChevronUp,
} from 'lucide-react'
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
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const menuNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload Data', path: '/upload', icon: UploadCloud },
    { name: 'Upload History', path: '/history', icon: History },
  ]

  const otherNavItems = [
    { name: 'Reports', path: '/reports', icon: FileText, badge: 'Auto' },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ]

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const userEmail = user?.email || 'user@example.com'
  const userName = user?.user_metadata?.full_name || userEmail.split('@')[0]

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-4 bg-white dark:bg-[#0b0f19] border-r border-slate-200 dark:border-slate-800">
      <div className="flex flex-col gap-6">
        {/* Logo & Brand Header */}
        <div className="flex items-center justify-between px-2 pt-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-100">InsightFlow</h1>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Retail Analytics</span>
            </div>
          </div>
          
          {/* Mobile close button */}
          <button 
            onClick={onClose}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MENU Group */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">
            Menu
          </span>
          <nav className="flex flex-col gap-1">
            {menuNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-950/50'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={cn('w-4 h-4', isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500')} />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* OTHERS Group */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">
            Others
          </span>
          <nav className="flex flex-col gap-1">
            {otherNavItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-950/50'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <item.icon className={cn('w-4 h-4', isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500')} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* User Profile Footer Card */}
      <div className="relative pt-3 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="flex items-center justify-between w-full p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors text-left"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{userName}</span>
              <span className="text-[11px] text-slate-400 truncate">{userEmail}</span>
            </div>
          </div>
          <ChevronUp className={cn('w-4 h-4 text-slate-400 transition-transform duration-200', userMenuOpen ? 'rotate-180' : '')} />
        </button>

        {/* Dropdown User Menu */}
        <AnimatePresence>
          {userMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-16 left-0 right-0 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col gap-1 z-30"
            >
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{userName}</p>
                <p className="text-[11px] text-slate-400 truncate">{userEmail}</p>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors w-full"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed left-0 top-0 bottom-0 z-30 no-print">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden no-print"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 w-72 z-50 md:hidden no-print"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

