// pages/cart.js
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { useCart } from '../context/CartContext'
import Link from 'next/link'
import Head from 'next/head'
import { auth } from '../lib/firebase'
import { useAuthState } from 'react-firebase-hooks/auth'
import 'bootstrap-icons/font/bootstrap-icons.css'

export default function CartPage() {
  const { items, increaseItem, decreaseItem, clear, total } = useCart()
  const [user] = useAuthState(auth)
  const router = useRouter()

  const goToCheckout = () => {
    if (!user) {
      alert('Musisz być zalogowany, aby złożyć zamówienie!')
      return
    }
    router.push('/checkout')
  }

  return (
    <Layout>
      <Head><title>Koszyk – TechZone</title></Head>
      <div className="container my-5">
        <h1 className="mb-4">
          <i className="bi bi-bag text-primary me-2"></i>
          Twój koszyk
        </h1>

        {items.length === 0 ? (
          <div className="alert alert-info shadow-sm">
            Koszyk jest pusty.{' '}
            <Link href="/" className="alert-link">Powrót do sklepu</Link>
          </div>
        ) : (
          <>
            <div className="card shadow-sm mb-4">
              <div className="card-body p-0">
                {/* RESPONSYWNA TABELA */}
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
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
                          <td className="fw-medium">{product.name}</td>
                          <td className="text-center">
                            <div className="btn-group" role="group">
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => decreaseItem(product.id, 1)}
                              >
                                <i className="bi bi-dash"></i>
                              </button>
                              <span className="px-3 fw-bold">{quantity}</span>
                              <button
                                className="btn btn-outline-success btn-sm"
                                onClick={() => increaseItem(product.id, 1)}
                              >
                                <i className="bi bi-plus"></i>
                              </button>
                            </div>
                          </td>
                          <td>{product.price} zł</td>
                          <td className="fw-bold">{(product.price * quantity).toFixed(2)} zł</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="card shadow-sm p-4">
              <h5 className="mb-3">
                <i className="bi bi-wallet2 me-2 text-info"></i>
                Podsumowanie
              </h5>
              <p className="fs-5">
                <strong>Razem:</strong> {total.toFixed(2)} zł
              </p>
              <div className="d-flex flex-column flex-sm-row justify-content-between gap-2">
                <button className="btn btn-outline-secondary" onClick={clear}>
                  <i className="bi bi-trash3 me-2"></i>Wyczyść koszyk
                </button>
                <button className="btn btn-success" onClick={goToCheckout}>
                  <i className="bi bi-box-arrow-right me-2"></i>Zamawiam
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
