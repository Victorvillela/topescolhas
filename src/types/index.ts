// ============================================
// TIPOS GLOBAIS
// ============================================

export type { LotteryConfig as Lottery } from '@/lib/lotteries'

export interface LotteryResult {
  slug: string
  name: string
  country: string
  numbers: number[]
  extras: number[]
  date: string
  prize: string
  concurso: string
  nextPrize?: string
  nextDate?: string
}

export interface JackpotData {
  slug: string
  jackpot: string
  jackpotRaw?: number
  nextDraw?: string
  source: 'api' | 'fallback'
}

export interface CartItem {
  lotterySlug: string
  lotteryName: string
  numbers: number[]
  extras: number[]
  price: number
  currency: string
}
