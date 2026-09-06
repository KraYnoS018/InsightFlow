import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart3, Mail, Lock, AlertCircle } from 'lucide-react'
import { Background } from '../components/ui/Background'
import { GlassCard } from '../components/ui/GlassCard'
import { GlassInput } from '../components/ui/GlassInput'
import { GlassButton } from '../components/ui/GlassButton'
import { supabase } from '../lib/supabase'

export const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('Please fill in all required fields.')
      return
    }

    setLoading(true)
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (authError) {
        throw authError
      }

      if (data.session) {
        navigate('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Background>
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/25 border border-sky-400/30">
            <BarChart3 className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-slate-100">InsightFlow</span>
        </Link>

        {/* Login Glass Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <GlassCard glow className="p-8">
            <div className="flex flex-col gap-1 mb-6 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Welcome back</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Sign in to access your sales analytics workspace</p>
            </div>

            {error && (
              <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <GlassInput
                label="Email address"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                required
              />

              <GlassInput
                label="Password"
                isPassword
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                required
              />

              <GlassButton variant="primary" size="lg" isLoading={loading} className="mt-2 w-full">
                Sign In
              </GlassButton>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Don't have an account?{' '}
                <Link to="/signup" className="font-semibold text-sky-600 dark:text-sky-400 hover:underline">
                  Sign up now
                </Link>
              </p>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </Background>
  )
}
