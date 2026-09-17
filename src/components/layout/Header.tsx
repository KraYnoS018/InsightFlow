import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Sun, Moon, Menu, Search, Calendar, Bell, X, Package, Tag, MapPin, Globe } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import { useAnalytics } from '../../contexts/AnalyticsContext'

interface HeaderProps {
  onOpenMobileMenu: () => void
}

interface SearchResultItem {
  type: 'Product' | 'Category' | 'Location' | 'Country'
  name: string
  subtitle?: string
  revenue?: string
  units?: number
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()
  const { analytics, searchTerm, setSearchTerm } = useAnalytics()
  const location = useLocation()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/dashboard':
        return 'Overview'
      case '/upload':
        return 'Upload Dataset'
      case '/history':
        return 'Upload History'
      case '/reports':
        return 'Sales Reports'
      case '/settings':
        return 'Settings'
      default:
        return 'Dashboard'
    }
  }

  const title = getPageTitle(location.pathname)
  const userInitial = (user?.email || 'U').charAt(0).toUpperCase()

  // Compute search results based on active dataset analytics
  const searchResults = useMemo(() => {
    if (!analytics || !searchTerm.trim()) return []

    const term = searchTerm.toLowerCase().trim()
    const results: SearchResultItem[] = []
    const symbol = analytics.currency?.symbol || '$'

    // 1. Search Categories
    analytics.categories.forEach((cat) => {
      if (cat.category.toLowerCase().includes(term)) {
        results.push({
          type: 'Category',
          name: cat.category,
          subtitle: `${cat.revenue_share}% revenue share`,
          revenue: `${symbol}${cat.revenue.toLocaleString()}`,
          units: cat.units,
        })
      }
    })

    // 2. Search Top Products
    analytics.top_products.forEach((prod) => {
      const name = prod.description || prod.stock_code || 'Product'
      const code = prod.stock_code || ''
      if (name.toLowerCase().includes(term) || code.toLowerCase().includes(term)) {
        results.push({
          type: 'Product',
          name: name,
          subtitle: code ? `Code: ${code}` : undefined,
          revenue: `${symbol}${prod.revenue.toLocaleString()}`,
          units: prod.units,
        })
      }
    })

    // 3. Search Store Locations
    analytics.locations.forEach((loc) => {
      if (loc.store_location.toLowerCase().includes(term)) {
        results.push({
          type: 'Location',
          name: loc.store_location,
          subtitle: `${loc.orders} orders`,
          revenue: `${symbol}${loc.revenue.toLocaleString()}`,
          units: loc.units,
        })
      }
    })

    // 4. Search Countries
    analytics.countries.forEach((ctry) => {
      if (ctry.country.toLowerCase().includes(term)) {
        results.push({
          type: 'Country',
          name: ctry.country,
          subtitle: `${ctry.orders} orders`,
          revenue: `${symbol}${ctry.revenue.toLocaleString()}`,
          units: ctry.units,
        })
      }
    })

    return results.slice(0, 8)
  }, [analytics, searchTerm])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-20 w-full px-4 md:px-6 lg:px-8 py-3.5 flex items-center justify-between bg-white/90 dark:bg-[#0b0f19]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 no-print">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <h2 className="text-base md:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h2>
          <span className="text-[11px] text-slate-400 font-normal hidden sm:inline">Real-time retail metrics & performance monitoring</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Interactive Search Field */}
        <div ref={searchRef} className="relative hidden lg:block w-64 md:w-72">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setIsSearchOpen(true)
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search products, categories, locations..."
              className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setIsSearchOpen(false)
                }}
                className="absolute right-2.5 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown Overlay */}
          {isSearchOpen && searchTerm.trim() !== '' && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col max-h-96">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <span>Matching Results</span>
                <span>{searchResults.length} found</span>
              </div>

              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                  No products, categories, locations or countries found matching "{searchTerm}"
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 overflow-y-auto">
                  {searchResults.map((item, idx) => (
                    <div
                      key={`${item.type}-${item.name}-${idx}`}
                      onClick={() => {
                        setIsSearchOpen(false)
                      }}
                      className="p-2.5 hover:bg-blue-50/60 dark:hover:bg-blue-950/40 cursor-pointer transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                          {item.type === 'Product' && <Package className="w-3.5 h-3.5 text-indigo-500" />}
                          {item.type === 'Category' && <Tag className="w-3.5 h-3.5 text-blue-500" />}
                          {item.type === 'Location' && <MapPin className="w-3.5 h-3.5 text-purple-500" />}
                          {item.type === 'Country' && <Globe className="w-3.5 h-3.5 text-emerald-500" />}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              {item.type}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {item.name}
                          </span>
                          {item.subtitle && (
                            <span className="text-[10px] text-slate-400 truncate">{item.subtitle}</span>
                          )}
                        </div>
                      </div>

                      {item.revenue && (
                        <div className="flex flex-col items-end shrink-0 text-right">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{item.revenue}</span>
                          {item.units !== undefined && (
                            <span className="text-[10px] text-slate-400">{item.units.toLocaleString()} units</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Date Context Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700/60">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Last 30 Days</span>
        </div>

        {/* Notifications Icon Button */}
        <button
          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700/60 relative"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700/60"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
        </button>

        {/* User avatar indicator */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
            {userInitial}
          </div>
        </div>
      </div>
    </header>
  )
}
