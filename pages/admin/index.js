// pages/admin/index.js
import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { db } from '../../lib/firebase'
import { collection, doc, setDoc, getDocs, deleteDoc, updateDoc } from 'firebase/firestore'

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
}

export default function AdminPage() {
  const [mode, setMode] = useState(null) // null | 'add' | 'edit'
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)

  // Formularz
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [category, setCategory] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [status, setStatus] = useState(null)

  // Pobieranie produktów
  const fetchProducts = async () => {
    setLoadingProducts(true)
    const snapshot = await getDocs(collection(db, 'products'))
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    setProducts(data)
    setLoadingProducts(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // Dodawanie lub edycja produktu
  const handleSubmit = async e => {
    e.preventDefault()
    setStatus('loading')
    try {
      if (!name || !price || !category) throw new Error('Nazwa, cena i kategoria są wymagane')
      const slug = slugify(name)

      if (mode === 'add') {
        await setDoc(doc(db, 'products', slug), {
          name,
          price: parseFloat(price),
          description,
          image,
          category,
          rating: 0,
          reviewsCount: 0,
        })
      } else if (mode === 'edit' && editingId) {
        await updateDoc(doc(db, 'products', editingId), {
          name,
          price: parseFloat(price),
          description,
          image,
          category,
        })
      }

      setStatus('success')
      setName('')
      setPrice('')
      setDescription('')
      setImage('')
      setCategory('')
      setEditingId(null)
      fetchProducts()
    } catch (error) {
      setStatus('error')
      console.error(error)
    }
  }

  const handleEdit = product => {
    setMode('edit')
    setEditingId(product.id)
    setName(product.name)
    setPrice(product.price)
    setDescription(product.description)
    setImage(product.image)
    setCategory(product.category)
  }

  const handleDelete = async id => {
    if (!confirm('Czy na pewno chcesz usunąć ten produkt?')) return
    await deleteDoc(doc(db, 'products', id))
    fetchProducts()
  }

  return (
    <Layout>
      <h1>Panel admina</h1>

      <div className="mb-4">
        <button className="btn btn-primary me-2" onClick={() => setMode('add')}>
          Dodaj produkt
        </button>
        <button className="btn btn-secondary" onClick={() => setMode('edit')}>
          Edytuj produkty
        </button>
      </div>

      {/* Formularz */}
      {(mode === 'add' || mode === 'edit') && (
        <form onSubmit={handleSubmit} style={{ maxWidth: 500 }}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Nazwa produktu *</label>
            <input
              type="text"
              id="name"
              className="form-control"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="Np. Sony Xperia 10"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="price" className="form-label">Cena (zł) *</label>
            <input
              type="number"
              id="price"
              className="form-control"
              value={price}
              onChange={e => setPrice(e.target.value)}
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="category" className="form-label">Kategoria *</label>
            <input
              type="text"
              id="category"
              className="form-control"
              value={category}
              onChange={e => setCategory(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label">Opis</label>
            <textarea
              id="description"
              className="form-control"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="image" className="form-label">URL zdjęcia</label>
            <input
              type="text"
              id="image"
              className="form-control"
              value={image}
              onChange={e => setImage(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-success" disabled={status === 'loading'}>
            {status === 'loading' ? 'Zapisuję...' : mode === 'add' ? 'Dodaj produkt' : 'Zapisz zmiany'}
          </button>

          {status === 'success' && <div className="alert alert-success mt-3">Zapisano pomyślnie!</div>}
          {status === 'error' && <div className="alert alert-danger mt-3">Wystąpił błąd!</div>}
        </form>
      )}

      {/* Lista produktów do edycji */}
      {mode === 'edit' && !loadingProducts && (
        <div className="mt-5">
          <h3>Produkty:</h3>
          {products.length === 0 && <p>Brak produktów w bazie</p>}
          {products.map(product => (
            <div key={product.id} className="border p-2 mb-2 d-flex justify-content-between align-items-center">
              <div>
                <strong>{product.name}</strong> - {product.price} zł - {product.category}
              </div>
              <div>
                <button className="btn btn-sm btn-primary me-2" onClick={() => handleEdit(product)}>Edytuj</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(product.id)}>Usuń</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {mode === 'edit' && loadingProducts && <p>Ładowanie produktów...</p>}
    </Layout>
  )
}
