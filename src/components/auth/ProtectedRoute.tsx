import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Loader2 } from 'lucide-react'

export const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f8fafc] dark:bg-[#080c14]">
        <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 shadow-2xl">
          <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
          <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Authenticating...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
