'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/contexts/LanguageContext'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import LanguageSwitcher from './LanguageSwitcher'

export default function Header() {
  const { t } = useTranslation()
  const { items } = useCartStore()
  const { user, logout } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const cartCount = items.length

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: scrolled ? 'rgba(10,14,26,0.95)' : 'rgba(10,14,26,0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        transition: 'all 0.3s',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #facc15, #f97316)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            🎰
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: '14px' }}>Top Escolhas</div>
            <div style={{ color: '#f97316', fontSize: '9px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const }}>
              DA NET
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav
          style={{
            display: 'flex',
            gap: '4px',
            alignItems: 'center',
          }}
          className="desktop-nav"
        >
          <NavLink href="/">{t.header.lotteries}</NavLink>
          <NavLink href="/resultados">{t.header.results}</NavLink>
          <NavLink href="/como-jogar">{t.header.howToPlay}</NavLink>
          {user && <NavLink href="/conta/apostas">{t.header.myBets}</NavLink>}
        </nav>

        {/* Right Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Cart */}
          <Link
            href="/carrinho"
            style={{
              position: 'relative',
              padding: '8px 10px',
              color: '#94a3b8',
              fontSize: '18px',
              textDecoration: 'none',
              borderRadius: '8px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
              e.currentTarget.style.color = '#fff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#94a3b8'
            }}
          >
            🛒
            {cartCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  width: '18px',
                  height: '18px',
                  background: '#f97316',
                  color: '#fff',
                  fontSize: '9px',
                  fontWeight: 700,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {cartCount}
              </span>
            )}
          </Link>

          {/* User / Login */}
          {user ? (
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px 6px 6px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  {user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}>
                    {user?.email?.split(' ')[0] || 'Usuário'}
                  </div>
                  <div style={{ color: '#4ade80', fontSize: '10px', fontWeight: 600 }}>
                    R$ {(0 || 0).toFixed(2).replace('.', ',')}
                  </div>
                </div>
                <span style={{ color: '#475569', fontSize: '8px', marginLeft: '2px' }}>▼</span>
              </button>

              {/* Dropdown Menu */}
              {menuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    background: '#1e293b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
                    zIndex: 1000,
                    minWidth: '200px',
                  }}
                >
                  {/* Balance Header */}
                  <div
                    style={{
                      padding: '14px 16px',
                      background: 'rgba(59,130,246,0.1)',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <div style={{ color: '#64748b', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>
                      {t.header.balance}
                    </div>
                    <div style={{ color: '#4ade80', fontSize: '18px', fontWeight: 800 }}>
                      R$ {(0 || 0).toFixed(2).replace('.', ',')}
                    </div>
                  </div>

                  <MenuLink href="/conta" icon="👤" onClick={() => setMenuOpen(false)}>
                    {t.header.myAccount}
                  </MenuLink>
                  <MenuLink href="/conta/apostas" icon="🎫" onClick={() => setMenuOpen(false)}>
                    {t.header.myBets}
                  </MenuLink>
                  <MenuLink href="/conta/depositar" icon="💰" onClick={() => setMenuOpen(false)}>
                    {t.header.deposit}
                  </MenuLink>

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <button
                      onClick={() => {
                        signOut()
                        setMenuOpen(false)
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        width: '100%',
                        padding: '12px 16px',
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        fontSize: '13px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: 'background 0.15s',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                    >
                      <span>🚪</span>
                      <span>{t.header.logout}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <Link
                href="/auth/login"
                style={{
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#94a3b8',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#fff' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8' }}
              >
                {t.header.login}
              </Link>
              <Link
                href="/auth/registro"
                style={{
                  padding: '8px 18px',
                  fontSize: '12px',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  border: 'none',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.1)' }}
                onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)' }}
              >
                {t.header.register}
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              display: 'none',
              padding: '8px',
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: '20px',
              cursor: 'pointer',
            }}
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div
          style={{
            background: '#0f1629',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            padding: '12px 24px 16px',
          }}
          className="mobile-nav"
        >
          <MobileNavLink href="/" onClick={() => setMobileOpen(false)}>
            🎰 {t.header.lotteries}
          </MobileNavLink>
          <MobileNavLink href="/resultados" onClick={() => setMobileOpen(false)}>
            📊 {t.header.results}
          </MobileNavLink>
          <MobileNavLink href="/como-jogar" onClick={() => setMobileOpen(false)}>
            ❓ {t.header.howToPlay}
          </MobileNavLink>
          {user && (
            <>
              <MobileNavLink href="/conta/apostas" onClick={() => setMobileOpen(false)}>
                🎫 {t.header.myBets}
              </MobileNavLink>
              <MobileNavLink href="/conta" onClick={() => setMobileOpen(false)}>
                👤 {t.header.myAccount}
              </MobileNavLink>
              <MobileNavLink href="/conta/depositar" onClick={() => setMobileOpen(false)}>
                💰 {t.header.deposit}
              </MobileNavLink>
            </>
          )}
        </div>
      )}

      <style jsx global>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
        @media (min-width: 769px) {
          .mobile-nav { display: none !important; }
        }
      `}</style>
    </header>
  )
}

// Nav Link Component
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        padding: '8px 14px',
        fontSize: '13px',
        fontWeight: 500,
        color: '#94a3b8',
        textDecoration: 'none',
        borderRadius: '8px',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = '#fff'
        e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = '#94a3b8'
        e.currentTarget.style.background = 'transparent'
      }}
    >
      {children}
    </Link>
  )
}

// Menu Dropdown Link
function MenuLink({ href, icon, children, onClick }: { href: string; icon: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 16px',
        color: '#e2e8f0',
        fontSize: '13px',
        fontWeight: 500,
        textDecoration: 'none',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
    >
      <span>{icon}</span>
      <span>{children}</span>
    </Link>
  )
}

// Mobile Nav Link
function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: 'block',
        padding: '12px 0',
        color: '#94a3b8',
        fontSize: '14px',
        fontWeight: 500,
        textDecoration: 'none',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {children}
    </Link>
  )
}
