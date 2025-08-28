import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { db } from '../lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import 'bootstrap-icons/font/bootstrap-icons.css'

export default function AddressPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
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
    }
    fetchUserData()
  }, [user])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    try {
      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        address,
        city,
        postalCode
      }, { merge: true })
      alert("Dane zostały zapisane ✅")
      router.push('/profile')
    } catch (error) {
      console.error("Błąd zapisu:", error)
      alert("Nie udało się zapisać danych.")
    }
    setSaving(false)
  }

  if (loading) {
    return <Layout><p>Ładowanie...</p></Layout>
  }

  return (
    <Layout>
      <div className="container my-5">
        <h1 className="mb-4">Edytuj dane użytkownika</h1>
        <div className="shadow-sm p-4">
          <form onSubmit={handleSave} className="d-grid gap-3">
            <div className="input-group align-items-center">
              <span className="input-group-text bg-primary text-white">
                <i className="bi bi-person-fill"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Imię"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>

            <div className="input-group align-items-center">
              <span className="input-group-text bg-primary text-white">
                <i className="bi bi-person-badge-fill"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Nazwisko"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            <div className="input-group align-items-center">
              <span className="input-group-text bg-success text-white">
                <i className="bi bi-geo-alt-fill"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Adres"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="input-group align-items-center">
              <span className="input-group-text bg-success text-white">
                <i className="bi bi-building"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Miasto"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>

            <div className="input-group align-items-center">
              <span className="input-group-text bg-warning text-white">
                <i className="bi bi-mailbox2"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Kod pocztowy"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                required
              />
            </div>

            <div className="d-flex gap-2 mt-3">
              <button type="submit" className="btn btn-primary flex-grow-1" disabled={saving}>
                {saving ? "Zapisywanie..." : "Zapisz dane"}
              </button>
              <button 
                type="button" 
                className="btn btn-outline-secondary flex-grow-1"
                onClick={() => router.push('/profile')}
              >
                Anuluj
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .input-group-text {
          min-width: 50px;
          justify-content: center;
          font-size: 1.2rem;
        }
        .card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
      `}</style>
    </Layout>
  )
}
