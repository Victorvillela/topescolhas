// ============================================
// DADOS DE TODAS AS LOTERIAS
// Apenas loterias com dados reais de API
// ============================================

export interface LotteryConfig {
  slug: string
  name: string
  country: string
  countryCode: string
  flag: string
  emoji: string
  gradient: string
  color: string
  mainNumbers: number
  mainRange: [number, number]
  extraNumbers: number
  extraRange: [number, number]
  extraName: string
  extraColor: 'red' | 'gold' | 'green' | 'blue' | 'purple'
  pricePerBet: number
  currency: string
  drawDays: string[]
  drawTime: string
  timezone: string
  description: string
  howToPlay: string
  jackpotStart: string
  odds: string
  apiName?: string
  isBrazilian: boolean
}

export const LOTTERIES: LotteryConfig[] = [

  // ========================================
  // 🇧🇷 BRASILEIRAS (7) — API: Guidi
  // ========================================
  {
    slug: 'mega-sena',
    name: 'Mega-Sena',
    country: 'Brasil',
    countryCode: 'BR',
    flag: '🇧🇷',
    emoji: '🍀',
    gradient: 'linear-gradient(135deg, #009c3b, #00c74d)',
    color: '#009c3b',
    mainNumbers: 6,
    mainRange: [1, 60],
    extraNumbers: 0,
    extraRange: [0, 0],
    extraName: '',
    extraColor: 'green',
    pricePerBet: 5.00,
    currency: 'BRL',
    drawDays: ['terça', 'quinta', 'sábado'],
    drawTime: '20:00',
    timezone: 'America/Sao_Paulo',
    description: 'A maior loteria do Brasil! Escolha 6 números de 1 a 60.',
    howToPlay: 'Escolha 6 números de 1 a 60. Acerte 4, 5 ou 6 para ganhar.',
    jackpotStart: 'R$ 3.000.000',
    odds: '1 em 50.063.860',
    apiName: 'megasena',
    isBrazilian: true,
  },
  {
    slug: 'lotofacil',
    name: 'Lotofácil',
    country: 'Brasil',
    countryCode: 'BR',
    flag: '🇧🇷',
    emoji: '⭐',
    gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
    color: '#8b5cf6',
    mainNumbers: 15,
    mainRange: [1, 25],
    extraNumbers: 0,
    extraRange: [0, 0],
    extraName: '',
    extraColor: 'green',
    pricePerBet: 3.00,
    currency: 'BRL',
    drawDays: ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
    drawTime: '20:00',
    timezone: 'America/Sao_Paulo',
    description: 'A loteria mais fácil de ganhar! Escolha 15 números de 1 a 25.',
    howToPlay: 'Escolha 15 números de 1 a 25. Ganha com 11 a 15 acertos!',
    jackpotStart: 'R$ 1.700.000',
    odds: '1 em 3.268.760',
    apiName: 'lotofacil',
    isBrazilian: true,
  },
  {
    slug: 'quina',
    name: 'Quina',
    country: 'Brasil',
    countryCode: 'BR',
    flag: '🇧🇷',
    emoji: '🔵',
    gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)',
    color: '#2563eb',
    mainNumbers: 5,
    mainRange: [1, 80],
    extraNumbers: 0,
    extraRange: [0, 0],
    extraName: '',
    extraColor: 'green',
    pricePerBet: 2.50,
    currency: 'BRL',
    drawDays: ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
    drawTime: '20:00',
    timezone: 'America/Sao_Paulo',
    description: 'Sorteios diários! Escolha 5 números de 1 a 80.',
    howToPlay: 'Escolha 5 números de 1 a 80. Prêmios para 2 a 5 acertos.',
    jackpotStart: 'R$ 700.000',
    odds: '1 em 24.040.016',
    apiName: 'quina',
    isBrazilian: true,
  },
  {
    slug: 'lotomania',
    name: 'Lotomania',
    country: 'Brasil',
    countryCode: 'BR',
    flag: '🇧🇷',
    emoji: '🎪',
    gradient: 'linear-gradient(135deg, #f97316, #fb923c)',
    color: '#f97316',
    mainNumbers: 50,
    mainRange: [0, 99],
    extraNumbers: 0,
    extraRange: [0, 0],
    extraName: '',
    extraColor: 'green',
    pricePerBet: 3.00,
    currency: 'BRL',
    drawDays: ['terça', 'sexta'],
    drawTime: '20:00',
    timezone: 'America/Sao_Paulo',
    description: 'Escolha 50 números de 0 a 99!',
    howToPlay: 'Escolha 50 números de 0 a 99. São sorteados 20. Prêmios de 15 a 20 acertos e 0 acertos!',
    jackpotStart: 'R$ 1.000.000',
    odds: '1 em 11.372.635',
    apiName: 'lotomania',
    isBrazilian: true,
  },
  {
    slug: 'timemania',
    name: 'Timemania',
    country: 'Brasil',
    countryCode: 'BR',
    flag: '🇧🇷',
    emoji: '⚽',
    gradient: 'linear-gradient(135deg, #ef4444, #f87171)',
    color: '#ef4444',
    mainNumbers: 10,
    mainRange: [1, 80],
    extraNumbers: 0,
    extraRange: [0, 0],
    extraName: '',
    extraColor: 'green',
    pricePerBet: 3.50,
    currency: 'BRL',
    drawDays: ['terça', 'quinta', 'sábado'],
    drawTime: '20:00',
    timezone: 'America/Sao_Paulo',
    description: 'A loteria do futebol! Escolha 10 números e um time.',
    howToPlay: 'Escolha 10 números de 1 a 80 e um time do coração.',
    jackpotStart: 'R$ 500.000',
    odds: '1 em 26.472.637',
    apiName: 'timemania',
    isBrazilian: true,
  },
  {
    slug: 'dupla-sena',
    name: 'Dupla Sena',
    country: 'Brasil',
    countryCode: 'BR',
    flag: '🇧🇷',
    emoji: '🎲',
    gradient: 'linear-gradient(135deg, #dc2626, #b91c1c)',
    color: '#dc2626',
    mainNumbers: 6,
    mainRange: [1, 50],
    extraNumbers: 0,
    extraRange: [0, 0],
    extraName: '',
    extraColor: 'green',
    pricePerBet: 2.50,
    currency: 'BRL',
    drawDays: ['terça', 'quinta', 'sábado'],
    drawTime: '20:00',
    timezone: 'America/Sao_Paulo',
    description: 'Duas chances de ganhar no mesmo concurso!',
    howToPlay: 'Escolha 6 números de 1 a 50. Dois sorteios por concurso!',
    jackpotStart: 'R$ 500.000',
    odds: '1 em 15.890.700',
    apiName: 'duplasena',
    isBrazilian: true,
  },
  {
    slug: 'dia-de-sorte',
    name: 'Dia de Sorte',
    country: 'Brasil',
    countryCode: 'BR',
    flag: '🇧🇷',
    emoji: '☀️',
    gradient: 'linear-gradient(135deg, #eab308, #facc15)',
    color: '#eab308',
    mainNumbers: 7,
    mainRange: [1, 31],
    extraNumbers: 0,
    extraRange: [0, 0],
    extraName: '',
    extraColor: 'green',
    pricePerBet: 2.50,
    currency: 'BRL',
    drawDays: ['terça', 'quinta', 'sábado'],
    drawTime: '20:00',
    timezone: 'America/Sao_Paulo',
    description: 'Escolha 7 números e um mês da sorte!',
    howToPlay: 'Escolha 7 números de 1 a 31 e um mês da sorte.',
    jackpotStart: 'R$ 300.000',
    odds: '1 em 2.629.575',
    apiName: 'diadesorte',
    isBrazilian: true,
  },

  // ========================================
  // 🇺🇸 ESTADOS UNIDOS (2) — API: NY Open Data
  // ========================================
  {
    slug: 'mega-millions',
    name: 'Mega Millions',
    country: 'E.U.A.',
    countryCode: 'US',
    flag: '🇺🇸',
    emoji: '💰',
    gradient: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
    color: '#1d4ed8',
    mainNumbers: 5,
    mainRange: [1, 70],
    extraNumbers: 1,
    extraRange: [1, 25],
    extraName: 'Mega Ball',
    extraColor: 'gold',
    pricePerBet: 15.00,
    currency: 'BRL',
    drawDays: ['terça', 'sexta'],
    drawTime: '01:00',
    timezone: 'America/New_York',
    description: 'Jackpots recordes de mais de US$ 1 bilhão!',
    howToPlay: 'Escolha 5 números de 1 a 70 e 1 Mega Ball de 1 a 25.',
    jackpotStart: 'US$ 20.000.000',
    odds: '1 em 302.575.350',
    isBrazilian: false,
  },
  {
    slug: 'powerball',
    name: 'Powerball',
    country: 'E.U.A.',
    countryCode: 'US',
    flag: '🇺🇸',
    emoji: '💥',
    gradient: 'linear-gradient(135deg, #dc2626, #ef4444)',
    color: '#dc2626',
    mainNumbers: 5,
    mainRange: [1, 69],
    extraNumbers: 1,
    extraRange: [1, 26],
    extraName: 'Powerball',
    extraColor: 'red',
    pricePerBet: 15.00,
    currency: 'BRL',
    drawDays: ['segunda', 'quarta', 'sábado'],
    drawTime: '00:59',
    timezone: 'America/New_York',
    description: 'A loteria mais famosa do mundo! Jackpots bilionários.',
    howToPlay: 'Escolha 5 números de 1 a 69 e 1 Powerball de 1 a 26.',
    jackpotStart: 'US$ 20.000.000',
    odds: '1 em 292.201.338',
    isBrazilian: false,
  },

  // ========================================
  // 🇪🇺 EUROPA (3) — API: Lottoland
  // ========================================
  {
    slug: 'euromilhoes',
    name: 'EuroMilhões',
    country: 'Europa',
    countryCode: 'EU',
    flag: '🇪🇺',
    emoji: '⭐',
    gradient: 'linear-gradient(135deg, #0369a1, #0ea5e9)',
    color: '#0369a1',
    mainNumbers: 5,
    mainRange: [1, 50],
    extraNumbers: 2,
    extraRange: [1, 12],
    extraName: 'Estrela',
    extraColor: 'gold',
    pricePerBet: 15.00,
    currency: 'BRL',
    drawDays: ['terça', 'sexta'],
    drawTime: '17:00',
    timezone: 'Europe/Lisbon',
    description: 'A maior loteria da Europa! Jogada em 9 países.',
    howToPlay: 'Escolha 5 números de 1 a 50 e 2 Estrelas de 1 a 12.',
    jackpotStart: '€ 17.000.000',
    odds: '1 em 139.838.160',
    apiName: 'euroMillions',
    isBrazilian: false,
  },
  {
    slug: 'eurojackpot',
    name: 'EuroJackpot',
    country: 'Europa',
    countryCode: 'EU',
    flag: '🇪🇺',
    emoji: '🏆',
    gradient: 'linear-gradient(135deg, #b45309, #d97706)',
    color: '#b45309',
    mainNumbers: 5,
    mainRange: [1, 50],
    extraNumbers: 2,
    extraRange: [1, 12],
    extraName: 'Euro Number',
    extraColor: 'gold',
    pricePerBet: 12.00,
    currency: 'BRL',
    drawDays: ['terça', 'sexta'],
    drawTime: '17:00',
    timezone: 'Europe/Berlin',
    description: 'Loteria pan-europeia jogada em 18 países!',
    howToPlay: 'Escolha 5 números de 1 a 50 e 2 Euro Numbers de 1 a 12.',
    jackpotStart: '€ 10.000.000',
    odds: '1 em 139.838.160',
    apiName: 'euroJackpot',
    isBrazilian: false,
  },
  {
    slug: 'eurodreams',
    name: 'EuroDreams',
    country: 'Europa',
    countryCode: 'EU',
    flag: '🇪🇺',
    emoji: '🌙',
    gradient: 'linear-gradient(135deg, #6d28d9, #8b5cf6)',
    color: '#6d28d9',
    mainNumbers: 6,
    mainRange: [1, 40],
    extraNumbers: 1,
    extraRange: [1, 5],
    extraName: 'Dream',
    extraColor: 'purple',
    pricePerBet: 12.00,
    currency: 'BRL',
    drawDays: ['segunda', 'quinta'],
    drawTime: '17:00',
    timezone: 'Europe/Paris',
    description: 'Ganhe € 20.000 por mês durante 30 anos!',
    howToPlay: 'Escolha 6 números de 1 a 40 e 1 Dream de 1 a 5. Prêmio: renda vitalícia!',
    jackpotStart: '€ 20.000/mês',
    odds: '1 em 19.191.900',
    apiName: 'euroDreams',
    isBrazilian: false,
  },

  // ========================================
  // 🇩🇪 ALEMANHA (1) — API: Lottoland
  // ========================================
  {
    slug: 'german-lotto',
    name: 'German Lotto 6aus49',
    country: 'Alemanha',
    countryCode: 'DE',
    flag: '🇩🇪',
    emoji: '🦅',
    gradient: 'linear-gradient(135deg, #dc2626, #fbbf24)',
    color: '#dc2626',
    mainNumbers: 6,
    mainRange: [1, 49],
    extraNumbers: 1,
    extraRange: [0, 9],
    extraName: 'Superzahl',
    extraColor: 'gold',
    pricePerBet: 8.00,
    currency: 'BRL',
    drawDays: ['quarta', 'sábado'],
    drawTime: '14:25',
    timezone: 'Europe/Berlin',
    description: 'A clássica loteria alemã 6 aus 49!',
    howToPlay: 'Escolha 6 números de 1 a 49 e 1 Superzahl de 0 a 9.',
    jackpotStart: '€ 1.000.000',
    odds: '1 em 139.838.160',
    apiName: 'german6aus49',
    isBrazilian: false,
  },

  // ========================================
  // 🇫🇷 FRANÇA (1) — API: Lottoland
  // ========================================
  {
    slug: 'france-loto',
    name: 'Loto',
    country: 'França',
    countryCode: 'FR',
    flag: '🇫🇷',
    emoji: '🗼',
    gradient: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
    color: '#1d4ed8',
    mainNumbers: 5,
    mainRange: [1, 49],
    extraNumbers: 1,
    extraRange: [1, 10],
    extraName: 'Chance',
    extraColor: 'red',
    pricePerBet: 8.00,
    currency: 'BRL',
    drawDays: ['segunda', 'quarta', 'sábado'],
    drawTime: '16:35',
    timezone: 'Europe/Paris',
    description: 'A loteria francesa com jackpots milionários!',
    howToPlay: 'Escolha 5 números de 1 a 49 e 1 número Chance de 1 a 10.',
    jackpotStart: '€ 2.000.000',
    odds: '1 em 19.068.840',
    apiName: 'frenchLotto',
    isBrazilian: false,
  },

  // ========================================
  // 🇨🇭 SUÍÇA (1) — API: Lottoland
  // ========================================
  {
    slug: 'swiss-lotto',
    name: 'Swiss Lotto',
    country: 'Suíça',
    countryCode: 'CH',
    flag: '🇨🇭',
    emoji: '⛰️',
    gradient: 'linear-gradient(135deg, #dc2626, #ef4444)',
    color: '#dc2626',
    mainNumbers: 6,
    mainRange: [1, 42],
    extraNumbers: 1,
    extraRange: [1, 6],
    extraName: 'Lucky Number',
    extraColor: 'gold',
    pricePerBet: 8.00,
    currency: 'BRL',
    drawDays: ['quarta', 'sábado'],
    drawTime: '13:20',
    timezone: 'Europe/Zurich',
    description: 'A loteria nacional da Suíça!',
    howToPlay: 'Escolha 6 números de 1 a 42 e 1 Lucky Number de 1 a 6.',
    jackpotStart: 'CHF 1.500.000',
    odds: '1 em 31.474.716',
    apiName: 'swissLotto',
    isBrazilian: false,
  },

  // ========================================
  // 🇮🇹 ITÁLIA (1) — API: Lottoland
  // ========================================
  {
    slug: 'superenalotto',
    name: 'SuperEnalotto',
    country: 'Itália',
    countryCode: 'IT',
    flag: '🇮🇹',
    emoji: '🍕',
    gradient: 'linear-gradient(135deg, #059669, #10b981)',
    color: '#059669',
    mainNumbers: 6,
    mainRange: [1, 90],
    extraNumbers: 1,
    extraRange: [1, 90],
    extraName: 'Jolly',
    extraColor: 'green',
    pricePerBet: 10.00,
    currency: 'BRL',
    drawDays: ['terça', 'quinta', 'sábado'],
    drawTime: '20:00',
    timezone: 'Europe/Rome',
    description: 'A loteria italiana com os maiores jackpots da Europa!',
    howToPlay: 'Escolha 6 números de 1 a 90. O Jolly é sorteado separadamente.',
    jackpotStart: '€ 2.000.000',
    odds: '1 em 622.614.630',
    apiName: 'superEnalotto',
    isBrazilian: false,
  },

  // ========================================
  // 🇬🇧 REINO UNIDO (1) — API: Lottoland
  // ========================================
  {
    slug: 'uk-lotto',
    name: 'UK Lotto',
    country: 'Reino Unido',
    countryCode: 'GB',
    flag: '🇬🇧',
    emoji: '👑',
    gradient: 'linear-gradient(135deg, #4338ca, #6366f1)',
    color: '#4338ca',
    mainNumbers: 6,
    mainRange: [1, 59],
    extraNumbers: 1,
    extraRange: [1, 59],
    extraName: 'Bonus Ball',
    extraColor: 'blue',
    pricePerBet: 10.00,
    currency: 'BRL',
    drawDays: ['quarta', 'sábado'],
    drawTime: '20:00',
    timezone: 'Europe/London',
    description: 'A clássica loteria britânica!',
    howToPlay: 'Escolha 6 números de 1 a 59. Bonus Ball para prêmio secundário.',
    jackpotStart: '£ 2.000.000',
    odds: '1 em 45.057.474',
    apiName: 'ukLotto',
    isBrazilian: false,
  },

  // ========================================
  // 🇮🇪 IRLANDA (1) — API: Lottoland
  // ========================================
  {
    slug: 'irish-lotto',
    name: 'Irish Lotto',
    country: 'Irlanda',
    countryCode: 'IE',
    flag: '🇮🇪',
    emoji: '☘️',
    gradient: 'linear-gradient(135deg, #059669, #10b981)',
    color: '#059669',
    mainNumbers: 6,
    mainRange: [1, 47],
    extraNumbers: 1,
    extraRange: [1, 47],
    extraName: 'Bonus',
    extraColor: 'green',
    pricePerBet: 8.00,
    currency: 'BRL',
    drawDays: ['quarta', 'sábado'],
    drawTime: '16:00',
    timezone: 'Europe/Dublin',
    description: 'A loteria irlandesa com excelentes chances!',
    howToPlay: 'Escolha 6 números de 1 a 47. 1 Bonus Ball para prêmio extra.',
    jackpotStart: '€ 2.000.000',
    odds: '1 em 10.737.573',
    apiName: 'irishLotto',
    isBrazilian: false,
  },

  // ========================================
  // 🇦🇹 ÁUSTRIA (1) — API: Lottoland
  // ========================================
  {
    slug: 'austria-lotto',
    name: 'Lotto',
    country: 'Áustria',
    countryCode: 'AT',
    flag: '🇦🇹',
    emoji: '🏔️',
    gradient: 'linear-gradient(135deg, #dc2626, #ef4444)',
    color: '#dc2626',
    mainNumbers: 6,
    mainRange: [1, 45],
    extraNumbers: 1,
    extraRange: [1, 45],
    extraName: 'Zusatzzahl',
    extraColor: 'red',
    pricePerBet: 6.00,
    currency: 'BRL',
    drawDays: ['quarta', 'domingo'],
    drawTime: '14:47',
    timezone: 'Europe/Vienna',
    description: 'A loteria clássica da Áustria!',
    howToPlay: 'Escolha 6 números de 1 a 45. Zusatzzahl para prêmio adicional.',
    jackpotStart: '€ 1.000.000',
    odds: '1 em 8.145.060',
    apiName: 'austriaLotto',
    isBrazilian: false,
  },

  // ========================================
  // 🇵🇱 POLÔNIA (1) — API: Lottoland
  // ========================================
  {
    slug: 'pl-lotto',
    name: 'Lotto',
    country: 'Polônia',
    countryCode: 'PL',
    flag: '🇵🇱',
    emoji: '🦅',
    gradient: 'linear-gradient(135deg, #dc2626, #ef4444)',
    color: '#dc2626',
    mainNumbers: 6,
    mainRange: [1, 49],
    extraNumbers: 0,
    extraRange: [0, 0],
    extraName: '',
    extraColor: 'red',
    pricePerBet: 4.00,
    currency: 'BRL',
    drawDays: ['terça', 'quinta', 'sábado'],
    drawTime: '17:50',
    timezone: 'Europe/Warsaw',
    description: 'A loteria polonesa clássica!',
    howToPlay: 'Escolha 6 números de 1 a 49.',
    jackpotStart: 'zł 2.000.000',
    odds: '1 em 13.983.816',
    apiName: 'polishLotto',
    isBrazilian: false,
  },
]

// ========================================
// FUNÇÕES HELPER
// ========================================

export function getLotteryBySlug(slug: string): LotteryConfig | undefined {
  return LOTTERIES.find(l => l.slug === slug)
}

export function getBrazilianLotteries(): LotteryConfig[] {
  return LOTTERIES.filter(l => l.isBrazilian)
}

export function getInternationalLotteries(): LotteryConfig[] {
  return LOTTERIES.filter(l => !l.isBrazilian)
}

export function getLotteriesByCountry(): Record<string, LotteryConfig[]> {
  const grouped: Record<string, LotteryConfig[]> = {}
  LOTTERIES.filter(l => !l.isBrazilian).forEach(l => {
    if (!grouped[l.country]) grouped[l.country] = []
    grouped[l.country].push(l)
  })
  return grouped
}

export function formatCurrency(value: number, currency: string = 'BRL'): string {
  if (currency === 'BRL') return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  if (currency === 'USD') return `US$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  if (currency === 'EUR') return `€ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  if (currency === 'GBP') return `£ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  if (currency === 'CHF') return `CHF ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
}
