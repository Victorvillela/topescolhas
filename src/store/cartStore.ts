'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  lotterySlug: string
  lotteryName: string
  lotteryEmoji: string
  lotteryGradient: string
  numbers: number[]
  extras: number[]
  extraName: string
  price: number
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  clearCart: () => void
  getTotal: () => number
  getCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const id = `${item.lotterySlug}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        set((state) => ({
          items: [...state.items, { ...item, id }],
        }))
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => get().items.reduce((sum, item) => sum + item.price, 0),

      getCount: () => get().items.length,
    }),
    {
      name: 'topescolhas-cart',
    }
  )
)
