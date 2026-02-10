// ==============================================
// SISTEMA DE RESULTADOS DE LOTERIAS
// Fontes: guidi.dev.br, NY Open Data, Lottoland
// ==============================================

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

// ============================================
// 1. LOTERIAS BRASILEIRAS - api.guidi.dev.br
// ============================================

const BR_LOTTERIES = [
  { slug: 'mega-sena', api: 'megasena', name: 'Mega-Sena' },
  { slug: 'lotofacil', api: 'lotofacil', name: 'Lotofácil' },
  { slug: 'quina', api: 'quina', name: 'Quina' },
  { slug: 'lotomania', api: 'lotomania', name: 'Lotomania' },
  { slug: 'timemania', api: 'timemania', name: 'Timemania' },
  { slug: 'dupla-sena', api: 'duplasena', name: 'Dupla Sena' },
  { slug: 'dia-de-sorte', api: 'diadesorte', name: 'Dia de Sorte' },
]

async function fetchBrazilianLottery(lot: typeof BR_LOTTERIES[0]): Promise<LotteryResult | null> {
  try {
    const res = await fetch(`https://api.guidi.dev.br/loteria/${lot.api}/ultimo`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 0 },
    })
    if (!res.ok) return null
    const data = await res.json()

    let numbers: number[] = []
    if (data.listaDezenas?.length > 0) {
      numbers = data.listaDezenas.map((d: string) => parseInt(d))
    } else if (data.dezenasSorteadasOrdemSorteio) {
      numbers = data.dezenasSorteadasOrdemSorteio.map((d: string) => parseInt(d))
    }
    if (numbers.length === 0) return null
    numbers.sort((a, b) => a - b)

    const concurso = String(data.numero || data.numeroConcurso || '')

    let date = ''
    if (data.dataApuracao) {
      const p = data.dataApuracao.split('/')
      if (p.length === 3) date = `${p[2]}-${p[1]}-${p[0]}`
    }

    let prize = 'Acumulou!'
    if (data.listaRateioPremio?.[0]) {
      const p = data.listaRateioPremio[0]
      if (p.valorPremio > 0) prize = `R$ ${fmtNum(p.valorPremio)}`
    }

    let nextPrize = ''
    if (data.valorEstimadoProximoConcurso) nextPrize = `R$ ${fmtNum(data.valorEstimadoProximoConcurso)}`
    else if (data.valorAcumuladoProximoConcurso) nextPrize = `R$ ${fmtNum(data.valorAcumuladoProximoConcurso)}`

    let nextDate = ''
    if (data.dataProximoConcurso) {
      const p = data.dataProximoConcurso.split('/')
      if (p.length === 3) nextDate = `${p[2]}-${p[1]}-${p[0]}`
    }

    return { slug: lot.slug, name: lot.name, country: 'Brasil', numbers, extras: [], date, prize, concurso, nextPrize, nextDate }
  } catch { return null }
}

// ============================================
// 2. LOTERIAS AMERICANAS - NY Open Data
// ============================================

async function fetchUSLotteries(): Promise<LotteryResult[]> {
  const results: LotteryResult[] = []

  // Powerball
  try {
    const res = await fetch('https://data.ny.gov/resource/d6yy-54nr.json?$order=draw_date%20DESC&$limit=1', { next: { revalidate: 0 } })
    if (res.ok) {
      const data = await res.json()
      if (data[0]) {
        const nums = data[0].winning_numbers.split(' ').map((n: string) => parseInt(n))
        results.push({
          slug: 'powerball', name: 'Powerball', country: 'E.U.A.',
          numbers: nums.slice(0, 5).sort((a: number, b: number) => a - b),
          extras: nums[5] ? [nums[5]] : [],
          date: data[0].draw_date?.split('T')[0] || '',
          prize: data[0].multiplier ? `US$ ${data[0].multiplier}x` : 'US$ —',
          concurso: '',
        })
      }
    }
  } catch (err) { console.error('  ❌ Powerball:', err) }

  // Mega Millions
  try {
    const res = await fetch('https://data.ny.gov/resource/5xaw-6ayf.json?$order=draw_date%20DESC&$limit=1', { next: { revalidate: 0 } })
    if (res.ok) {
      const data = await res.json()
      if (data[0]) {
        const nums = data[0].winning_numbers.split(' ').map((n: string) => parseInt(n))
        results.push({
          slug: 'mega-millions', name: 'Mega Millions', country: 'E.U.A.',
          numbers: nums.slice(0, 5).sort((a: number, b: number) => a - b),
          extras: nums[5] ? [nums[5]] : [],
          date: data[0].draw_date?.split('T')[0] || '',
          prize: data[0].multiplier ? `US$ ${data[0].multiplier}x` : 'US$ —',
          concurso: '',
        })
      }
    }
  } catch (err) { console.error('  ❌ Mega Millions:', err) }

  return results
}

