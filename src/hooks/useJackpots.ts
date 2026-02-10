'use client'
import { useState, useEffect } from 'react'

// ============================================
// Hook: useJackpots
// Busca jackpots reais do /api/jackpots
// Retorna um mapa slug → { jackpot, nextDraw }
// ============================================

interface JackpotInfo {
  slug: string
  jackpot: string
  jackpotRaw?: number
  nextDraw?: string
  source: 'api' | 'fallback'
}

interface UseJackpotsReturn {
  jackpots: Record<string, JackpotInfo>
  loading: boolean
  error: string | null
  /** Retorna jackpot real ou undefined se não disponível */
  getJackpot: (slug: string) => string | undefined
  /** Retorna data do próximo sorteio ou undefined */
  getNextDraw: (slug: string) => string | undefined
  /** Total de jackpots carregados da API */
  count: number
}

export function useJackpots(): UseJackpotsReturn {
  const [jackpots, setJackpots] = useState<Record<string, JackpotInfo>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      try {
        const res = await fetch('/api/jackpots', {
          next: { revalidate: 300 }, // 5 min client cache
        })

        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const data = await res.json()

        if (!cancelled && data.jackpots?.length > 0) {
          const map: Record<string, JackpotInfo> = {}
          data.jackpots.forEach((j: JackpotInfo) => {
            map[j.slug] = j
          })
          setJackpots(map)
        }
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Erro ao buscar jackpots'
          setError(msg)
          console.error('useJackpots:', msg)
        }
      }

      if (!cancelled) setLoading(false)
    }

    fetchData()

    return () => { cancelled = true }
  }, [])

  const getJackpot = (slug: string): string | undefined => {
    return jackpots[slug]?.jackpot
  }

  const getNextDraw = (slug: string): string | undefined => {
    return jackpots[slug]?.nextDraw
  }

  return {
    jackpots,
    loading,
    error,
    getJackpot,
    getNextDraw,
    count: Object.keys(jackpots).length,
  }
}
