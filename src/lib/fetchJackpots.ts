// ============================================
// BUSCA JACKPOTS REAIS DE TODAS AS LOTERIAS
// Fontes: Guidi API (BR), Lottoland Media API (INT)
// Todas as APIs são GRATUITAS e sem autenticação
//
// REMOVIDAS (API Lottoland não retorna dados):
// - La Primitiva, El Gordo, Oz Lotto, Powerball AU, German Lotto
// ============================================

export interface JackpotData {
  slug: string
  jackpot: string          // Valor formatado: "R$ 47.000.000", "US$ 137.000.000"
  jackpotRaw?: number      // Valor numérico (para ordenação)
  nextDraw?: string        // Data do próximo sorteio (ISO)
  source: 'api' | 'fallback'
}

// ============================================
// MAPEAMENTO GUIDI: slug → apiName
// api.guidi.dev.br/loteria/{apiName}/ultimo
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
  multiplier?: number
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

  // 🇪🇸 Espanha — REMOVIDAS: la-primitiva, el-gordo (API não retorna)
  'bonoloto':          { apiName: 'bonoloto',           currency: 'EUR', symbol: '€',   locale: 'de-DE' },

  // 🇦🇺 Austrália — REMOVIDAS: oz-lotto, au-powerball (API não retorna)
  'saturday-lotto':    { apiName: 'saturdayLotto',      currency: 'AUD', symbol: 'A$',  locale: 'en-AU' },

  // 🇦🇹 Áustria
  'austria-lotto':     { apiName: 'austriaLotto',       currency: 'EUR', symbol: '€',   locale: 'de-DE' },

  // 🇩🇪 Alemanha — REMOVIDA: german-lotto (API não retorna)

  // 🇵🇱 Polônia
  'polish-lotto':      { apiName: 'polishLotto',        currency: 'PLN', symbol: 'zł',  locale: 'pl-PL' },

  // 🇵🇹 Portugal
  'totoloto':          { apiName: 'totoloto',           currency: 'EUR', symbol: '€',   locale: 'de-DE' },

  // 🇨🇦 Canadá
  'lotto-649':         { apiName: 'lotto649',           currency: 'CAD', symbol: 'C$',  locale: 'en-CA' },

  // 🇿🇦 África do Sul
  'sa-lotto':          { apiName: 'saLotto',            currency: 'ZAR', symbol: 'R',   locale: 'en-ZA' },
  'sa-powerball':      { apiName: 'saPowerball',        currency: 'ZAR', symbol: 'R',   locale: 'en-ZA' },
  'sa-daily-lotto':    { apiName: 'saDailyLotto',       currency: 'ZAR', symbol: 'R',   locale: 'en-ZA' },

  // 🇭🇺 Hungria
  'hatoslotto':        { apiName: 'hatoslotto',         currency: 'HUF', symbol: 'Ft',  locale: 'hu-HU' },
  'otoslotto':         { apiName: 'otoslotto',          currency: 'HUF', symbol: 'Ft',  locale: 'hu-HU' },

  // 🇵🇭 Filipinas
  'ph-ultra-lotto':    { apiName: 'phUltraLotto',       currency: 'PHP', symbol: '₱',   locale: 'en-PH' },
  'ph-grand-lotto':    { apiName: 'phGrandLotto',       currency: 'PHP', symbol: '₱',   locale: 'en-PH' },
}

// ============================================
// FETCH: Guidi (BR)
// ============================================

async function fetchGuidiJackpot(slug: string, apiName: string): Promise<JackpotData | null> {
  try {
    const res = await fetch(`https://api.guidi.dev.br/loteria/${apiName}/ultimo`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 0 },
    })
    if (!res.ok) return null
    const data = await res.json()

    let jackpotRaw = 0
    if (data.valorEstimadoProximoConcurso) {
      jackpotRaw = Number(data.valorEstimadoProximoConcurso)
    } else if (data.valorAcumuladoProximoConcurso) {
      jackpotRaw = Number(data.valorAcumuladoProximoConcurso)
    }

    if (!jackpotRaw || isNaN(jackpotRaw)) return null

    return {
      slug,
      jackpot: `R$ ${formatBRL(jackpotRaw)}`,
      jackpotRaw,
      source: 'api',
    }
  } catch { return null }
}

// ============================================
// FETCH: Lottoland (INT)
// ============================================

async function fetchLottolandJackpot(slug: string, config: LottolandConfig): Promise<JackpotData | null> {
  try {
    const res = await fetch(`https://media.lottoland.com/api/drawings/${config.apiName}`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 0 },
    })
    if (!res.ok) return null
    const data = await res.json()

    if (!data?.next?.jackpot) return null

    const rawStr = String(data.next.jackpot)
    let jackpotRaw = parseFloat(rawStr.replace(/,/g, ''))

    // Lottoland retorna em milhões para muitas loterias
    if (jackpotRaw < 10000) {
      jackpotRaw = jackpotRaw * 1_000_000
    }

    if (!jackpotRaw || isNaN(jackpotRaw)) return null

    const multiplier = config.multiplier || 1
    jackpotRaw = jackpotRaw * multiplier

    return {
      slug,
      jackpot: formatJackpot(jackpotRaw, config.symbol, config.locale),
      jackpotRaw,
      source: 'api',
    }
  } catch { return null }
}

// ============================================
// FETCH ALL
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

  if (value >= 1_000_000) {
    const millions = Math.round(value / 1_000_000)
    const formatted = (millions * 1_000_000).toLocaleString('pt-BR')
    return `${symbol} ${formatted}`
  }

  const formatted = Math.round(value).toLocaleString('pt-BR')
  return `${symbol} ${formatted}`
}
