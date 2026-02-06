'use client'
import Link from 'next/link'
import { LotteryConfig } from '@/lib/lotteries'
import CountdownTimer from './CountdownTimer'

interface Props {
  lottery: LotteryConfig
  jackpot?: string
  nextDraw?: string
}

export default function LotteryCard({ lottery, jackpot, nextDraw }: Props) {
  return (
    <Link href={`/loterias/${lottery.slug}`}
      className="group block bg-dark-900/50 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 hover:shadow-xl hover:shadow-black/20 transition-all duration-300 hover:-translate-y-1">
      {/* Header com gradiente */}
      <div className="p-5 pb-4 relative overflow-hidden" style={{ background: lottery.gradient }}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
        <div className="relative flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-white/80 text-xs font-medium">{lottery.flag} {lottery.country}</span>
            </div>
            <h3 className="text-white font-bold text-lg leading-tight">{lottery.emoji} {lottery.name}</h3>
          </div>
        </div>
        <div className="relative mt-3">
          <div className="text-white/70 text-[10px] font-semibold uppercase tracking-wider">Jackpot Estimado</div>
          <div className="text-white font-black text-xl tracking-tight mt-0.5">
            {jackpot || lottery.jackpotStart}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 pt-3">
        {nextDraw && (
          <div className="mb-3">
            <div className="text-dark-500 text-[10px] font-semibold uppercase tracking-wider mb-1">Próximo Sorteio</div>
            <CountdownTimer targetDate={nextDraw} compact />
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="text-dark-500 text-xs">
            A partir de <span className="text-white font-semibold">R$ {lottery.pricePerBet.toFixed(2)}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg text-xs font-bold text-white group-hover:scale-105 transition-transform"
            style={{ background: lottery.gradient }}>
            Jogar →
          </div>
        </div>
      </div>
    </Link>
  )
}
