'use client'
import { useState } from 'react'
import { LOTTERIES, LotteryConfig } from '@/lib/lotteries'
import ResultBalls from '@/components/ResultBalls'
import Link from 'next/link'
import { useTranslation } from '@/contexts/LanguageContext'

const MOCK_RESULTS = [
  { slug: 'mega-sena', numbers: [10,11,22,26,36,46], extras: [], date: '03/02/2025', prize: 'R$ 144.000.000', concurso: '2968' },
  { slug: 'lotofacil', numbers: [1,3,5,7,8,10,11,13,15,17,18,20,22,24,25], extras: [], date: '04/02/2025', prize: 'R$ 4.200.000', concurso: '3312' },
  { slug: 'powerball', numbers: [27,29,30,37,58], extras: [15], date: '05/02/2025', prize: 'US$ 137.000.000', concurso: '' },
  { slug: 'mega-millions', numbers: [5,11,22,25,69], extras: [21], date: '04/02/2025', prize: 'US$ 346.000.000', concurso: '' },
  { slug: 'euromilhoes', numbers: [26,27,28,34,37], extras: [4,9], date: '03/02/2025', prize: '€ 190.000.000', concurso: '' },
  { slug: 'quina', numbers: [12,28,45,67,73], extras: [], date: '04/02/2025', prize: 'R$ 14.500.000', concurso: '6645' },
  { slug: 'oz-lotto', numbers: [4,10,19,27,29,41,46], extras: [7], date: '03/02/2025', prize: 'A$ 2.000.000', concurso: '' },
  { slug: 'eurojackpot', numbers: [7,15,23,38,49], extras: [4,8], date: '02/02/2025', prize: '€ 95.000.000', concurso: '' },
  { slug: 'dupla-sena', numbers: [8,14,23,31,42,47], extras: [], date: '03/02/2025', prize: 'R$ 8.500.000', concurso: '2790' },
  { slug: 'france-loto', numbers: [1,11,22,43,79], extras: [], date: '04/02/2025', prize: '€ 13.000.000', concurso: '' },
  { slug: 'au-powerball', numbers: [9,12,15,18,22,25,33], extras: [8], date: '05/02/2025', prize: 'A$ 60.000.000', concurso: '' },
  { slug: 'lotto-649', numbers: [3,4,9,15,27,49], extras: [6], date: '05/02/2025', prize: 'CA$ 12.000.000', concurso: '' },
]

function formatDate(d: string) {
  const months: Record<string, string> = {'01':'jan','02':'fev','03':'mar','04':'abr','05':'mai','06':'jun','07':'jul','08':'ago','09':'set','10':'out','11':'nov','12':'dez'}
  const parts = d.split('/')
  if (parts.length === 3) return `${parseInt(parts[0])} ${months[parts[1]] || parts[1]}`
  return d
}

export default function ResultsPage() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<'all' | 'br' | 'int'>('all')

  const filtered = MOCK_RESULTS.filter(r => {
    const lot = LOTTERIES.find(l => l.slug === r.slug)
    if (!lot) return false
    if (filter === 'br') return lot.isBrazilian
    if (filter === 'int') return !lot.isBrazilian
    return true
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-white font-bold text-2xl mb-1">{t.results.title}</h1>
        <p className="text-dark-400 text-sm">{t.results.subtitle}</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        {[
          { id: 'all' as const, label: t.results.all },
          { id: 'br' as const, label: `🇧🇷 ${t.results.brazilian}` },
          { id: 'int' as const, label: `🌍 ${t.results.international}` },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              filter === f.id ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'bg-dark-800 text-dark-400 border border-white/5 hover:text-white'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-lg shadow-black/10 border border-gray-100">
        {/* Desktop */}
        <div className="hidden md:block">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-100">
                <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">{t.results.lottery}</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">{t.results.date}</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">{t.results.numbers}</th>
                <th className="text-right px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">{t.results.prize}</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => {
                const lot = LOTTERIES.find(l => l.slug === r.slug) as LotteryConfig
                const countryName = t.countries[lot.country as keyof typeof t.countries] || lot.country
                return (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                          style={{ background: lot.gradient }}>{lot.emoji}</div>
                        <div>
                          <span className="text-gray-400 text-[11px]">{countryName} - </span>
                          <span className="text-gray-800 font-semibold text-[13px]">{lot.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 text-[13px]">{formatDate(r.date)}</td>
                    <td className="px-4 py-3.5">
                      <ResultBalls numbers={r.numbers} extras={r.extras} extraColor={lot.extraColor} size="md" />
                    </td>
                    <td className="px-5 py-3.5 text-right text-gray-800 font-bold text-[13px] whitespace-nowrap">{r.prize}</td>
                    <td className="px-4 py-3.5">
                      <Link href={`/loterias/${r.slug}`}
                        className="inline-flex px-3 py-1.5 rounded-lg text-[11px] font-bold text-white"
                        style={{ background: lot.gradient }}>
                        {t.lotteryCard.play}
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-gray-50">
          {filtered.map((r, idx) => {
            const lot = LOTTERIES.find(l => l.slug === r.slug) as LotteryConfig
            return (
              <div key={idx} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                      style={{ background: lot.gradient }}>{lot.emoji}</div>
                    <div>
                      <div className="text-gray-800 font-semibold text-sm">{lot.name}</div>
                      <div className="text-gray-400 text-[11px]">{lot.country} • {formatDate(r.date)}</div>
                    </div>
                  </div>
                  <Link href={`/loterias/${r.slug}`}
                    className="px-3 py-1 rounded-lg text-[11px] font-bold text-white"
                    style={{ background: lot.gradient }}>
                    {t.lotteryCard.play}
                  </Link>
                </div>
                <ResultBalls numbers={r.numbers} extras={r.extras} extraColor={lot.extraColor} size="sm" />
                <div className="text-gray-700 font-bold text-sm">{r.prize}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
