import admin from 'firebase-admin'
import 'dotenv/config'
import {
  onObjectDeleted,
  onObjectFinalized,
  onObjectMetadataUpdated,
} from 'firebase-functions/storage'
import firebaseFunctions from 'firebase-functions/v2'

function getRegion() {
  return process.env.RUXAILAB_FUNCTIONS_REGION || 'europe-west6'
}

function onRequest({ handler, opts = {} }) {
  return firebaseFunctions.https.onRequest(
    { region: getRegion(), ...opts },
    handler,
  )
}

function onCall({ handler, options = {} }) {
  return firebaseFunctions.https.onCall(
    { region: getRegion(), ...options },
    handler,
  )
}

function onTrigger({ path, event, handler }) {
  const baseOptions = { region: getRegion() }

  const firestoreEvents = {
    created: (p, h) =>
      firebaseFunctions.firestore.onDocumentCreated(
        { document: p, ...baseOptions },
        h,
      ),
    updated: (p, h) =>
      firebaseFunctions.firestore.onDocumentUpdated(
        { document: p, ...baseOptions },
        h,
      ),
    deleted: (p, h) =>
      firebaseFunctions.firestore.onDocumentDeleted(
        { document: p, ...baseOptions },
        h,
      ),
    written: (p, h) =>
      firebaseFunctions.firestore.onDocumentWritten(
        { document: p, ...baseOptions },
        h,
      ),
  }

  if (!firestoreEvents[event]) {
    throw new Error(`Unsupported Firestore event: ${event}`)
  }
  return firestoreEvents[event](path, handler)
}

function onStorageTrigger({ event, handler }) {
  const baseOptions = { region: getRegion() }
  const storageEvents = {
    finalized: (h) => onObjectFinalized(baseOptions, h),
    deleted: (h) => onObjectDeleted(baseOptions, h),
    metadataUpdated: (h) => onObjectMetadataUpdated(baseOptions, h),
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
  ...firebaseFunctions,
}

export { admin, functions }
