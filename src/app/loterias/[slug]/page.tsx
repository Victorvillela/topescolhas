'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { getLotteryBySlug } from '@/lib/lotteries'
import NumberSelector from '@/components/NumberSelector'
import CountdownTimer from '@/components/CountdownTimer'
import ResultBalls from '@/components/ResultBalls'
import Link from 'next/link'
import { ArrowLeft, Info, Clock, Loader2 } from 'lucide-react'
import { useTranslation } from '@/contexts/LanguageContext'

interface ResultData {
  slug: string
  name: string
  country: string
  numbers: number[]
  extras: number[]
  date: string
  prize: string
  concurso: string
}

interface JackpotData {
  slug: string
  jackpot: string
  jackpotRaw?: number
  source: 'api' | 'fallback'
}

export default function LotteryPage() {
  const { t } = useTranslation()
  const { slug } = useParams<{ slug: string }>()
  const lottery = getLotteryBySlug(slug)

  const [lastResult, setLastResult] = useState<ResultData | null>(null)
  const [realJackpot, setRealJackpot] = useState<string>('')
  const [loadingResult, setLoadingResult] = useState(true)

  // Buscar resultado real e jackpot real ao carregar a página
  useEffect(() => {
    if (!slug) return

    // Buscar último resultado
    fetch('/api/results')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.results) {
          const match = data.results.find((r: ResultData) => r.slug === slug)
          if (match) setLastResult(match)
        }
      })
      .catch(() => {})
      .finally(() => setLoadingResult(false))

    // Buscar jackpot real
    fetch('/api/jackpots')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.jackpots) {
          const match = data.jackpots.find((j: JackpotData) => j.slug === slug)
          if (match?.jackpot) setRealJackpot(match.jackpot)
        }
      })
      .catch(() => {})
  }, [slug])

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

  // Usar jackpot real se disponível, senão fallback pro estático
  const displayJackpot = realJackpot || lottery.jackpotStart

  // Formatar data do resultado
  const formatResultDate = (dateStr: string) => {
    if (!dateStr) return '—'
    try {
      const date = new Date(dateStr + 'T12:00:00')
      return date.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

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
              <div className="text-white font-black text-2xl md:text-3xl">{displayJackpot}</div>
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

            {/* Last Results - DADOS REAIS DA API */}
            <div className="bg-dark-900/50 border border-white/5 rounded-2xl p-5">
              <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                <Clock size={16} className="text-orange-400" /> {t.lotteryPage.lastResults}
              </h3>
              <div className="space-y-4">
                {loadingResult ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-dark-500" />
                  </div>
                ) : lastResult ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-dark-500 text-[10px] font-semibold">
                        {formatResultDate(lastResult.date)}
                      </span>
                      {lastResult.concurso && (
                        <span className="text-dark-500 text-[10px] font-semibold">
                          #{lastResult.concurso}
                        </span>
                      )}
                    </div>
                    <ResultBalls
                      numbers={lastResult.numbers}
                      extras={lastResult.extras.length > 0 ? lastResult.extras : (lottery.extraNumbers > 0 ? [] : [])}
                      extraColor={lottery.extraColor}
                      size="sm"
                    />
                    {lastResult.prize && (
                      <p className="mt-2 text-emerald-400 text-xs font-semibold">
                        {lastResult.prize}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-dark-500 text-xs text-center py-2">
                    Nenhum resultado disponível
                  </p>
                )}
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
