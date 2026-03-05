'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { LOTTERIES, LotteryConfig } from '@/lib/lotteries'
import { getNextDraw, getCountdown } from '@/lib/utils'
import { useTranslation } from '@/contexts/LanguageContext'
import { Clock, ArrowRight, Trophy, Globe, TrendingUp, SlidersHorizontal } from 'lucide-react'

// ============================================
// TIPOS
// ============================================

interface JackpotInfo {
  slug: string
  jackpot: string
  jackpotRaw?: number
}

interface LotteryCardData {
  lottery: LotteryConfig
  nextDraw: Date
  jackpot: string
  jackpotRaw: number
  isRealJackpot: boolean
}

// ============================================
// REGIÕES PARA FILTROS
// ============================================

const REGIONS = [
  { id: 'all', label: '🌍 Todas', countries: [] },
  { id: 'br', label: '🇧🇷 Brasil', countries: ['Brasil'] },
  { id: 'eu', label: '🇪🇺 Europa', countries: ['Europa', 'França', 'Alemanha', 'Itália', 'Irlanda', 'Reino Unido', 'Áustria', 'Polônia', 'Suíça'] },
  { id: 'us', label: '🇺🇸 Américas', countries: ['E.U.A.'] },
] as const

type RegionId = typeof REGIONS[number]['id']
type SortBy = 'jackpot' | 'date' | 'name'

// ============================================
// COUNTDOWN COMPONENT
// ============================================

function LiveCountdown({ targetDate }: { targetDate: Date }) {
  const [cd, setCd] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, formatted: '' })

  useEffect(() => {
    const tick = () => setCd(getCountdown(targetDate))
    tick()
    const iv = setInterval(tick, 1000)
    return () => clearInterval(iv)
  }, [targetDate])

  const isUrgent = cd.days === 0 && cd.hours < 2

  return (
    <div className={`flex items-center gap-1.5 text-xs font-mono ${isUrgent ? 'text-amber-400' : 'text-gray-400'}`}>
      <Clock className="w-3.5 h-3.5" />
      {cd.days > 0 && <span className="font-bold text-white">{cd.days}d</span>}
      <span className="font-bold text-white">{String(cd.hours).padStart(2, '0')}</span>
      <span className="text-gray-600">:</span>
      <span className="font-bold text-white">{String(cd.minutes).padStart(2, '0')}</span>
      <span className="text-gray-600">:</span>
      <span className={`font-bold ${isUrgent ? 'text-amber-400' : 'text-gray-500'}`}>
        {String(cd.seconds).padStart(2, '0')}
      </span>
    </div>
  )
}

// ============================================
// LOTTERY CARD
// ============================================

