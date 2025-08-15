import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

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

  return (
    <Layout>
      <h1>Twój profil</h1>
      <p>Witaj {firstName} {lastName}!</p>

      <button 
          className="btn btn-warning mt-3"
          onClick={logout}
        >
          Wyloguj
        </button>

      {/* Przycisk do panelu admina - tylko jeśli rola = 'admin' */}
      {role === 'admin' && (
        <button 
          className="btn btn-warning mt-3"
          onClick={() => router.push('/admin')}
        >
          Panel admina
        </button>
      )}
    </Layout>
  )
}
