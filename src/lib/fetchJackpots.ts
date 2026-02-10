// ============================================
// BUSCA JACKPOTS REAIS DE TODAS AS LOTERIAS
// Fontes: Guidi API (BR), Lottoland Media API (INT)
// Todas as APIs são GRATUITAS e sem autenticação
// ============================================

export interface JackpotData {
  slug: string
  jackpot: string          // Valor formatado: "R$ 47.000.000", "US$ 137.000.000"
  jackpotRaw?: number      // Valor numérico (para ordenação)
  nextDraw?: string        // Data do próximo sorteio (ISO)
  source: 'api' | 'fallback'
}

// ============================================
// MAPEAMENTO LOTTOLAND: slug → config
// media.lottoland.com/api/drawings/{apiName}
// Retorna: { next: { jackpot: "22", currency: "EUR" } }
// jackpot vem em milhões (ex: "22" = €22.000.000)
// ============================================

interface LottolandConfig {
  apiName: string
  currency: string
  symbol: string
  locale: string
  multiplier?: number  // Some APIs return value in millions, some in units
}

const LOTTOLAND_MAP: Record<string, LottolandConfig> = {
  // 🇺🇸 EUA
  'mega-millions':     { apiName: 'usMegaMillions',     currency: 'USD', symbol: 'US$', locale: 'en-US' },
  'powerball':         { apiName: 'usPowerball',        currency: 'USD', symbol: 'US$', locale: 'en-US' },

  // 🇪🇺 Europa Multi-país
  'euromilhoes':       { apiName: 'euroMillions',       currency: 'EUR', symbol: '€',   locale: 'de-DE' },
  'eurojackpot':       { apiName: 'euroJackpot',        currency: 'EUR', symbol: '€',   locale: 'de-DE' },

  // 🇮🇹 Itália
  'superenalotto':     { apiName: 'superEnalotto',      currency: 'EUR', symbol: '€',   locale: 'de-DE' },

  // 🇫🇷 França
  'france-loto':       { apiName: 'frenchLoto',         currency: 'EUR', symbol: '€',   locale: 'de-DE' },

  // 🇬🇧 Reino Unido
  'uk-lotto':          { apiName: 'ukLotto',            currency: 'GBP', symbol: '£',   locale: 'en-GB' },

  // 🇮🇪 Irlanda
  'irish-lotto':       { apiName: 'irishLotto',         currency: 'EUR', symbol: '€',   locale: 'de-DE' },

  // 🇪🇸 Espanha
  'la-primitiva':      { apiName: 'laPrimitiva',        currency: 'EUR', symbol: '€',   locale: 'de-DE' },
  'el-gordo':          { apiName: 'elGordo',            currency: 'EUR', symbol: '€',   locale: 'de-DE' },
  'bonoloto':          { apiName: 'bonoloto',           currency: 'EUR', symbol: '€',   locale: 'de-DE' },

  // 🇦🇺 Austrália
  'oz-lotto':          { apiName: 'ozLotto',            currency: 'AUD', symbol: 'A$',  locale: 'en-AU' },
  'au-powerball':      { apiName: 'powerballAu',        currency: 'AUD', symbol: 'A$',  locale: 'en-AU' },
  'saturday-lotto':    { apiName: 'saturdayLotto',      currency: 'AUD', symbol: 'A$',  locale: 'en-AU' },

  // 🇦🇹 Áustria
  'austria-lotto':     { apiName: 'austriaLotto',       currency: 'EUR', symbol: '€',   locale: 'de-DE' },

  // 🇩🇪 Alemanha
  'german-lotto':      { apiName: 'lotto6aus49',        currency: 'EUR', symbol: '€',   locale: 'de-DE' },

  // 🇵🇱 Polônia
  'pl-lotto':          { apiName: 'polishLotto',        currency: 'PLN', symbol: 'zł',  locale: 'pl-PL' },

  // 🇵🇹 Portugal
  'totoloto':          { apiName: 'totoloto',           currency: 'EUR', symbol: '€',   locale: 'de-DE' },

  // 🇨🇦 Canadá
  'lotto-649':         { apiName: 'canadaLotto649',     currency: 'CAD', symbol: 'CA$', locale: 'en-CA' },

  // 🇿🇦 África do Sul (tentativas - nomes podem variar no Lottoland)
  'za-lotto':          { apiName: 'southAfricanLotto',  currency: 'ZAR', symbol: 'R',   locale: 'en-ZA' },
  'za-powerball':      { apiName: 'southAfricanPowerball', currency: 'ZAR', symbol: 'R', locale: 'en-ZA' },
  'za-dailylotto':     { apiName: 'southAfricanDailyLotto', currency: 'ZAR', symbol: 'R', locale: 'en-ZA' },

  // 🇭🇺 Hungria (tentativas)
  'hatoslotto':        { apiName: 'hungarianLotto6',    currency: 'HUF', symbol: 'Ft',  locale: 'hu-HU' },
  'otoslotto':         { apiName: 'hungarianLotto5',    currency: 'HUF', symbol: 'Ft',  locale: 'hu-HU' },

  // 🇵🇭 Filipinas (tentativas)
  'ph-ultralotto':     { apiName: 'philippinesUltraLotto', currency: 'PHP', symbol: '₱', locale: 'en-PH' },
  'ph-grandlotto':     { apiName: 'philippinesGrandLotto', currency: 'PHP', symbol: '₱', locale: 'en-PH' },
}

