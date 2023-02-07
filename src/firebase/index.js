import "firebase/auth";
import "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  // connectAuthEmulator
} from "firebase/auth";
import {
  getFirestore,
  // connectFirestoreEmulator
} from "firebase/firestore";
import {
  getFunctions,
  // connectFunctionsEmulator
} from 'firebase/functions'

let isProduction = false;

const firebaseConfig = isProduction
  ? {
    apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
    authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
    storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
    databaseURL: process.env.VUE_APP_FIREBASE_DB_URL,
    projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
    messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VUE_APP_FIREBASE_APP_ID,
  }
  : {
    apiKey: process.env.VUE_APP_FIREBASE_API_KEY_DEV,
    authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN_DEV,
    storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET_DEV,
    databaseURL: process.env.VUE_APP_FIREBASE_DB_URL_DEV,
    projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID_DEV,
    messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID_DEV,
    appId: process.env.VUE_APP_FIREBASE_APP_ID_DEV,
    measurementId: process.env.VUE_APP_FIREBASE_MEASUREMENT_ID_DEV,
  };

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const analytics = getAnalytics(firebaseApp);
const fbFunctions = getFunctions(firebaseApp)

// connectFirestoreEmulator(db, 'localhost', 8081);
// connectAuthEmulator(auth, "http://localhost:9099");
// connectFunctionsEmulator(fbFunctions, "localhost", 5001);

export { auth, db, analytics, fbFunctions };
