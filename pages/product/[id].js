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
    image: [ siteUrl + product.image ],
    description: product.description,
    sku: product.id,
    offers: {
      "@type": "Offer",
      priceCurrency: "PLN",
      price: String(product.price),
      availability: "https://schema.org/InStock",
      url: `${siteUrl}/product/${product.id}`
    },
    aggregateRating: product.reviewRating ? {
      "@type": "AggregateRating",
      ratingValue: product.reviewRating,
      reviewCount: product.reviewCount
    } : undefined
  }

  return (
    <Layout>
      <Head>
        <title>{product.name} — Mój Sklep</title>
        <meta name="description" content={product.description} />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.description} />
      </Head>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ flex: 1 }}>
          <img src={product.image} alt={product.name} style={{ width: '100%', borderRadius: 6 }} />
        </div>
        <div style={{ flex: 1 }}>
          <h1>{product.name}</h1>
          <p style={{ marginTop: 10 }}>{product.description}</p>
          <p style={{ marginTop: 10, fontWeight: 700 }}>{product.price} zł</p>
          <button className="btn" style={{ marginTop: 12 }} onClick={() => addItem(product, 1)}>Dodaj do koszyka</button>
        </div>
      </div>
    </Layout>
  )
}
