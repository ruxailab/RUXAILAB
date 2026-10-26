import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage'
import { isDeviceBusyError } from '@/ux/UserTest/utils/recordingOutcome'

const VIRTUAL_CAMERA = /virtual|obs|ndi|snap|xsplit|manycam|droidcam|camo/i

/**
 * Opens the browser's default camera. If it cannot start (busy, or a virtual
 * camera with no picture), tries the other cameras, real ones first, and
 * rethrows the original error when none starts.
 */
export const openCameraStream = async (mediaDevices) => {
  try {
    return await mediaDevices.getUserMedia({ video: true })
  } catch (error) {
    if (!isDeviceBusyError(error)) throw error
    // Labels are known now that camera permission has been requested.
    const cameras = (await mediaDevices.enumerateDevices())
      .filter((device) => device.kind === 'videoinput' && device.deviceId)
      .sort(
        (left, right) =>
          VIRTUAL_CAMERA.test(left.label) - VIRTUAL_CAMERA.test(right.label),
      )
    for (const camera of cameras) {
      try {
        return await mediaDevices.getUserMedia({
          video: { deviceId: { exact: camera.deviceId } },
        })
      } catch {
        // Try the next camera.
      }
    }
    throw error
  }
}

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
