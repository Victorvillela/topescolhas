// ============================================
// CLIENTE SUPABASE
// Variáveis de ambiente necessárias:
// NEXT_PUBLIC_SUPABASE_URL
// NEXT_PUBLIC_SUPABASE_ANON_KEY
// SUPABASE_SERVICE_ROLE_KEY (opcional, para server)
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

export default supabase
