// ==============================================
// SISTEMA DE RESULTADOS DE LOTERIAS
// Fontes: guidi.dev.br, NY Open Data, Lottoland
//
// 20 loterias com dados reais confirmados
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
    if (data.listaRateioPremio?.length > 0) {
      const main = data.listaRateioPremio[0]
      if (main.numeroDeGanhadores > 0) {
        prize = `R$ ${fmtNum(main.valorPremio)}`
      }
    }

    return {
      slug: lot.slug,
      name: lot.name,
      country: 'Brasil',
      numbers,
      extras: [],
      date,
      prize,
      concurso,
    }
  } catch { return null }
}

// ============================================
// 2. LOTERIAS AMERICANAS - NY Open Data
// ============================================

async function fetchUSLotteries(): Promise<LotteryResult[]> {
  const results: LotteryResult[] = []

  // Powerball
  try {
    const res = await fetch('https://data.ny.gov/resource/d6yy-54nr.json?$order=draw_date%20DESC&$limit=1', {
      next: { revalidate: 0 },
    })
    if (res.ok) {
      const data = await res.json()
      if (data.length > 0) {
        const d = data[0]
        const nums = d.winning_numbers?.split(' ').map((n: string) => parseInt(n)) || []
        results.push({
          slug: 'powerball',
          name: 'Powerball',
          country: 'E.U.A.',
          numbers: nums.slice(0, 5).sort((a: number, b: number) => a - b),
          extras: nums[5] ? [nums[5]] : [],
          date: d.draw_date?.split('T')[0] || '',
          prize: d.multiplier ? `US$ ${d.multiplier}x` : 'US$ —',
          concurso: '',
        })
      }
    }
  } catch (err) {
    console.error('  ❌ Powerball:', err)
  }

  // Mega Millions
  try {
    const res = await fetch('https://data.ny.gov/resource/5xaw-6ayf.json?$order=draw_date%20DESC&$limit=1', {
      next: { revalidate: 0 },
    })
    if (res.ok) {
      const data = await res.json()
      if (data.length > 0) {
        const d = data[0]
        const nums = d.winning_numbers?.split(' ').map((n: string) => parseInt(n)) || []
        results.push({
          slug: 'mega-millions',
          name: 'Mega Millions',
          country: 'E.U.A.',
          numbers: nums.slice(0, 5).sort((a: number, b: number) => a - b),
          extras: nums[5] ? [nums[5]] : [],
          date: d.draw_date?.split('T')[0] || '',
          prize: d.multiplier ? `US$ ${d.multiplier}x` : 'US$ —',
          concurso: '',
        })
      }
    }
  } catch (err) {
    console.error('  ❌ Mega Millions:', err)
  }

  return results
}

// ============================================
// 3. LOTERIAS INTERNACIONAIS - Lottoland
// ============================================

interface LottolandConfig {
  slug: string
  api: string
  name: string
  country: string
  currency: string
  // Lista de campos onde procurar números extras (tenta em ordem)
  // Suporta arrays [4, 5] e valores únicos (42)
  extrasFields: string[]
}

