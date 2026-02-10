// ============================================
// CLIENTE SUPABASE
// ============================================

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente server-side com service role key (para webhooks, cron, etc.)
export function createServerClient() {
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
