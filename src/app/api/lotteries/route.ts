import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { LOTTERIES } from '@/lib/lotteries'

// GET /api/lotteries - Returns all lotteries with current jackpots
export async function GET() {
  const supabase = createServerClient()

  // Get current jackpots from DB
  const { data: jackpots } = await supabase.from('jackpots').select('*')
  const jackpotMap = new Map((jackpots || []).map(j => [j.lottery_slug, j]))

  const lotteries = LOTTERIES.map(lot => {
    const jp = jackpotMap.get(lot.slug)
    return {
      ...lot,
      currentJackpot: jp?.amount || lot.jackpotStart,
      nextDraw: jp?.next_draw || null,
      lastUpdated: jp?.updated_at || null,
    }
  })

  return NextResponse.json({ lotteries })
}
