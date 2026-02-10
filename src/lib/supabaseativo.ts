// ============================================
// CLIENTE SUPABASE (lazy — não quebra sem env vars)
// ============================================

import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey

// Cria o cliente apenas se as variáveis existirem
let _supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) return null
  if (!_supabase) {
    _supabase = createClient(supabaseUrl, supabaseAnonKey)
  }
  return _supabase
}

// Proxy que não quebra quando Supabase não está configurado
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabase()
    if (!client) {
      // Retorna funções no-op pra não crashar
      return typeof prop === 'string' ? (..._args: unknown[]) => ({
        data: null,
        error: { message: 'Supabase not configured' },
        select: () => ({ data: null, error: { message: 'Supabase not configured' } }),
      }) : undefined
    }
    return (client as Record<string | symbol, unknown>)[prop]
  },
})

// Cliente server-side
export function createServerClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseServiceKey) return null
  return createClient(supabaseUrl, supabaseServiceKey)
}

// Tipo do usuário no banco
export interface DbUser {
  id: string
  email: string
  name?: string
  avatar_url?: string
  balance?: number
  created_at?: string
  updated_at?: string
}

export default supabase
