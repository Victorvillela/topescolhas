'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { ShoppingCart, User, Menu, X, LogOut, Ticket, Wallet, ChevronDown } from 'lucide-react'

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const cartCount = useCartStore(s => s.getCount())
  const { user, initialize, logout } = useAuthStore()

  useEffect(() => {
    setMounted(true)
    initialize()
  }, [initialize])

  const navLinks = [
    { href: '/', label: '🎰 Loterias' },
    { href: '/resultados', label: '📊 Resultados' },
    { href: '/como-jogar', label: '❓ Como Jogar' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-dark-950/95 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-lg">🎰</div>
          <div className="leading-tight">
            <div className="text-white font-extrabold text-sm tracking-tight">Top Escolhas</div>
            <div className="text-orange-400 text-[10px] font-bold tracking-widest uppercase">DA NET</div>
          </div>
        </Link>

        {/* Nav Desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href}
              className="px-4 py-2 text-sm font-medium text-dark-300 hover:text-white transition-colors rounded-lg hover:bg-white/5">
              {link.label}
            </Link>
          ))}
          {user && (
            <Link href="/conta/apostas"
              className="px-4 py-2 text-sm font-medium text-dark-300 hover:text-white transition-colors rounded-lg hover:bg-white/5">
              🎫 Minhas Apostas
            </Link>
          )}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Cart */}
          <Link href="/carrinho"
            className="relative p-2.5 rounded-lg text-dark-300 hover:text-white hover:bg-white/5 transition-colors">
            <ShoppingCart size={20} />
            {mounted && cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User */}
          {user ? (
            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold">
                  {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs text-white font-medium leading-tight">{user.name || 'Minha Conta'}</div>
                  <div className="text-[10px] text-green-400 font-semibold">R$ {Number(user.balance).toFixed(2)}</div>
                </div>
                <ChevronDown size={14} className="text-dark-400" />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-52 bg-dark-900 border border-white/10 rounded-xl shadow-2xl z-50 py-2">
                    <Link href="/conta" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-300 hover:text-white hover:bg-white/5">
                      <User size={16} /> Minha Conta
                    </Link>
                    <Link href="/conta/apostas" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-300 hover:text-white hover:bg-white/5">
                      <Ticket size={16} /> Minhas Apostas
                    </Link>
                    <Link href="/conta/depositar" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-300 hover:text-white hover:bg-white/5">
                      <Wallet size={16} /> Depositar
                    </Link>
                    <hr className="border-white/5 my-1" />
                    <button onClick={() => { logout(); setUserMenuOpen(false) }}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 w-full">
                      <LogOut size={16} /> Sair
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link href="/auth/login"
              className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-400 hover:to-orange-500 transition-all shadow-lg shadow-orange-500/20">
              Entrar
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-dark-300 hover:text-white">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav className="md:hidden bg-dark-950 border-t border-white/5 py-3 px-4 flex flex-col gap-1">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
              className="px-4 py-3 text-sm font-medium text-dark-300 hover:text-white rounded-lg hover:bg-white/5">
              {link.label}
            </Link>
          ))}
          {user && (
            <>
              <Link href="/conta/apostas" onClick={() => setMobileOpen(false)}
                className="px-4 py-3 text-sm font-medium text-dark-300 hover:text-white rounded-lg hover:bg-white/5">
                🎫 Minhas Apostas
              </Link>
              <Link href="/conta" onClick={() => setMobileOpen(false)}
                className="px-4 py-3 text-sm font-medium text-dark-300 hover:text-white rounded-lg hover:bg-white/5">
                👤 Minha Conta
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  )
}
