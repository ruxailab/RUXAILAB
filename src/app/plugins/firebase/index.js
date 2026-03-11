import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'
import { getStorage, connectStorageEmulator } from 'firebase/storage'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: 'AIzaSyDPjRW1yeCx7qjc6nxyQJ0Pc8U3FFGWDXg',
  authDomain: 'bugrux-db346.firebaseapp.com',
  projectId: 'bugrux-db346',
  storageBucket: 'bugrux-db346.firebasestorage.app',
  messagingSenderId: '135444117599',
  appId: '1:135444117599:web:129f1abff4ab4ad83643ea',
}

const firebaseApp = initializeApp(firebaseConfig)
const auth = getAuth(firebaseApp)
const db = getFirestore(firebaseApp)

// Analytics - only initialize if measurement ID is configured
let analytics = null
if (process.env.VUE_APP_FIREBASE_MEASUREMENT_ID) {
  try {
    analytics = getAnalytics(firebaseApp)
  } catch (e) {
    console.warn('Analytics initialization skipped:', e.message)
  }
}

const fbFunctions = getFunctions(firebaseApp)

// Storage - safe initialization with bucket validation
let storage = null
if (firebaseConfig.storageBucket) {
  try {
    storage = getStorage(firebaseApp, `gs://${firebaseConfig.storageBucket}`)
  } catch (e) {
    console.warn('Storage initialization failed:', e.message)
  }
}

// Database - safe initialization with URL validation
let database = null
if (firebaseConfig.databaseURL) {
  try {
    database = getDatabase(firebaseApp, firebaseConfig.databaseURL)
  } catch (e) {
    console.warn('Database initialization failed:', e.message)
  }
}

if (process.env.VUE_APP_USE_EMULATORS === 'true') {
  const EMULATOR_HOST =
    process.env.VUE_APP_FIREBASE_EMULATOR_HOST || 'localhost'
  const FIRESTORE_EMULATOR_PORT =
    Number(process.env.VUE_APP_FIRESTORE_EMULATOR_PORT) || 8081
  const AUTH_EMULATOR_PORT =
    Number(process.env.VUE_APP_AUTH_EMULATOR_PORT) || 9099
  const FUNCTIONS_EMULATOR_PORT =
    Number(process.env.VUE_APP_FUNCTIONS_EMULATOR_PORT) || 5002
  const STORAGE_EMULATOR_PORT =
    Number(process.env.VUE_APP_STORAGE_EMULATOR_PORT) || 9199

  connectFirestoreEmulator(db, EMULATOR_HOST, FIRESTORE_EMULATOR_PORT)
  connectAuthEmulator(auth, `http://${EMULATOR_HOST}:${AUTH_EMULATOR_PORT}`)
  connectFunctionsEmulator(fbFunctions, EMULATOR_HOST, FUNCTIONS_EMULATOR_PORT)
  connectStorageEmulator(storage, EMULATOR_HOST, STORAGE_EMULATOR_PORT)
}

export { auth, db, analytics, fbFunctions, storage, database }
