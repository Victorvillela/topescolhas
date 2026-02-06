'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import Link from 'next/link'
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(email, password)
    if (result.error) {
      setError(result.error === 'Invalid login credentials' ? 'Email ou senha incorretos' : result.error)
      setLoading(false)
    } else {
      router.push('/')
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl mx-auto mb-4">🎰</div>
          <h1 className="text-white font-bold text-2xl mb-1">Bem-vindo de volta!</h1>
          <p className="text-dark-400 text-sm">Entre na sua conta para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-dark-900/50 border border-white/5 rounded-2xl p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="text-dark-400 text-xs font-semibold mb-1.5 block">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="seu@email.com"
                className="w-full bg-dark-800 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand-500 transition-colors" />
            </div>
          </div>

          <div>
            <label className="text-dark-400 text-xs font-semibold mb-1.5 block">Senha</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500" />
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                className="w-full bg-dark-800 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand-500 transition-colors" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-500 hover:text-white">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold text-sm rounded-xl hover:from-brand-400 hover:to-brand-500 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Entrando...</> : 'Entrar'}
          </button>

          <p className="text-center text-dark-400 text-sm">
            Não tem conta?{' '}
            <Link href="/auth/registro" className="text-brand-400 hover:text-brand-300 font-semibold">
              Cadastre-se grátis
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
