import React from 'react'
import { useLocation } from 'react-router-dom'
import { Sun, Moon, Menu } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'

interface HeaderProps {
  onOpenMobileMenu: () => void
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()
  const location = useLocation()

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/dashboard':
        return 'Overview'
      case '/upload':
        return 'Upload Dataset'
      case '/history':
        return 'Upload History'
      default:
        return 'Dashboard'
    }
  }

  const title = getPageTitle(location.pathname)
  const userInitial = (user?.email || 'U').charAt(0).toUpperCase()

  return (
    <header className="sticky top-0 z-20 w-full px-4 md:px-8 py-4 flex items-center justify-between backdrop-blur-md bg-white/40 dark:bg-slate-950/40 border-b border-slate-200/50 dark:border-white/5">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 border border-slate-300/50 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 shadow-sm"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>

        {/* User avatar indicator */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-white/10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
            {userInitial}
          </div>
        </div>
      </div>
    </header>
  )
}
