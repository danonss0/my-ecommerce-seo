import { useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { auth, db } from '../lib/firebase'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('') // imię
  const [lastName, setLastName] = useState('')   // nazwisko
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
      // Tworzymy dokument użytkownika w Firestore z imieniem i nazwiskiem
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

  return (
    <Layout>
      <h1>{isRegistering ? 'Rejestracja' : 'Logowanie'}</h1>

      <form onSubmit={isRegistering ? handleRegister : handleLogin} style={{ maxWidth: 400 }}>
        {isRegistering && (
          <>
            <div className="mb-3">
              <label htmlFor="firstName" className="form-label">Imię</label>
              <input
                type="text"
                id="firstName"
                className="form-control"
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
                className="form-control"
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
            className="form-control"
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
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={isRegistering ? 'new-password' : 'current-password'}
          />
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <button type="submit" className="btn btn-primary">
          {isRegistering ? 'Zarejestruj się' : 'Zaloguj się'}
        </button>
      </form>

      <div style={{ marginTop: 20 }}>
        {isRegistering ? (
          <>
            Masz już konto?{' '}
            <button className="btn btn-link p-0" onClick={() => { setIsRegistering(false); setError('') }}>
              Zaloguj się
            </button>
          </>
        ) : (
          <>
            Nie masz konta?{' '}
            <button className="btn btn-link p-0" onClick={() => { setIsRegistering(true); setError('') }}>
              Zarejestruj się
            </button>
          </>
        )}
      </div>
    </Layout>
  )
}
