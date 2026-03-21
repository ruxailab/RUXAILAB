import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'
import { getStorage, connectStorageEmulator } from 'firebase/storage'
import { getDatabase } from 'firebase/database'
import { isFirebaseDisabled } from '@/config/runtimeFlags'

const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  databaseURL: process.env.VUE_APP_FIREBASE_DB_URL,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_FIREBASE_APP_ID,
}

let auth, db, analytics, fbFunctions, storage, database;

if (!isFirebaseDisabled) {
  const firebaseApp = initializeApp(firebaseConfig)
  auth = getAuth(firebaseApp)
  db = getFirestore(firebaseApp)
  analytics = getAnalytics(firebaseApp)
  fbFunctions = getFunctions(firebaseApp)
  storage = getStorage(firebaseApp, `gs://${firebaseConfig.storageBucket}`)
  database = getDatabase(firebaseApp, firebaseConfig.databaseURL)

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
} else {
  // Provide empty mocks to allow platform UI to load when Firebase is disabled
  auth = {}
  db = {}
  analytics = {}
  fbFunctions = {}
  storage = {}
  database = {}
  console.info('Firebase initialization bypassed: isFirebaseDisabled flag is active.')
}

export { auth, db, analytics, fbFunctions, storage, database }