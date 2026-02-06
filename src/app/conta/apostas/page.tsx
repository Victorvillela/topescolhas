'use client'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { LOTTERIES } from '@/lib/lotteries'
import ResultBalls from '@/components/ResultBalls'
import Link from 'next/link'
import { Ticket, Clock, CheckCircle, XCircle } from 'lucide-react'

interface Bet {
  id: string; lottery_slug: string; lottery_name: string; numbers: number[]; extras: number[];
  amount: number; status: string; draw_date: string; prize_amount: number; created_at: string;
}

export default function MyBetsPage() {
  const { user, loading } = useAuthStore()
  const router = useRouter()
  const [bets, setBets] = useState<Bet[]>([])
  const [loadingBets, setLoadingBets] = useState(true)

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    const fetchBets = async () => {
      const { data } = await supabase
        .from('bets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)
      setBets((data as Bet[]) || [])
      setLoadingBets(false)
    }
    fetchBets()
  }, [user])

  if (loading || !user) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const statusConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
    pending: { icon: <Clock size={14} />, label: 'Pendente', color: 'text-yellow-400 bg-yellow-400/10' },
    confirmed: { icon: <CheckCircle size={14} />, label: 'Confirmada', color: 'text-blue-400 bg-blue-400/10' },
    won: { icon: <CheckCircle size={14} />, label: 'Premiada!', color: 'text-green-400 bg-green-400/10' },
    lost: { icon: <XCircle size={14} />, label: 'Não premiada', color: 'text-dark-500 bg-dark-500/10' },
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white font-bold text-2xl flex items-center gap-2"><Ticket size={24} /> Minhas Apostas</h1>
          <p className="text-dark-400 text-sm">{bets.length} aposta{bets.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/"
          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold rounded-lg">
          + Nova Aposta
        </Link>
      </div>

      {loadingBets ? (
        <div className="text-center py-12 text-dark-400">Carregando...</div>
      ) : bets.length === 0 ? (
        <div className="text-center py-16 bg-dark-900/50 border border-white/5 rounded-2xl">
          <div className="text-5xl mb-4">🎯</div>
          <h2 className="text-white font-bold text-lg mb-2">Nenhuma aposta ainda</h2>
          <p className="text-dark-400 text-sm mb-4">Escolha uma loteria e faça sua primeira aposta!</p>
          <Link href="/" className="inline-flex px-6 py-3 bg-brand-500 text-white font-bold text-sm rounded-xl">
            Ver Loterias
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bets.map(bet => {
            const lot = LOTTERIES.find(l => l.slug === bet.lottery_slug)
            const status = statusConfig[bet.status] || statusConfig.pending
            return (
              <div key={bet.id} className="bg-dark-900/50 border border-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                      style={{ background: lot?.gradient || '#64748b' }}>
                      {lot?.emoji || '🎯'}
                    </div>
                    <div>
                      <div className="text-white font-semibold text-sm">{bet.lottery_name}</div>
                      <div className="text-dark-500 text-[10px]">
                        {new Date(bet.created_at).toLocaleDateString('pt-BR')} •
                        R$ {bet.amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${status.color}`}>
                    {status.icon} {status.label}
                  </span>
                </div>
                <ResultBalls numbers={bet.numbers} extras={bet.extras} extraColor={lot?.extraColor || 'green'} size="sm" />
                {bet.status === 'won' && bet.prize_amount > 0 && (
                  <div className="mt-2 text-green-400 text-sm font-bold">
                    🎉 Prêmio: R$ {bet.prize_amount.toFixed(2)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
