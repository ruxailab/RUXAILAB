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

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    online.value = true
  })
  window.addEventListener('offline', () => {
    online.value = false
  })
  // Leaving the page drops an unfinished upload, and with it the file.
  window.addEventListener('beforeunload', (event) => {
    if (!uploads.length) return
    event.preventDefault()
    event.returnValue = ''
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
 * the user cancels. Pass `replaceable: false` for data that cannot be
 * produced again (recordings), so cancelling warns that it is lost for good.
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
      label: label || reference.name,
      replaceable,
      bytesTransferred: 0,
      totalBytes: data?.size || 0,
      status: 'uploading',
    })
    const upload = uploads[uploads.length - 1]
    let task = null

    const start = () => {
      upload.status = 'uploading'
      upload.bytesTransferred = 0
      const current = uploadBytesResumable(reference, data, metadata)
      task = current
      current.on(
        'state_changed',
        ({ bytesTransferred, totalBytes }) => {
          upload.bytesTransferred = bytesTransferred
          upload.totalBytes = totalBytes
        },
        () => {
          // A cancelled upload has already been removed.
          if (controls.has(id)) upload.status = 'failed'
        },
        () => {
          remove(id)
          resolve(current.snapshot)
        },
      )
    }

    controls.set(id, {
      retry: start,
      cancel: () => {
        remove(id)
        task?.cancel()
        reject(new UploadCancelledError())
      },
    })
    start()
  })

const retryUpload = (id) => controls.get(id)?.retry()
const cancelUpload = (id) => controls.get(id)?.cancel()

export const useUploads = () => ({
  uploads: readonly(uploads),
  online: readonly(online),
  retryUpload,
  cancelUpload,
})
