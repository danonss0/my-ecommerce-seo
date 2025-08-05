// pages/index.js
import Link from 'next/link'
import { products } from '../data/products'
import Layout from '../components/Layout'
import { useCart } from '../context/CartContext'
import Head from 'next/head'

export async function getStaticProps() {
  return { props: { products } }
}

export default function Home({ products }) {
  const { addItem } = useCart()

  return (
    <Layout>
      <Head>
        <title>Sklep demo</title>
      </Head>

      <h1 className="mb-4">Sklep demo</h1>
      <div className="row g-4">
        {products.map(product => (
          <div className="col-sm-6 col-md-4 col-lg-3" key={product.id}>
            <div className="product-card h-100">
              <Link href={`/product/${product.id}`}>
                <img src={product.image} alt={product.name} />
              </Link>
              <div className="product-body">
                <h5 className="mb-1">{product.name}</h5>
                <div className="text-muted mb-2">{product.price} zł</div>
              </div>
              <div className="product-hover">
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => addItem(product, 1)}
                >
                  Dodaj do koszyka
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}
