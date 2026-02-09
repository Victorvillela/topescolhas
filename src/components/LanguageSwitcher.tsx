'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslation } from '@/contexts/LanguageContext'
import { locales, localeNames, localeFlags, Locale } from '@/i18n'

export default function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Current Language Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          color: '#e2e8f0',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s',
          fontFamily: 'inherit',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
        }}
      >
        <span style={{ fontSize: '14px' }}>{localeFlags[locale]}</span>
        <span>{locale === 'pt-BR' ? 'PT' : locale.toUpperCase()}</span>
        <span style={{ fontSize: '8px', color: '#64748b' }}>▼</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            background: '#1e293b',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
            zIndex: 1000,
            minWidth: '160px',
            animation: 'fadeIn 0.15s ease',
          }}
        >
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => {
                setLocale(loc)
                setIsOpen(false)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '10px 14px',
                background: locale === loc ? 'rgba(59,130,246,0.1)' : 'transparent',
                border: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                color: locale === loc ? '#60a5fa' : '#e2e8f0',
                fontSize: '13px',
                fontWeight: locale === loc ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s',
                fontFamily: 'inherit',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                if (locale !== loc) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                }
              }}
              onMouseLeave={(e) => {
                if (locale !== loc) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <span style={{ fontSize: '16px' }}>{localeFlags[loc]}</span>
              <span>{localeNames[loc]}</span>
              {locale === loc && (
                <span style={{ marginLeft: 'auto', fontSize: '11px' }}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
