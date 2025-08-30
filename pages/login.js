// pages/login.js
import { useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { auth, db } from '../lib/firebase'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push('/profile')
    } catch (err) {
      setError('Niepoprawny email lub hasło')
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        firstName,
        lastName,
        role: 'user',
        createdAt: new Date().toISOString(),
      })
      router.push('/profile')
    } catch (err) {
      setError('Błąd podczas rejestracji: ' + err.message)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      // Sprawdź, czy użytkownik istnieje w bazie, jeśli nie -> dodaj
      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: user.email,
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ')[1] || '',
          role: 'user',
          createdAt: new Date().toISOString(),
        })
      }

      router.push('/profile')
    } catch (err) {
      setError('Błąd logowania przez Google: ' + err.message)
    }
  }

  return (
    <Layout>
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
        <div className="card shadow p-4" style={{ maxWidth: 450, width: '100%', borderRadius: 16 }}>
          <h2 className="mb-4 text-center">{isRegistering ? 'Rejestracja' : 'Logowanie'}</h2>

          <form onSubmit={isRegistering ? handleRegister : handleLogin}>
            {isRegistering && (
              <>
                <div className="mb-3">
                  <label htmlFor="firstName" className="form-label">Imię</label>
                  <input
                    type="text"
                    id="firstName"
                    className="form-control rounded-pill"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="lastName" className="form-label">Nazwisko</label>
                  <input
                    type="text"
                    id="lastName"
                    className="form-control rounded-pill"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                id="email"
                className="form-control rounded-pill"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">Hasło</label>
              <input
                type="password"
                id="password"
                className="form-control rounded-pill"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
              />
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <button type="submit" className="btn btn-primary w-100 rounded-pill">
              {isRegistering ? 'Zarejestruj się' : 'Zaloguj się'}
            </button>
          </form>

          <div className="text-center text-muted my-3">lub</div>

          <button
            className="btn btn-outline-dark w-100 rounded-pill d-flex align-items-center justify-content-center gap-2"
            onClick={handleGoogleLogin}
          >
            <img src="/google.svg" alt="Google" style={{ width: 20, height: 20 }} />
            Kontynuuj z Google
          </button>

          <div className="text-center mt-4">
            {isRegistering ? (
              <>
                Masz już konto?{' '}
                <button
                  className="btn btn-sm text-primary fw-semibold border-0 bg-transparent"
                  style={{ textDecoration: 'none' }}
                  onClick={() => { setIsRegistering(false); setError('') }}
                >
                  Zaloguj się
                </button>
              </>
            ) : (
              <>
                Nie masz konta?{' '}
                <button
                  className="btn btn-sm text-success fw-semibold border-0 bg-transparent"
                  style={{ textDecoration: 'none' }}
                  onClick={() => { setIsRegistering(true); setError('') }}
                >
                  Zarejestruj się
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </Layout>
  )
}
