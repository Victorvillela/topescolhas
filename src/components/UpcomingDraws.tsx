'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { LOTTERIES, LotteryConfig } from '@/lib/lotteries'
import { getNextDraw, getCountdown } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface JackpotInfo {
  slug: string
  jackpot: string
  jackpotRaw?: number
}

interface DrawCard {
  lottery: LotteryConfig
  nextDraw: Date
  jackpot: string
  isRealJackpot: boolean
}

function CountdownBadge({ targetDate }: { targetDate: Date }) {
  const [cd, setCd] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, formatted: '' })

  useEffect(() => {
    const tick = () => setCd(getCountdown(targetDate))
    tick()
    const iv = setInterval(tick, 1000)
    return () => clearInterval(iv)
  }, [targetDate])

  return (
    <div className="text-white text-xs font-bold tracking-wide">
      {cd.days > 0 ? `${cd.days} dias ` : ''}
      {String(cd.hours).padStart(2, '0')}:{String(cd.minutes).padStart(2, '0')}:{String(cd.seconds).padStart(2, '0')}
    </div>
  )
}

export default function UpcomingDraws() {
  const [cards, setCards] = useState<DrawCard[]>([])
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const now = new Date()
    const draws: DrawCard[] = LOTTERIES.map(lottery => {
      const nextDraw = getNextDraw(lottery.drawDays, lottery.drawTime)
      return {
        lottery,
        nextDraw,
        jackpot: lottery.jackpotStart,
        isRealJackpot: false,
      }
    })
      .filter(d => d.nextDraw.getTime() > now.getTime())
      .sort((a, b) => a.nextDraw.getTime() - b.nextDraw.getTime())
      .slice(0, 20)

    setCards(draws)

    fetch('/api/jackpots')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.jackpots) {
          const jackpotMap = new Map<string, JackpotInfo>(
            data.jackpots.map((j: JackpotInfo) => [j.slug, j])
          )
          setCards(prev => prev.map(card => {
            const real = jackpotMap.get(card.lottery.slug)
            if (real) {
              return { ...card, jackpot: real.jackpot, isRealJackpot: true }
            }
            return card
          }))
        }
      })
      .catch(() => {})
  }, [])

  // Atualizar visibilidade das setas conforme scroll
  const updateScrollButtons = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 10)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateScrollButtons()
    el.addEventListener('scroll', updateScrollButtons, { passive: true })
    window.addEventListener('resize', updateScrollButtons)
    return () => {
      el.removeEventListener('scroll', updateScrollButtons)
      window.removeEventListener('resize', updateScrollButtons)
    }
  }, [cards])

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = 280
      scrollRef.current.scrollBy({
        left: dir === 'left' ? -amount : amount,
        behavior: 'smooth',
      })
    }
  }

  if (cards.length === 0) return null

  return (
    <section className="w-full py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-white font-bold text-xl">🔥 Próximos Sorteios</h2>
            <p className="text-gray-400 text-sm">Jogue antes que feche!</p>
          </div>
          <Link href="/loterias" className="text-brand-400 hover:text-brand-300 text-sm font-semibold">
            Ver todas
          </Link>
        </div>

        {/* Carousel wrapper com setas sobrepostas */}
        <div className="relative">
          {/* Seta esquerda — sobreposta na borda esquerda */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg shadow-black/30 flex items-center justify-center transition-all duration-200 hover:scale-110 hover:bg-gray-100 -ml-3"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
          )}

          {/* Seta direita — sobreposta na borda direita */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg shadow-black/30 flex items-center justify-center transition-all duration-200 hover:scale-110 hover:bg-gray-100 -mr-3"
              aria-label="Próximo"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          )}

          {/* Cards */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2 px-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {cards.map((card) => (
              <Link
                key={card.lottery.slug}
                href={`/loterias/${card.lottery.slug}`}
                className="flex-shrink-0 w-[200px] group/card"
              >
                <div
                  className="rounded-2xl overflow-hidden transition-all duration-300 group-hover/card:scale-[1.03] group-hover/card:shadow-xl group-hover/card:shadow-black/30"
                  style={{ background: card.lottery.gradient }}
                >
                  {/* Top section - emoji */}
                  <div className="px-4 pt-5 pb-3 text-center">
                    <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-3xl shadow-lg">
                      {card.lottery.emoji}
                    </div>
                    <h3 className="text-white font-bold text-sm leading-tight">
                      {card.lottery.name}
                    </h3>
                    <p className="text-white/60 text-[10px] mt-0.5">
                      {card.lottery.flag} {card.lottery.country}
                    </p>
                  </div>

                  {/* Jackpot */}
                  <div className="px-4 pb-3 text-center">
                    <div className="text-white font-black text-lg leading-tight">
                      {card.jackpot}
                    </div>
                    {card.isRealJackpot && (
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-white/50 text-[9px]">ao vivo</span>
                      </div>
                    )}
                    {!card.isRealJackpot && (
                      <div className="text-white/40 text-[9px] mt-1">estimado</div>
                    )}
                  </div>

                  {/* Countdown footer */}
                  <div className="bg-black/20 px-4 py-2.5 text-center">
                    <CountdownBadge targetDate={card.nextDraw} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
