// context/CartContext.js
import { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [items, setItems] = useState([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('cart')
      if (raw) setItems(JSON.parse(raw))
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(items))
    }
  }, [items])

  const addItem = (product, qty = 1) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.product.id === product.id)
      if (idx > -1) {
        const copy = [...prev]
        copy[idx].quantity += qty
        return copy
      }
      return [...prev, { product, quantity: qty }]
    })
  }

  const removeItem = (productId) => setItems(prev => prev.filter(i => i.product.id !== productId))
  const clear = () => setItems([])
  const total = items.reduce((s, it) => s + it.product.price * it.quantity, 0)
  const count = items.reduce((s, it) => s + it.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clear, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
