import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase (usar em componentes)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase (usar em API routes)
export function createServerClient() {
  return createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
  )
}

// ============================================
// TIPOS DO BANCO DE DADOS
// ============================================
export interface DbUser {
  id: string
  email: string
  name: string
  balance: number
  created_at: string
}

export interface DbBet {
  id: string
  user_id: string
  lottery_slug: string
  lottery_name: string
  numbers: number[]
  extras: number[]
  amount: number
  status: 'pending' | 'confirmed' | 'won' | 'lost'
  draw_date: string
  prize_amount: number | null
  created_at: string
}

export interface DbResult {
  id: string
  lottery_slug: string
  lottery_name: string
  numbers: number[]
  extras: number[]
  jackpot: string
  draw_date: string
  concurso: string
  created_at: string
}

export interface DbTransaction {
  id: string
  user_id: string
  type: 'deposit' | 'withdrawal' | 'bet' | 'prize'
  amount: number
  description: string
  status: 'pending' | 'completed' | 'failed'
  payment_id: string | null
  created_at: string
}
