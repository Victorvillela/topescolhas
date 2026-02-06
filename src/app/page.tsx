'use client'
import { LOTTERIES, getBrazilianLotteries, getInternationalLotteries } from '@/lib/lotteries'
import LotteryCard from '@/components/LotteryCard'
import { Shield, CreditCard, Zap, Trophy, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const brazilian = getBrazilianLotteries()
  const international = getInternationalLotteries()

  // Destaque: maiores jackpots
  const featured = [
    { ...LOTTERIES.find(l => l.slug === 'mega-millions')!, jackpot: 'US$ 346.000.000' },
    { ...LOTTERIES.find(l => l.slug === 'powerball')!, jackpot: 'US$ 137.000.000' },
    { ...LOTTERIES.find(l => l.slug === 'mega-sena')!, jackpot: 'R$ 144.000.000' },
  ]

  return (
    <div className="animate-fade-in">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-900/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-500/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 pt-16 pb-12 relative">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 text-brand-400 text-xs font-semibold mb-5 border border-brand-500/20">
              <Zap size={14} /> Apostas 100% Online e Seguras
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
              Jogue nas maiores<br />
              <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                loterias do mundo
              </span>
            </h1>
            <p className="text-dark-400 text-base md:text-lg leading-relaxed">
              Mega-Sena, Powerball, Mega Millions, EuroMilhões e muito mais.
              Escolha seus números e concorra a prêmios milionários!
            </p>
          </div>

          {/* Featured Jackpots */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {featured.map(f => (
              <Link key={f.slug} href={`/loterias/${f.slug}`}
                className="group flex items-center gap-3 p-4 rounded-xl border border-white/5 bg-dark-900/50 hover:bg-dark-900/80 hover:border-white/10 transition-all">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                  style={{ background: f.gradient }}>
                  {f.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-dark-400 text-xs font-medium">{f.flag} {f.name}</div>
                  <div className="text-white font-black text-lg truncate">{f.jackpot}</div>
                </div>
                <ArrowRight size={16} className="text-dark-500 group-hover:text-white transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* LOTERIAS BRASILEIRAS */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">🇧🇷</span>
          <div>
            <h2 className="text-white font-bold text-xl">Loterias Brasileiras</h2>
            <p className="text-dark-500 text-sm">Jogos da Caixa Econômica Federal</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {brazilian.map(lot => (
            <LotteryCard key={lot.slug} lottery={lot} />
          ))}
        </div>
      </section>

      {/* LOTERIAS INTERNACIONAIS */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">🌍</span>
          <div>
            <h2 className="text-white font-bold text-xl">Loterias Internacionais</h2>
            <p className="text-dark-500 text-sm">Os maiores jackpots do mundo</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {international.map(lot => (
            <LotteryCard key={lot.slug} lottery={lot} />
          ))}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-white font-bold text-2xl mb-2">Como Funciona</h2>
          <p className="text-dark-400 text-sm">Simples, rápido e seguro</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: '🎯', title: 'Escolha a Loteria', desc: 'Navegue entre dezenas de loterias nacionais e internacionais' },
            { icon: '🔢', title: 'Selecione os Números', desc: 'Escolha seus números da sorte ou use a Surpresinha' },
            { icon: '💳', title: 'Faça o Pagamento', desc: 'Pague com PIX, cartão de crédito ou boleto bancário' },
            { icon: '🏆', title: 'Ganhe Prêmios!', desc: 'Seus prêmios são creditados automaticamente na sua conta' },
          ].map((step, i) => (
            <div key={i} className="text-center p-6 rounded-2xl bg-dark-900/30 border border-white/5">
              <div className="text-3xl mb-3">{step.icon}</div>
              <h3 className="text-white font-bold text-sm mb-1.5">{step.title}</h3>
              <p className="text-dark-400 text-xs leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Shield size={20} />, label: 'Seguro & Confiável', color: 'text-green-400' },
            { icon: <CreditCard size={20} />, label: 'PIX & Cartão', color: 'text-blue-400' },
            { icon: <Zap size={20} />, label: 'Pagamento Instantâneo', color: 'text-yellow-400' },
            { icon: <Trophy size={20} />, label: 'Prêmios Reais', color: 'text-orange-400' },
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
