import { create } from 'zustand'
import { persist } from 'zustand/middleware'

function matchesCartItem(i: CartItem, id: string, size?: string, variantId?: string) {
  if (i.id !== id) return false

  if (variantId) {
    return i.variantId === variantId
  }

  if (size) {
    return i.size === size && !i.variantId
  }

  return !i.variantId && !i.size
}

// Define what a "Product" looks like in your cart
export interface CartItem {
  id: string
  name: string
  price: number // Store in cents (e.g., $10.00 = 1000) to avoid math errors
  quantity: number
  image?: string
  // For your specific app: is this a kit or a service?
  type: 'kit' | 'service' 
  slug: string
  size?: string
  variantId?: string
  metadata?: Record<string, unknown>
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
  openCart: () => void
  closeCart: () => void
  addItem: (item: CartItem) => void
  removeItem: (id: string, size?: string, variantId?: string) => void
  updateQuantity: (id: string, quantity: number, size?: string, variantId?: string) => void
  clearCart: () => void
  // Computed values
  totalPrice: () => number
}

// Create the store with persistence (saves to localStorage automatically)
export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      
      addItem: (newItem) => set((state) => {
        // Uniqueness check: Match ID AND (VariantID OR Size)
        // If variantId is present, match on that. If not, match on size.
        const existingItem = state.items.find((i) =>
          matchesCartItem(i, newItem.id, newItem.size, newItem.variantId)
        )

        if (existingItem) {
          // If item exists, just bump quantity
          return {
            items: state.items.map((i) =>
              i === existingItem ? { ...i, quantity: i.quantity + newItem.quantity } : i
            ),
            isOpen: true
          }
        }
        return { 
            items: [...state.items, { ...newItem }],
            isOpen: true
        }
      }),

      removeItem: (id, size, variantId) => set((state) => ({
        items: state.items.filter((i) => !matchesCartItem(i, id, size, variantId)),
      })),

      updateQuantity: (id, quantity, size, variantId) => set((state) => {
        if (quantity <= 0) {
            return {
            items: state.items.filter((i) => !matchesCartItem(i, id, size, variantId))
            }
        }
        return {
            items: state.items.map((i) => {
            const match = matchesCartItem(i, id, size, variantId)
                return match ? { ...i, quantity } : i;
            }),
        }
      }),

      clearCart: () => set({ items: [] }),

      totalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      }
    }),
    {
      name: 'hoodie-cart-storage', // unique name for localStorage
      partialize: (state) => ({ items: state.items }), // Only persist items, not isOpen state
      onRehydrateStorage: (state) => {
        return () => {
          state?.setHasHydrated(true)
        }
      }
    }
  )
)
