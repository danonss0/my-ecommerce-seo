import Layout from '../../components/Layout'
import { useAuth } from '../../context/AuthContext'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { db } from '../../lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import 'bootstrap-icons/font/bootstrap-icons.css'

export default function OrderDetails() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const { id } = router.query
    const [order, setOrder] = useState(null)
    const [loadingOrder, setLoadingOrder] = useState(true)

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login')
        }
    }, [user, loading, router])

    useEffect(() => {
        const fetchOrder = async () => {
            if (!id) return
            try {
                const ref = doc(db, "orders", id)
                const snap = await getDoc(ref)
                if (snap.exists()) {
                    setOrder({ id: snap.id, ...snap.data() })
                } else {
                    console.log("Brak zamówienia")
                }
            } catch (error) {
                console.error("Błąd przy pobieraniu zamówienia:", error)
            } finally {
                setLoadingOrder(false)
            }
        }
        fetchOrder()
    }, [id])

    if (loading || loadingOrder) {
        return <Layout><p>Ładowanie...</p></Layout>
    }

    if (!order) {
        return <Layout><p>Zamówienie nie istnieje.</p></Layout>
    }

    const statusClass = (status) => {
        switch (status) {
            case "Oczekujące": return "bg-danger"
            case "W realizacji": return "bg-primary"
            case "Zrealizowane": return "bg-success"
            default: return "bg-secondary"
        }
    }

    // Oblicz koszt dostawy
    const deliveryCost = order.delivery === 'kurier' ? 15.99
                        : order.delivery === 'paczkomat' ? 10.20
                        : 0

    const totalProducts = order.items?.reduce((acc, item) => acc + item.product.price * item.quantity, 0).toFixed(2)
    const totalOrder = (parseFloat(totalProducts) + deliveryCost).toFixed(2)

    return (
        <Layout>
            <div className="container my-5">
                <h1 className="mb-4">Szczegóły zamówienia #{order.id}</h1>

                {/* Dane klienta */}
                <div className="card shadow-sm p-4 mb-4">
                    <h5 className="mb-3">
                        <i className="bi bi-person-lines-fill me-2 text-primary"></i>
                        Dane klienta
                    </h5>
                    <p><strong>Imię:</strong> {order.address.firstName}</p>
                    <p><strong>Nazwisko:</strong> {order.address.lastName}</p>
                    <p><strong>Adres:</strong> {order.address.address}</p>
                    <p><strong>Miasto:</strong> {order.address.city}</p>
                    <p><strong>Kod pocztowy:</strong> {order.address.postalCode}</p>
                    <p>
                        <strong>Status zamówienia:</strong>{" "}
                        <span className={`badge ${statusClass(order.status)}`}>{order.status}</span>
                    </p>
                </div>

                {/* Produkty w tabeli */}
                <h5 className="mb-3">Produkty w zamówieniu:</h5>
                <div className="card shadow-sm mb-4">
                    <div className="table-responsive">
                        <table className="table table-striped table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Produkt</th>
                                    <th className="text-center">Ilość</th>
                                    <th>Cena / szt.</th>
                                    <th>Łącznie</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items?.map(item => (
                                    <tr
                                        key={item.id}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => router.push(`/product/${item.product.id}`)}
                                    >
                                        <td>{item.product.name}</td>
                                        <td className="text-center">{item.quantity}</td>
                                        <td>{item.product.price} zł</td>
                                        <td>{(item.product.price * item.quantity).toFixed(2)} zł</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Podsumowanie */}
                <div className="card shadow-sm p-4">
                    <h5 className="mb-3">
                        <i className="bi bi-wallet2 me-2 text-success"></i>
                        Podsumowanie zamówienia
                    </h5>
                    <p><strong>Metoda płatności:</strong> {order.payment}</p>
                    <p><strong>Dostawa:</strong> {order.delivery} ({deliveryCost.toFixed(2)} zł)</p>
                    <p><strong>Suma produktów:</strong> {totalProducts} zł</p>
                    <p className="fw-bold fs-5">Całkowity koszt: {totalOrder} zł</p>
                </div>
            </div>

            <style jsx>{`
                table tbody tr:hover {
                    background-color: rgba(0,123,255,0.05);
                }
            `}</style>
        </Layout>
    )
}
