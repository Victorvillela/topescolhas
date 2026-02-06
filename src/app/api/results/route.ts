import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

const CAIXA_API = 'https://api.guidi.dev.br/loteria'

const LOTTERY_MAP: Record<string, string> = {
  'mega-sena': 'megasena',
  'lotofacil': 'lotofacil',
  'quina': 'quina',
  'lotomania': 'lotomania',
  'timemania': 'timemania',
  'dupla-sena': 'duplasena',
  'dia-de-sorte': 'diadesorte',
}

// GET /api/results?lottery=mega-sena
// GET /api/results?sync=true (syncs all Brazilian lotteries)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lottery = searchParams.get('lottery')
  const sync = searchParams.get('sync')
  const supabase = createServerClient()

  // Sync all Brazilian lotteries from Caixa API
  if (sync === 'true') {
    const results = []
    for (const [slug, apiName] of Object.entries(LOTTERY_MAP)) {
      try {
        const res = await fetch(`${CAIXA_API}/${apiName}/latest`, { next: { revalidate: 300 } })
        if (!res.ok) continue
        const data = await res.json()

        const numbers = (data.listaDezenas || []).map((n: string) => parseInt(n))
        const extras = slug === 'dupla-sena'
          ? (data.listaDezenasSegundoSorteio || []).map((n: string) => parseInt(n))
          : []

        const jackpot = data.valorEstimadoProximoConcurso
          ? `R$ ${Number(data.valorEstimadoProximoConcurso).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
          : data.valorAcumuladoProximoConcurso
            ? `R$ ${Number(data.valorAcumuladoProximoConcurso).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            : ''

        const LOTTERY_NAMES: Record<string, string> = {
          'mega-sena': 'Mega-Sena', 'lotofacil': 'Lotofácil', 'quina': 'Quina',
          'lotomania': 'Lotomania', 'timemania': 'Timemania', 'dupla-sena': 'Dupla Sena',
          'dia-de-sorte': 'Dia de Sorte',
        }

        // Upsert result
        await supabase.from('results').upsert({
          lottery_slug: slug,
          lottery_name: LOTTERY_NAMES[slug] || slug,
          numbers,
          extras,
          jackpot,
          prize_breakdown: data.listaRateioPremio || [],
          draw_date: data.dataApuracao || new Date().toISOString().split('T')[0],
          concurso: String(data.numero || ''),
          accumulated: data.acumulado || false,
        }, { onConflict: 'lottery_slug,concurso' })

        // Update jackpot
        await supabase.from('jackpots').upsert({
          lottery_slug: slug,
          lottery_name: LOTTERY_NAMES[slug] || slug,
          amount: jackpot,
          next_draw: data.dataProximoConcurso || null,
          updated_at: new Date().toISOString(),
        })

        results.push({ slug, concurso: data.numero, numbers, jackpot })
      } catch (e) {
        console.error(`Error syncing ${slug}:`, e)
      }
    }
    return NextResponse.json({ synced: results.length, results })
  }

  // Get results from DB
  const query = supabase.from('results').select('*').order('draw_date', { ascending: false }).limit(20)
  if (lottery) query.eq('lottery_slug', lottery)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ results: data })
}
