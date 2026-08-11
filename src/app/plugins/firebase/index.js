import { initializeApp } from 'firebase/app'
//import { getAnalytics } from 'firebase/analytics'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'
import { getStorage, connectStorageEmulator } from 'firebase/storage'
import { getDatabase } from 'firebase/database'

const REQUIRED_ENV_VARS = {
  VUE_APP_FIREBASE_API_KEY: process.env.VUE_APP_FIREBASE_API_KEY,
  VUE_APP_FIREBASE_AUTH_DOMAIN: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  VUE_APP_FIREBASE_PROJECT_ID: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  VUE_APP_FIREBASE_APP_ID: process.env.VUE_APP_FIREBASE_APP_ID,
  VUE_APP_FIREBASE_DB_URL: process.env.VUE_APP_FIREBASE_DB_URL,
}

const missingVars = Object.entries(REQUIRED_ENV_VARS)
  .filter(([, v]) => !v)
  .map(([k]) => k)

if (missingVars.length > 0) {
  throw new Error(`Missing required env vars: ${missingVars.join(', ')}`)
}

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
//const analytics = getAnalytics(firebaseApp)
// Must match functions/src/f.firebase.js. Calling a callable in the wrong
// region returns a 404 that browsers often report as a CORS failure.
const functionsRegion =
  process.env.VUE_APP_FIREBASE_FUNCTIONS_REGION || 'europe-west6'
const fbFunctions = getFunctions(firebaseApp, functionsRegion)
const storage = getStorage(firebaseApp, `gs://${firebaseConfig.storageBucket}`)
const database = getDatabase(firebaseApp, firebaseConfig.databaseURL)

const useAllEmulators = process.env.VUE_APP_USE_EMULATORS === 'true'
const EMULATOR_HOST =
  process.env.VUE_APP_FIREBASE_EMULATOR_HOST || 'localhost'

if (
  useAllEmulators ||
  process.env.VUE_APP_USE_AUTH_EMULATOR === 'true'
) {
  const AUTH_EMULATOR_PORT =
    Number(process.env.VUE_APP_AUTH_EMULATOR_PORT) || 9099
  connectAuthEmulator(auth, `http://${EMULATOR_HOST}:${AUTH_EMULATOR_PORT}`)
}

if (
  useAllEmulators ||
  process.env.VUE_APP_USE_FIRESTORE_EMULATOR === 'true'
) {
  const FIRESTORE_EMULATOR_PORT =
    Number(process.env.VUE_APP_FIRESTORE_EMULATOR_PORT) || 8081
  connectFirestoreEmulator(db, EMULATOR_HOST, FIRESTORE_EMULATOR_PORT)
}

if (
  useAllEmulators ||
  process.env.VUE_APP_USE_FUNCTIONS_EMULATOR === 'true'
) {
  const FUNCTIONS_EMULATOR_PORT =
    Number(process.env.VUE_APP_FUNCTIONS_EMULATOR_PORT) || 5002
  connectFunctionsEmulator(fbFunctions, EMULATOR_HOST, FUNCTIONS_EMULATOR_PORT)
}

if (
  useAllEmulators ||
  process.env.VUE_APP_USE_STORAGE_EMULATOR === 'true'
) {
  const STORAGE_EMULATOR_PORT =
    Number(process.env.VUE_APP_STORAGE_EMULATOR_PORT) || 9199
  connectStorageEmulator(storage, EMULATOR_HOST, STORAGE_EMULATOR_PORT)
}

export { auth, db, fbFunctions, storage, database }