// ============================================
// BRASILEIRAS: api.guidi.dev.br/loteria/{name}/ultimo
// API gratuita com dados oficiais da Caixa
// ============================================

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
  config: LottolandConfig
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

    const jackpotNum = parseFloat(nextJackpot)
    if (isNaN(jackpotNum) || jackpotNum <= 0) return null

    // Lottoland retorna em milhões para a maioria dos jogos
    const multiplier = config.multiplier || 1_000_000
    const jackpotValue = jackpotNum * multiplier

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

    // Próximo prêmio estimado (vários campos possíveis da API da Caixa)
    let jackpotValue =
      data.valorEstimadoProximoConcurso ||
      data.valorAcumuladoProximoConcurso ||
      data.valorAcumuladoConcursoEspecial ||
      0

    if (jackpotValue <= 0) {
      jackpotValue =
        data.valorAcumuladoConcurso_0_5 ||
        data.valorAcumulado ||
        0
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
// BUSCAR TODOS OS JACKPOTS (paralelo)
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
      console.log(`  ❌ ${slug}: sem dados`)
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
      console.log(`  ❌ ${slug}: sem dados`)
    }
  })

  // Executa tudo em paralelo
  await Promise.all([...brPromises, ...intPromises])

  console.log(`\n📊 Jackpots obtidos: ${results.length}/${Object.keys(GUIDI_MAP).length + Object.keys(LOTTOLAND_MAP).length}`)
  if (errors.length > 0) console.log(`⚠️ Sem dados: ${errors.join(', ')}`)

  return results
}

// ============================================
// HELPERS DE FORMATAÇÃO
// ============================================

function formatBRL(value: number): string {
  if (!value || isNaN(value)) return '—'
  return Math.round(value).toLocaleString('pt-BR')
}

function formatJackpot(value: number, symbol: string, locale: string): string {
  if (!value || isNaN(value)) return `${symbol} —`

  // Formata com separador de milhares pt-BR para consistência visual
  if (value >= 1_000_000) {
    const millions = Math.round(value / 1_000_000)
    const formatted = (millions * 1_000_000).toLocaleString('pt-BR')
    return `${symbol} ${formatted}`
  }

  const formatted = Math.round(value).toLocaleString('pt-BR')
  return `${symbol} ${formatted}`
}
