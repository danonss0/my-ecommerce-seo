import Layout from '../components/Layout'
import { useCart } from '../context/CartContext'
import { useAuthState } from 'react-firebase-hooks/auth'
import { db, auth } from '../lib/firebase'
import { addDoc, collection, serverTimestamp, doc, setDoc, getDoc } from 'firebase/firestore'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import 'bootstrap-icons/font/bootstrap-icons.css'

export default function CheckoutPage() {
  const { items, total, clear } = useCart()
  const [user] = useAuthState(auth)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [payment, setPayment] = useState('pobranie')
  const [delivery, setDelivery] = useState('kurier')
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        const userRef = doc(db, "users", user.uid)
        const snap = await getDoc(userRef)
        if (snap.exists()) {
          const data = snap.data()
          setFirstName(data.firstName || '')
          setLastName(data.lastName || '')
          setAddress(data.address || '')
          setCity(data.city || '')
          setPostalCode(data.postalCode || '')
        }
      }
      fetchUserData()
    }
  }, [user])

  const getDeliveryCost = () => {
    if (delivery === 'kurier') return 15.99
    if (delivery === 'paczkomat') return 10.20
    return 0
  }

  const handleOrder = async (e) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)

    const deliveryCost = getDeliveryCost()
    const totalWithDelivery = parseFloat(total) + deliveryCost

    try {
      // zapis danych użytkownika
      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        address,
        city,
        postalCode
      }, { merge: true })

      // zapis zamówienia
      await addDoc(collection(db, "orders"), {
        userId: user.uid,
        firstName,
        lastName,
        items,
        total: totalWithDelivery.toFixed(2),
        status: "oczekujące",
        createdAt: serverTimestamp(),
        delivery,
        payment,
        deliveryCost: deliveryCost.toFixed(2),
        address: { firstName, lastName, address, city, postalCode }
      })

      clear()
      alert("Zamówienie zostało złożone!")
      router.push('/profile')
    } catch (error) {
      console.error("Błąd podczas składania zamówienia:", error)
      alert("Wystąpił błąd przy zapisywaniu zamówienia.")
    }

    setSaving(false)
  }

  return (
    <Layout>
      <div className="container my-5">
  <h1 className="mb-4">Finalizacja zamówienia</h1>

  <form onSubmit={handleOrder}>
    {/* Dane klienta */}
    <div className="card shadow-sm p-4 mb-4">
      <h5 className="mb-3">
        <i className="bi bi-person-lines-fill me-2 text-primary"></i>
        Dane klienta
      </h5>
      <div className="mb-3">
        <label className="form-label">Imię</label>
        <input
          type="text"
          className="form-control"
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Nazwisko</label>
        <input
          type="text"
          className="form-control"
          value={lastName}
          onChange={e => setLastName(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Adres</label>
        <input
          type="text"
          className="form-control"
          value={address}
          onChange={e => setAddress(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Miasto</label>
        <input
          type="text"
          className="form-control"
          value={city}
          onChange={e => setCity(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Kod pocztowy</label>
        <input
          type="text"
          className="form-control"
          value={postalCode}
          onChange={e => setPostalCode(e.target.value)}
          required
        />
      </div>
    </div>

    {/* Płatność i dostawa */}
    <div className="card shadow-sm p-4 mb-4">
      <h5 className="mb-3">
        <i className="bi bi-credit-card-2-front me-2 text-success"></i>
        Płatność i dostawa
      </h5>
      <div className="mb-3">
        <label className="form-label">Metoda płatności</label>
        <select
          className="form-select"
          value={payment}
          onChange={e => setPayment(e.target.value)}
          required
        >
          <option value="pobranie">Płatność przy odbiorze</option>
        </select>
      </div>
      <div className="mb-3">
        <label className="form-label">Dostawa</label>
        <select
          className="form-select"
          value={delivery}
          onChange={e => setDelivery(e.target.value)}
          required
        >
          <option value="kurier">Kurier (15,99 zł)</option>
          <option value="paczkomat">Paczkomat (10,20 zł)</option>
          <option value="odbior-wlasny">Odbiór własny (0 zł)</option>
        </select>
      </div>
    </div>

    {/* Podsumowanie */}
    <div className="card shadow-sm p-4 mb-4">
      <h5 className="mb-3">
        <i className="bi bi-wallet2 me-2 text-info"></i>
        Podsumowanie zamówienia
      </h5>
      <p><strong>Suma produktów:</strong> {total.toFixed(2)} zł</p>
      <p><strong>Koszt dostawy:</strong> {getDeliveryCost().toFixed(2)} zł</p>
      <p className="fw-bold fs-5">Całkowity koszt: {(parseFloat(total) + getDeliveryCost()).toFixed(2)} zł</p>
    </div>

    <button
      type="submit"
      className="btn btn-success btn-lg w-100"
      disabled={saving}
    >
      {saving ? "Składanie zamówienia..." : "Złóż zamówienie"}
    </button>
  </form>
</div>
    </Layout>
  )
}
