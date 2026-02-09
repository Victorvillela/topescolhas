'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { Mail, Lock, Loader2 } from 'lucide-react'
import { useTranslation } from '@/contexts/LanguageContext'

export default function LoginPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { login } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(email, password)
    if (result.error) {
      setError(result.error)
    } else {
      router.push('/conta')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎰</div>
          <h1 className="text-white font-bold text-2xl">{t.auth.loginTitle}</h1>
          <p className="text-dark-400 text-sm mt-1">{t.auth.loginSubtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-dark-900/50 border border-white/5 rounded-2xl p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium rounded-lg p-3">
              {error}
            </div>
          )}

          <div>
            <label className="text-dark-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">{t.auth.email}</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full bg-dark-800 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand-500"
                placeholder="email@exemplo.com" />
            </div>
          </div>

          <div>
            <label className="text-dark-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">{t.auth.password}</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full bg-dark-800 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand-500"
                placeholder="••••••" />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold text-sm rounded-xl hover:from-brand-400 hover:to-brand-500 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50">
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {t.auth.loginButton}
          </button>

          <p className="text-center text-dark-400 text-xs">
            {t.auth.noAccount}{' '}
            <Link href="/auth/registro" className="text-brand-400 font-semibold hover:text-brand-300">
              {t.auth.signUp}
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
