'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import ResultBalls from '@/components/ResultBalls'
import { getLotteryBySlug } from '@/lib/lotteries'
import Link from 'next/link'
import { Lock, QrCode, CreditCard, Wallet, Check, Loader2 } from 'lucide-react'
import { useTranslation } from '@/contexts/LanguageContext'

export default function CheckoutPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { items, getTotal, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const [method, setMethod] = useState<'pix' | 'card' | 'balance'>('pix')
  const [loading, setLoading] = useState(false)
  const [pixCode, setPixCode] = useState('')
  const [success, setSuccess] = useState(false)
  const total = getTotal()

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="text-5xl mb-4">🔐</div>
        <h1 className="text-white font-bold text-xl mb-2">{t.auth.loginTitle}</h1>
        <p className="text-dark-400 text-sm mb-6">{t.auth.loginSubtitle}</p>
        <Link href="/auth/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold text-sm rounded-xl">
          {t.auth.loginButton}
        </Link>
      </div>
    )
  }

  if (items.length === 0 && !success) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="text-5xl mb-4">🛒</div>
        <h1 className="text-white font-bold text-xl mb-2">{t.cart.empty}</h1>
        <Link href="/" className="text-brand-400 text-sm font-semibold">← {t.cart.browseLotteries}</Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check size={32} className="text-green-400" />
        </div>
        <h1 className="text-white font-bold text-2xl mb-2">{t.checkout.success} 🎉</h1>
        <p className="text-dark-400 text-sm mb-6">{t.checkout.successDesc}</p>
        <div className="flex flex-col gap-3">
          <Link href="/conta/apostas"
            className="px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold text-sm rounded-xl">
            {t.checkout.viewBets}
          </Link>
          <Link href="/" className="text-dark-400 hover:text-white text-sm font-medium transition-colors">
            {t.cart.addMore}
          </Link>
        </div>
      </div>
    )
  }

  const handlePayment = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({
            lotterySlug: i.lotterySlug,
            lotteryName: i.lotteryName,
            numbers: i.numbers,
            extras: i.extras,
            price: i.price,
          })),
          total, method, userId: user.id,
        }),
      })
      const data = await res.json()
      if (method === 'pix' && data.pixCode) {
        setPixCode(data.pixCode)
      } else if (data.success) {
        clearCart()
        setSuccess(true)
      }
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const payMethods = [
    { id: 'pix' as const, icon: <QrCode size={18} />, label: t.checkout.pix, desc: t.checkout.pixDesc },
    { id: 'card' as const, icon: <CreditCard size={18} />, label: t.checkout.card, desc: t.checkout.cardDesc },
    { id: 'balance' as const, icon: <Wallet size={18} />, label: t.checkout.balanceMethod, desc: `R$ ${Number(user.balance).toFixed(2)} ${t.checkout.available}` },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-white font-bold text-2xl mb-1 flex items-center gap-2">
        <Lock size={22} /> {t.checkout.title}
      </h1>
      <p className="text-dark-400 text-sm mb-6">{t.checkout.subtitle}</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Method */}
          <div className="bg-dark-900/50 border border-white/5 rounded-xl p-5">
            <h3 className="text-white font-bold text-sm mb-4">{t.checkout.paymentMethod}</h3>
            <div className="grid grid-cols-3 gap-3">
              {payMethods.map(pm => (
                <button key={pm.id} onClick={() => setMethod(pm.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    method === pm.id
                      ? 'border-brand-500 bg-brand-500/10'
                      : 'border-white/5 bg-dark-800/50 hover:border-white/10'
                  }`}>
                  <div className={method === pm.id ? 'text-brand-400' : 'text-dark-400'}>{pm.icon}</div>
                  <div className="text-white font-semibold text-sm mt-2">{pm.label}</div>
                  <div className="text-dark-500 text-[10px] mt-0.5">{pm.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* PIX */}
          {pixCode && method === 'pix' && (
            <div className="bg-dark-900/50 border border-white/5 rounded-xl p-5 text-center">
              <h3 className="text-white font-bold text-sm mb-3">{t.checkout.scanQR}</h3>
              <div className="w-48 h-48 bg-white rounded-xl mx-auto mb-4 flex items-center justify-center">
                <QrCode size={120} className="text-dark-900" />
              </div>
              <p className="text-dark-400 text-xs mb-3">{t.checkout.orCopyPix}</p>
              <div className="bg-dark-800 rounded-lg p-3 text-xs text-dark-300 font-mono break-all">{pixCode}</div>
              <button onClick={() => { navigator.clipboard.writeText(pixCode) }}
                className="mt-3 px-4 py-2 bg-brand-500/20 text-brand-400 text-xs font-semibold rounded-lg hover:bg-brand-500/30 transition-colors">
                {t.checkout.copyCode}
              </button>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-dark-900/50 border border-white/5 rounded-xl p-5 h-fit sticky top-20">
          <h3 className="text-white font-bold text-sm mb-4">{t.checkout.yourBets}</h3>
          <div className="space-y-3 mb-4">
            {items.map(item => {
              const lot = getLotteryBySlug(item.lotterySlug)
              return (
                <div key={item.id} className="pb-3 border-b border-white/5 last:border-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-white text-xs font-medium">{item.lotteryEmoji} {item.lotteryName}</span>
                    <span className="text-dark-400 text-xs">R$ {item.price.toFixed(2)}</span>
                  </div>
                  <ResultBalls numbers={item.numbers} extras={item.extras} extraColor={lot?.extraColor || 'green'} size="sm" />
                </div>
              )
            })}
          </div>
          <hr className="border-white/5 mb-4" />
          <div className="flex items-center justify-between mb-6">
            <span className="text-white font-bold">{t.cart.total}</span>
            <span className="text-white font-black text-xl">R$ {total.toFixed(2)}</span>
          </div>
          <button onClick={handlePayment} disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-sm rounded-xl hover:from-green-400 hover:to-green-500 transition-all shadow-lg shadow-green-500/20 disabled:opacity-50">
            {loading ? <><Loader2 size={16} className="animate-spin" /> {t.checkout.processing}</> :
              method === 'pix' ? <><QrCode size={16} /> {t.checkout.generatePix}</> :
              method === 'card' ? <><CreditCard size={16} /> {t.checkout.card}</> :
              <><Wallet size={16} /> {t.checkout.balanceMethod}</>}
          </button>
          <div className="flex items-center justify-center gap-1.5 mt-3 text-dark-500 text-[10px]">
            <Lock size={10} /> {t.checkout.securePayment}
          </div>
        </div>
      </div>
    </div>
  )
}
