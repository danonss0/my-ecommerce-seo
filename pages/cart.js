// pages/cart.js
import Layout from '../components/Layout'
import { useCart } from '../context/CartContext'
import Link from 'next/link'

export default function CartPage() {
  const { items, removeItem, clear, total } = useCart()

  return (
    <Layout>
      <h1>Koszyk</h1>
      {items.length === 0 ? (
        <div>
          <p>Koszyk jest pusty.</p>
          <Link href="/">Powrót do sklepu</Link>

        </div>
      ) : (
        <div>
          <ul>
            {items.map(it => (
              <li key={it.product.id} style={{ marginBottom: 12 }}>
                <strong>{it.product.name}</strong> — {it.quantity} × {it.product.price} zł
                <button style={{ marginLeft: 10 }} onClick={() => removeItem(it.product.id)}>Usuń</button>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 12 }}>
            <strong>Razem: {total} zł</strong>
          </div>
          <div style={{ marginTop: 12 }}>
            <button className="btn" onClick={() => alert('Symulacja zamówienia — brak płatności w tej wersji')}>Zamawiam</button>
            <button style={{ marginLeft: 8 }} onClick={clear}>Wyczyść koszyk</button>
          </div>
        </div>
      )}
    </Layout>
  )
}
