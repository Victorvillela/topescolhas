// src/app/api/test-lottoland/route.ts
// ENDPOINT TEMPORÁRIO — deploy na Vercel, acesse /api/test-lottoland e veja quais loterias funcionam
// DEPOIS DE TESTAR, PODE DELETAR ESTE ARQUIVO

import { NextResponse } from 'next/server'

const GAME_NAMES = [
  // Já funcionando (confirmação)
  'euroJackpot',
  'euroMillions',
  'superEnalotto',
  'ukLotto',
  'irishLotto',
  'austriaLotto',
  'polishLotto',
  // Novos candidatos — Europa
  'germanLotto',
  'german6aus49',
  'lotto6aus49',
  'frenchLoto',
  'frenchLotto',
  'bonoLoto',
  'bonoloto',
  'laPrimitiva',
  'elGordo',
  'euroDreams',
  'swissLotto',
  'swisslotto',
  'vikingLotto',
  'miniLotto',
  'thunderball',
  'setForLife',
  'totoloto',
  // Novos candidatos — Oceania
  'ozLotto',
  'saturdayLotto',
  'auPowerball',
  'mondayLotto',
  'wednesdayLotto',
  // Novos candidatos — África
  'saLotto',
  'saPowerball',
  'saDailyLotto',
  // Novos candidatos — Américas
  'cash4Life',
  'megaMillions',
  'powerBall',
  // Novos candidatos — Ásia
  'japanLoto6',
  'japanLoto7',
  // Húngria
  'hatosLotto',
  'otosLotto',
  // Outros formatos
  'keno',
  'jokerPoland',
]

export async function GET() {
  const results: Array<{
    game: string
    status: 'ok' | 'error' | 'empty'
    numbers?: number[]
    extras?: number[]
    date?: string
    jackpot?: string
    nextJackpot?: string
    currency?: string
    raw?: unknown
  }> = []

  const promises = GAME_NAMES.map(async (game) => {
    try {
      const res = await fetch(
        `https://media.lottoland.com/api/drawings/${game}?count=1`,
        { next: { revalidate: 0 } }
      )
      
      if (!res.ok) {
        // Try alternate URL
        const res2 = await fetch(
          `https://www.lottoland.com/api/drawings/${game}`,
          { next: { revalidate: 0 } }
        )
        if (!res2.ok) {
          return { game, status: 'error' as const, raw: `HTTP ${res.status} / ${res2.status}` }
        }
        const data2 = await res2.json()
        const last = data2?.last
        if (!last) return { game, status: 'empty' as const }
        return {
          game,
          status: 'ok' as const,
          numbers: last.numbers,
          extras: last.euroNumbers || last.extraNumbers || last.starNumbers || last.bonusNumbers || [],
          date: last.date ? `${last.date.day}/${last.date.month}/${last.date.year}` : '?',
          jackpot: last.jackpot,
          nextJackpot: data2?.next?.jackpot,
          currency: last.currency || data2?.next?.currency,
          raw: { last: { ...last, odds: undefined }, next: data2?.next ? { ...data2.next } : undefined },
        }
      }

      const text = await res.text()
      if (!text || text.length < 10) {
        return { game, status: 'empty' as const }
      }

      let data
      try {
        data = JSON.parse(text)
      } catch {
        return { game, status: 'error' as const, raw: text.substring(0, 100) }
      }

      // Lottoland retorna array ou objeto com "last"
      const last = Array.isArray(data) ? data[0] : data?.last
      if (!last) {
        return { game, status: 'empty' as const, raw: text.substring(0, 200) }
      }

      return {
        game,
        status: 'ok' as const,
        numbers: last.numbers,
        extras: last.euroNumbers || last.extraNumbers || last.starNumbers || last.bonusNumbers || [],
        date: last.date ? `${last.date.day}/${last.date.month}/${last.date.year}` : '?',
        jackpot: last.jackpot,
        nextJackpot: data?.next?.jackpot || (Array.isArray(data) ? undefined : data?.next?.jackpot),
        currency: last.currency || data?.next?.currency,
        raw: last,
      }
    } catch (err) {
      return { game, status: 'error' as const, raw: String(err) }
    }
  })

  const all = await Promise.all(promises)

  const working = all.filter(r => r.status === 'ok')
  const failed = all.filter(r => r.status !== 'ok')

  return NextResponse.json({
    summary: `${working.length} funcionando de ${all.length} testados`,
    working: working.map(r => ({
      game: r.game,
      numbers: r.numbers,
      extras: r.extras,
      date: r.date,
      jackpot: r.jackpot,
      nextJackpot: r.nextJackpot,
      currency: r.currency,
    })),
    failed: failed.map(r => ({
      game: r.game,
      status: r.status,
      detail: typeof r.raw === 'string' ? r.raw.substring(0, 100) : undefined,
    })),
    raw: working, // dados completos pra debug
  })
}
