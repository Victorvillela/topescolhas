'use client'
import { useCartStore } from '@/store/cartStore'
import ResultBalls from '@/components/ResultBalls'
import Link from 'next/link'
import { Trash2, ShoppingCart, ArrowRight, Plus } from 'lucide-react'
import { getLotteryBySlug } from '@/lib/lotteries'
import { useTranslation } from '@/contexts/LanguageContext'

export default function CartPage() {
  const { t } = useTranslation()
  const { items, removeItem, clearCart, getTotal } = useCartStore()
  const total = getTotal()

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-white font-bold text-2xl mb-2">{t.cart.empty}</h1>
        <p className="text-dark-400 text-sm mb-6">{t.cart.emptyDesc}</p>
        <Link href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm rounded-xl hover:from-orange-400 hover:to-orange-500 transition-all">
          <Plus size={16} /> {t.cart.browseLotteries}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white font-bold text-2xl flex items-center gap-2">
            <ShoppingCart size={24} /> {t.cart.title}
          </h1>
          <p className="text-dark-400 text-sm">{items.length} {items.length > 1 ? t.cart.bets : t.cart.bet}</p>
        </div>
        <button onClick={clearCart}
          className="text-red-400 hover:text-red-300 text-xs font-semibold flex items-center gap-1.5">
          <Trash2 size={14} /> {t.cart.clearAll}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => {
            const lottery = getLotteryBySlug(item.lotterySlug)
            return (
              <div key={item.id} className="bg-dark-900/50 border border-white/5 rounded-xl p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
                  style={{ background: item.lotteryGradient }}>
                  {item.lotteryEmoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-semibold text-sm">{item.lotteryName}</h3>
                    <button onClick={() => removeItem(item.id)}
                      className="p-1.5 text-dark-500 hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <ResultBalls
                    numbers={item.numbers}
                    extras={item.extras}
                    extraColor={lottery?.extraColor || 'green'}
                    size="sm"
                  />
                  <div className="mt-2 text-dark-400 text-xs">
                    R$ <span className="text-white font-semibold">{item.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="bg-dark-900/50 border border-white/5 rounded-xl p-5 h-fit sticky top-20">
          <h3 className="text-white font-bold text-sm mb-4">{t.cart.summary}</h3>
          <div className="space-y-2 mb-4">
            {items.map(item => (
              <div key={item.id} className="flex items-center justify-between text-xs">
                <span className="text-dark-400 truncate mr-2">{item.lotteryName}</span>
                <span className="text-white font-medium shrink-0">R$ {item.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <hr className="border-white/5 mb-4" />
          <div className="flex items-center justify-between mb-6">
            <span className="text-white font-bold text-sm">{t.cart.total}</span>
            <span className="text-white font-black text-xl">R$ {total.toFixed(2)}</span>
          </div>
          <Link href="/checkout"
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-sm rounded-xl hover:from-green-400 hover:to-green-500 transition-all shadow-lg shadow-green-500/20">
            {t.cart.checkout} <ArrowRight size={16} />
          </Link>
          <Link href="/"
            className="block text-center text-dark-400 hover:text-white text-xs font-medium mt-3 transition-colors">
            + {t.cart.addMore}
          </Link>
        </div>
      </div>
    </div>
  )
}