// ============================================
// 3. LOTERIAS INTERNACIONAIS - Lottoland API
// URL CORRIGIDA: media.lottoland.com (não www)
// Gratuita, sem autenticação
// ============================================

interface LottolandConfig {
  slug: string
  api: string
  name: string
  country: string
  currency: string
  hasExtras: boolean
  extrasField: string
}

// API names confirmados que funcionam no media.lottoland.com:
// ✅ euroJackpot, euroMillions, superEnalotto, frenchLoto,
//    ukLotto, irishLotto
// 🔧 Corrigidos: lotto6aus49, powerballAu, ozLotto,
//    elGordoPrimitive, laPrimitiva
const LOTTOLAND_LOTTERIES: LottolandConfig[] = [
  // ✅ Funcionando
  { slug: 'eurojackpot',   api: 'euroJackpot',     name: 'EuroJackpot',   country: 'Europa',      currency: '€', hasExtras: true,  extrasField: 'euroNumbers' },
  { slug: 'euromilhoes',   api: 'euroMillions',     name: 'EuroMilhões',   country: 'Europa',      currency: '€', hasExtras: true,  extrasField: 'starNumbers' },
  { slug: 'superenalotto', api: 'superEnalotto',    name: 'SuperEnalotto',  country: 'Itália',      currency: '€', hasExtras: false, extrasField: '' },
  { slug: 'france-loto',   api: 'frenchLoto',       name: 'Loto',          country: 'França',      currency: '€', hasExtras: false, extrasField: '' },
  { slug: 'uk-lotto',      api: 'ukLotto',          name: 'UK Lotto',      country: 'Reino Unido', currency: '£', hasExtras: false, extrasField: '' },
  { slug: 'irish-lotto',   api: 'irishLotto',       name: 'Irish Lotto',   country: 'Irlanda',     currency: '€', hasExtras: false, extrasField: '' },

  // 🔧 Corrigidos - API names atualizados
  { slug: 'german-lotto',  api: 'lotto6aus49',      name: 'German Lotto',  country: 'Alemanha',    currency: '€', hasExtras: false, extrasField: '' },
  { slug: 'la-primitiva',  api: 'laPrimitiva',      name: 'La Primitiva',  country: 'Espanha',     currency: '€', hasExtras: false, extrasField: '' },
  { slug: 'el-gordo',      api: 'elGordoPrimitive',  name: 'El Gordo',      country: 'Espanha',     currency: '€', hasExtras: false, extrasField: '' },
  { slug: 'oz-lotto',      api: 'ozLotto',          name: 'Oz Lotto',      country: 'Austrália',   currency: 'A$', hasExtras: false, extrasField: '' },
  { slug: 'au-powerball',  api: 'powerballAu',      name: 'Powerball AU',  country: 'Austrália',   currency: 'A$', hasExtras: false, extrasField: '' },
]

// Nomes alternativos para tentar se o principal falhar
const API_FALLBACK_NAMES: Record<string, string[]> = {
  'lotto6aus49':      ['germanLotto', 'german6aus49'],
  'elGordoPrimitive': ['elGordo', 'elGordoSpanish'],
  'laPrimitiva':      ['laprimitiva', 'primitiva'],
  'ozLotto':          ['ozLotteries', 'australianOzLotto'],
  'powerballAu':      ['powerBallAU', 'australianPowerball'],
}

async function fetchLottolandLottery(lot: LottolandConfig): Promise<LotteryResult | null> {
  // Tenta o nome principal primeiro
  const result = await tryFetchLottoland(lot, lot.api)
  if (result) return result

  // Se falhou, tenta nomes alternativos
  const fallbacks = API_FALLBACK_NAMES[lot.api]
  if (fallbacks) {
    for (const altApi of fallbacks) {
      const altResult = await tryFetchLottoland(lot, altApi)
      if (altResult) {
        console.log(`    → Funcionou com nome alternativo: ${altApi}`)
        return altResult
      }
    }
  }

  return null
}

