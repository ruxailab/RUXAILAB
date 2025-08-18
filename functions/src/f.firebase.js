import admin from 'firebase-admin'
import firebaseFunctions from 'firebase-functions/v2'

function onRequest({ handler, options = {} }) {
  return firebaseFunctions.https.onRequest(options, handler)
}

function onCall({ handler, options = {} }) {
  return firebaseFunctions.https.onCall(options, handler)
}

function onTrigger({ path, event, handler }) {
  const firestoreEvents = {
    created: (p, h) => firebaseFunctions.firestore.onDocumentCreated(p, h),
    updated: (p, h) => firebaseFunctions.firestore.onDocumentUpdated(p, h),
    deleted: (p, h) => firebaseFunctions.firestore.onDocumentDeleted(p, h),
    written: (p, h) => firebaseFunctions.firestore.onDocumentWritten(p, h),
  }

  if (!firestoreEvents[event]) {
    throw new Error(`Unsupported Firestore event: ${event}`)
  }
  return firestoreEvents[event](path, handler)
}

const functions = {
  onRequest,
  onCall,
  onTrigger,
  ...firebaseFunctions
}

export { admin, functions }
