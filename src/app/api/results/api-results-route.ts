import { NextResponse } from 'next/server'
import { getCachedResults, isCacheValid } from '@/lib/resultsCache'
import { fetchAllResults } from '@/lib/fetchResults'
import { setCachedResults } from '@/lib/resultsCache'
import { supabase } from '@/lib/supabase'

// GET /api/results — retorna resultados para a página
// Prioridade: 1) Cache em memória  2) Supabase  3) Busca ao vivo

export const dynamic = 'force-dynamic'

export async function GET() {
  // 1. Tenta cache em memória
  const cache = getCachedResults()
  if (cache.results.length > 0 && isCacheValid(720)) {
    return NextResponse.json({
      source: 'cache',
      age: `${cache.age} min`,
      results: cache.results,
    })
  }

  // 2. Tenta Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
    try {
      const { data, error } = await supabase
        .from('lottery_results')
        .select('*')
        .order('draw_date', { ascending: false })
        .limit(30)

      if (!error && data && data.length > 0) {
        const results = data.map((r: any) => ({
          slug: r.slug,
          name: r.name,
          country: r.country,
          numbers: r.numbers,
          extras: r.extras,
          date: r.draw_date,
          prize: r.prize,
          concurso: r.concurso,
          nextPrize: r.next_prize,
          nextDate: r.next_date,
        }))

        // Atualiza cache
        setCachedResults(results)

        return NextResponse.json({
          source: 'database',
          results,
        })
      }
    } catch (err) {
      console.error('Erro ao buscar do Supabase:', err)
    }
  }

  // 3. Busca ao vivo das APIs (fallback)
  try {
    const results = await fetchAllResults()
    if (results.length > 0) {
      setCachedResults(results)
      return NextResponse.json({
        source: 'live',
        results,
      })
    }
  } catch (err) {
    console.error('Erro ao buscar ao vivo:', err)
  }

  // 4. Nada disponível
  return NextResponse.json({
    source: 'none',
    results: [],
    message: 'Nenhum resultado disponível. Acesse /api/cron/results para buscar.',
  })
}
