'use client'
import { create } from 'zustand'
import { supabase, DbUser } from '@/lib/supabase'

interface AuthStore {
  user: DbUser | null
  loading: boolean
  initialize: () => Promise<void>
  login: (email: string, password: string) => Promise<{ error?: string }>
  register: (email: string, password: string, name: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
  refreshBalance: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()((set, get) => ({
  user: null,
  loading: true,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        if (profile) {
          set({ user: profile as DbUser, loading: false })
          return
        }
      }
    } catch (e) { /* */ }
    set({ user: null, loading: false })
  },

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()
      set({ user: profile as DbUser })
    }
    return {}
  },

  register: async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    })
    if (error) return { error: error.message }
    if (data.user) {
      // Aguarda o trigger criar o perfil
      await new Promise(r => setTimeout(r, 1000))
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()
      if (profile) {
        // Atualiza o nome
        await supabase.from('profiles').update({ name }).eq('id', data.user.id)
        set({ user: { ...profile, name } as DbUser })
      }
    }
    return {}
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null })
  },

  refreshBalance: async () => {
    const user = get().user
    if (!user) return
    const { data } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', user.id)
      .single()
    if (data) {
      set({ user: { ...user, balance: data.balance } })
    }
  },
}))
