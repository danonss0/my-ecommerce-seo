// context/CartContext.js
import { createContext, useContext, useEffect, useRef, useState } from 'react'

const CartContext = createContext()

function safeParse(raw) {
  try { return JSON.parse(raw) } catch { return null }
}
const makeId = () => String(Date.now()) + Math.random().toString(36).slice(2,7)

/* Konfiguracja */
const AUTO_HIDE_MS = 8000
const STAGGER_MS = 300
const RECENT_ADD_WINDOW_MS = 800 // jeśli dodano ten sam produkt w ciągu 800ms - zignoruj/aggreguj

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [toasts, setToasts] = useState([])
  const recentAdds = useRef(new Map()) // Map<productId, timestamp>

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('cart')
      const parsed = safeParse(raw)
      if (Array.isArray(parsed)) setItems(parsed)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('cart', JSON.stringify(items)) } catch {}
    }
  }, [items])

  const idStr = id => String(id)

  // dodaj toast ze stable hideAt (zapobiega zmianom harmonogramu)
  const addToast = ({ product, quantity }) => {
    setToasts(prev => {
      const now = Date.now()
      // spróbuj znaleźć istniejący toast dla tego produktu - zaktualizuj ilość i hideAt (opcjonalnie)
      const pid = idStr(product?.id)
      const idx = prev.findIndex(t => idStr(t.product?.id) === pid)
      if (idx > -1) {
        const copy = [...prev]
        const existing = copy[idx]
        copy[idx] = {
          ...existing,
          quantity: (Number(existing.quantity) || 0) + (Number(quantity) || 0),
          // nie zmieniamy hideAt, bo to zapewnia stabilność; ewentualnie możesz odświeżyć hideAt = now + AUTO_HIDE_MS
        }
        // przenieś zaktualizowany toast na początek (najnowszy)
        const [item] = copy.splice(idx, 1)
        return [item, ...copy]
      }
      // tworzymy nowy toast z hideAt zdefiniowanym przy tworzeniu (stabilne)
      const offset = prev.length * STAGGER_MS
      const t = {
        id: makeId(),
        product,
        quantity,
        createdAt: now,
        hideAt: now + AUTO_HIDE_MS + offset
      }
      return [t, ...prev]
    })
  }

  // usuń toast po id
  const removeToast = (toastId) => {
    setToasts(prev => prev.filter(t => t.id !== toastId))
  }

  // GŁÓWNA: dodaj produkt do koszyka (z ochroną przed duplikatami w krótkim oknie)
  const addItem = (product, qty = 1) => {
    const q = Number(qty) || 0
    if (q <= 0) return
    const pid = idStr(product.id)
    const now = Date.now()
    const last = recentAdds.current.get(pid) || 0

    // jeśli ostatnie dodanie tego samego produktu było w ciągu RECENT_ADD_WINDOW_MS -> ignoruj (zabezpieczenie)
    if (now - last < RECENT_ADD_WINDOW_MS) {
      // opcjonalnie: zamiast ignorować, możesz tylko dodać quantity do istniejącego koszyka bez tworzenia nowego toasta
      setItems(prev => prev.map(it => idStr(it.product.id) === pid ? { ...it, quantity: it.quantity + q } : it))
      // Zaktualizuj recentAdds timestamp
      recentAdds.current.set(pid, now)
      return
    }

    // zarejestruj zdarzenie (blok na RECENT_ADD_WINDOW_MS)
    recentAdds.current.set(pid, now)
    // opcjonalnie wyczyść wpis po jakimś czasie
    setTimeout(() => recentAdds.current.delete(pid), RECENT_ADD_WINDOW_MS + 200)

    setItems(prev => {
      const idx = prev.findIndex(i => idStr(i.product.id) === pid)
      let next
      if (idx > -1) {
        next = prev.map((it, i) => i === idx ? { ...it, quantity: it.quantity + q } : it)
      } else {
        next = [...prev, { product, quantity: q }]
      }
      // dodaj toast (w kontekście - addToast zadealuje dedupe/aggregację)
      addToast({ product, quantity: q })
      return next
    })
  }

  const removeItem = (productId) => {
    const pid = idStr(productId)
    setItems(prev => prev.filter(i => idStr(i.product.id) !== pid))
  }

  const updateQuantity = (productId, newQuantity) => {
    const q = Number(newQuantity) || 0
    const pid = idStr(productId)
    if (q <= 0) {
      setItems(prev => prev.filter(i => idStr(i.product.id) !== pid))
      return
    }
    setItems(prev => prev.map(i => idStr(i.product.id) === pid ? { ...i, quantity: q } : i))
  }

  const increaseItem = (productId, amount = 1) => {
    const a = Number(amount) || 1
    if (a <= 0) return
    const pid = idStr(productId)
    setItems(prev => {
      const idx = prev.findIndex(i => idStr(i.product.id) === pid)
      if (idx > -1) return prev.map((it, i) => i === idx ? { ...it, quantity: it.quantity + a } : it)
      return prev
    })
  }

  const decreaseItem = (productId, amount = 1) => {
    const a = Number(amount) || 1
    if (a <= 0) return
    const pid = idStr(productId)
    setItems(prev => {
      const idx = prev.findIndex(i => idStr(i.product.id) === pid)
      if (idx === -1) return prev
      const current = prev[idx].quantity
      const nextQty = current - a
      if (nextQty <= 0) return prev.filter(i => idStr(i.product.id) !== pid)
      return prev.map((it, i) => i === idx ? { ...it, quantity: nextQty } : it)
    })
  }

  const clear = () => setItems([])

  const total = items.reduce((s, it) => s + (Number(it.product.price) || 0) * it.quantity, 0)
  const count = items.reduce((s, it) => s + Number(it.quantity || 0), 0)

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      increaseItem,
      decreaseItem,
      clear,
      total,
      count,
      toasts,
      removeToast,
      addToast
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
