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
        createdAt: new Date().toISOString(),
      })
    }
  }

  // Pobiera rolę użytkownika z Firestore
  async function fetchUserRole(uid) {
    const userRef = doc(db, 'users', uid)
    const docSnap = await getDoc(userRef)
    if (docSnap.exists()) {
      return docSnap.data().role || 'user'
    }
    return 'user'
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true)
      setUser(firebaseUser)

      if (firebaseUser) {
        await createUserIfNotExists(firebaseUser)
        const userRole = await fetchUserRole(firebaseUser.uid)
        setRole(userRole)
      } else {
        setRole('user')
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
    <AuthContext.Provider value={{ user, role, loading, login, logout }}>
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
