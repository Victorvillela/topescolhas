// Busca resultados de loterias de várias fontes
// Brasileiras: API da Caixa (gratuita)
// Internacionais: APIs públicas + fallback

export interface LotteryResult {
  slug: string
  name: string
  country: string
  numbers: number[]
  extras: number[]
  date: string           // ISO date
  prize: string
  concurso: string
  nextPrize?: string
  nextDate?: string
}

// ============================================
// LOTERIAS BRASILEIRAS - API da Caixa
// ============================================

const CAIXA_LOTTERIES = [
  { slug: 'mega-sena', api: 'megasena', name: 'Mega-Sena', country: 'Brasil' },
  { slug: 'lotofacil', api: 'lotofacil', name: 'Lotofácil', country: 'Brasil' },
  { slug: 'quina', api: 'quina', name: 'Quina', country: 'Brasil' },
  { slug: 'lotomania', api: 'lotomania', name: 'Lotomania', country: 'Brasil' },
  { slug: 'timemania', api: 'timemania', name: 'Timemania', country: 'Brasil' },
  { slug: 'dupla-sena', api: 'duplasena', name: 'Dupla Sena', country: 'Brasil' },
  { slug: 'dia-de-sorte', api: 'diadesorte', name: 'Dia de Sorte', country: 'Brasil' },
]

async function fetchCaixaLottery(apiName: string): Promise<any> {
  try {
    const res = await fetch(
      `https://servicebus2.caixa.gov.br/portaldeloterias/api/${apiName}/`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0',
        },
        next: { revalidate: 0 },
      }
    )
    if (!res.ok) throw new Error(`Caixa API ${apiName}: ${res.status}`)
    return await res.json()
  } catch (err) {
    console.error(`Erro ao buscar ${apiName}:`, err)
    return null
  }
}

function parseCaixaResult(slug: string, name: string, country: string, data: any): LotteryResult | null {
  if (!data) return null

  try {
    // A API da Caixa retorna formatos ligeiramente diferentes
    let numbers: number[] = []
    let extras: number[] = []
    let date = ''
    let prize = ''
    let concurso = ''
    let nextPrize = ''
    let nextDate = ''

    // Número do concurso
    concurso = String(data.numero || data.numeroConcurso || '')

    // Data do sorteio
    if (data.dataApuracao) {
      // Formato: "dd/mm/yyyy"
      const parts = data.dataApuracao.split('/')
      if (parts.length === 3) {
        date = `${parts[2]}-${parts[1]}-${parts[0]}`
      }
    }

    // Dezenas sorteadas
    if (data.listaDezenas) {
      numbers = data.listaDezenas.map((d: string) => parseInt(d))
    } else if (data.dezenasSorteadasOrdemSorteio) {
      numbers = data.dezenasSorteadasOrdemSorteio.map((d: string) => parseInt(d))
    }

    // Prêmio principal
    if (data.listaRateioPremio && data.listaRateioPremio.length > 0) {
      const mainPrize = data.listaRateioPremio[0]
      if (mainPrize.valorPremio > 0) {
        prize = `R$ ${formatBRL(mainPrize.valorPremio)}`
      } else {
        prize = 'Acumulou!'
      }
    }

    // Valor acumulado / próximo prêmio
    if (data.valorAcumuladoProximoConcurso) {
      nextPrize = `R$ ${formatBRL(data.valorAcumuladoProximoConcurso)}`
    } else if (data.valorEstimadoProximoConcurso) {
      nextPrize = `R$ ${formatBRL(data.valorEstimadoProximoConcurso)}`
    }

    // Data do próximo concurso
    if (data.dataProximoConcurso) {
      const parts = data.dataProximoConcurso.split('/')
      if (parts.length === 3) {
        nextDate = `${parts[2]}-${parts[1]}-${parts[0]}`
      }
    }

    // Casos especiais
    if (slug === 'dupla-sena' && data.listaDezenasSegundoSorteio) {
      // Dupla Sena tem 2 sorteios, usamos o primeiro
    }

    if (slug === 'dia-de-sorte' && data.nomeTimeCoracaoMesSorte) {
      // Mês da sorte é um extra especial
    }

    if (numbers.length === 0) return null

    numbers.sort((a, b) => a - b)

    return {
      slug,
      name,
      country,
      numbers,
      extras,
      date,
      prize: prize || 'Acumulou!',
      concurso,
      nextPrize,
      nextDate,
    }
  } catch (err) {
    console.error(`Erro ao parsear ${slug}:`, err)
    return null
  }
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

// ============================================
// LOTERIAS INTERNACIONAIS
// ============================================

// Powerball & Mega Millions - powerball.com / megamillions.com
async function fetchUSLotteries(): Promise<LotteryResult[]> {
  const results: LotteryResult[] = []

  // Powerball - via API pública
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
        const mainNums = nums.slice(0, 5).sort((a: number, b: number) => a - b)
        const powerball = nums[5] ? [nums[5]] : []

        results.push({
          slug: 'powerball',
          name: 'Powerball',
          country: 'E.U.A.',
          numbers: mainNums,
          extras: powerball,
          date: d.draw_date?.split('T')[0] || '',
          prize: d.multiplier ? `US$ ${d.multiplier}x` : 'US$ —',
          concurso: '',
        })
      }
    }
  } catch (err) {
    console.error('Erro Powerball:', err)
  }

  // Mega Millions - via API pública
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
        const mainNums = nums.slice(0, 5).sort((a: number, b: number) => a - b)
        const megaBall = nums[5] ? [nums[5]] : []

        results.push({
          slug: 'mega-millions',
          name: 'Mega Millions',
          country: 'E.U.A.',
          numbers: mainNums,
          extras: megaBall,
          date: d.draw_date?.split('T')[0] || '',
          prize: d.multiplier ? `US$ ${d.multiplier}x` : 'US$ —',
          concurso: '',
        })
      }
    }
  } catch (err) {
    console.error('Erro Mega Millions:', err)
  }

  return results
}

