import { reactive, readonly, ref } from 'vue'
import { uploadBytesResumable } from 'firebase/storage'

/**
 * Every Storage upload goes through `uploadWithProgress`, so one dialog
 * (UploadProgressDialog) can show how much of each file has been sent and
 * let the user retry a failed upload instead of losing the file.
 */

const uploads = reactive([])
const controls = new Map()
const online = ref(typeof navigator === 'undefined' || navigator.onLine)
let nextId = 0

// Storage reports a lost connection with these codes (or none). Any other
// code means the request reached Storage and was refused (rules, quota).
const CONNECTION_ERRORS = new Set([
  'storage/retry-limit-exceeded',
  'storage/unknown',
])
const isConnectionError = (error) =>
  !error?.code || CONNECTION_ERRORS.has(error.code)

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    online.value = true
    // The dialog promises that uploads continue once the connection is back.
    for (const upload of uploads) {
      if (upload.status === 'failed' && !upload.errorCode) {
        controls.get(upload.id)?.retry()
      }
    }
  })
  window.addEventListener('offline', () => {
    online.value = false
  })
  // Leaving the page drops an unfinished upload, and with it the file.
  window.addEventListener('beforeunload', (event) => {
    if (uploads.length) event.preventDefault()
  })
}

export class UploadCancelledError extends Error {
  constructor() {
    super('Upload cancelled')
    this.name = 'UploadCancelledError'
  }
}

export const isUploadCancelled = (error) =>
  error instanceof UploadCancelledError

const remove = (id) => {
  const index = uploads.findIndex((upload) => upload.id === id)
  if (index !== -1) uploads.splice(index, 1)
  controls.delete(id)
}

/**
 * Uploads `data` to `reference` and resolves with the finished snapshot.
 * A failed upload keeps its data and waits in the dialog until the user
 * retries it, so the promise rejects only with UploadCancelledError, when
 * the user cancels, or with the error of an upload that could not start.
 * Pass `replaceable: false` for data that cannot be produced again
 * (recordings), so cancelling warns that it is lost for good.
 */
export const uploadWithProgress = (
  reference,
  data,
  { label, metadata, replaceable = true } = {},
) =>
  new Promise((resolve, reject) => {
    const id = ++nextId
    uploads.push({
      id,
      label: label || reference?.name || '',
      replaceable,
      bytesTransferred: 0,
      totalBytes: data?.size || 0,
      status: 'uploading',
      errorCode: null,
    })
    const upload = uploads[uploads.length - 1]
    let task = null

    const start = () => {
      upload.status = 'uploading'
      upload.bytesTransferred = 0
      upload.errorCode = null
      const current = uploadBytesResumable(reference, data, metadata)
      task = current
      // Only the latest attempt of an upload that is still listed may
      // update it: earlier attempts and cancelled uploads are ignored.
      const isActive = () => task === current && controls.has(id)
      current.on(
        'state_changed',
        ({ bytesTransferred, totalBytes }) => {
          if (!isActive()) return
          upload.bytesTransferred = bytesTransferred
          upload.totalBytes = totalBytes
        },
        (error) => {
          if (!isActive()) return
          upload.status = 'failed'
          upload.errorCode = isConnectionError(error) ? null : error.code
        },
        () => {
          if (!isActive()) return
          remove(id)
          resolve(current.snapshot)
        },
      )
    }

    controls.set(id, {
      retry: () => {
        if (upload.status !== 'failed') return
        try {
          start()
        } catch (error) {
          upload.status = 'failed'
          upload.errorCode = error?.code || error?.name || 'error'
        }
      },
      cancel: () => {
        remove(id)
        task?.cancel()
        reject(new UploadCancelledError())
      },
    })

    try {
      start()
    } catch (error) {
      // An upload that cannot even start must not stay in the dialog,
      // which would otherwise block the page for good.
      remove(id)
      reject(error)
    }
  })

const retryUpload = (id) => controls.get(id)?.retry()
const cancelUpload = (id) => controls.get(id)?.cancel()

export const useUploads = () => ({
  uploads: readonly(uploads),
  online: readonly(online),
  retryUpload,
  cancelUpload,
})