function LotteryGridCard({ data }: { data: LotteryCardData }) {
  const { lottery, nextDraw, jackpot, isRealJackpot } = data

  return (
    <Link
      href={`/loterias/${lottery.slug}`}
      className="group relative flex flex-col bg-gray-900/80 border border-gray-800/60 rounded-2xl overflow-hidden transition-all duration-300 hover:border-gray-600/60 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40"
    >
      {/* Gradient top bar */}
      <div className="h-1.5 w-full" style={{ background: lottery.gradient }} />

      {/* Card body */}
      <div className="flex flex-col flex-1 p-5">

        {/* Header: emoji + name + country */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-lg"
            style={{ background: lottery.gradient }}
          >
            {lottery.emoji}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-white text-sm leading-tight group-hover:text-amber-300 transition-colors">
              {lottery.name}
            </h3>
            <p className="text-gray-500 text-xs mt-0.5">
              {lottery.flag} {lottery.country}
            </p>
          </div>
        </div>

        {/* Jackpot */}
        <div className="mb-4">
          <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Trophy className="w-3 h-3" />
            Jackpot
            {isRealJackpot && (
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" title="Ao vivo" />
            )}
          </div>
          <div className="font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500 leading-tight">
            {jackpot}
          </div>
        </div>

        {/* Spacer to push footer down */}
        <div className="flex-1" />

        {/* Countdown */}
        <div className="mb-4">
          <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">
            Próximo sorteio
          </div>
          <LiveCountdown targetDate={nextDraw} />
        </div>

        {/* Draw days */}
        <div className="flex flex-wrap gap-1 mb-4">
          {lottery.drawDays.map((day) => {
            const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
            return (
              <span key={day} className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-500 font-medium">
                {DAY_NAMES[Number(day)] || day}
              </span>
            )
          })}
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-500 font-medium">
            {lottery.drawTime}
          </span>
        </div>

        {/* CTA button */}
        <div
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 group-hover:shadow-lg group-hover:shadow-black/20 group-hover:brightness-110"
          style={{ background: lottery.gradient }}
        >
          Jogar
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  )
}

// ============================================
// FEATURED LOTTERY CARD (maior, pro topo)
// ============================================

function FeaturedLotteryCard({ data }: { data: LotteryCardData }) {
  const { lottery, nextDraw, jackpot, isRealJackpot } = data

  return (
    <Link
      href={`/loterias/${lottery.slug}`}
      className="group relative flex flex-col md:flex-row bg-gray-900/80 border border-gray-800/60 rounded-2xl overflow-hidden transition-all duration-300 hover:border-gray-600/60 hover:shadow-2xl hover:shadow-black/40"
    >
      {/* Gradient side/top */}
      <div
        className="w-full md:w-48 h-32 md:h-auto flex items-center justify-center shrink-0 relative"
        style={{ background: lottery.gradient }}
      >
        <div className="text-6xl">{lottery.emoji}</div>
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
      </div>

      {/* Content */}
      <div className="flex-1 p-6 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{lottery.flag}</span>
          <span className="text-gray-500 text-xs">{lottery.country}</span>
          {isRealJackpot && (
            <span className="flex items-center gap-1 text-[9px] text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              ao vivo
            </span>
          )}
        </div>
        <h3 className="font-bold text-white text-xl mb-2 group-hover:text-amber-300 transition-colors">
          {lottery.name}
        </h3>
        <div className="font-black text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500 mb-3">
          {jackpot}
        </div>
        <div className="flex items-center gap-4 mb-4">
          <LiveCountdown targetDate={nextDraw} />
          <div className="flex gap-1">
            {lottery.drawDays.map((day) => {
              const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
              return (
                <span key={day} className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-500 font-medium">
                  {DAY_NAMES[Number(day)] || day}
                </span>
              )
            })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all group-hover:shadow-lg group-hover:brightness-110"
            style={{ background: lottery.gradient }}
          >
            Jogar agora
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  )
}

// ============================================
// PÁGINA PRINCIPAL
// ============================================

export default function LoteriasPage() {
  const { t } = useTranslation()
  const [cards, setCards] = useState<LotteryCardData[]>([])
  const [region, setRegion] = useState<RegionId>('all')
  const [sortBy, setSortBy] = useState<SortBy>('jackpot')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Montar cards com dados estáticos
    const now = new Date()
    const initialCards: LotteryCardData[] = LOTTERIES.map(lottery => {
      const nextDraw = getNextDraw(lottery.drawDays, lottery.drawTime)
      // Tentar parsear jackpotStart pra valor numérico
      const rawStr = lottery.jackpotStart.replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.')
      const jackpotRaw = parseFloat(rawStr) || 0

      return {
        lottery,
        nextDraw,
        jackpot: lottery.jackpotStart,
        jackpotRaw,
        isRealJackpot: false,
      }
    }).filter(d => d.nextDraw.getTime() > now.getTime())

    setCards(initialCards)
    setLoading(false)

    // Buscar jackpots reais da API
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
              return {
                ...card,
                jackpot: real.jackpot,
                jackpotRaw: real.jackpotRaw || card.jackpotRaw,
                isRealJackpot: true,
              }
            }
            return card
          }))
        }
      })
      .catch(() => {})
  }, [])

  // Filtrar por região
  const regionConfig = REGIONS.find(r => r.id === region)
  const filtered = region === 'all'
    ? cards
    : cards.filter(c => (regionConfig?.countries as readonly string[])?.includes(c.lottery.country))

  // Ordenar
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'jackpot':
        return b.jackpotRaw - a.jackpotRaw
      case 'date':
        return a.nextDraw.getTime() - b.nextDraw.getTime()
      case 'name':
        return a.lottery.name.localeCompare(b.lottery.name)
      default:
        return 0
    }
  })

  // Top 2 (featured) e o resto
  const featured = sorted.slice(0, 2)
  const rest = sorted.slice(2)

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Hero Banner */}
      <div className="relative overflow-hidden">
        {/* Background com gradiente e glow */}
        <div className="absolute inset-0 bg-gray-950" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/10 rounded-full blur-[120px]" />

        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 mb-6">
            <span className="text-sm">🏆</span>
            <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">Maiores Jackpots do Mundo</span>
          </div>

          {/* Título principal */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-5">
            Jogue nas{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
              Maiores Loterias
            </span>
            <br />
            do Brasil e do Mundo
          </h1>

          {/* Subtítulo */}
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Escolha seus números da sorte, compre online e concorra a prêmios milionários. É fácil, seguro e rápido.
          </p>

          {/* CTA */}
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 font-bold text-lg hover:from-amber-300 hover:to-amber-400 transition-all duration-300 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 hover:scale-105"
          >
            Cadastre-se e Ganhe Bônus
            <span className="text-xl">🎁</span>
          </Link>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 mt-10">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" />
              <span className="text-sm text-gray-400">
                <span className="text-white font-bold">{LOTTERIES.length}</span> loterias
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-gray-400">
                <span className="text-white font-bold">{new Set(LOTTERIES.map(l => l.country)).size}</span> países
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-400">
                Jackpots <span className="text-green-400 font-bold">ao vivo</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros e Ordenação */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

          {/* Filtros por região */}
          <div className="flex flex-wrap gap-2">
            {REGIONS.map((r) => (
              <button
                key={r.id}
                onClick={() => setRegion(r.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  region === r.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'bg-gray-800/60 text-gray-400 hover:bg-gray-700/60 hover:text-gray-300'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Ordenação */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="bg-gray-800/60 border border-gray-700/50 text-gray-300 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
            >
              <option value="jackpot">💰 Maior jackpot</option>
              <option value="date">⏰ Próximo sorteio</option>
              <option value="name">🔤 Nome A–Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-7xl mx-auto px-4 pb-16">

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            <span className="ml-3 text-gray-400">Carregando loterias...</span>
          </div>
        ) : (
          <>
            {/* Featured (top 2) */}
            {featured.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {featured.map((data) => (
                  <FeaturedLotteryCard key={data.lottery.slug} data={data} />
                ))}
              </div>
            )}

            {/* Grid do resto */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {rest.map((data) => (
                  <LotteryGridCard key={data.lottery.slug} data={data} />
                ))}
              </div>
            )}

            {/* Vazio */}
            {sorted.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                <p className="text-lg">Nenhuma loteria encontrada nesta região.</p>
                <button
                  onClick={() => setRegion('all')}
                  className="mt-4 px-6 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 text-white text-sm"
                >
                  Ver todas
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
