'use client'
import { useState, useCallback } from 'react'
import { LotteryConfig } from '@/lib/lotteries'
import { useCartStore } from '@/store/cartStore'
import { Shuffle, Trash2, ShoppingCart, Check } from 'lucide-react'
import { useTranslation } from '@/contexts/LanguageContext'

interface Props {
  lottery: LotteryConfig
}

export default function NumberSelector({ lottery }: Props) {
  const { t } = useTranslation()
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const [selectedExtras, setSelectedExtras] = useState<number[]>([])
  const [justAdded, setJustAdded] = useState(false)
  const addItem = useCartStore(s => s.addItem)

  const toggleNumber = (n: number) => {
    setSelectedNumbers(prev => {
      if (prev.includes(n)) return prev.filter(x => x !== n)
      if (prev.length >= lottery.mainNumbers) return prev
      return [...prev, n].sort((a, b) => a - b)
    })
  }

  const toggleExtra = (n: number) => {
    setSelectedExtras(prev => {
      if (prev.includes(n)) return prev.filter(x => x !== n)
      if (prev.length >= lottery.extraNumbers) return prev
      return [...prev, n].sort((a, b) => a - b)
    })
  }

  const quickPick = useCallback(() => {
    const nums: number[] = []
    while (nums.length < lottery.mainNumbers) {
      const n = Math.floor(Math.random() * (lottery.mainRange[1] - lottery.mainRange[0] + 1)) + lottery.mainRange[0]
      if (!nums.includes(n)) nums.push(n)
    }
    setSelectedNumbers(nums.sort((a, b) => a - b))

    if (lottery.extraNumbers > 0) {
      const extras: number[] = []
      while (extras.length < lottery.extraNumbers) {
        const n = Math.floor(Math.random() * (lottery.extraRange[1] - lottery.extraRange[0] + 1)) + lottery.extraRange[0]
        if (!extras.includes(n)) extras.push(n)
      }
      setSelectedExtras(extras.sort((a, b) => a - b))
    }
  }, [lottery])

  const clearAll = () => {
    setSelectedNumbers([])
    setSelectedExtras([])
  }

  const isComplete = selectedNumbers.length === lottery.mainNumbers &&
    (lottery.extraNumbers === 0 || selectedExtras.length === lottery.extraNumbers)

  const addToCart = () => {
    if (!isComplete) return
    addItem({
      lotterySlug: lottery.slug,
      lotteryName: lottery.name,
      lotteryEmoji: lottery.emoji,
      lotteryGradient: lottery.gradient,
      numbers: [...selectedNumbers],
      extras: [...selectedExtras],
      extraName: lottery.extraName,
      price: lottery.pricePerBet,
    })
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 2000)
    clearAll()
  }

  const mainRange = Array.from(
    { length: lottery.mainRange[1] - lottery.mainRange[0] + 1 },
    (_, i) => i + lottery.mainRange[0]
  )
  const extraRange = lottery.extraNumbers > 0 ? Array.from(
    { length: lottery.extraRange[1] - lottery.extraRange[0] + 1 },
    (_, i) => i + lottery.extraRange[0]
  ) : []

  const extraColorMap: Record<string, string> = {
    red: 'bg-red-100 text-red-800 border-red-300 ring-red-500',
    gold: 'bg-yellow-100 text-yellow-800 border-yellow-300 ring-yellow-500',
    green: 'bg-green-100 text-green-800 border-green-300 ring-green-500',
    blue: 'bg-blue-100 text-blue-800 border-blue-300 ring-blue-500',
    purple: 'bg-purple-100 text-purple-800 border-purple-300 ring-purple-500',
  }
  const extraSelectedMap: Record<string, string> = {
    red: 'bg-red-500 text-white border-red-600',
    gold: 'bg-yellow-500 text-white border-yellow-600',
    green: 'bg-green-500 text-white border-green-600',
    blue: 'bg-blue-500 text-white border-blue-600',
    purple: 'bg-purple-500 text-white border-purple-600',
  }

  return (
    <div className="space-y-6">
      {/* Main Numbers */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-bold text-sm">
            {t.lotteryPage.choose} {lottery.mainNumbers} {t.lotteryPage.numbers}
            <span className="text-dark-400 font-normal ml-1">
              ({selectedNumbers.length}/{lottery.mainNumbers})
            </span>
          </h3>
          <div className="flex items-center gap-2">
            <button onClick={quickPick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-dark-300 hover:text-white hover:bg-white/10 transition-colors">
              <Shuffle size={14} /> {t.lotteryPage.quickPick}
            </button>
            <button onClick={clearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-dark-300 hover:text-red-400 hover:bg-white/10 transition-colors">
              <Trash2 size={14} /> {t.lotteryPage.clear}
            </button>
          </div>
        </div>

        <div className={`grid gap-1.5 ${mainRange.length > 50 ? 'grid-cols-10' : 'grid-cols-10'}`}>
          {mainRange.map(n => {
            const isSelected = selectedNumbers.includes(n)
            return (
              <button key={n} onClick={() => toggleNumber(n)}
                className={`aspect-square rounded-full flex items-center justify-center text-sm font-bold transition-all duration-150 ${
                  isSelected
                    ? 'bg-blue-100 text-blue-900 border-2 border-blue-400 scale-110 shadow-lg shadow-blue-500/20'
                    : 'bg-dark-800 text-dark-300 border border-white/5 hover:bg-dark-700 hover:text-white hover:border-white/10'
                }`}>
                {n}
              </button>
            )
          })}
        </div>
      </div>

      {/* Extra Numbers */}
      {lottery.extraNumbers > 0 && (
        <div>
          <h3 className="text-white font-bold text-sm mb-3">
            {t.lotteryPage.choose} {lottery.extraNumbers} {lottery.extraName}
            <span className="text-dark-400 font-normal ml-1">
              ({selectedExtras.length}/{lottery.extraNumbers})
            </span>
          </h3>
          <div className="grid grid-cols-10 gap-1.5">
            {extraRange.map(n => {
              const isSelected = selectedExtras.includes(n)
              return (
                <button key={n} onClick={() => toggleExtra(n)}
                  className={`aspect-square rounded-full flex items-center justify-center text-sm font-bold transition-all duration-150 ${
                    isSelected
                      ? `${extraSelectedMap[lottery.extraColor]} scale-110 shadow-lg`
                      : `${extraColorMap[lottery.extraColor]} hover:scale-105 opacity-70 hover:opacity-100`
                  }`}>
                  {n}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Selected Summary */}
      {(selectedNumbers.length > 0 || selectedExtras.length > 0) && (
        <div className="bg-dark-800/50 border border-white/5 rounded-xl p-4">
          <div className="text-dark-500 text-[10px] font-semibold uppercase tracking-wider mb-2">{t.lotteryPage.yourNumbers}</div>
          <div className="flex items-center gap-2 flex-wrap">
            {selectedNumbers.map(n => (
              <span key={n} className="w-9 h-9 rounded-full bg-blue-100 text-blue-900 text-sm font-bold flex items-center justify-center border-2 border-blue-400">
                {n}
              </span>
            ))}
            {selectedExtras.length > 0 && <span className="w-2" />}
            {selectedExtras.map(n => (
              <span key={`e-${n}`}
                className={`w-9 h-9 rounded-full text-sm font-bold flex items-center justify-center border-2 ${extraSelectedMap[lottery.extraColor]}`}>
                {n}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Add to Cart */}
      <div className="flex items-center gap-3">
        <button onClick={addToCart} disabled={!isComplete}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all ${
            isComplete
              ? 'text-white shadow-lg hover:-translate-y-0.5'
              : 'bg-dark-800 text-dark-500 cursor-not-allowed'
          }`}
          style={isComplete ? { background: lottery.gradient, boxShadow: `0 8px 20px ${lottery.color}33` } : {}}>
          {justAdded ? (
            <><Check size={18} /> ✓ {t.lotteryPage.addToCart}!</>
          ) : (
            <><ShoppingCart size={18} /> {t.lotteryPage.addToCart} — R$ {lottery.pricePerBet.toFixed(2)}</>
          )}
        </button>
      </div>
    </div>
  )
}
