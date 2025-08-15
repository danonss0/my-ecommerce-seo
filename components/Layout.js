// components/Layout.js
import Head from 'next/head'
import Link from 'next/link'
import Image from "next/image";
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const AUTO_HIDE_MS = 3200
const ANIM_MS = 360

export default function Layout({ children }) {
    const { count, toasts, removeToast } = useCart()
    const router = useRouter()
    const { user } = useAuth()

    const handleProfileClick = () => {
        if (user) {
            router.push('/profile')
        } else {
            router.push('/login')
        }
    }

    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="robots" content="index, follow" />
                <link rel="icon" href="/logo mini.png" />
            </Head>

            <header className="bg-light border-bottom py-3">
                <div className="container-fluid d-flex justify-content-between align-items-center" style={{ maxWidth: 1400 }}>
                    <Link href="/" className="fw-bold text-decoration-none text-dark fs-4">
                        <div style={{ width: '20vw', minWidth: 220, maxWidth: 600 }}>
                            <Image
                                src="/logo3.png"
                                alt="Logo"
                                width={600}
                                height={150}
                                style={{ width: '100%', height: 'auto' }}
                                priority
                            />
                        </div>

                    </Link>

                    <nav className="d-flex align-items-center gap-3">
                        <Link href="/profile" className="d-flex flex-column align-items-center text-decoration-none text-dark" aria-label="Profil">
                            <div className="position-relative d-inline-block">
                                <i className="bi bi-people fs-3"></i>
                            </div>
                            <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Mój profil</div>
                        </Link>

                        <Link href="/cart" className="d-flex flex-column align-items-center text-decoration-none text-dark" aria-label="Koszyk">
                            <div className="position-relative d-inline-block">
                                <i className="bi bi-bag fs-3"></i>
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.7rem', minWidth: '1.1rem' }}>
                                    {count}
                                </span>
                            </div>
                            <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Koszyk</div>
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="container-fluid my-4" style={{ maxWidth: 1400 }}>
                {children}
            </main>

            <footer className="text-center py-3 border-top">© {new Date().getFullYear()} Mój Sklep</footer>

            <div
                aria-live="polite"
                aria-atomic="true"
                className="position-fixed"
                style={{ zIndex: 2000, right: 20, bottom: 20, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end' }}
            >
                {toasts.map((t, i) => (
                    <ToastItem key={t.id} toast={t} index={i} onClose={() => removeToast(t.id)} router={router} />
                ))}
            </div>
        </>
    )
}

function ToastItem({ toast, onClose, router }) {
    const [show, setShow] = useState(false)

    useEffect(() => {
        const enter = setTimeout(() => setShow(true), 10)
        const now = Date.now()
        const hideIn = Math.max(0, (toast.hideAt || (now + AUTO_HIDE_MS)) - now)
        const hide = setTimeout(() => setShow(false), hideIn)
        const clear = setTimeout(() => onClose(), hideIn + ANIM_MS + 10)

        return () => {
            clearTimeout(enter)
            clearTimeout(hide)
            clearTimeout(clear)
        }
    }, [toast, onClose])

    const handleGoCart = () => {
        setShow(false)
        setTimeout(() => {
            onClose()
            router.push('/cart')
        }, ANIM_MS + 10)
    }

    const handleClose = () => {
        setShow(false)
        setTimeout(() => onClose(), ANIM_MS + 10)
    }

    return (
        <div className={`toast fade ${show ? 'show' : ''}`} role="status" aria-live="polite" aria-atomic="true" style={{ minWidth: 300 }}>
            <div className="toast-header">
                <strong className="me-auto">Dodano do koszyka</strong>
                <small className="text-muted">teraz</small>
                <button type="button" className="btn-close ms-2 mb-1" aria-label="Zamknij" onClick={handleClose} />
            </div>

            <div className="toast-body">
                <div className="d-flex align-items-center">
                    <img src={toast.product.image} alt={toast.product.name} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 6, marginRight: 12 }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{toast.product.name}</div>
                        <div className="text-muted" style={{ fontSize: 13 }}>1 × {toast.product.price} zł</div>
                    </div>
                </div>

                <div className="mt-3 d-flex justify-content-end gap-2">
                    <button className="btn btn-primary" onClick={handleGoCart}>Koszyk</button>
                </div>
            </div>
        </div>
    )
}
