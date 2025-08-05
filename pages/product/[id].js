// pages/product/[id].js
import Head from 'next/head'
import Layout from '../../components/Layout'
import { products } from '../../data/products'
import { useCart } from '../../context/CartContext'

export async function getStaticPaths() {
  const paths = products.map(p => ({ params: { id: p.id } }))
  return { paths, fallback: false }
}

export async function getStaticProps({ params }) {
  const product = products.find(p => p.id === params.id)
  if (!product) return { notFound: true }
  return { props: { product } }
}

export default function ProductPage({ product }) {
  const { addItem } = useCart()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

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
        <title>{`${product.name} - Mój Sklep`}</title>
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
