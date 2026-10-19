import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '@/app/plugins/firebase'

/**
 * Listen to queue jobs recorded for one study.
 *
 * @param {string} studyId
 * @param {(jobs: object[]) => void} onChange
 * @param {(error: Error) => void} [onError]
 * @returns {() => void}
 */
export function watchStudyJobs(studyId, onChange, onError) {
  const jobsQuery = query(
    collection(db, 'jobs'),
    where('studyId', '==', studyId),
  )

  return onSnapshot(
    jobsQuery,
    (snapshot) => {
      onChange(
        snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })),
      )
    },
    onError,
  )
}