// EuroMillions, EuroJackpot, etc. - via API pública
async function fetchEuropeanLotteries(): Promise<LotteryResult[]> {
  const results: LotteryResult[] = []

  // EuroMillions
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
          numbers: data.numbers || [],
          extras: data.stars || data.luckyStars || [],
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
// BUSCAR TODOS OS RESULTADOS
// ============================================

export async function fetchAllResults(): Promise<LotteryResult[]> {
  const results: LotteryResult[] = []
  const errors: string[] = []

  // 1. Loterias Brasileiras (paralelo)
  console.log('🇧🇷 Buscando loterias brasileiras...')
  const caixaPromises = CAIXA_LOTTERIES.map(async (lot) => {
    const data = await fetchCaixaLottery(lot.api)
    const result = parseCaixaResult(lot.slug, lot.name, lot.country, data)
    if (result) {
      results.push(result)
      console.log(`  ✅ ${lot.name}: concurso ${result.concurso}`)
    } else {
      errors.push(lot.name)
      console.log(`  ❌ ${lot.name}: sem dados`)
    }
  })
  await Promise.all(caixaPromises)

  // 2. Loterias Americanas
  console.log('🇺🇸 Buscando loterias americanas...')
  try {
    const usResults = await fetchUSLotteries()
    results.push(...usResults)
    usResults.forEach(r => console.log(`  ✅ ${r.name}: ${r.date}`))
  } catch (err) {
    console.error('  ❌ Erro loterias US:', err)
  }

  // 3. Loterias Europeias
  console.log('🇪🇺 Buscando loterias europeias...')
  try {
    const euResults = await fetchEuropeanLotteries()
    results.push(...euResults)
    euResults.forEach(r => console.log(`  ✅ ${r.name}: ${r.date}`))
  } catch (err) {
    console.error('  ❌ Erro loterias EU:', err)
  }

  console.log(`\n📊 Total: ${results.length} resultados obtidos`)
  if (errors.length > 0) {
    console.log(`⚠️ Falhas: ${errors.join(', ')}`)
  }

  return results
}

// ============================================
// BUSCAR RESULTADO ESPECÍFICO
// ============================================

export async function fetchResultBySlug(slug: string): Promise<LotteryResult | null> {
  const caixaLot = CAIXA_LOTTERIES.find(l => l.slug === slug)
  if (caixaLot) {
    const data = await fetchCaixaLottery(caixaLot.api)
    return parseCaixaResult(caixaLot.slug, caixaLot.name, caixaLot.country, data)
  }

  if (slug === 'powerball' || slug === 'mega-millions') {
    const usResults = await fetchUSLotteries()
    return usResults.find(r => r.slug === slug) || null
  }

  if (slug === 'euromilhoes') {
    const euResults = await fetchEuropeanLotteries()
    return euResults.find(r => r.slug === slug) || null
  }

  return null
}
