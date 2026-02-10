// ============================================
// BUSCA JACKPOTS REAIS DE TODAS AS LOTERIAS
// Fontes: Guidi API (BR), Lottoland (INT), NY Open Data (US)
// ============================================

export interface JackpotData {
  slug: string
  jackpot: string          // Valor formatado: "R$ 47.000.000", "US$ 137.000.000"
  jackpotRaw?: number      // Valor numérico (para ordenação)
  nextDraw?: string        // ISO date
  source: 'api' | 'fallback'
}

// ============================================
// MAPEAMENTO: slug → fonte de dados
// ============================================

// Lottoland API: media.lottoland.com/api/drawings/{name}
// Retorna: { next: { jackpot: "22", currency: "EUR" } }
const LOTTOLAND_MAP: Record<string, { apiName: string; currency: string; symbol: string; locale: string }> = {
  'mega-millions':    { apiName: 'usMegaMillions',  currency: 'USD', symbol: 'US$', locale: 'en-US' },
  'powerball':        { apiName: 'usPowerball',     currency: 'USD', symbol: 'US$', locale: 'en-US' },
  'euromilhoes':      { apiName: 'euroMillions',    currency: 'EUR', symbol: '€',   locale: 'de-DE' },
  'eurojackpot':      { apiName: 'euroJackpot',     currency: 'EUR', symbol: '€',   locale: 'de-DE' },
  'superenalotto':    { apiName: 'superEnalotto',   currency: 'EUR', symbol: '€',   locale: 'de-DE' },
  'france-loto':      { apiName: 'frenchLoto',      currency: 'EUR', symbol: '€',   locale: 'de-DE' },
  'uk-lotto':         { apiName: 'ukLotto',         currency: 'GBP', symbol: '£',   locale: 'en-GB' },
  'irish-lotto':      { apiName: 'irishLotto',      currency: 'EUR', symbol: '€',   locale: 'de-DE' },
  'la-primitiva':     { apiName: 'laPrimitiva',     currency: 'EUR', symbol: '€',   locale: 'de-DE' },
  'el-gordo':         { apiName: 'elGordo',         currency: 'EUR', symbol: '€',   locale: 'de-DE' },
  'bonoloto':         { apiName: 'bonoloto',        currency: 'EUR', symbol: '€',   locale: 'de-DE' },
  'oz-lotto':         { apiName: 'ozLotto',         currency: 'AUD', symbol: 'A$',  locale: 'en-AU' },
  'au-powerball':     { apiName: 'powerballAu',     currency: 'AUD', symbol: 'A$',  locale: 'en-AU' },
  'saturday-lotto':   { apiName: 'saturdayLotto',   currency: 'AUD', symbol: 'A$',  locale: 'en-AU' },
  'austria-lotto':    { apiName: 'austriaLotto',    currency: 'EUR', symbol: '€',   locale: 'de-DE' },
  'german-lotto':     { apiName: 'lotto6aus49',     currency: 'EUR', symbol: '€',   locale: 'de-DE' },
  'pl-lotto':         { apiName: 'polishLotto',     currency: 'PLN', symbol: 'zł',  locale: 'pl-PL' },
  'totoloto':         { apiName: 'totoloto',        currency: 'EUR', symbol: '€',   locale: 'de-DE' },
  'lotto-649':        { apiName: 'canadaLotto649',  currency: 'CAD', symbol: 'CA$', locale: 'en-CA' },
}

// Brasileiras: api.guidi.dev.br/loteria/{name}/ultimo
const GUIDI_MAP: Record<string, string> = {
  'mega-sena':    'megasena',
  'lotofacil':    'lotofacil',
  'quina':        'quina',
  'lotomania':    'lotomania',
  'timemania':    'timemania',
  'dupla-sena':   'duplasena',
  'dia-de-sorte': 'diadesorte',
}

// ============================================
// BUSCA LOTTOLAND (Internacional)
// ============================================

