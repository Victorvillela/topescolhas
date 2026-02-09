'use client'
import { useState, useEffect } from 'react'
import { LOTTERIES, LotteryConfig } from '@/lib/lotteries'
import ResultBalls from '@/components/ResultBalls'
import Link from 'next/link'
import { useTranslation } from '@/contexts/LanguageContext'
import { Loader2, RefreshCw } from 'lucide-react'

interface ResultData {
  slug: string3
  name: string
  country: string
  numbers: number[]
  extras: number[]
  date: string
  prize: string
  concurso: string
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr + 'T12:00:00')
    const months: Record<number, string> = {0:'jan',1:'fev',2:'mar',3:'abr',4:'mai',5:'jun',6:'jul',7:'ago',8:'set',9:'out',10:'nov',11:'dez'}
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
  } catch {
    return dateStr
  }
}

export default function ResultsPage() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<'all' | 'br' | 'int'>('all')
  const [results, setResults] = useState<ResultData[]>([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState('')
  const [error, setError] = useState('')

  const fetchResults = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/results')
      const data = await res.json()
      if (data.results && data.results.length > 0) {
        setResults(data.results)
        setSource(data.source)
      } else {
        // Se não tem resultados, tenta o cron direto
        const cronRes = await fetch('/api/cron/results')
        const cronData = await cronRes.json()
        if (cronData.results) {
          setResults(cronData.results)
          setSource('live')
        } else {
          setError('Nenhum resultado disponível')
        }
      }
    } catch (err) {
      console.error(err)
      setError('Erro ao buscar resultados')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchResults()
  }, [])

  const filtered = results.filter(r => {
    const lot = LOTTERIES.find(l => l.slug === r.slug)
    if (!lot) return true // Mostra mesmo sem config
    if (filter === 'br') return lot.isBrazilian
    if (filter === 'int') return !lot.isBrazilian
    return true
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white font-bold text-2xl mb-1">{t.results.title}</h1>
          <p className="text-dark-400 text-sm">{t.results.subtitle}</p>
        </div>
        <button
          onClick={fetchResults}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white/5 text-dark-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? t.common.loading : 'Refresh'}
        </button>
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
        {source && (
          <span className="ml-auto text-dark-600 text-[10px]">
            {source === 'cache' ? '📦 Cache' : source === 'database' ? '💾 DB' : '🌐 Live'}
          </span>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-brand-400" />
          <span className="ml-3 text-dark-400 text-sm">{t.common.loading}</span>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">😕</div>
          <p className="text-dark-400 text-sm mb-4">{error}</p>
          <button onClick={fetchResults}
            className="px-4 py-2 bg-brand-500/20 text-brand-400 text-xs font-semibold rounded-lg">
            Tentar novamente
          </button>
        </div>
      )}

      {/* Results Table */}
      {!loading && !error && filtered.length > 0 && (
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
                  const lot = LOTTERIES.find(l => l.slug === r.slug)
                  const countryName = lot
                    ? (t.countries[lot.country as keyof typeof t.countries] || lot.country)
                    : r.country

                  return (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          {lot && (
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                              style={{ background: lot.gradient }}>{lot.emoji}</div>
                          )}
                          <div>
                            <span className="text-gray-400 text-[11px]">{countryName} </span>
                            <span className="text-gray-800 font-semibold text-[13px]">{r.name}</span>
                            {r.concurso && <span className="text-gray-400 text-[10px] ml-1">#{r.concurso}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 text-[13px]">{formatDate(r.date)}</td>
                      <td className="px-4 py-3.5">
                        <ResultBalls
                          numbers={r.numbers}
                          extras={r.extras}
                          extraColor={lot?.extraColor || 'green'}
                          size="md"
                        />
                      </td>
                      <td className="px-5 py-3.5 text-right text-gray-800 font-bold text-[13px] whitespace-nowrap">{r.prize}</td>
                      <td className="px-4 py-3.5">
                        <Link href={`/loterias/${r.slug}`}
                          className="inline-flex px-3 py-1.5 rounded-lg text-[11px] font-bold text-white"
                          style={{ background: lot?.gradient || 'linear-gradient(135deg,#3b82f6,#1d4ed8)' }}>
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
              const lot = LOTTERIES.find(l => l.slug === r.slug)
              return (
                <div key={idx} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {lot && (
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                          style={{ background: lot.gradient }}>{lot.emoji}</div>
                      )}
                      <div>
                        <div className="text-gray-800 font-semibold text-sm">{r.name}</div>
                        <div className="text-gray-400 text-[11px]">{r.country} • {formatDate(r.date)}</div>
                      </div>
                    </div>
                    <Link href={`/loterias/${r.slug}`}
                      className="px-3 py-1 rounded-lg text-[11px] font-bold text-white"
                      style={{ background: lot?.gradient || 'linear-gradient(135deg,#3b82f6,#1d4ed8)' }}>
                      {t.lotteryCard.play}
                    </Link>
                  </div>
                  <ResultBalls numbers={r.numbers} extras={r.extras} extraColor={lot?.extraColor || 'green'} size="sm" />
                  <div className="text-gray-700 font-bold text-sm">{r.prize}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🎱</div>
          <p className="text-dark-400 text-sm">{t.common.noResults}</p>
        </div>
      )}
    </div>
  )
}
