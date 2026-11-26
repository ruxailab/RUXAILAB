import { uploadBytesResumable } from 'firebase/storage'
import {
  isUploadCancelled,
  uploadWithProgress,
  useUploads,
} from '@/shared/services/uploadManager'

jest.mock('firebase/storage', () => ({ uploadBytesResumable: jest.fn() }))

const tasks = []
const createTask = () => {
  const task = {
    cancel: jest.fn(),
    snapshot: { ref: `snapshot-${tasks.length}` },
    on: jest.fn((_event, next, error, complete) => {
      task.next = next
      task.error = error
      task.complete = complete
    }),
  }
  tasks.push(task)
  return task
}

const { uploads, online, retryUpload, cancelUpload } = useUploads()
const reference = { name: 'clip.webm' }
const file = { size: 2048 }

beforeEach(() => {
  tasks.length = 0
  uploadBytesResumable.mockImplementation(createTask)
})

it('tracks the bytes sent and removes the upload once it finishes', async () => {
  const done = uploadWithProgress(reference, file, {
    label: 'Screen recording',
  })

  expect(uploads).toEqual([
    expect.objectContaining({
      label: 'Screen recording',
      replaceable: true,
      bytesTransferred: 0,
      totalBytes: 2048,
      status: 'uploading',
    }),
  ])

  tasks[0].next({ bytesTransferred: 1024, totalBytes: 2048 })
  expect(uploads[0].bytesTransferred).toBe(1024)

  tasks[0].complete()
  await expect(done).resolves.toBe(tasks[0].snapshot)
  expect(uploads).toHaveLength(0)
})

it('uses the file name when no label is given', async () => {
  const done = uploadWithProgress(reference, file)
  expect(uploads[0].label).toBe('clip.webm')
  tasks[0].complete()
  await done
})

it('keeps a failed upload until it is retried with the same data', async () => {
  const done = uploadWithProgress(reference, file, { replaceable: false })
  tasks[0].next({ bytesTransferred: 512, totalBytes: 2048 })
  tasks[0].error(new Error('network down'))

  expect(uploads[0]).toEqual(
    expect.objectContaining({ status: 'failed', replaceable: false }),
  )

  retryUpload(uploads[0].id)

  expect(uploadBytesResumable).toHaveBeenCalledTimes(2)
  expect(uploadBytesResumable).toHaveBeenLastCalledWith(
    reference,
    file,
    undefined,
  )
  expect(uploads[0]).toEqual(
    expect.objectContaining({ status: 'uploading', bytesTransferred: 0 }),
  )

  tasks[1].complete()
  await expect(done).resolves.toBe(tasks[1].snapshot)
  expect(uploads).toHaveLength(0)
})

it('stops the upload and rejects with a cancellation when cancelled', async () => {
  const done = uploadWithProgress(reference, file)
  cancelUpload(uploads[0].id)

  expect(tasks[0].cancel).toHaveBeenCalled()
  expect(uploads).toHaveLength(0)
  // The SDK then reports the cancellation as an error, which is ignored.
  tasks[0].error(new Error('storage/canceled'))
  expect(uploads).toHaveLength(0)

  const error = await done.catch((reason) => reason)
  expect(isUploadCancelled(error)).toBe(true)
  expect(isUploadCancelled(new Error('other'))).toBe(false)
})

it('asks before leaving the page only while an upload is running', async () => {
  const done = uploadWithProgress(reference, file)
  const whileUploading = new Event('beforeunload', { cancelable: true })
  window.dispatchEvent(whileUploading)
  expect(whileUploading.defaultPrevented).toBe(true)

  tasks[0].complete()
  await done

  const afterUpload = new Event('beforeunload', { cancelable: true })
  window.dispatchEvent(afterUpload)
  expect(afterUpload.defaultPrevented).toBe(false)
})

it('follows the browser connection state', () => {
  window.dispatchEvent(new Event('offline'))
  expect(online.value).toBe(false)
  window.dispatchEvent(new Event('online'))
  expect(online.value).toBe(true)
})