async function tryFetchLottoland(lot: LottolandConfig, apiName: string): Promise<LotteryResult | null> {
  try {
    // URL CORRIGIDA: media.lottoland.com em vez de www.lottoland.com
    const res = await fetch(`https://media.lottoland.com/api/drawings/${apiName}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) {
      console.log(`    [${apiName}] HTTP ${res.status}`)
      return null
    }

    const data = await res.json()

    if (!data?.last) {
      console.log(`    [${apiName}] Sem dados 'last' na resposta`)
      return null
    }

    const last = data.last

    // Números principais
    const numbers = (last.numbers || []).map((n: number) => n).sort((a: number, b: number) => a - b)
    if (numbers.length === 0) {
      console.log(`    [${apiName}] Sem números na resposta`)
      return null
    }

    // Números extras (EuroJackpot = euroNumbers, EuroMillions = starNumbers)
    let extras: number[] = []
    if (lot.hasExtras && lot.extrasField && last[lot.extrasField]) {
      extras = last[lot.extrasField].map((n: number) => n)
    }

    // Data
    let date = ''
    if (last.date) {
      const d = last.date
      if (d.year && d.month && d.day) {
        date = `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`
      }
    }

    // Prêmio
    let prize = `${lot.currency} —`
    if (last.jackpot) {
      const jp = Number(last.jackpot)
      if (jp > 0) {
        prize = `${lot.currency} ${fmtNum(jp * 1_000_000)}`
      }
    }
    // Tenta pegar o prêmio real das odds
    if (last.odds?.rank1?.prize) {
      const p = last.odds.rank1.prize
      if (p > 0) {
        prize = `${lot.currency} ${fmtNum(p / 100)}`
      }
    }

    // Próximo prêmio
    let nextPrize = ''
    if (data.next?.jackpot) {
      const nj = Number(data.next.jackpot)
      if (nj > 0) nextPrize = `${lot.currency} ${fmtNum(nj * 1_000_000)}`
    }

    // Próxima data
    let nextDate = ''
    if (data.next?.date) {
      const d = data.next.date
      if (d.year && d.month && d.day) {
        nextDate = `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`
      }
    }

    return {
      slug: lot.slug,
      name: lot.name,
      country: lot.country,
      numbers,
      extras,
      date,
      prize,
      concurso: String(last.nr || ''),
      nextPrize,
      nextDate,
    }
  } catch (err) {
    console.error(`    [${apiName}] Erro:`, err instanceof Error ? err.message : err)
    return null
  }
}

// ============================================
// BUSCAR TODOS OS RESULTADOS
// ============================================

export async function fetchAllResults(): Promise<LotteryResult[]> {
  const results: LotteryResult[] = []
  const errors: string[] = []

  // 1. Brasileiras
  console.log('🇧🇷 Buscando loterias brasileiras (api.guidi.dev.br)...')
  const brPromises = BR_LOTTERIES.map(async (lot) => {
    const result = await withTimeout(fetchBrazilianLottery(lot), 15000)
    if (result) {
      results.push(result)
      console.log(`  ✅ ${lot.name}: #${result.concurso}`)
    } else {
      errors.push(lot.name)
      console.log(`  ❌ ${lot.name}`)
    }
  })
  await Promise.all(brPromises)

  // 2. Americanas
  console.log('🇺🇸 Buscando loterias americanas (NY Open Data)...')
  try {
    const usResults = await withTimeout(fetchUSLotteries(), 15000)
    if (usResults) {
      results.push(...usResults)
      usResults.forEach(r => console.log(`  ✅ ${r.name}: ${r.date}`))
    }
  } catch (err) { console.error('  ❌ US:', err) }

  // 3. Internacionais (Lottoland)
  console.log('🌍 Buscando loterias internacionais (Lottoland)...')
  const intPromises = LOTTOLAND_LOTTERIES.map(async (lot) => {
    const result = await withTimeout(fetchLottolandLottery(lot), 20000)
    if (result) {
      results.push(result)
      console.log(`  ✅ ${lot.name}: ${result.date} - ${result.prize}`)
    } else {
      errors.push(lot.name)
      console.log(`  ❌ ${lot.name}`)
    }
  })
  await Promise.all(intPromises)

  console.log(`\n📊 Total: ${results.length} resultados`)
  if (errors.length > 0) console.log(`⚠️ Falhas: ${errors.join(', ')}`)

  return results
}

// ============================================
// BUSCAR RESULTADO ESPECÍFICO
// ============================================

export async function fetchResultBySlug(slug: string): Promise<LotteryResult | null> {
  const brLot = BR_LOTTERIES.find(l => l.slug === slug)
  if (brLot) return fetchBrazilianLottery(brLot)

  if (slug === 'powerball' || slug === 'mega-millions') {
    const us = await fetchUSLotteries()
    return us.find(r => r.slug === slug) || null
  }

  const intLot = LOTTOLAND_LOTTERIES.find(l => l.slug === slug)
  if (intLot) return fetchLottolandLottery(intLot)

  return null
}

// ============================================
// HELPERS
// ============================================

function fmtNum(value: number): string {
  if (!value || isNaN(value)) return '—'
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  try {
    return await Promise.race([
      promise,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
    ])
  } catch { return null }
}
