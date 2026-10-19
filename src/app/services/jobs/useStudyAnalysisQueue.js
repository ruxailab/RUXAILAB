import { computed, isRef, onUnmounted, ref, unref, watch } from 'vue'
import { watchStudyJobs } from '@/app/services/jobs/watchStudyJobs'

const PENDING_STATUSES = new Set(['queued', 'processing'])

export function isPendingJob(job) {
  return PENDING_STATUSES.has(job?.status)
}

export function findInFlightJob(jobs, { type, userDocId, taskId }) {
  if (!userDocId || taskId == null || taskId === '') return null
  const user = String(userDocId)
  const task = String(taskId)

  return (
    jobs.find(
      (job) =>
        job.type === type &&
        String(job.userDocId) === user &&
        String(job.taskId) === task &&
        isPendingJob(job),
    ) || null
  )
}

function readStudyId(studyIdSource) {
  if (typeof studyIdSource === 'function' && !isRef(studyIdSource)) {
    return studyIdSource()
  }
  return unref(studyIdSource)
}

export function useStudyAnalysisQueue(studyIdSource) {
  const jobs = ref([])
  const ready = ref(false)
  let stop = null

  function listen(studyId) {
    stop?.()
    stop = null
    jobs.value = []

    if (typeof studyId !== 'string' || !studyId) {
      ready.value = true
      return
    }

    ready.value = false
    stop = watchStudyJobs(
      studyId,
      (next) => {
        jobs.value = next
        ready.value = true
      },
      () => {
        ready.value = true
      },
    )
  }

  watch(() => readStudyId(studyIdSource), listen, { immediate: true })
  onUnmounted(() => stop?.())

  const pending = computed(() => ({
    facial: jobs.value.some((job) => job.type === 'facial' && isPendingJob(job)),
    text: jobs.value.some((job) => job.type === 'text' && isPendingJob(job)),
    transcription: jobs.value.some(
      (job) => job.type === 'transcription' && isPendingJob(job),
    ),
  }))

  return { jobs, ready, pending }
}

export function useInFlightTaskJob(source, onPending) {
  const { jobs, ready } = useStudyAnalysisQueue(() => source().studyId)
  const followedId = ref(null)

  watch([jobs, ready], () => {
    if (!ready.value) return
    const job = findInFlightJob(jobs.value, source())
    if (!job || followedId.value === job.id) return
    followedId.value = job.id
    onPending(job)
  })

  const awaitingQueue = computed(() => {
    const { studyId } = source()
    return Boolean(studyId) && !ready.value
  })

  return {
    ready,
    awaitingQueue,
    claim(jobDocId) {
      followedId.value = jobDocId || null
    },
  }
}

export function useReloadWhenQueueSettles(pendingSource, reload) {
  watch(pendingSource, async (isPending, wasPending) => {
    if (!wasPending || isPending) return
    await reload()
  })
}
