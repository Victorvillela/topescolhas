'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import ResultBalls from '@/components/ResultBalls'
import { getLotteryBySlug } from '@/lib/lotteries'
import Link from 'next/link'
import { Lock, QrCode, CreditCard, Wallet, Check, Loader2 } from 'lucide-react'

export default function CheckoutPage() {
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
        <h1 className="text-white font-bold text-xl mb-2">Faça login para continuar</h1>
        <p className="text-dark-400 text-sm mb-6">Você precisa estar logado para finalizar a compra.</p>
        <Link href="/auth/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold text-sm rounded-xl">
          Entrar na Conta
        </Link>
      </div>
    )
  }

  if (items.length === 0 && !success) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="text-5xl mb-4">🛒</div>
        <h1 className="text-white font-bold text-xl mb-2">Carrinho vazio</h1>
        <Link href="/" className="text-brand-400 text-sm font-semibold">← Voltar para Loterias</Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check size={32} className="text-green-400" />
        </div>
        <h1 className="text-white font-bold text-2xl mb-2">Aposta Confirmada! 🎉</h1>
        <p className="text-dark-400 text-sm mb-6">Suas apostas foram registradas com sucesso. Boa sorte!</p>
        <div className="flex flex-col gap-3">
          <Link href="/conta/apostas"
            className="px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold text-sm rounded-xl">
            Ver Minhas Apostas
          </Link>
          <Link href="/" className="text-dark-400 hover:text-white text-sm font-medium transition-colors">
            Fazer mais apostas
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
          total,
          method,
          userId: user.id,
        }),
      })
      const data = await res.json()

      if (method === 'pix' && data.pixCode) {
        setPixCode(data.pixCode)
      } else if (data.success) {
        clearCart()
        setSuccess(true)
      }
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const payMethods = [
    { id: 'pix' as const, icon: <QrCode size={18} />, label: 'PIX', desc: 'Pagamento instantâneo' },
    { id: 'card' as const, icon: <CreditCard size={18} />, label: 'Cartão', desc: 'Crédito ou débito' },
    { id: 'balance' as const, icon: <Wallet size={18} />, label: 'Saldo', desc: `R$ ${Number(user.balance).toFixed(2)} disponível` },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-white font-bold text-2xl mb-1 flex items-center gap-2">
        <Lock size={22} /> Checkout
      </h1>
      <p className="text-dark-400 text-sm mb-6">Finalize suas apostas de forma segura</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Method */}
          <div className="bg-dark-900/50 border border-white/5 rounded-xl p-5">
            <h3 className="text-white font-bold text-sm mb-4">Forma de Pagamento</h3>
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

          {/* PIX QR Code */}
          {pixCode && method === 'pix' && (
            <div className="bg-dark-900/50 border border-white/5 rounded-xl p-5 text-center">
              <h3 className="text-white font-bold text-sm mb-3">Escaneie o QR Code</h3>
              <div className="w-48 h-48 bg-white rounded-xl mx-auto mb-4 flex items-center justify-center">
                <QrCode size={120} className="text-dark-900" />
              </div>
              <p className="text-dark-400 text-xs mb-3">Ou copie o código PIX:</p>
              <div className="bg-dark-800 rounded-lg p-3 text-xs text-dark-300 font-mono break-all">
                {pixCode}
              </div>
              <button onClick={() => { navigator.clipboard.writeText(pixCode) }}
                className="mt-3 px-4 py-2 bg-brand-500/20 text-brand-400 text-xs font-semibold rounded-lg hover:bg-brand-500/30 transition-colors">
                Copiar Código
              </button>
            </div>
          )}

          {/* Card Form */}
          {method === 'card' && (
            <div className="bg-dark-900/50 border border-white/5 rounded-xl p-5">
              <h3 className="text-white font-bold text-sm mb-4">Dados do Cartão</h3>
              <div className="space-y-3">
                <input type="text" placeholder="Número do cartão" maxLength={19}
                  className="w-full bg-dark-800 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand-500" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="MM/AA" maxLength={5}
                    className="bg-dark-800 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand-500" />
                  <input type="text" placeholder="CVV" maxLength={4}
                    className="bg-dark-800 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand-500" />
                </div>
                <input type="text" placeholder="Nome no cartão"
                  className="w-full bg-dark-800 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand-500" />
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-dark-900/50 border border-white/5 rounded-xl p-5 h-fit sticky top-20">
          <h3 className="text-white font-bold text-sm mb-4">Suas Apostas</h3>
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
            <span className="text-white font-bold">Total</span>
            <span className="text-white font-black text-xl">R$ {total.toFixed(2)}</span>
          </div>
          <button onClick={handlePayment} disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-sm rounded-xl hover:from-green-400 hover:to-green-500 transition-all shadow-lg shadow-green-500/20 disabled:opacity-50">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Processando...</> :
              method === 'pix' ? <><QrCode size={16} /> Gerar PIX</> :
              method === 'card' ? <><CreditCard size={16} /> Pagar com Cartão</> :
              <><Wallet size={16} /> Pagar com Saldo</>}
          </button>
          <div className="flex items-center justify-center gap-1.5 mt-3 text-dark-500 text-[10px]">
            <Lock size={10} /> Pagamento seguro e criptografado
          </div>
        </div>
      </div>
    </div>
  )
}
