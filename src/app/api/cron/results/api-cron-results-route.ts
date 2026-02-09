import { NextResponse } from 'next/server'
import { fetchAllResults } from '@/lib/fetchResults'
import { setCachedResults } from '@/lib/resultsCache'
import { supabase } from '@/lib/supabase'

// Vercel Cron - roda todo dia às 20:00 e 23:00 (BRT)
// Também pode ser chamado manualmente: GET /api/cron/results

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // segundos

export async function GET(request: Request) {
  // Permite Vercel Cron ou chamadas com token
  const isVercelCron = request.headers.get('x-vercel-cron')
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!isVercelCron && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('🎰 [CRON] Iniciando busca de resultados...')
  console.log(`📅 ${new Date().toISOString()}`)

  try {
    // 1. Busca todos os resultados de APIs públicas
    const results = await fetchAllResults()

    if (results.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Nenhum resultado obtido',
        timestamp: new Date().toISOString(),
      })
    }

    // 2. Salva no cache em memória (sempre funciona)
    setCachedResults(results)

    // 3. Salva no Supabase (se configurado com credenciais reais)
    let savedToDb = false
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
      try {
        for (const result of results) {
          const { error } = await supabase
            .from('lottery_results')
            .upsert(
              {
                slug: result.slug,
                name: result.name,
                country: result.country,
                numbers: result.numbers,
                extras: result.extras,
                draw_date: result.date,
                prize: result.prize,
                concurso: result.concurso,
                next_prize: result.nextPrize || null,
                next_date: result.nextDate || null,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'slug,concurso', ignoreDuplicates: false }
            )
          if (error) console.error(`DB error ${result.slug}:`, error.message)
        }
        savedToDb = true
        console.log('💾 Salvos no Supabase')
      } catch (dbErr) {
        console.error('❌ Erro Supabase:', dbErr)
      }
    }

    console.log(`✅ [CRON] ${results.length} resultados obtidos`)

    return NextResponse.json({
      success: true,
      count: results.length,
      savedToDb,
      results: results.map(r => ({
        slug: r.slug,
        name: r.name,
        date: r.date,
        concurso: r.concurso,
        prize: r.prize,
        numbers: r.numbers,
        extras: r.extras,
      })),
      timestamp: new Date().toISOString(),
    })
  } catch (err: any) {
    console.error('❌ [CRON] Erro:', err)
    return NextResponse.json({
      success: false,
      error: err.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}
