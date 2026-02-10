// ============================================
// CACHE DE RESULTADOS EM MEMÓRIA
// ============================================

import { LotteryResult } from './fetchResults'

interface CacheData {
  results: LotteryResult[]
  updatedAt: string
}

let cache: CacheData | null = null

// Cache válido por 4 horas (em ms)
const CACHE_TTL = 4 * 60 * 60 * 1000

export function setCachedResults(results: LotteryResult[]): void {
  cache = {
    results,
    updatedAt: new Date().toISOString(),
  }
}

export function getCachedResults(): CacheData | null {
  return cache
}

export function isCacheValid(): boolean {
  if (!cache) return false
  const age = Date.now() - new Date(cache.updatedAt).getTime()
  return age < CACHE_TTL
}

export function clearResultsCache(): void {
  cache = null
}
