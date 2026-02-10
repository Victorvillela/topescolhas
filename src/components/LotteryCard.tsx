'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Lottery } from '@/types'
import { getNextDraw, getCountdown } from '@/lib/utils'
import { Clock, ArrowRight } from 'lucide-react'

interface LotteryCardProps {
  lottery: Lottery
  featured?: boolean
  /** Jackpot real da API (substitui lottery.jackpotStart quando disponível) */
  jackpotOverride?: string
  /** Data do próximo sorteio da API (ISO string) */
  nextDrawOverride?: string
}

export function LotteryCard({ lottery, featured = false, jackpotOverride, nextDrawOverride }: LotteryCardProps) {
  const [cd, setCd] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const next = nextDrawOverride
      ? new Date(nextDrawOverride)
      : getNextDraw(lottery.drawDays, lottery.drawTime)
    const tick = () => setCd(getCountdown(next))
    tick()
    const iv = setInterval(tick, 1000)
    return () => clearInterval(iv)
  }, [lottery, nextDrawOverride])

  // Usa jackpot real da API se disponível, senão usa o estático
  const displayJackpot = jackpotOverride || lottery.jackpotStart

  // Indicador visual se o jackpot é real (da API)
  const isRealJackpot = !!jackpotOverride

  return (
    <Link href={`/loterias/${lottery.slug}`}
      className={`group relative overflow-hidden rounded-2xl border border-brand-border bg-brand-card transition-all duration-300 hover:border-white/20 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 ${
        featured ? 'md:col-span-2 md:row-span-2' : ''
      }`}>
      {/* Gradient header */}
      <div className="h-2 w-full" style={{ background: lottery.gradient }} />

      <div className={`p-5 ${featured ? 'md:p-8' : ''}`}>
        {/* Logo + Name */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ background: lottery.gradient }}>
            {lottery.emoji}
          </div>
          <div>
            <div className="text-xs text-gray-500">{lottery.flag} {lottery.country}</div>
            <h3 className={`font-bold text-white ${featured ? 'text-xl' : 'text-sm'}`}>{lottery.name}</h3>
          </div>
        </div>

        {/* Jackpot */}
        <div className="mb-1">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            Jackpot Estimado
            {isRealJackpot && (
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" title="Valor atualizado" />
            )}
          </div>
          <div className={`font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500 ${
            featured ? 'text-3xl md:text-4xl my-2' : 'text-xl my-1'
          }`}>
            {displayJackpot}
          </div>
        </div>

        {/* Countdown */}
        <div className="flex items-center gap-2 text-gray-500 text-xs mb-4">
          <Clock className="w-3.5 h-3.5" />
          <span>Próx. sorteio:</span>
          <div className="flex gap-1 font-mono font-bold text-white/80">
            {cd.days > 0 && <span>{cd.days}d</span>}
            <span>{String(cd.hours).padStart(2, '0')}h</span>
            <span>{String(cd.minutes).padStart(2, '0')}m</span>
            <span className="text-amber-400">{String(cd.seconds).padStart(2, '0')}s</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px] text-gray-500">
            <span>💰 A partir de {lottery.currency === 'BRL' ? 'R$' : lottery.currency} {lottery.pricePerBet.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold group-hover:text-amber-400 transition-colors"
            style={{ color: lottery.color }}>
            Jogar <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  )
}
