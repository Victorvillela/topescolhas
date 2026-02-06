'use client'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { QrCode, CreditCard, Loader2, Check, Wallet } from 'lucide-react'

const AMOUNTS = [20, 50, 100, 200, 500]

export default function DepositPage() {
  const { user, loading, refreshBalance } = useAuthStore()
  const router = useRouter()
  const [amount, setAmount] = useState(50)
  const [customAmount, setCustomAmount] = useState('')
  const [method, setMethod] = useState<'pix' | 'card'>('pix')
  const [processing, setProcessing] = useState(false)
  const [pixCode, setPixCode] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login')
  }, [user, loading, router])

  if (loading || !user) return null

  const finalAmount = customAmount ? parseFloat(customAmount) : amount

  const handleDeposit = async () => {
    if (finalAmount < 5) return
    setProcessing(true)
    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'deposit', amount: finalAmount, method, userId: user.id }),
      })
      const data = await res.json()
      if (method === 'pix' && data.pixCode) {
        setPixCode(data.pixCode)
      } else if (data.success) {
        setSuccess(true)
        refreshBalance()
      }
    } catch (e) { console.error(e) }
    setProcessing(false)
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check size={32} className="text-green-400" />
        </div>
        <h1 className="text-white font-bold text-2xl mb-2">Depósito Realizado!</h1>
        <p className="text-dark-400 text-sm mb-6">R$ {finalAmount.toFixed(2)} foram adicionados ao seu saldo.</p>
        <button onClick={() => router.push('/')} className="px-6 py-3 bg-brand-500 text-white font-bold text-sm rounded-xl">
          Começar a Jogar
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-white font-bold text-2xl mb-1 flex items-center gap-2">
        <Wallet size={24} /> Depositar
      </h1>
      <p className="text-dark-400 text-sm mb-6">Saldo atual: <span className="text-green-400 font-bold">R$ {Number(user.balance).toFixed(2)}</span></p>

      <div className="bg-dark-900/50 border border-white/5 rounded-2xl p-6 space-y-6">
        {/* Amount Selection */}
        <div>
          <label className="text-dark-400 text-xs font-semibold mb-3 block">Valor do depósito</label>
          <div className="grid grid-cols-5 gap-2 mb-3">
            {AMOUNTS.map(a => (
              <button key={a} onClick={() => { setAmount(a); setCustomAmount('') }}
                className={`py-2.5 rounded-lg text-sm font-bold transition-all ${
                  amount === a && !customAmount ? 'bg-brand-500 text-white' : 'bg-dark-800 text-dark-300 hover:bg-dark-700 hover:text-white border border-white/5'
                }`}>
                R$ {a}
              </button>
            ))}
          </div>
          <input type="number" value={customAmount} onChange={e => setCustomAmount(e.target.value)}
            placeholder="Outro valor (mín. R$ 5,00)"
            className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand-500" />
        </div>

        {/* Method */}
        <div>
          <label className="text-dark-400 text-xs font-semibold mb-3 block">Forma de pagamento</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'pix' as const, icon: <QrCode size={18} />, label: 'PIX', desc: 'Instantâneo' },
              { id: 'card' as const, icon: <CreditCard size={18} />, label: 'Cartão', desc: 'Crédito/Débito' },
            ].map(m => (
              <button key={m.id} onClick={() => setMethod(m.id)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  method === m.id ? 'border-brand-500 bg-brand-500/10' : 'border-white/5 bg-dark-800/50 hover:border-white/10'
                }`}>
                <div className={method === m.id ? 'text-brand-400' : 'text-dark-400'}>{m.icon}</div>
                <div className="text-white font-semibold text-sm mt-2">{m.label}</div>
                <div className="text-dark-500 text-[10px]">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* PIX QR */}
        {pixCode && (
          <div className="text-center p-5 bg-dark-800/50 rounded-xl">
            <div className="w-40 h-40 bg-white rounded-xl mx-auto mb-3 flex items-center justify-center">
              <QrCode size={100} className="text-dark-900" />
            </div>
            <p className="text-dark-400 text-xs mb-2">Código PIX copia e cola:</p>
            <div className="bg-dark-800 rounded-lg p-3 text-[11px] text-dark-300 font-mono break-all mb-3">{pixCode}</div>
            <button onClick={() => navigator.clipboard.writeText(pixCode)}
              className="px-4 py-2 bg-brand-500/20 text-brand-400 text-xs font-semibold rounded-lg">Copiar</button>
          </div>
        )}

        {/* Submit */}
        <button onClick={handleDeposit} disabled={processing || finalAmount < 5}
          className="w-full py-3.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-green-500/20 disabled:opacity-50 flex items-center justify-center gap-2">
          {processing ? <><Loader2 size={16} className="animate-spin" /> Processando...</> :
            `Depositar R$ ${finalAmount.toFixed(2)}`}
        </button>
      </div>
    </div>
  )
}
