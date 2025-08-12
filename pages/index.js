// pages/index.js
import Link from 'next/link'

import Layout from '../components/Layout'
import { useCart } from '../context/CartContext'
import Head from 'next/head'
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

export async function getServerSideProps() {
  const snapshot = await getDocs(collection(db, "products"));
  const products = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  return { props: { products } };
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
