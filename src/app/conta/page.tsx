'use client'
import { useAuthStore } from '@/store/authStore'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Wallet, Ticket, Settings, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react'

export default function AccountPage() {
  const { user, loading, logout } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login')
  }, [user, loading, router])

  if (loading || !user) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      {/* Profile Header */}
      <div className="bg-dark-900/50 border border-white/5 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-2xl font-bold">
            {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-white font-bold text-xl">{user.name || 'Minha Conta'}</h1>
            <p className="text-dark-400 text-sm">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl p-6 mb-6">
        <div className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Seu Saldo</div>
        <div className="text-white font-black text-3xl mb-4">R$ {Number(user.balance).toFixed(2)}</div>
        <div className="flex gap-3">
          <Link href="/conta/depositar"
            className="flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded-xl transition-colors">
            <ArrowDownRight size={16} /> Depositar
          </Link>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white/80 text-sm font-semibold rounded-xl transition-colors">
            <ArrowUpRight size={16} /> Sacar
          </button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/conta/apostas"
          className="bg-dark-900/50 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all group">
          <Ticket size={24} className="text-orange-400 mb-3" />
          <h3 className="text-white font-bold text-sm mb-1">Minhas Apostas</h3>
          <p className="text-dark-400 text-xs">Veja suas apostas e resultados</p>
        </Link>
        <Link href="/conta/depositar"
          className="bg-dark-900/50 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all group">
          <Wallet size={24} className="text-green-400 mb-3" />
          <h3 className="text-white font-bold text-sm mb-1">Depositar</h3>
          <p className="text-dark-400 text-xs">Adicione saldo via PIX ou cartão</p>
        </Link>
        <div className="bg-dark-900/50 border border-white/5 rounded-xl p-5">
          <Clock size={24} className="text-brand-400 mb-3" />
          <h3 className="text-white font-bold text-sm mb-1">Histórico</h3>
          <p className="text-dark-400 text-xs">Transações e movimentações</p>
        </div>
      </div>
    </div>
  )
}
