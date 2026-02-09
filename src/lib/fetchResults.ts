// Busca resultados de loterias de várias fontes
// Brasileiras: APIs alternativas (funciona fora do BR)
// Internacionais: APIs públicas

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
// LOTERIAS BRASILEIRAS
// ============================================

const CAIXA_LOTTERIES = [
  { slug: 'mega-sena', api: 'mega-sena', name: 'Mega-Sena', country: 'Brasil' },
  { slug: 'lotofacil', api: 'lotofacil', name: 'Lotofácil', country: 'Brasil' },
  { slug: 'quina', api: 'quina', name: 'Quina', country: 'Brasil' },
  { slug: 'lotomania', api: 'lotomania', name: 'Lotomania', country: 'Brasil' },
  { slug: 'timemania', api: 'timemania', name: 'Timemania', country: 'Brasil' },
  { slug: 'dupla-sena', api: 'dupla-sena', name: 'Dupla Sena', country: 'Brasil' },
  { slug: 'dia-de-sorte', api: 'dia-de-sorte', name: 'Dia de Sorte', country: 'Brasil' },
]

// Fonte 1: loteriascaixa.com (funciona globalmente)
async function fetchFromLoteriascaixa(apiName: string): Promise<any> {
  try {
    const res = await fetch(
      `https://loteriascaixa.com/api/v2/${apiName}/latest`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        next: { revalidate: 0 },
      }
    )
    if (res.ok) return await res.json()
  } catch (err) {
    // silencioso
  }
  return null
}

// Fonte 2: servicebus2.caixa.gov.br (pode não funcionar fora do BR)
async function fetchFromCaixaDirecta(apiName: string): Promise<any> {
  const apiMap: Record<string, string> = {
    'mega-sena': 'megasena',
    'lotofacil': 'lotofacil',
    'quina': 'quina',
    'lotomania': 'lotomania',
    'timemania': 'timemania',
    'dupla-sena': 'duplasena',
    'dia-de-sorte': 'diadesorte',
  }
  try {
    const res = await fetch(
      `https://servicebus2.caixa.gov.br/portaldeloterias/api/${apiMap[apiName]}/`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://loterias.caixa.gov.br/',
          'Origin': 'https://loterias.caixa.gov.br',
        },
        next: { revalidate: 0 },
      }
    )
    if (res.ok) return await res.json()
  } catch (err) {
    // silencioso
  }
  return null
}

// Fonte 3: API aberta do GitHub (loteriascaixa-api)
async function fetchFromGithubAPI(apiName: string): Promise<any> {
  try {
    const res = await fetch(
      `https://loteriascaixa-api.herokuapp.com/api/${apiName}/latest`,
      {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 0 },
      }
    )
    if (res.ok) return await res.json()
  } catch (err) {
    // silencioso
  }
  return null
}

// Tenta múltiplas fontes
async function fetchBrazilianLottery(lot: typeof CAIXA_LOTTERIES[0]): Promise<LotteryResult | null> {
  // Tenta fonte 1
  let data = await fetchFromLoteriascaixa(lot.api)

  // Tenta fonte 2
  if (!data) {
    data = await fetchFromCaixaDirecta(lot.api)
  }

  // Tenta fonte 3
  if (!data) {
    data = await fetchFromGithubAPI(lot.api)
  }

  if (!data) return null

  return parseBrazilianResult(lot.slug, lot.name, data)
}

function parseBrazilianResult(slug: string, name: string, data: any): LotteryResult | null {
  try {
    let numbers: number[] = []
    let extras: number[] = []
    let date = ''
    let prize = ''
    let concurso = ''
    let nextPrize = ''

    // Concurso
    concurso = String(data.numero || data.numeroConcurso || data.concurso || '')

    // Data - aceita vários formatos
    if (data.dataApuracao) {
      date = parseDateBR(data.dataApuracao)
    } else if (data.data) {
      date = parseDateBR(data.data)
    } else if (data.date) {
      date = data.date
    }

    // Dezenas
    if (data.listaDezenas) {
      numbers = data.listaDezenas.map((d: string) => parseInt(d))
    } else if (data.dezenas) {
      numbers = (Array.isArray(data.dezenas) ? data.dezenas : []).map((d: any) => parseInt(String(d)))
    } else if (data.dezenasSorteadasOrdemSorteio) {
      numbers = data.dezenasSorteadasOrdemSorteio.map((d: string) => parseInt(d))
    }

    // Prêmio
    if (data.listaRateioPremio && data.listaRateioPremio.length > 0) {
      const p = data.listaRateioPremio[0]
      prize = p.valorPremio > 0 ? `R$ ${formatNum(p.valorPremio)}` : 'Acumulou!'
    } else if (data.valorAcumulado !== undefined) {
      prize = data.valorAcumulado > 0 ? `R$ ${formatNum(data.valorAcumulado)}` : 'R$ —'
    } else if (data.premiacoes && data.premiacoes.length > 0) {
      const p = data.premiacoes[0]
      prize = p.premio ? `R$ ${formatNum(p.premio)}` : 'Acumulou!'
    }

    // Próximo
    if (data.valorAcumuladoProximoConcurso) {
      nextPrize = `R$ ${formatNum(data.valorAcumuladoProximoConcurso)}`
    } else if (data.valorEstimadoProximoConcurso) {
      nextPrize = `R$ ${formatNum(data.valorEstimadoProximoConcurso)}`
    }

    if (numbers.length === 0) return null
    numbers.sort((a, b) => a - b)

    return {
      slug,
      name,
      country: 'Brasil',
      numbers,
      extras,
      date,
      prize: prize || '—',
      concurso,
      nextPrize,
    }
  } catch (err) {
    console.error(`Erro parse ${slug}:`, err)
    return null
  }
}

