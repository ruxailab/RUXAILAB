import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage'

export const saveRecordedMedia = async ({
  blob,
  storage,
  storagePath,
  store,
  taskIndex,
  mediaType,
  userId,
}) => {
  const reference = storageRef(storage, storagePath)
  await uploadBytes(reference, blob)
  const url = await getDownloadURL(reference)
  await store.dispatch('updateTaskMediaUrl', {
    taskIndex,
    mediaType,
    url,
    size: blob.size,
    userId,
  })
}

export const createMediaRecorder = ({
  stream,
  mimeType,
  blobType,
  attempt,
  emit,
  save,
  cleanup,
}) => {
  const chunks = []
  const recorder = mimeType
    ? new MediaRecorder(stream, { mimeType })
    : new MediaRecorder(stream)

  recorder.ondataavailable = ({ data }) => {
    if (data.size) chunks.push(data)
  }
  recorder.onerror = () => {
    if (attempt.finish('failed', 'capture', 'captureError')) cleanup()
  }
  recorder.onstop = async () => {
    if (!attempt.beginUpload()) return
    emit('showLoading')
    try {
      const blob = new Blob(chunks, { type: blobType })
      if (!blob.size) {
        attempt.finish('failed', 'capture', 'emptyRecording')
        return
      }
      await save(blob)
      attempt.finish('completed', 'upload')
    } catch {
      attempt.finish('failed', 'upload', 'uploadError')
    } finally {
      cleanup()
      emit('stopShowLoading')
    }
  }
  return recorder
}
