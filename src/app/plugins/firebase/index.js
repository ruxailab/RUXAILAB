import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'
import { getStorage, connectStorageEmulator } from 'firebase/storage'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  databaseURL: process.env.VUE_APP_FIREBASE_DB_URL,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_FIREBASE_APP_ID,
  measurementId: process.env.VUE_APP_FIREBASE_MEASUREMENT_ID,
}

const firebaseApp = initializeApp(firebaseConfig)
const auth = getAuth(firebaseApp)
const db = getFirestore(firebaseApp)

// Analytics is not available in emulator mode or when using fake credentials,
// as it always contacts Google's servers and has no emulator support.
const useEmulators = process.env.VUE_APP_USE_EMULATORS === 'true'
let analytics = null
if (!useEmulators) {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(firebaseApp)
    }
  }).catch(() => {
    // Analytics not available in this environment
  })
}
const fbFunctions = getFunctions(firebaseApp)
const storage = getStorage(firebaseApp, `gs://${firebaseConfig.storageBucket}`)
const database = getDatabase(firebaseApp, firebaseConfig.databaseURL)

// Emulators if running locally
if (process.env.VUE_APP_USE_EMULATORS === 'true') {
  connectFirestoreEmulator(db, 'localhost', 8081)
  connectAuthEmulator(auth, 'http://localhost:9099')
  connectFunctionsEmulator(fbFunctions, 'localhost', 5001)
  connectStorageEmulator(storage, '127.0.0.1', 9199)
}

export { auth, db, analytics, fbFunctions, storage, database }
