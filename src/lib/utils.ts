// ============================================
// UTILITÁRIOS
// ============================================

const DAY_MAP: Record<string, number> = {
  'domingo': 0,
  'segunda': 1,
  'terça': 2,
  'quarta': 3,
  'quinta': 4,
  'sexta': 5,
  'sábado': 6,
}

/**
 * Calcula a data do próximo sorteio com base nos dias da semana
 */
export function getNextDraw(drawDays: string[], drawTime: string, timezone?: string): Date {
  const now = new Date()
  const [hours, minutes] = (drawTime || '20:00').split(':').map(Number)

  const targetDays = drawDays
    .map(d => DAY_MAP[d.toLowerCase()])
    .filter(d => d !== undefined)
    .sort((a, b) => a - b)

  if (targetDays.length === 0) {
    // Fallback: próximo dia às 20:00
    const next = new Date(now)
    next.setDate(next.getDate() + 1)
    next.setHours(hours, minutes, 0, 0)
    return next
  }

  const currentDay = now.getDay()
  const currentTime = now.getHours() * 60 + now.getMinutes()
  const drawMinutes = hours * 60 + minutes

  // Procura o próximo dia de sorteio
  for (const day of targetDays) {
    if (day > currentDay || (day === currentDay && currentTime < drawMinutes)) {
      const diff = day - currentDay
      const next = new Date(now)
      next.setDate(next.getDate() + diff)
      next.setHours(hours, minutes, 0, 0)
      return next
    }
  }

  // Se passou de todos os dias desta semana, pega o primeiro da próxima
  const firstDay = targetDays[0]
  const diff = 7 - currentDay + firstDay
  const next = new Date(now)
  next.setDate(next.getDate() + diff)
  next.setHours(hours, minutes, 0, 0)
  return next
}

/**
 * Retorna o countdown formatado (dias, horas, minutos, segundos)
 */
export function getCountdown(targetDate: Date): {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
  formatted: string
} {
  const now = new Date()
  const diff = targetDate.getTime() - now.getTime()

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0, formatted: '00:00:00' }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  const pad = (n: number) => String(n).padStart(2, '0')

  let formatted = ''
  if (days > 0) {
    formatted = `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  } else {
    formatted = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  }

  return { days, hours, minutes, seconds, total: diff, formatted }
}

/**
 * Formata moeda
 */
export function formatCurrency(value: number, currency: string = 'BRL'): string {
  const symbols: Record<string, string> = {
    BRL: 'R$',
    USD: 'US$',
    EUR: '€',
    GBP: '£',
    AUD: 'A$',
    CAD: 'C$',
  }
  const symbol = symbols[currency] || currency
  return `${symbol} ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
}

/**
 * Classe utilitária para merge de classNames (similar ao clsx)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
