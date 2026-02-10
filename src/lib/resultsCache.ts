// ============================================
// CACHE DE RESULTADOS EM MEMÓRIA
// Armazena os resultados da última execução do cron
// para servir via API sem precisar buscar novamente
// ============================================

import { LotteryResult } from './fetchResults'

interface CacheData {
  results: LotteryResult[]
  updatedAt: string
}

let cache: CacheData | null = null

export function setResultsCache(results: LotteryResult[]): void {
  cache = {
    results,
    updatedAt: new Date().toISOString(),
  }
}

export function getResultsCache(): CacheData | null {
  return cache
}

export function clearResultsCache(): void {
  cache = null
}
