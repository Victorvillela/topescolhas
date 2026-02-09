import { LotteryResult } from './fetchResults'

// Cache global em memória
// Funciona sem Supabase - os resultados ficam até o próximo deploy/restart
let cachedResults: LotteryResult[] = []
let cacheTimestamp = 0

export function setCachedResults(results: LotteryResult[]) {
  cachedResults = results
  cacheTimestamp = Date.now()
}

export function getCachedResults(): { results: LotteryResult[], timestamp: number, age: number } {
  return {
    results: cachedResults,
    timestamp: cacheTimestamp,
    age: cacheTimestamp > 0 ? Math.round((Date.now() - cacheTimestamp) / 1000 / 60) : -1, // minutos
  }
}

export function isCacheValid(maxAgeMinutes = 720): boolean {
  // Cache válido por 12 horas (720 min) por padrão
  if (cacheTimestamp === 0) return false
  return (Date.now() - cacheTimestamp) < maxAgeMinutes * 60 * 1000
}
