import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart3, Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Background } from '../components/ui/Background'
import { GlassCard } from '../components/ui/GlassCard'
import { GlassInput } from '../components/ui/GlassInput'
import { GlassButton } from '../components/ui/GlassButton'
import { supabase } from '../lib/supabase'

export const Signup: React.FC = () => {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmationSent, setConfirmationSent] = useState(false)
  const navigate = useNavigate()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setLoading(true)
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      })

      if (signUpError) {
        throw signUpError
      }

      if (data.session) {
        // Direct auto login if email confirmation is disabled in Supabase
        navigate('/dashboard')
      } else if (data.user) {
        // Email confirmation is enabled
        setConfirmationSent(true)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.')
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

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <GlassCard glow className="p-8">
            {confirmationSent ? (
              <div className="flex flex-col items-center text-center p-4 gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shadow-lg">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Check your email</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  We have sent a verification link to <span className="font-bold text-slate-800 dark:text-slate-100">{email}</span>. Please click the link to confirm your account and get started.
                </p>
                <Link to="/login" className="w-full mt-2">
                  <GlassButton variant="primary" className="w-full">
                    Return to Login
                  </GlassButton>
                </Link>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-1 mb-6 text-center">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Create your account</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Start transforming your sales data into decisions</p>
                </div>

                {error && (
                  <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSignup} className="flex flex-col gap-4">
                  <GlassInput
                    label="Full Name"
                    type="text"
                    placeholder="Alex Morgan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    icon={<User className="w-4 h-4" />}
                    required
                  />

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
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={<Lock className="w-4 h-4" />}
                    required
                  />

                  <GlassInput
                    label="Confirm Password"
                    isPassword
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    icon={<Lock className="w-4 h-4" />}
                    required
                  />

                  <GlassButton variant="primary" size="lg" isLoading={loading} className="mt-2 w-full">
                    Create Account
                  </GlassButton>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-sky-600 dark:text-sky-400 hover:underline">
                      Sign in
                    </Link>
                  </p>
                </div>
              </>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </Background>
  )
}
