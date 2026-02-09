// Busca resultados de loterias de várias fontes
// Brasileiras: api.guidi.dev.br (gratuita, funciona globalmente)
// Americanas: NY Open Data (gratuita)

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
// LOTERIAS BRASILEIRAS - api.guidi.dev.br
// Gratuita, sem limite, funciona fora do BR
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
    const res = await fetch(
      `https://api.guidi.dev.br/loteria/${lot.api}/ultimo`,
      {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 0 },
      }
    )

    if (!res.ok) {
      console.error(`  ❌ ${lot.name}: HTTP ${res.status}`)
      return null
    }

    const data = await res.json()
    return parseBrazilianResult(lot.slug, lot.name, data)
  } catch (err) {
    console.error(`  ❌ ${lot.name}:`, err)
    return null
  }
}

function parseBrazilianResult(slug: string, name: string, data: any): LotteryResult | null {
  try {
    // Dezenas
    let numbers: number[] = []
    if (data.listaDezenas && data.listaDezenas.length > 0) {
      numbers = data.listaDezenas.map((d: string) => parseInt(d))
    } else if (data.dezenasSorteadasOrdemSorteio) {
      numbers = data.dezenasSorteadasOrdemSorteio.map((d: string) => parseInt(d))
    }

    if (numbers.length === 0) return null
    numbers.sort((a, b) => a - b)

    // Concurso
    const concurso = String(data.numero || data.numeroConcurso || '')

    // Data
    let date = ''
    if (data.dataApuracao) {
      const parts = data.dataApuracao.split('/')
      if (parts.length === 3) date = `${parts[2]}-${parts[1]}-${parts[0]}`
    }

    // Prêmio principal
    let prize = 'Acumulou!'
    if (data.listaRateioPremio && data.listaRateioPremio.length > 0) {
      const p = data.listaRateioPremio[0]
      if (p.valorPremio > 0) {
        prize = `R$ ${formatNum(p.valorPremio)}`
      } else if (p.numeroDeGanhadores === 0) {
        prize = 'Acumulou!'
      }
    }

    // Próximo prêmio estimado
    let nextPrize = ''
    if (data.valorEstimadoProximoConcurso) {
      nextPrize = `R$ ${formatNum(data.valorEstimadoProximoConcurso)}`
    } else if (data.valorAcumuladoProximoConcurso) {
      nextPrize = `R$ ${formatNum(data.valorAcumuladoProximoConcurso)}`
    }

    // Data próximo concurso
    let nextDate = ''
    if (data.dataProximoConcurso) {
      const parts = data.dataProximoConcurso.split('/')
      if (parts.length === 3) nextDate = `${parts[2]}-${parts[1]}-${parts[0]}`
    }

    return {
      slug,
      name,
      country: 'Brasil',
      numbers,
      extras: [],
      date,
      prize,
      concurso,
      nextPrize,
      nextDate,
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
// BUSCAR TODOS OS RESULTADOS
// ============================================

export async function fetchAllResults(): Promise<LotteryResult[]> {
  const results: LotteryResult[] = []
  const errors: string[] = []

  // 1. Brasileiras (paralelo com timeout de 15s)
  console.log('🇧🇷 Buscando loterias brasileiras (api.guidi.dev.br)...')
  const brPromises = BR_LOTTERIES.map(async (lot) => {
    try {
      const result = await Promise.race([
        fetchBrazilianLottery(lot),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 15000)),
      ])
      if (result) {
        results.push(result)
        console.log(`  ✅ ${lot.name}: #${result.concurso} - ${result.date} - ${result.prize}`)
      } else {
        errors.push(lot.name)
      }
    } catch {
      errors.push(lot.name)
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

  return null
}

// ============================================
// HELPERS
// ============================================

function formatNum(value: number): string {
  if (!value || isNaN(value)) return '—'
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}
