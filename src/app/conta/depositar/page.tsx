'use client'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import Link from 'next/link'
import { QrCode, CreditCard, Loader2 } from 'lucide-react'
import { useTranslation } from '@/contexts/LanguageContext'

export default function DepositPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [amount, setAmount] = useState(50)
  const [method, setMethod] = useState<'pix' | 'card'>('pix')
  const [loading, setLoading] = useState(false)

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="text-5xl mb-4">🔐</div>
        <Link href="/auth/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold text-sm rounded-xl">
          {t.auth.loginButton}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-white font-bold text-2xl mb-1">{t.deposit.title}</h1>
      <p className="text-dark-400 text-sm mb-6">
        {t.deposit.currentBalance}: <span className="text-green-400 font-bold">R$ {Number(user.balance || 0).toFixed(2).replace('.', ',')}</span>
      </p>

      <div className="bg-dark-900/50 border border-white/5 rounded-2xl p-6 space-y-6">
        {/* Amount */}
        <div>
          <label className="text-dark-400 text-xs font-semibold uppercase tracking-wider mb-3 block">{t.deposit.amount}</label>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[20, 50, 100, 200].map(v => (
              <button key={v} onClick={() => setAmount(v)}
                className={`py-3 rounded-lg text-sm font-bold transition-all ${
                  amount === v
                    ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                    : 'bg-dark-800 text-dark-400 border border-white/5 hover:text-white'
                }`}>
                R$ {v}
              </button>
            ))}
          </div>
          <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} min={5}
            className="w-full bg-dark-800 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand-500"
            placeholder={t.deposit.customAmount} />
        </div>

        {/* Method */}
        <div>
          <label className="text-dark-400 text-xs font-semibold uppercase tracking-wider mb-3 block">{t.deposit.paymentMethod}</label>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setMethod('pix')}
              className={`p-4 rounded-xl border text-left transition-all ${
                method === 'pix' ? 'border-brand-500 bg-brand-500/10' : 'border-white/5 bg-dark-800/50 hover:border-white/10'
              }`}>
              <QrCode size={20} className={method === 'pix' ? 'text-brand-400' : 'text-dark-400'} />
              <div className="text-white font-semibold text-sm mt-2">PIX</div>
            </button>
            <button onClick={() => setMethod('card')}
              className={`p-4 rounded-xl border text-left transition-all ${
                method === 'card' ? 'border-brand-500 bg-brand-500/10' : 'border-white/5 bg-dark-800/50 hover:border-white/10'
              }`}>
              <CreditCard size={20} className={method === 'card' ? 'text-brand-400' : 'text-dark-400'} />
              <div className="text-white font-semibold text-sm mt-2">{t.checkout.card}</div>
            </button>
          </div>
        </div>

        <button disabled={loading || amount < 5}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-sm rounded-xl hover:from-green-400 hover:to-green-500 transition-all shadow-lg shadow-green-500/20 disabled:opacity-50">
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          {t.deposit.depositButton} R$ {amount.toFixed(2)}
        </button>
      </div>
    </div>
  )
}
