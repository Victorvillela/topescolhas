'use client'
import { useState, useEffect } from 'react'
import { LOTTERIES } from '@/lib/lotteries'
import ResultBalls from '@/components/ResultBalls'
import Link from 'next/link'
import { useTranslation } from '@/contexts/LanguageContext'
import { Loader2, RefreshCw } from 'lucide-react'

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

// ========================================
// BANDEIRAS E GRADIENTES POR PAÍS/SLUG
// ========================================

const COUNTRY_FLAGS: Record<string, string> = {
  'Brasil': '🇧🇷',
  'E.U.A.': '🇺🇸',
  'Europa': '🇪🇺',
  'Itália': '🇮🇹',
  'França': '🇫🇷',
  'Reino Unido': '🇬🇧',
  'Alemanha': '🇩🇪',
  'Irlanda': '🇮🇪',
  'Espanha': '🇪🇸',
  'Austrália': '🇦🇺',
  'Portugal': '🇵🇹',
  'Canadá': '🇨🇦',
  'Japão': '🇯🇵',
  'México': '🇲🇽',
  'Argentina': '🇦🇷',
  'Chile': '🇨🇱',
  'Colômbia': '🇨🇴',
  'Peru': '🇵🇪',
  'África do Sul': '🇿🇦',
  'Polônia': '🇵🇱',
  'Hungria': '🇭🇺',
  'Filipinas': '🇵🇭',
  'Áustria': '🇦🇹',
  'Romênia': '🇷🇴',
}

const SLUG_GRADIENTS: Record<string, string> = {
  'eurojackpot': 'linear-gradient(135deg, #f59e0b, #d97706)',
  'euromilhoes': 'linear-gradient(135deg, #fbbf24, #f59e0b)',
  'superenalotto': 'linear-gradient(135deg, #059669, #047857)',
  'france-loto': 'linear-gradient(135deg, #2563eb, #1d4ed8)',
  'uk-lotto': 'linear-gradient(135deg, #dc2626, #b91c1c)',
  'irish-lotto': 'linear-gradient(135deg, #16a34a, #15803d)',
  'bonoloto': 'linear-gradient(135deg, #ea580c, #c2410c)',
  'saturday-lotto': 'linear-gradient(135deg, #0284c7, #0369a1)',
  'austria-lotto': 'linear-gradient(135deg, #ef4444, #dc2626)',
  'pl-lotto': 'linear-gradient(135deg, #dc2626, #991b1b)',
  'totoloto': 'linear-gradient(135deg, #059669, #047857)',
  'lotto-649': 'linear-gradient(135deg, #dc2626, #991b1b)',
  'za-lotto': 'linear-gradient(135deg, #f59e0b, #d97706)',
  'za-powerball': 'linear-gradient(135deg, #7c3aed, #6d28d9)',
  'za-dailylotto': 'linear-gradient(135deg, #10b981, #059669)',
  'hatoslotto': 'linear-gradient(135deg, #dc2626, #059669)',
  'otoslotto': 'linear-gradient(135deg, #059669, #047857)',
  'ph-ultralotto': 'linear-gradient(135deg, #2563eb, #1d4ed8)',
  'ph-grandlotto': 'linear-gradient(135deg, #f59e0b, #d97706)',
}

const COUNTRY_GRADIENTS: Record<string, string> = {
  'Europa': 'linear-gradient(135deg, #2563eb, #1e40af)',
  'Itália': 'linear-gradient(135deg, #059669, #047857)',
  'França': 'linear-gradient(135deg, #2563eb, #1d4ed8)',
  'Reino Unido': 'linear-gradient(135deg, #dc2626, #b91c1c)',
  'Irlanda': 'linear-gradient(135deg, #16a34a, #15803d)',
  'Espanha': 'linear-gradient(135deg, #ea580c, #c2410c)',
  'Austrália': 'linear-gradient(135deg, #0284c7, #0369a1)',
  'Portugal': 'linear-gradient(135deg, #059669, #047857)',
  'Canadá': 'linear-gradient(135deg, #dc2626, #991b1b)',
  'África do Sul': 'linear-gradient(135deg, #f59e0b, #d97706)',
  'Polônia': 'linear-gradient(135deg, #dc2626, #991b1b)',
  'Hungria': 'linear-gradient(135deg, #dc2626, #059669)',
  'Filipinas': 'linear-gradient(135deg, #2563eb, #1d4ed8)',
  'Áustria': 'linear-gradient(135deg, #ef4444, #dc2626)',
  'Romênia': 'linear-gradient(135deg, #2563eb, #f59e0b)',
}