async function fetchLottolandJackpot(
  slug: string,
  config: typeof LOTTOLAND_MAP[string]
): Promise<JackpotData | null> {
  try {
    const res = await fetch(
      `https://media.lottoland.com/api/drawings/${config.apiName}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        next: { revalidate: 0 },
        signal: AbortSignal.timeout(8000),
      }
    )

    if (!res.ok) return null

    const data = await res.json()

    // next.jackpot vem em milhões (ex: "22" = 22 milhões)
    // next.marketingJackpot pode ter valor mais preciso
    const nextJackpot = data?.next?.jackpot || data?.next?.marketingJackpot
    if (!nextJackpot) return null

    const jackpotMillions = parseFloat(nextJackpot)
    if (isNaN(jackpotMillions) || jackpotMillions <= 0) return null

    const jackpotValue = jackpotMillions * 1_000_000

    // Formata o valor
    const formatted = formatJackpot(jackpotValue, config.symbol, config.locale)

    // Data do próximo sorteio
    let nextDraw: string | undefined
    if (data?.next?.date) {
      const d = data.next.date
      if (d.year && d.month && d.day) {
        nextDraw = `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`
        if (d.hour !== undefined) {
          nextDraw += `T${String(d.hour).padStart(2, '0')}:${String(d.minute || 0).padStart(2, '0')}:00`
        }
      }
    }

    return {
      slug,
      jackpot: formatted,
      jackpotRaw: jackpotValue,
      nextDraw,
      source: 'api',
    }
  } catch (err) {
    console.error(`[Lottoland] ${slug}:`, err instanceof Error ? err.message : err)
    return null
  }
}

// ============================================
// BUSCA BRASILEIRAS (Guidi API)
// ============================================

async function fetchGuidiJackpot(
  slug: string,
  apiName: string
): Promise<JackpotData | null> {
  try {
    const res = await fetch(
      `https://api.guidi.dev.br/loteria/${apiName}/ultimo`,
      {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 0 },
        signal: AbortSignal.timeout(10000),
      }
    )

    if (!res.ok) return null

    const data = await res.json()

    // Próximo prêmio estimado
    let jackpotValue =
      data.valorEstimadoProximoConcurso ||
      data.valorAcumuladoProximoConcurso ||
      data.valorAcumuladoConcursoEspecial ||
      0

    if (jackpotValue <= 0) {
      // Se não tem estimativa, usa o valor acumulado
      if (data.valorAcumuladoConcurso_0_5) {
        jackpotValue = data.valorAcumuladoConcurso_0_5
      } else if (data.acumulado) {
        // Tenta extrair de outro campo
        jackpotValue = data.valorAcumulado || 0
      }
    }

    if (jackpotValue <= 0) return null

    const formatted = `R$ ${formatBRL(jackpotValue)}`

    // Próximo sorteio
    let nextDraw: string | undefined
    if (data.dataProximoConcurso) {
      const parts = data.dataProximoConcurso.split('/')
      if (parts.length === 3) {
        nextDraw = `${parts[2]}-${parts[1]}-${parts[0]}T20:00:00`
      }
    }

    return {
      slug,
      jackpot: formatted,
      jackpotRaw: jackpotValue,
      nextDraw,
      source: 'api',
    }
  } catch (err) {
    console.error(`[Guidi] ${slug}:`, err instanceof Error ? err.message : err)
    return null
  }
}

// ============================================
// BUSCAR TODOS OS JACKPOTS
// ============================================

export async function fetchAllJackpots(): Promise<JackpotData[]> {
  const results: JackpotData[] = []
  const errors: string[] = []

  // 1. Brasileiras (paralelo)
  console.log('🇧🇷 Buscando jackpots brasileiros...')
  const brPromises = Object.entries(GUIDI_MAP).map(async ([slug, apiName]) => {
    const result = await fetchGuidiJackpot(slug, apiName)
    if (result) {
      results.push(result)
      console.log(`  ✅ ${slug}: ${result.jackpot}`)
    } else {
      errors.push(slug)
      console.log(`  ❌ ${slug}`)
    }
  })

  // 2. Internacionais via Lottoland (paralelo)
  console.log('🌍 Buscando jackpots internacionais (Lottoland)...')
  const intPromises = Object.entries(LOTTOLAND_MAP).map(async ([slug, config]) => {
    const result = await fetchLottolandJackpot(slug, config)
    if (result) {
      results.push(result)
      console.log(`  ✅ ${slug}: ${result.jackpot}`)
    } else {
      errors.push(slug)
      console.log(`  ❌ ${slug}`)
    }
  })

  // Executa tudo em paralelo
  await Promise.all([...brPromises, ...intPromises])

  console.log(`\n📊 Jackpots obtidos: ${results.length}`)
  if (errors.length > 0) console.log(`⚠️ Sem dados: ${errors.join(', ')}`)

  return results
}

// ============================================
// HELPERS
// ============================================

function formatBRL(value: number): string {
  if (!value || isNaN(value)) return '—'
  // Formata sem decimais, com separador de milhares
  return Math.round(value).toLocaleString('pt-BR')
}

function formatJackpot(value: number, symbol: string, locale: string): string {
  if (!value || isNaN(value)) return `${symbol} —`

  // Para valores em milhões, formata de forma limpa
  if (value >= 1_000_000) {
    const millions = Math.round(value / 1_000_000)
    // Formata com separador de milhares: 137.000.000
    const formatted = (millions * 1_000_000).toLocaleString('pt-BR')
    return `${symbol} ${formatted}`
  }

  const formatted = Math.round(value).toLocaleString('pt-BR')
  return `${symbol} ${formatted}`
}
