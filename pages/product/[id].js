// pages/product/[id].js
import Head from 'next/head'
import Layout from '../../components/Layout'
import { useCart } from '../../context/CartContext'
import { doc, getDoc, collection, query, where, addDoc, serverTimestamp, getDocs, updateDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext' // zakładam, że masz taki kontekst

export default function ProductPage({ product }) {
  const { addItem } = useCart()
  const { user, firstName } = useAuth()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const [reviews, setReviews] = useState([])
  const [newReview, setNewReview] = useState('')
  const [rating, setRating] = useState(5)

  useEffect(() => {
    loadReviews()
  }, [])

  async function loadReviews() {
    const q = query(collection(db, 'reviews'), where('productId', '==', product.id))
    const querySnapshot = await getDocs(q)
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    setReviews(data)
  }

  async function handleAddReview() {
    if (!user) return alert('Musisz być zalogowany, aby dodać opinię.')

    if (newReview.trim() === '') return alert('Napisz coś w treści recenzji.')

    await addDoc(collection(db, 'reviews'), {
      productId: product.id,
      author: firstName,
      content: newReview,
      rating: Number(rating),
      createdAt: serverTimestamp()
    })

    await updateProductRating()
    setNewReview('')
    setRating(5)
    loadReviews()
  }

  async function updateProductRating() {
    const q = query(collection(db, 'reviews'), where('productId', '==', product.id))
    const querySnapshot = await getDocs(q)
    const ratings = querySnapshot.docs.map(doc => doc.data().rating)
    const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 0

    await updateDoc(doc(db, 'products', product.id), {
      reviewRating: Number(avgRating),
      reviewCount: ratings.length
    })
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

            <p className="mt-2">Średnia ocena: ⭐ {product.reviewRating} ({product.reviewCount} opinii)</p>

            <button
              className="btn btn-primary mt-3"
              onClick={() => addItem(product, 1)}
              aria-label={`Dodaj produkt ${product.name} do koszyka`}
            >
              Dodaj do koszyka
            </button>
          </div>
        </div>

        {/* Sekcja recenzji */}
        <hr className="my-5" />
        <h3>Opinie użytkowników</h3>

        {reviews.length === 0 && <p>Brak opinii dla tego produktu.</p>}
        <ul className="list-group mb-4">
          {reviews.map(r => (
            <li key={r.id} className="list-group-item">
              <strong>{r.author}</strong> — ⭐ {r.rating}
              <p className="mb-1">{r.content}</p>
              <small>{r.createdAt?.toDate?.().toLocaleString?.() || ''}</small>
            </li>
          ))}
        </ul>

        {/* Formularz dodawania opinii */}
        {user ? (
          <div className="card p-3">
            <h5>Dodaj opinię</h5>
            <label>Ocena:</label>
            <select className="form-select mb-2" value={rating} onChange={e => setRating(e.target.value)}>
              {[5, 4, 3, 2, 1].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
            <textarea
              className="form-control mb-2"
              placeholder="Napisz swoją opinię..."
              value={newReview}
              onChange={e => setNewReview(e.target.value)}
            />
            <button className="btn btn-success" onClick={handleAddReview}>
              Dodaj opinię
            </button>
          </div>
        ) : (
          <p>Aby dodać opinię, musisz być zalogowany.</p>
        )}
      </div>
    </Layout>
  )
}

export async function getServerSideProps({ params }) {
  const { id } = params
  const docRef = doc(db, 'products', id)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    return { notFound: true }
  }

  const productData = docSnap.data()

  return {
    props: {
      product: {
        id,
        ...productData
      }
    }
  }
}
