// pages/index.js
import Link from 'next/link'
import Layout from '../components/Layout'
import { useCart } from '../context/CartContext'
import Head from 'next/head'
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import FilterSort from '../components/FilterSort'
import Image from 'next/image'

export async function getServerSideProps({ query }) {
  const snapshot = await getDocs(collection(db, "products"));
  let products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  if (query.category && query.category !== 'all') {
    products = products.filter(p => p.category === query.category);
  }

  if (query.sort) {
    switch (query.sort) {
      case 'price_asc': products.sort((a, b) => a.price - b.price); break;
      case 'price_desc': products.sort((a, b) => b.price - a.price); break;
      case 'name_asc': products.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name_desc': products.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'rating_desc': products.sort((a, b) => (b.reviewRating || 0) - (a.reviewRating || 0)); break;
    }
  }

  const categories = [...new Set(snapshot.docs.map(doc => doc.data().category).filter(Boolean))];

  return { props: { products, query, categories } };
}

export default function Home({ products, query, categories }) {
  const { addItem } = useCart()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  // JSON-LD dla produktów
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": products.map((p, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteUrl}/product/${p.id}`
    }))
  }

  return (
    <Layout>
      <Head>
        <title>TechZone – Twój sklep z elektroniką</title>
        <meta name="description" content="TechZone – nowoczesny sklep online z elektroniką. Sprawdź nasze produkty i korzystaj z wygodnych zakupów!" />
        <meta property="og:title" content="TechZone – Twój sklep z elektroniką" />
        <meta property="og:description" content="Sprawdź naszą ofertę produktów elektronicznych online." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:image" content={`${siteUrl}/logo.png`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Head>

      <h1 className="mb-4">Twój sklep z elektroniką</h1>

      <div className="row">
        {/* Sidebar kategorii */}
        <div className="col-md-3 mb-3">
          <FilterSort
            categories={categories}
            currentCategory={query.category || 'all'}
            currentSort={query.sort || ''}
          />
        </div>

        {/* Produkty */}
        <div className="col-md-9">
          <div className="row g-4">
            {products.map(product => (
              <div className="col-sm-6 col-lg-4 col-xl-3" key={product.id}>
                <div className="product-card h-100 shadow-sm rounded overflow-hidden position-relative">
                  <Link href={`/product/${product.id}`} className='text-dark text-decoration-none'>
                    <div className="position-relative" style={{ width: '100%', height: '200px' }}>
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        priority={false}
                      />
                    </div>
                    <div className="product-rating position-absolute top-0 end-0 bg-primary text-white px-2 py-1 rounded-start">
                      {product.reviewRating || 0} ★
                    </div>
                    <div className="product-body p-3">
                      <h2 className="h5 mb-1">{product.name}</h2>
                      <div className="text-muted mb-2">{product.price} zł</div>
                    </div>
                  </Link>
                  <div className="product-hover text-center p-2">
                    <button className="btn btn-sm btn-primary w-100" onClick={() => addItem(product, 1)}>
                      Dodaj do koszyka
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          transition: all 0.2s ease-in-out;
        }
        .product-rating { font-weight: bold; }
      `}</style>
    </Layout>
  )
}
