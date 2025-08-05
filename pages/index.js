// pages/index.js
import Link from 'next/link'
import { products } from '../data/products'
import Layout from '../components/Layout'

export async function getStaticProps() {
  return { props: { products } }
}

export default function Home({ products }) {
  return (
    <Layout>
      <h1>Sklep demo</h1>
      <div className="product-grid" style={{ marginTop: 14 }}>
        {products.map(p => (
          <Link key={p.id} href={`/product/${p.id}`} className="card">
            <img src={p.image} alt={p.name} />
            <h3 style={{ marginTop: 8 }}>{p.name}</h3>
            <div className="product-meta">{p.price} zł</div>
          </Link>
        ))}
      </div>
    </Layout>
  )
}