function getGradient(slug: string, country: string): string {
  return SLUG_GRADIENTS[slug] || COUNTRY_GRADIENTS[country] || 'linear-gradient(135deg, #6366f1, #8b5cf6)'
}

function getFlag(slug: string, country: string): string {
  const lot = LOTTERIES.find(l => l.slug === slug)
  if (lot?.flag) return lot.flag
  return COUNTRY_FLAGS[country] || '🌍'
}

function getEmoji(slug: string): string {
  const lot = LOTTERIES.find(l => l.slug === slug)
  return lot?.emoji || ''
}

export default function ResultadosPage() {
  const { t } = useTranslation()
  const [results, setResults] = useState<ResultData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'br' | 'int'>('all')

  useEffect(() => {
    fetchResults()
  }, [])

  async function fetchResults() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/cron/results')
      if (!res.ok) throw new Error('Erro ao buscar resultados')
      const data = await res.json()
      setResults(data.results || [])
    } catch (err) {
      setError('Erro ao carregar resultados. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const filtered = results.filter(r => {
    if (filter === 'br') return r.country === 'Brasil'
    if (filter === 'int') return r.country !== 'Brasil'
    return true
  })

  // Ordena: brasileiras primeiro, depois internacionais
  const sorted = [...filtered].sort((a, b) => {
    if (a.country === 'Brasil' && b.country !== 'Brasil') return -1
    if (a.country !== 'Brasil' && b.country === 'Brasil') return 1
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">
            🎲 {t.results?.title || 'Resultados'}
          </h1>
          <button
            onClick={fetchResults}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {t.results?.refresh || 'Atualizar'}
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6">
          {(['all', 'br', 'int'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {f === 'all' ? `🌍 ${t.results?.all || 'Todas'}` :
               f === 'br' ? `🇧🇷 ${t.results?.brazilian || 'Brasileiras'}` :
               `🌎 ${t.results?.international || 'Internacionais'}`}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <span className="ml-3 text-gray-400">{t.results?.loading || 'Carregando resultados...'}</span>
          </div>
        )}

        {error && (
          <div className="text-center py-20 text-red-400">
            <p>{error}</p>
            <button onClick={fetchResults} className="mt-4 px-6 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700">
              {t.results?.tryAgain || 'Tentar novamente'}
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map((result, idx) => {
              const gradient = getGradient(result.slug, result.country)
              const flag = getFlag(result.slug, result.country)
              const emoji = getEmoji(result.slug)

              return (
                <Link
                  key={`${result.slug}-${idx}`}
                  href={`/loterias/${result.slug}`}
                  className="block bg-gray-900 rounded-xl overflow-hidden hover:scale-[1.02] transition-transform"
                >
                  {/* Header com gradiente */}
                  <div
                    className="px-4 py-3 flex items-center justify-between"
                    style={{ background: gradient }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{flag}</span>
                      <div>
                        <h3 className="font-bold text-white text-sm">
                          {emoji ? `${emoji} ` : ''}{result.name}
                        </h3>
                        <p className="text-white/70 text-xs">{result.country}</p>
                      </div>
                    </div>
                    {result.concurso && (
                      <span className="text-white/60 text-xs">#{result.concurso}</span>
                    )}
                  </div>

                  {/* Corpo */}
                  <div className="p-4">
                    <p className="text-gray-500 text-xs mb-2">
                      {result.date ? new Date(result.date + 'T12:00:00').toLocaleDateString('pt-BR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      }) : '—'}
                    </p>

                    <ResultBalls
                      numbers={result.numbers}
                      extras={result.extras}
                      size="sm"
                    />

                    <p className="mt-3 text-sm font-semibold text-emerald-400">
                      {result.prize}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {!loading && !error && sorted.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <p>{t.results?.noResults || 'Nenhum resultado encontrado.'}</p>
          </div>
        )}
      </div>
    </div>
  )
}
