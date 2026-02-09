import ptBR from './pt-BR'
import en from './en'
import es from './es'
import type { Translations } from './pt-BR'

export type Locale = 'pt-BR' | 'en' | 'es'

export const locales: Locale[] = ['pt-BR', 'en', 'es']

export const dictionaries: Record<Locale, Translations> = {
  'pt-BR': ptBR,
  'en': en,
  'es': es,
}

export const localeNames: Record<Locale, string> = {
  'pt-BR': 'Português',
  'en': 'English',
  'es': 'Español',
}

export const localeFlags: Record<Locale, string> = {
  'pt-BR': '🇧🇷',
  'en': '🇺🇸',
  'es': '🇪🇸',
}

export function getDictionary(locale: Locale): Translations {
  return dictionaries[locale] || dictionaries['pt-BR']
}

export type { Translations }
export default dictionaries
