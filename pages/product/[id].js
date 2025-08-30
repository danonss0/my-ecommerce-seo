// pages/product/[id].js
import Head from 'next/head'
import Layout from '../../components/Layout'
import { useCart } from '../../context/CartContext'
import { doc, getDoc, collection, query, where, addDoc, serverTimestamp, getDocs, updateDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useAuth } from '../../context/AuthContext'
import 'bootstrap-icons/font/bootstrap-icons.css'

export default function ProductPage({ product }) {
  const { addItem } = useCart()
  const { user, firstName } = useAuth()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const [reviews, setReviews] = useState([])
  const [newReview, setNewReview] = useState('')
  const [rating, setRating] = useState(5)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadReviews() }, [])

  async function loadReviews() {
    const q = query(
      collection(db, 'reviews'),
      where('productId', '==', product.id),
    )
    const querySnapshot = await getDocs(q)
    const data = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      // sortowanie po createdAt malejąco (najnowsze pierwsze)
      .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds)
    setReviews(data)
  }

  async function handleAddReview() {
    if (!user) return alert('Musisz być zalogowany, aby dodać opinię.')
    if (newReview.trim() === '') return alert('Napisz coś w treści recenzji.')

    setSaving(true)
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
    setSaving(false)
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

      <div className="container my-5">
        <div className="row g-4">
          {/* Obraz produktu - duży i w pełni widoczny */}
          <div className="col-md-6">
  <div style={{ position: 'relative', width: '100%', height: 500 }}>
    <Image
      src={product.image}
      alt={product.name}
      fill
      style={{ objectFit: 'contain' }}
      priority
    />
  </div>
</div>

          {/* Informacje o produkcie */}
          <div className="col-md-6 d-flex flex-column">
            <div className="card shadow-sm p-4 flex-grow-1 d-flex flex-column">
              <h1>{product.name}</h1>
              <p className="mt-3 flex-grow-1">{product.description}</p>

              <div className="d-flex justify-content-between align-items-center mt-3">
                <p className="fw-bold fs-4 mb-0">{product.price} zł</p>
                <p className="mb-0">⭐ {product.reviewRating} ({product.reviewCount} opinii)</p>
              </div>

              <button
                className="btn btn-primary mt-4 w-100"
                onClick={() => addItem(product, 1)}
              >
                <i className="bi bi-cart-plus me-2"></i> Dodaj do koszyka
              </button>
            </div>
          </div>
        </div>

        {/* Sekcja recenzji */}
        <hr className="my-5" />
        <h3 className="mb-4">Opinie użytkowników</h3>

        {reviews.length === 0 ? (
          <div className="alert alert-info">Brak opinii dla tego produktu.</div>
        ) : (
          <ul className="list-group mb-4">
            {reviews.map(r => (
              <li key={r.id} className="list-group-item shadow-sm mb-2 rounded">
                <div className="d-flex justify-content-between align-items-center">
                  <strong>{r.author}</strong>
                  <span>⭐ {r.rating}</span>
                </div>
                <p className="mb-1">{r.content}</p>
                <small className="text-muted">{r.createdAt?.toDate?.().toLocaleString?.() || ''}</small>
              </li>
            ))}
          </ul>
        )}

        {/* Formularz dodawania opinii */}
        {user ? (
          <div className="card shadow-sm p-4 mb-5">
            <h5>Dodaj opinię</h5>
            <label className="form-label">Ocena:</label>
            <select
              className="form-select mb-3 w-auto"
              value={rating}
              onChange={e => setRating(e.target.value)}
            >
              {[5, 4, 3, 2, 1].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
            <textarea
              className="form-control mb-3"
              placeholder="Napisz swoją opinię..."
              value={newReview}
              onChange={e => setNewReview(e.target.value)}
            />
            <button
              className="btn btn-success"
              onClick={handleAddReview}
              disabled={saving}
            >
              {saving ? "Dodawanie..." : "Dodaj opinię"}
            </button>
          </div>
        ) : (
          <div className="alert alert-warning">
            Aby dodać opinię, musisz być zalogowany.
          </div>
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
    props: { product: { id, ...productData } }
  }
}
