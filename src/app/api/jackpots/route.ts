import { NextResponse } from 'next/server'
import { fetchAllJackpots, JackpotData } from '@/lib/fetchJackpots'

// ============================================
// /api/jackpots - Endpoint de jackpots reais
// Cache: 30 min em memória + 5 min CDN
// Cron: Vercel roda a cada hora (vercel.json)
// ============================================

// Cache em memória (persiste entre requests no mesmo worker)
let cachedJackpots: JackpotData[] = []
let cacheTimestamp = 0
const CACHE_TTL = 30 * 60 * 1000 // 30 minutos

export const dynamic = 'force-dynamic'
export const maxDuration = 30 // timeout 30s para fetch de todas as APIs

export async function GET() {
  const now = Date.now()
  const cacheAge = now - cacheTimestamp

  // Se cache válido (< 30 min), retorna direto
  if (cachedJackpots.length > 0 && cacheAge < CACHE_TTL) {
    return NextResponse.json({
      source: 'cache',
      age: Math.round(cacheAge / 60000) + ' min',
      count: cachedJackpots.length,
      jackpots: cachedJackpots,
      updatedAt: new Date(cacheTimestamp).toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'Access-Control-Allow-Origin': '*',
      }
    })
  }

  // Busca novos jackpots
  try {
    console.log('🎰 [JACKPOTS] Buscando jackpots reais...')
    const startTime = Date.now()
    const jackpots = await fetchAllJackpots()
    const elapsed = Date.now() - startTime

    if (jackpots.length > 0) {
      cachedJackpots = jackpots
      cacheTimestamp = now
    }

    console.log(`🎰 [JACKPOTS] ${jackpots.length} jackpots em ${elapsed}ms`)

    return NextResponse.json({
      source: 'live',
      count: jackpots.length,
      jackpots,
      elapsed: elapsed + 'ms',
      updatedAt: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'Access-Control-Allow-Origin': '*',
      }
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('❌ [JACKPOTS] Erro:', message)

    // Se tem cache antigo, retorna mesmo expirado
    if (cachedJackpots.length > 0) {
      return NextResponse.json({
        source: 'stale-cache',
        age: Math.round(cacheAge / 60000) + ' min',
        count: cachedJackpots.length,
        jackpots: cachedJackpots,
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        }
      })
    }

    return NextResponse.json({
      source: 'error',
      error: message,
      jackpots: [],
    }, { status: 500 })
  }
}
