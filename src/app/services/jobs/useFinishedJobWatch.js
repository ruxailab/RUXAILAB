import { onUnmounted, ref } from 'vue'

/**
 * Subscribe to a job document until it finishes or the caller stops.
 *
 * @param {Object} options
 * @param {(jobDocId: string, onChange: Function, onError: Function) => Function} options.watchJob
 * @param {(job: object) => void|Promise<void>} [options.onDone]
 * @param {(job: object) => void|Promise<void>} [options.onFailed]
 * @param {(error: Error) => void} [options.onError]
 */
export function useFinishedJobWatch({ watchJob, onDone, onFailed, onError }) {
  const running = ref(false)
  let stopJobWatch = null
  let activeJobDocId = null

  function stop() {
    if (stopJobWatch) {
      stopJobWatch()
      stopJobWatch = null
    }
  }

  function finish() {
    stop()
    activeJobDocId = null
    running.value = false
  }

  function follow(jobDocId, jobId) {
    if (!jobDocId) return
    if (activeJobDocId === jobDocId && stopJobWatch) return
    activeJobDocId = jobDocId
    stop()
    running.value = true

    stopJobWatch = watchJob(
      jobDocId,
      async (job) => {
        if (!job || (jobId && job.jobId !== jobId)) return
        if (job.status !== 'done' && job.status !== 'failed') return

        finish()

        if (job.status === 'failed') {
          await onFailed?.(job)
          return
        }

        await onDone?.(job)
      },
      (err) => {
        finish()
        onError?.(err)
      },
    )
  }

  onUnmounted(stop)

  return { running, follow, stop }
}
