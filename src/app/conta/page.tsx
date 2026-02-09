'use client'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { Ticket, PiggyBank, History, ChevronRight } from 'lucide-react'
import { useTranslation } from '@/contexts/LanguageContext'

export default function AccountPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="text-5xl mb-4">🔐</div>
        <h1 className="text-white font-bold text-xl mb-2">{t.auth.loginTitle}</h1>
        <Link href="/auth/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold text-sm rounded-xl">
          {t.auth.loginButton}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-white font-bold text-2xl mb-6">{t.account.title}</h1>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl p-6 mb-6">
        <div className="text-white/70 text-xs font-semibold uppercase tracking-wider">{t.account.yourBalance}</div>
        <div className="text-white font-black text-3xl mt-1">R$ {Number(user.balance || 0).toFixed(2).replace('.', ',')}</div>
        <div className="flex gap-3 mt-4">
          <Link href="/conta/depositar"
            className="px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-lg transition-colors">
            {t.account.deposit}
          </Link>
          <button className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white/80 text-xs font-bold rounded-lg transition-colors">
            {t.account.withdraw}
          </button>
        </div>
      </div>

      {/* Menu Options */}
      <div className="space-y-3">
        {[
          { href: '/conta/apostas', icon: <Ticket size={20} />, title: t.account.myBets, desc: t.account.myBetsDesc, color: 'text-orange-400' },
          { href: '/conta/depositar', icon: <PiggyBank size={20} />, title: t.account.depositFunds, desc: t.account.depositDesc, color: 'text-green-400' },
          { href: '#', icon: <History size={20} />, title: t.account.history, desc: t.account.historyDesc, color: 'text-blue-400' },
        ].map((item, i) => (
          <Link key={i} href={item.href}
            className="flex items-center gap-4 p-4 bg-dark-900/50 border border-white/5 rounded-xl hover:bg-dark-900/80 hover:border-white/10 transition-all">
            <div className={`${item.color}`}>{item.icon}</div>
            <div className="flex-1">
              <div className="text-white font-semibold text-sm">{item.title}</div>
              <div className="text-dark-400 text-xs">{item.desc}</div>
            </div>
            <ChevronRight size={16} className="text-dark-500" />
          </Link>
        ))}
      </div>
    </div>
  )
}
