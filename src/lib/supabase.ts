// ============================================
// CLIENTE SUPABASE (desativado por enquanto)
// Usa URL placeholder pra nunca crashar.
// Quando quiser ativar, configure as env vars no Vercel.
// ============================================

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function createServerClient() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

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
