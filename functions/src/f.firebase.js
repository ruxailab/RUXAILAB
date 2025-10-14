import admin from 'firebase-admin'
import { onObjectDeleted, onObjectFinalized, onObjectMetadataUpdated } from 'firebase-functions/storage'
import firebaseFunctions from 'firebase-functions/v2'

function onRequest({ handler, opts = {} }) {
  return firebaseFunctions.https.onRequest(opts, handler)
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

function onStorageTrigger({ event, handler }) {
  const storageEvents = {
    finalized: (h) => onObjectFinalized(h),
    deleted: (h) => onObjectDeleted(h),
    metadataUpdated: (h) => onObjectMetadataUpdated(h),
  }

  if (!storageEvents[event]) {
    throw new Error(`Unsupported Storage event: ${event}`)
  }
  return storageEvents[event](handler)
}

const functions = {
  onRequest,
  onCall,
  onTrigger,
  onStorageTrigger,
  ...firebaseFunctions
}

export { admin, functions }
