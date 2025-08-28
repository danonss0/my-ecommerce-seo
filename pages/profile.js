import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import 'bootstrap-icons/font/bootstrap-icons.css'

export default function ProfilePage() {
  const { user, logout, role, loading, firstName, lastName } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return <Layout><p>Ładowanie...</p></Layout>
  }

  const cardButtonClasses =
    "card shadow-sm p-3 mb-3 d-flex flex-row align-items-center gap-3 hover-scale"

  return (
    <Layout>
      <div className="container my-5">
        <h1 className="mb-4">Twój profil</h1>
        <p className="lead mb-5">
          Witaj <strong>{firstName} {lastName}</strong>!
        </p>

        <div className="d-grid gap-3">
          <div
            className={cardButtonClasses}
            onClick={() => router.push('/address')}
            style={{ cursor: 'pointer' }}
          >
            <i className="bi bi-geo-alt fs-3 text-primary"></i>
            <span className="fs-5">Edytuj dane adresowe</span>
          </div>

          <div
            className={cardButtonClasses}
            onClick={() => router.push('/orders')}
            style={{ cursor: 'pointer' }}
          >
            <i className="bi bi-receipt fs-3 text-success"></i>
            <span className="fs-5">Moje zamówienia</span>
          </div>

          {role === 'admin' && (
            <div
              className={cardButtonClasses}
              onClick={() => router.push('/admin')}
              style={{ cursor: 'pointer' }}
            >
              <i className="bi bi-tools fs-3 text-warning"></i>
              <span className="fs-5">Panel admina</span>
            </div>
          )}

          <div
            className={cardButtonClasses}
            onClick={logout}
            style={{ cursor: 'pointer' }}
          >
            <i className="bi bi-box-arrow-right fs-3 text-danger"></i>
            <span className="fs-5">Wyloguj</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hover-scale {
          transition: all 0.2s ease-in-out;
        }
        .hover-scale:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </Layout>
  )
}
