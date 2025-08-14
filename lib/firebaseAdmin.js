// lib/firebaseAdmin.js
import admin from 'firebase-admin'

if (!admin.apps.length) {
  // Klucz serwisowy w JSON lub JSON.stringify w ENV
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
}

const adminAuth = admin.auth()
const adminFirestore = admin.firestore()

export { adminAuth, adminFirestore }