// ✅ Apenas loterias confirmadas com dados reais (testado 11/02/2026)
const LOTTOLAND_LOTTERIES: LottolandConfig[] = [
  // 🇬🇧 Reino Unido
  { slug: 'uk-lotto', api: 'ukLotto', name: 'UK Lotto', country: 'Reino Unido', currency: '£',
    extrasFields: ['bonusBalls', 'bonus'] },

  // 🇮🇪 Irlanda
  { slug: 'irish-lotto', api: 'irishLotto', name: 'Irish Lotto', country: 'Irlanda', currency: '€',
    extrasFields: ['bonusBalls', 'bonus'] },

  // 🇪🇺 Europa
  { slug: 'eurojackpot', api: 'euroJackpot', name: 'EuroJackpot', country: 'Europa', currency: '€',
    extrasFields: ['euroNumbers', 'extras'] },
  { slug: 'euromilhoes', api: 'euroMillions', name: 'EuroMilhões', country: 'Europa', currency: '€',
    extrasFields: ['starNumbers', 'stars'] },
  { slug: 'eurodreams', api: 'euroDreams', name: 'EuroDreams', country: 'Europa', currency: '€',
    extrasFields: ['dream', 'extras', 'bonusBalls', 'bonus'] },

  // 🇩🇪 Alemanha — superzahl é número único (0-9)
  { slug: 'german-lotto', api: 'german6aus49', name: 'German Lotto 6aus49', country: 'Alemanha', currency: '€',
    extrasFields: ['superzahl', 'superZahl', 'bonus'] },

  // 🇫🇷 França — chance é número único (1-10)
  { slug: 'france-loto', api: 'frenchLotto', name: 'Loto', country: 'França', currency: '€',
    extrasFields: ['chance', 'bonusBalls', 'bonus'] },

  // 🇨🇭 Suíça — luckyNumber é número único (1-6)
  { slug: 'swiss-lotto', api: 'swissLotto', name: 'Swiss Lotto', country: 'Suíça', currency: 'CHF',
    extrasFields: ['luckyNumber', 'lucky', 'bonus'] },

  // 🇮🇹 Itália — jolly é número único
  { slug: 'superenalotto', api: 'superEnalotto', name: 'SuperEnalotto', country: 'Itália', currency: '€',
    extrasFields: ['jolly', 'bonusBalls'] },

  // 🇦🇹 Áustria — Zusatzzahl é número único
  { slug: 'austria-lotto', api: 'austriaLotto', name: 'Austria Lotto', country: 'Áustria', currency: '€',
    extrasFields: ['Zusatzzahl', 'zusatzzahl', 'bonus'] },

  // 🇵🇱 Polônia — sem extras
  { slug: 'pl-lotto', api: 'polishLotto', name: 'Polish Lotto', country: 'Polônia', currency: 'zł',
    extrasFields: [] },
]

async function fetchLottolandLottery(lot: LottolandConfig): Promise<LotteryResult | null> {
  try {
    const res = await fetch(`https://www.lottoland.com/api/drawings/${lot.api}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      next: { revalidate: 0 },
    })
    if (!res.ok) return null
    const data = await res.json()

    if (!data?.last) return null
    const last = data.last

    // Números principais
    const numbers = (last.numbers || []).map((n: number) => n).sort((a: number, b: number) => a - b)
    if (numbers.length === 0) return null

    // Números extras — tenta cada campo em extrasFields
    // Suporta arrays [4, 5] e valores únicos (42, "7")
    let extras: number[] = []
    for (const field of lot.extrasFields) {
      const val = last[field]
      if (val !== undefined && val !== null) {
        if (Array.isArray(val) && val.length > 0) {
          extras = val.map((n: number) => Number(n))
        } else if (typeof val === 'number') {
          extras = [val]
        } else if (typeof val === 'string' && val.trim() !== '' && !isNaN(Number(val))) {
          extras = [Number(val)]
        }
        if (extras.length > 0) break
      }
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
    if (data.last?.jackpot) {
      let val = parseFloat(String(data.last.jackpot).replace(/,/g, ''))
      if (val < 10000) val = val * 1_000_000
      prize = `${lot.currency} ${fmtNum(val)}`
    }

    return {
      slug: lot.slug,
      name: lot.name,
      country: lot.country,
      numbers,
      extras,
      date,
      prize,
      concurso: '',
    }
  } catch { return null }
}

// ============================================
// BUSCAR TODOS OS RESULTADOS
// ============================================

export async function fetchAllResults(): Promise<LotteryResult[]> {
  const results: LotteryResult[] = []
  const errors: string[] = []

  // 1. Brasileiras (paralelo)
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

  // 3. Internacionais (Lottoland) — 11 loterias confirmadas
  console.log('🌍 Buscando loterias internacionais (Lottoland)...')
  const intPromises = LOTTOLAND_LOTTERIES.map(async (lot) => {
    const result = await withTimeout(fetchLottolandLottery(lot), 15000)
    if (result) {
      results.push(result)
      console.log(`  ✅ ${lot.name}: ${result.date} [${result.numbers}] extras:[${result.extras}] - ${result.prize}`)
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
