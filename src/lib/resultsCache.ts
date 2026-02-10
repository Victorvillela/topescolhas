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

export function getCachedResults(): CacheData | null {
  return cache
}

export function clearResultsCache(): void {
  cache = null
}
