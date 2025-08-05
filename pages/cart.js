// pages/cart.js
import Layout from '../components/Layout'
import { useCart } from '../context/CartContext'
import Link from 'next/link'
import Head from 'next/head'

export default function CartPage() {
  const { items, increaseItem, decreaseItem, clear, total } = useCart()

  
  return (
    <Layout>
      <Head>
        <title>Koszyk – Mój Sklep</title>
      </Head>

      <div className="container my-4">
        <h1>Koszyk</h1>

        {items.length === 0 ? (
          <div className="alert alert-info">
            Koszyk jest pusty.{' '}
            <Link href="/" className="alert-link">
              Powrót do sklepu
            </Link>
          </div>
        ) : (
          <>
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Produkt</th>
                  <th className="text-center">Ilość</th>
                  <th>Cena / szt.</th>
                  <th>Łącznie</th>
                </tr>
              </thead>
              <tbody>
                {items.map(({ product, quantity }) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td className="text-center">
                      <div className="btn-group" role="group" aria-label="Zmiana ilości">
                        <button
                          className="btn btn-danger btn-sm "
                          onClick={() => decreaseItem(product.id, 1)}
                        >
                          −
                        </button>
                        <span className="px-3">{quantity}</span>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => increaseItem(product.id, 1)}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>{product.price} zł</td>
                    <td>{(product.price * quantity).toFixed(2)} zł</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="d-flex justify-content-between align-items-center mt-3">
              <strong>Razem: {total.toFixed(2)} zł</strong>
              <div>
                <button
                  className="btn btn-success me-2"
                  onClick={() => alert('Symulacja zamówienia — brak płatności w tej wersji')}
                >
                  Zamawiam
                </button>
                <button className="btn btn-outline-secondary" onClick={clear}>
                  Wyczyść koszyk
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
