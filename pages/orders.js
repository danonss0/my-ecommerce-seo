import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { db } from '../lib/firebase'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import Link from 'next/link'
import 'bootstrap-icons/font/bootstrap-icons.css'

export default function OrdersPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return
      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        )
        const querySnapshot = await getDocs(q)
        const userOrders = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        setOrders(userOrders)
      } catch (error) {
        console.error("Błąd przy pobieraniu zamówień:", error)
      } finally {
        setLoadingOrders(false)
      }
    }
    fetchOrders()
  }, [user])

  if (loading) {
    return <Layout><p>Ładowanie...</p></Layout>
  }

  const statusClass = (status) => {
  switch (status) {
    case "Oczekujące":
      return "bg-secondary"; // czerwone
    case "W realizacji":
      return "bg-primary"; // niebieskie
    case "Zrealizowane":
      return "bg-success"; // zielone
    default:
      return "bg-secondary"; // szare dla nieznanego statusu
  }
}


  return (
    <Layout>
      <div className="container my-5">
        <h1 className="mb-4">Moje zamówienia</h1>

        {loadingOrders ? (
          <p>Ładowanie zamówień...</p>
        ) : orders.length === 0 ? (
          <div className="alert alert-info">Nie masz jeszcze żadnych zamówień.</div>
        ) : (
          <div className="d-grid gap-3">
            {orders.map(order => (
              <Link 
                key={order.id} 
                href={`/orders/${order.id}`} 
                className="card p-3 shadow-sm text-decoration-none text-dark hover-scale"
              >
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-1">
                    <i className="bi bi-receipt me-2 text-primary"></i>
                    Zamówienie #{order.id}
                  </h5>
                  <span className={`badge fs-6 ${statusClass(order.status)}`}>{order.status}</span>

                </div>
                <p className="mb-1">Łączna kwota: <strong>{order.total} zł</strong></p>
                <small className="text-muted">
                  Data: {order.createdAt?.seconds 
                    ? new Date(order.createdAt.seconds * 1000).toLocaleString() 
                    : "brak"}
                </small>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .hover-scale {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .hover-scale:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
      `}</style>
    </Layout>
  )
}
