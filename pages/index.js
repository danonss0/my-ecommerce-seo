import Link from 'next/link'
import Layout from '../components/Layout'
import { useCart } from '../context/CartContext'
import Head from 'next/head'
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import FilterSort from '../components/FilterSort'

export async function getServerSideProps({ query }) {
  const snapshot = await getDocs(collection(db, "products"));
  let products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Filtrowanie po kategorii
  if (query.category && query.category !== 'all') {
    products = products.filter(p => p.category === query.category);
  }

  // Sortowanie
  if (query.sort) {
    switch (query.sort) {
      case 'price_asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'name_asc':
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        products.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'rating_desc':
        products.sort((a, b) => (b.reviewRating || 0) - (a.reviewRating || 0));
        break;
    }
  }

  // Pobranie unikalnych kategorii
  const categories = [...new Set(snapshot.docs.map(doc => doc.data().category).filter(Boolean))];

  return { props: { products, query, categories } };
}

export default function Home({ products, query, categories }) {
  const { addItem } = useCart()

  return (
    <Layout>
      <Head>
        <title>Sklep demo</title>
      </Head>

      <h1 className="mb-4">Sklep demo</h1>

      {/* Kategorie i sortowanie */}
      <FilterSort categories={categories} currentCategory={query.category || 'all'} currentSort={query.sort || ''} />

      {/* Lista produktów */}
      <div className="row g-4 mt-3">
        {products.map(product => (
          <div className="col-sm-6 col-md-4 col-lg-3" key={product.id}>
            <div className="product-card h-100">
              <Link href={`/product/${product.id}`} className='text-dark text-decoration-none'>
                <img src={product.image} alt={product.name} className="img-fluid rounded-top" />

                <div className="product-rating">{product.reviewRating} ★</div>

                <div className="product-body">
                  <h5 className="mb-1">{product.name}</h5>
                  <div className="text-muted mb-2">{product.price} zł</div>
                </div>
              </Link>
              <div className="product-hover text-center">
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
