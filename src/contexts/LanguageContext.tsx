'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Locale, dictionaries, locales } from '@/i18n'
import type { Translations } from '@/i18n'

interface LanguageContextType {
  locale: Locale
  t: Translations
  setLocale: (locale: Locale) => void
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'pt-BR',
  t: dictionaries['pt-BR'],
  setLocale: () => {},
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('pt-BR')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Load saved language from localStorage
    const saved = localStorage.getItem('locale') as Locale
    if (saved && locales.includes(saved)) {
      setLocaleState(saved)
    } else {
      // Auto-detect from browser
      const browserLang = navigator.language
      if (browserLang.startsWith('es')) {
        setLocaleState('es')
      } else if (browserLang.startsWith('en')) {
        setLocaleState('en')
      }
      // Default: pt-BR
    }
    setMounted(true)
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)
    // Update html lang attribute
    document.documentElement.lang = newLocale === 'pt-BR' ? 'pt-BR' : newLocale
  }

  const t = dictionaries[locale]

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <LanguageContext.Provider value={{ locale: 'pt-BR', t: dictionaries['pt-BR'], setLocale }}>
        {children}
      </LanguageContext.Provider>
    )
  }

  return (
    <LanguageContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider')
  }
  return context
}

export default LanguageContext
