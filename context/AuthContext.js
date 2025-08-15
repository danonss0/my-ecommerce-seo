import { createContext, useContext, useEffect, useState } from 'react'
import { auth, db } from '../lib/firebase'
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState('user')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(true)

  // Tworzy dokument użytkownika jeśli nie istnieje
  async function createUserIfNotExists(firebaseUser) {
    if (!firebaseUser) return
    const userRef = doc(db, 'users', firebaseUser.uid)
    const docSnap = await getDoc(userRef)
    if (!docSnap.exists()) {
      await setDoc(userRef, {
        email: firebaseUser.email,
        role: 'user',
        firstName: '',
        lastName: '',
        createdAt: new Date().toISOString(),
      })
      setFirstName('')
      setLastName('')
    } else {
      const data = docSnap.data()
      setFirstName(data.firstName || '')
      setLastName(data.lastName || '')
    }
  }

  // Pobiera dane użytkownika z Firestore
  async function fetchUserData(uid) {
    const userRef = doc(db, 'users', uid)
    const docSnap = await getDoc(userRef)
    if (docSnap.exists()) {
      const data = docSnap.data()
      setRole(data.role || 'user')
      setFirstName(data.firstName || '')
      setLastName(data.lastName || '')
    } else {
      setRole('user')
      setFirstName('')
      setLastName('')
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true)
      setUser(firebaseUser)

      if (firebaseUser) {
        await createUserIfNotExists(firebaseUser)
        await fetchUserData(firebaseUser.uid)
      } else {
        setRole('user')
        setFirstName('')
        setLastName('')
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  const login = async () => {
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error('Błąd logowania:', error)
    }
  }

  const logout = async () => {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, role, firstName, lastName, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth musi być używane wewnątrz AuthProvider')
  }
  return context
}
