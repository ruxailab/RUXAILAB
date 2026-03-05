import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
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
}

const firebaseApp = initializeApp(firebaseConfig)
const auth = getAuth(firebaseApp)
const db = getFirestore(firebaseApp)
const analytics = getAnalytics(firebaseApp)
const fbFunctions = getFunctions(firebaseApp)
const storage = getStorage(firebaseApp, `gs://${firebaseConfig.storageBucket}`)
const database = getDatabase(firebaseApp, firebaseConfig.databaseURL)

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
