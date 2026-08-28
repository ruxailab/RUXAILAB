import admin from 'firebase-admin'
import dotenv from 'dotenv'
import {
  onObjectDeleted,
  onObjectFinalized,
  onObjectMetadataUpdated,
} from 'firebase-functions/storage'
import firebaseFunctions from 'firebase-functions/v2'

dotenv.config()
const envPath =
  process.env.ENV_FILE ||
  (process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : null)
if (envPath) {
  dotenv.config({ path: envPath })
}

function getRegion() {
  return process.env.RUXAILAB_FUNCTIONS_REGION || 'europe-west6'
}

/**
 * @param {Array<(request: object, next: () => Promise<unknown>) => Promise<unknown>>} middlewares
 * @param {(request: object) => Promise<unknown>} handler
 * @returns {(request: object) => Promise<unknown>}
 */
function composeMiddlewares(middlewares, handler) {
  return middlewares.reduceRight(
    (next, middleware) => (request) =>
      middleware(request, () => next(request)),
    handler,
  )
}

function onRequest({ handler, options = {} }) {
  const runtimeOptions = { region: getRegion(), ...options }
  return firebaseFunctions.https.onRequest(runtimeOptions, handler)
}

/**
 * Callable with optional middleware chain.
 *
 * Middlewares run in array order (first = outermost). Signature:
 *   async (request, next) => { ...; return next() }
 *
 * @param {object} params
 * @param {(request: object) => Promise<unknown>} params.handler
 * @param {object} [params.options]
 * @param {Array<(request: object, next: () => Promise<unknown>) => Promise<unknown>>} [params.middlewares]
 */
function onCall({ handler, options = {}, middlewares = [] }) {
  const runtimeOptions = { region: getRegion(), ...options }
  const composed = composeMiddlewares(middlewares, handler)
  return firebaseFunctions.https.onCall(runtimeOptions, composed)
}

function onTrigger({ path, event, handler, opts = {} }) {
  const options = { region: getRegion(), ...opts }

  const firestoreEvents = {
    created: (p, h) =>
      firebaseFunctions.firestore.onDocumentCreated(
        { document: p, ...options },
        h,
      ),
    updated: (p, h) =>
      firebaseFunctions.firestore.onDocumentUpdated(
        { document: p, ...options },
        h,
      ),
    deleted: (p, h) =>
      firebaseFunctions.firestore.onDocumentDeleted(
        { document: p, ...options },
        h,
      ),
    written: (p, h) =>
      firebaseFunctions.firestore.onDocumentWritten(
        { document: p, ...options },
        h,
      ),
  }

  if (!firestoreEvents[event]) {
    throw new Error(`Unsupported Firestore event: ${event}`)
  }
  return firestoreEvents[event](path, handler)
}

function onStorageTrigger({ event, handler }) {
  const options = { region: getRegion() }
  const storageEvents = {
    finalized: (h) => onObjectFinalized(options, h),
    deleted: (h) => onObjectDeleted(options, h),
    metadataUpdated: (h) => onObjectMetadataUpdated(options, h),
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
