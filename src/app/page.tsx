'use client'
import { useState, useEffect } from 'react'
import { lotteries, getTopJackpots, getByRegion } from '@/lib/lotteries'
import { LotteryCard } from '@/components/LotteryCard'
import { Zap, Shield, CreditCard, Trophy, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'

// ============================================
// HOOK: Busca jackpots reais da API
// ============================================

interface JackpotInfo {
  slug: string
  jackpot: string
  jackpotRaw?: number
  nextDraw?: string
}

function useJackpots() {
  const [jackpots, setJackpots] = useState<Record<string, JackpotInfo>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch('/api/jackpots')
      .then(r => r.json())
      .then(data => {
        if (!cancelled && data.jackpots?.length > 0) {
          const map: Record<string, JackpotInfo> = {}
          data.jackpots.forEach((j: JackpotInfo) => { map[j.slug] = j })
          setJackpots(map)
        }
      })
      .catch(err => console.error('Jackpots:', err))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return { jackpots, loading }
}

// ============================================
// HOME PAGE
// ============================================

export default function Home() {
  const { t } = useTranslation()
  const { jackpots, loading } = useJackpots()

  // Helpers
  const getJackpot = (slug: string) => jackpots[slug]?.jackpot
  const getNextDraw = (slug: string) => jackpots[slug]?.nextDraw

  // Separar por região
  const brazilian = lotteries.filter(l => l.region === 'brasil')
  const international = lotteries.filter(l => l.region !== 'brasil')

  // Featured: 3 maiores jackpots (com valor real se disponível)
  const featuredSlugs = ['mega-millions', 'powerball', 'mega-sena']
  const featured = featuredSlugs
    .map(slug => {
      const lot = lotteries.find(l => l.slug === slug)
      if (!lot) return null
      const jp = jackpots[slug]
      return {
        ...lot,
        displayJackpot: jp?.jackpot || lot.jackpot,
        sortValue: jp?.jackpotRaw || lot.jackpotValue || 0,
      }
    })
    .filter(Boolean)
    .sort((a, b) => (b!.sortValue) - (a!.sortValue)) as (typeof lotteries[0] & { displayJackpot: string; sortValue: number })[]

  return (
    <div className="animate-fade-in">
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-900/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-500/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 pt-16 pb-12 relative">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 text-brand-400 text-xs font-semibold mb-5 border border-brand-500/20">
              <Zap size={14} /> {t('home.badge', 'Apostas 100% Online e Seguras')}
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
              {t('home.title1', 'Jogue nas maiores')}<br />
              <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                {t('home.title2', 'loterias do mundo')}
              </span>
            </h1>
            <p className="text-dark-400 text-base md:text-lg leading-relaxed">
              {t('home.subtitle', 'Mega-Sena, Powerball, Mega Millions, EuroMilhões e muito mais. Escolha seus números e concorra a prêmios milionários!')}
            </p>
          </div>

          {/* Featured Jackpots - 3 maiores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {featured.map(f => (
              <Link key={f.slug} href={`/loterias/${f.slug}`}
                className="group flex items-center gap-3 p-4 rounded-xl border border-white/5 bg-dark-900/50 hover:bg-dark-900/80 hover:border-white/10 transition-all">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                  style={{ background: f.gradient }}>
                  {f.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-dark-400 text-xs font-medium">{f.flag} {f.name}</div>
                  <div className="text-white font-black text-lg truncate">
                    {loading ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Loader2 size={14} className="animate-spin text-dark-500" />
                        <span className="text-dark-500 text-sm font-medium">...</span>
                      </span>
                    ) : (
                      f.displayJackpot
                    )}
                  </div>
                </div>
                <ArrowRight size={16} className="text-dark-500 group-hover:text-white transition-colors shrink-0" />
              </Link>
            ))}
          </div>

          {/* Indicador de dados reais */}
          {!loading && Object.keys(jackpots).length > 0 && (
            <div className="text-center mt-4">
              <span className="inline-flex items-center gap-1.5 text-[10px] text-dark-500">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                {t('home.realtime', 'Jackpots atualizados em tempo real')}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ============ LOTERIAS BRASILEIRAS ============ */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">🇧🇷</span>
          <div>
            <h2 className="text-white font-bold text-xl">{t('home.brazilian', 'Loterias Brasileiras')}</h2>
            <p className="text-dark-500 text-sm">{t('home.brazilianSub', 'Jogos da Caixa Econômica Federal')}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {brazilian.map(lot => (
            <LotteryCard
              key={lot.slug}
              lottery={lot}
              jackpotOverride={getJackpot(lot.slug)}
              nextDrawOverride={getNextDraw(lot.slug)}
            />
          ))}
        </div>
      </section>

      {/* ============ LOTERIAS INTERNACIONAIS ============ */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">🌍</span>
          <div>
            <h2 className="text-white font-bold text-xl">{t('home.international', 'Loterias Internacionais')}</h2>
            <p className="text-dark-500 text-sm">{t('home.internationalSub', 'Os maiores jackpots do mundo')}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {international.map(lot => (
            <LotteryCard
              key={lot.slug}
              lottery={lot}
              jackpotOverride={getJackpot(lot.slug)}
              nextDrawOverride={getNextDraw(lot.slug)}
            />
          ))}
        </div>
      </section>

      {/* ============ COMO FUNCIONA ============ */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-white font-bold text-2xl mb-2">{t('home.howTitle', 'Como Funciona')}</h2>
          <p className="text-dark-400 text-sm">{t('home.howSub', 'Simples, rápido e seguro')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: '🎯', title: t('home.step1', 'Escolha a Loteria'), desc: t('home.step1d', 'Navegue entre dezenas de loterias nacionais e internacionais') },
            { icon: '🔢', title: t('home.step2', 'Selecione os Números'), desc: t('home.step2d', 'Escolha seus números da sorte ou use a Surpresinha') },
            { icon: '💳', title: t('home.step3', 'Faça o Pagamento'), desc: t('home.step3d', 'Pague com PIX, cartão de crédito ou boleto bancário') },
            { icon: '🏆', title: t('home.step4', 'Ganhe Prêmios!'), desc: t('home.step4d', 'Seus prêmios são creditados automaticamente na sua conta') },
          ].map((step, i) => (
            <div key={i} className="text-center p-6 rounded-2xl bg-dark-900/30 border border-white/5">
              <div className="text-3xl mb-3">{step.icon}</div>
              <h3 className="text-white font-bold text-sm mb-1.5">{step.title}</h3>
              <p className="text-dark-400 text-xs leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ TRUST BADGES ============ */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Shield size={20} />, label: t('home.trust1', 'Seguro & Confiável'), color: 'text-green-400' },
            { icon: <CreditCard size={20} />, label: t('home.trust2', 'PIX & Cartão'), color: 'text-blue-400' },
            { icon: <Zap size={20} />, label: t('home.trust3', 'Pagamento Instantâneo'), color: 'text-yellow-400' },
            { icon: <Trophy size={20} />, label: t('home.trust4', 'Prêmios Reais'), color: 'text-orange-400' },
          ].map((badge, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-dark-900/30 border border-white/5">
              <div className={badge.color}>{badge.icon}</div>
              <span className="text-dark-300 text-xs font-semibold">{badge.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
