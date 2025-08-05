// components/Layout.js
import Head from 'next/head'
import Link from 'next/link'
import { useCart } from '../context/CartContext'

export default function Layout({ children }) {
  const { count } = useCart()
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
      </Head>

      <header className="header">
        <div className="container inner">
          <div>
          <Link href="/" style={{ fontWeight: 700, textDecoration: 'none', color: '#111' }}>Mój Sklep</Link>

          </div>
          <nav>
          <Link href="/cart" style={{ textDecoration: 'none', color: '#111' }}>Koszyk ({count})</Link>

          </nav>
        </div>
      </header>

      <main className="container" style={{ paddingTop: 20 }}>
        {children}
      </main>

      <footer className="footer">© {new Date().getFullYear()} Mój Sklep</footer>
    </>
  )
}
