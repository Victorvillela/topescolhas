'use client'
import { useParams } from 'next/navigation'
import { getLotteryBySlug } from '@/lib/lotteries'
import NumberSelector from '@/components/NumberSelector'
import CountdownTimer from '@/components/CountdownTimer'
import ResultBalls from '@/components/ResultBalls'
import Link from 'next/link'
import { ArrowLeft, Info, Clock, Target } from 'lucide-react'
import { useTranslation } from '@/contexts/LanguageContext'

export default function LotteryPage() {
  const { t } = useTranslation()
  const { slug } = useParams<{ slug: string }>()
  const lottery = getLotteryBySlug(slug)

  if (!lottery) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-white text-2xl font-bold mb-4">{t.common.noResults}</h1>
        <Link href="/" className="text-brand-400 hover:text-brand-300 text-sm">← {t.lotteryPage.back}</Link>
      </div>
    )
  }

  const countryName = t.countries[lottery.country as keyof typeof t.countries] || lottery.country
  const nextDraw = new Date()
  nextDraw.setDate(nextDraw.getDate() + 2)
  nextDraw.setHours(20, 0, 0, 0)

  return (
    <div className="animate-fade-in">
      {/* Hero Header */}
      <div className="relative overflow-hidden" style={{ background: lottery.gradient }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30" />
        <div className="max-w-7xl mx-auto px-4 py-8 relative">
          <Link href="/" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-medium mb-4 transition-colors">
            <ArrowLeft size={14} /> {t.lotteryPage.back}
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white/80 text-sm">{lottery.flag} {countryName}</span>
              </div>
              <h1 className="text-white font-black text-3xl md:text-4xl">
                {lottery.emoji} {lottery.name}
              </h1>
              <p className="text-white/70 text-sm mt-2 max-w-xl">{lottery.description}</p>
            </div>
            <div className="text-left md:text-right">
              <div className="text-white/60 text-[10px] font-semibold uppercase tracking-wider">{t.lotteryCard.estimatedJackpot}</div>
              <div className="text-white font-black text-2xl md:text-3xl">{lottery.jackpotStart}</div>
              <div className="mt-2">
                <CountdownTimer targetDate={nextDraw.toISOString()} compact />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Number Selector */}
          <div className="lg:col-span-2">
            <div className="bg-dark-900/50 border border-white/5 rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-1">{t.lotteryPage.chooseNumbers}</h2>
              <p className="text-dark-400 text-sm mb-6">
                {t.lotteryPage.selectNumbers
                  .replace('{main}', String(lottery.mainNumbers))
                  .replace('{minRange}', String(lottery.mainRange[0]))
                  .replace('{maxRange}', String(lottery.mainRange[1]))}
                {lottery.extraNumbers > 0 && ` ${t.lotteryPage.selectExtra
                  .replace('{extra}', String(lottery.extraNumbers))
                  .replace('{extraName}', lottery.extraName)
                  .replace('{minRange}', String(lottery.extraRange[0]))
                  .replace('{maxRange}', String(lottery.extraRange[1]))}`}
              </p>
              <NumberSelector lottery={lottery} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Info Card */}
            <div className="bg-dark-900/50 border border-white/5 rounded-2xl p-5">
              <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                <Info size={16} className="text-brand-400" /> {t.lotteryPage.information}
              </h3>
              <div className="space-y-3">
                {[
                  { label: t.lotteryPage.price, value: `R$ ${lottery.pricePerBet.toFixed(2)}` },
                  { label: t.lotteryPage.odds, value: lottery.odds },
                  { label: t.lotteryPage.draws, value: lottery.drawDays.join(', ') },
                  { label: t.lotteryPage.time, value: `${lottery.drawTime} (${lottery.timezone.split('/')[1]})` },
                ].map((info, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <span className="text-dark-400 text-xs">{info.label}</span>
                    <span className="text-white text-xs font-semibold">{info.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Last Results */}
            <div className="bg-dark-900/50 border border-white/5 rounded-2xl p-5">
              <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                <Clock size={16} className="text-orange-400" /> {t.lotteryPage.lastResults}
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-dark-500 text-[10px] font-semibold mb-2">3 fev 2025</div>
                  <ResultBalls
                    numbers={lottery.slug === 'mega-sena' ? [10, 11, 22, 26, 36, 46] : [5, 11, 22, 25, 69]}
                    extras={lottery.extraNumbers > 0 ? [21] : []}
                    extraColor={lottery.extraColor}
                    size="sm"
                  />
                </div>
              </div>
              <Link href="/resultados" className="block mt-4 text-brand-400 hover:text-brand-300 text-xs font-semibold text-center">
                {t.lotteryPage.viewAll} →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