// ============================================
// LOTERIAS AMERICANAS - NY Open Data (gratuita)
// ============================================

async function fetchUSLotteries(): Promise<LotteryResult[]> {
  const results: LotteryResult[] = []

  // Powerball
  try {
    const res = await fetch(
      'https://data.ny.gov/resource/d6yy-54nr.json?$order=draw_date%20DESC&$limit=1',
      { next: { revalidate: 0 } }
    )
    if (res.ok) {
      const data = await res.json()
      if (data.length > 0) {
        const d = data[0]
        const nums = d.winning_numbers.split(' ').map((n: string) => parseInt(n))
        results.push({
          slug: 'powerball',
          name: 'Powerball',
          country: 'E.U.A.',
          numbers: nums.slice(0, 5).sort((a: number, b: number) => a - b),
          extras: nums[5] ? [nums[5]] : [],
          date: d.draw_date?.split('T')[0] || '',
          prize: `US$ ${d.multiplier || '—'}`,
          concurso: '',
        })
      }
    }
  } catch (err) {
    console.error('Erro Powerball:', err)
  }

  // Mega Millions
  try {
    const res = await fetch(
      'https://data.ny.gov/resource/5xaw-6ayf.json?$order=draw_date%20DESC&$limit=1',
      { next: { revalidate: 0 } }
    )
    if (res.ok) {
      const data = await res.json()
      if (data.length > 0) {
        const d = data[0]
        const nums = d.winning_numbers.split(' ').map((n: string) => parseInt(n))
        results.push({
          slug: 'mega-millions',
          name: 'Mega Millions',
          country: 'E.U.A.',
          numbers: nums.slice(0, 5).sort((a: number, b: number) => a - b),
          extras: nums[5] ? [nums[5]] : [],
          date: d.draw_date?.split('T')[0] || '',
          prize: `US$ ${d.multiplier || '—'}`,
          concurso: '',
        })
      }
    }
  } catch (err) {
    console.error('Erro Mega Millions:', err)
  }

  return results
}

// ============================================
// LOTERIAS EUROPEIAS
// ============================================

async function fetchEuropeanLotteries(): Promise<LotteryResult[]> {
  const results: LotteryResult[] = []

  // EuroMillions - via API
  try {
    const res = await fetch(
      'https://www.euro-millions.com/api/result',
      {
        headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' },
        next: { revalidate: 0 },
      }
    )
    if (res.ok) {
      const data = await res.json()
      if (data && data.numbers) {
        results.push({
          slug: 'euromilhoes',
          name: 'EuroMilhões',
          country: 'Europa',
          numbers: (data.numbers || []).map((n: any) => parseInt(n)),
          extras: (data.stars || data.luckyStars || []).map((n: any) => parseInt(n)),
          date: data.date || '',
          prize: data.jackpot || '€ —',
          concurso: '',
        })
      }
    }
  } catch (err) {
    console.error('Erro EuroMillions:', err)
  }

  return results
}

// ============================================
// BUSCAR TODOS
// ============================================

export async function fetchAllResults(): Promise<LotteryResult[]> {
  const results: LotteryResult[] = []
  const errors: string[] = []

  // 1. Brasileiras (paralelo com timeout)
  console.log('🇧🇷 Buscando loterias brasileiras...')
  const brPromises = CAIXA_LOTTERIES.map(async (lot) => {
    try {
      const result = await Promise.race([
        fetchBrazilianLottery(lot),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 10000)), // 10s timeout
      ])
      if (result) {
        results.push(result)
        console.log(`  ✅ ${lot.name}: #${result.concurso}`)
      } else {
        errors.push(lot.name)
        console.log(`  ❌ ${lot.name}: sem dados`)
      }
    } catch (err) {
      errors.push(lot.name)
      console.log(`  ❌ ${lot.name}: erro`)
    }
  })
  await Promise.all(brPromises)

  // 2. Americanas
  console.log('🇺🇸 Buscando loterias americanas...')
  try {
    const usResults = await fetchUSLotteries()
    results.push(...usResults)
    usResults.forEach(r => console.log(`  ✅ ${r.name}: ${r.date}`))
  } catch (err) {
    console.error('  ❌ Erro US:', err)
  }

  // 3. Europeias
  console.log('🇪🇺 Buscando loterias europeias...')
  try {
    const euResults = await fetchEuropeanLotteries()
    results.push(...euResults)
    euResults.forEach(r => console.log(`  ✅ ${r.name}: ${r.date}`))
  } catch (err) {
    console.error('  ❌ Erro EU:', err)
  }

  console.log(`\n📊 Total: ${results.length} resultados`)
  if (errors.length > 0) console.log(`⚠️ Falhas: ${errors.join(', ')}`)

  return results
}

// ============================================
// BUSCAR ESPECÍFICO
// ============================================

export async function fetchResultBySlug(slug: string): Promise<LotteryResult | null> {
  const caixaLot = CAIXA_LOTTERIES.find(l => l.slug === slug)
  if (caixaLot) return fetchBrazilianLottery(caixaLot)

  if (slug === 'powerball' || slug === 'mega-millions') {
    const us = await fetchUSLotteries()
    return us.find(r => r.slug === slug) || null
  }

  if (slug === 'euromilhoes') {
    const eu = await fetchEuropeanLotteries()
    return eu.find(r => r.slug === slug) || null
  }

  return null
}

// ============================================
// HELPERS
// ============================================

function parseDateBR(dateStr: string): string {
  if (!dateStr) return ''
  // "dd/mm/yyyy" → "yyyy-mm-dd"
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/')
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`
  }
  // Já no formato ISO
  if (dateStr.includes('-')) return dateStr.split('T')[0]
  return dateStr
}

function formatNum(value: number): string {
  if (!value || isNaN(value)) return '—'
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}
