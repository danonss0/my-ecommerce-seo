// pages/product/[id].js
import Head from 'next/head'
import Layout from '../../components/Layout'
import { useCart } from '../../context/CartContext'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'

export default function ProductPage({ product }) {
  const { addItem } = useCart()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  if (!product) {
    return (
      <Layout>
        <p>Produkt nie znaleziony</p>
      </Layout>
    )
  }

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: [siteUrl + product.image],
    description: product.description,
    sku: product.id,
    offers: {
      "@type": "Offer",
      priceCurrency: "PLN",
      price: String(product.price),
      availability: "https://schema.org/InStock",
      url: `${siteUrl}/product/${product.id}`
    },
    aggregateRating: product.reviewRating
      ? {
          "@type": "AggregateRating",
          ratingValue: product.reviewRating,
          reviewCount: product.reviewCount
        }
      : undefined
  }

  return (
    <Layout>
      <Head>
        <title>{`${product.name} - TechZone`}</title>
        <meta name="description" content={product.description} />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.description} />
      </Head>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="container my-4">
        <div className="row g-4">
          <div className="col-md-6">
            <img
              src={product.image}
              alt={product.name}
              className="img-fluid rounded"
              style={{ objectFit: 'cover', maxHeight: 400, width: '100%' }}
            />
          </div>
          <div className="col-md-6 d-flex flex-column">
            <h1>{product.name}</h1>
            <p className="mt-3">{product.description}</p>
            <p className="mt-auto fw-bold fs-4">{product.price} zł</p>
            <p className="mt-auto fw-bold fs-4">{product.rating}</p>
            <button
              className="btn btn-primary mt-3"
              onClick={() => addItem(product, 1)}
              aria-label={`Dodaj produkt ${product.name} do koszyka`}
            >
              Dodaj do koszyka
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export async function getServerSideProps({ params }) {
  const { id } = params
  const docRef = doc(db, 'products', id)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    return {
      notFound: true
    }
  }

  const productData = docSnap.data()

  // Jeśli obrazki w Firestore mają pełny URL, to zostaw jak jest, 
  // jeśli to ścieżka lokalna, dodaj 'siteUrl' jak w jsonLd (wtedy trzeba przekazać w props)
  
  const product = {
    id,
    ...productData
  }

  return {
    props: {
      product
    }
  }
}
