// ============================================
// CACHE DE RESULTADOS EM MEMÓRIA
// ============================================

import { LotteryResult } from './fetchResults'

interface CacheData {
  results: LotteryResult[]
  updatedAt: string
}

let cache: CacheData | null = null

export function setCachedResults(results: LotteryResult[]): void {
  cache = {
    results,
    updatedAt: new Date().toISOString(),
  }
}

export function getCachedResults(): { results: LotteryResult[]; age: number; updatedAt: string } {
  if (!cache) {
    return { results: [], age: Infinity, updatedAt: '' }
  }
  const ageMs = Date.now() - new Date(cache.updatedAt).getTime()
  const ageMinutes = Math.round(ageMs / 60000)
  return {
    results: cache.results,
    age: ageMinutes,
    updatedAt: cache.updatedAt,
  }
}

export function isCacheValid(maxAgeMinutes?: number): boolean {
  if (!cache) return false
  const ageMs = Date.now() - new Date(cache.updatedAt).getTime()
  const ttl = (maxAgeMinutes || 240) * 60 * 1000
  return ageMs < ttl
}

export function clearResultsCache(): void {
  cache = null
}
