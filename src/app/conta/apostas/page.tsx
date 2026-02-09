'use client'
import { useAuthStore } from '@/store/authStore'
import ResultBalls from '@/components/ResultBalls'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { useTranslation } from '@/contexts/LanguageContext'

export default function BetsPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="text-5xl mb-4">🔐</div>
        <Link href="/auth/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold text-sm rounded-xl">
          {t.auth.loginButton}
        </Link>
      </div>
    )
  }

  // Mock bets (in production, fetched from Supabase)
  const bets: any[] = []

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white font-bold text-2xl">{t.bets.title}</h1>
        <Link href="/"
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold rounded-lg">
          <Plus size={14} /> {t.bets.newBet}
        </Link>
      </div>

      {bets.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🎫</div>
          <h2 className="text-white font-bold text-xl mb-2">{t.bets.noBets}</h2>
          <p className="text-dark-400 text-sm mb-6">{t.bets.noBetsDesc}</p>
          <Link href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm rounded-xl">
            <Plus size={16} /> {t.bets.newBet}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Bet cards would go here */}
        </div>
      )}
    </div>
  )
}
