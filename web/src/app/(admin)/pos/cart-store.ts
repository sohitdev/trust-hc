import { create } from 'zustand'
import { Database } from '@/types/database.types'

type Product = Database['public']['Tables']['products']['Row']

export interface CartItem {
  product: Product
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (product) => {
    const currentItems = get().items
    const existingItem = currentItems.find((item) => item.product.id === product.id)
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock_quantity) return // Can't add more than stock
      set({
        items: currentItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      })
    } else {
      if (product.stock_quantity <= 0) return
      set({ items: [...currentItems, { product, quantity: 1 }] })
    }
  },
  removeItem: (productId) => {
    set({ items: get().items.filter((item) => item.product.id !== productId) })
  },
  updateQuantity: (productId, quantity) => {
    set({
      items: get().items.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      ),
    })
  },
  clearCart: () => set({ items: [] }),
  getTotal: () => {
    return get().items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    )
  },
}))
