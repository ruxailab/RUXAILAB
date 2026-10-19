import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/app/plugins/firebase'

/**
 * Listen to one queue job until the caller unsubscribes.
 *
 * @param {string} jobDocId
 * @param {(job: object|null) => void} onChange
 * @param {(error: Error) => void} [onError]
 * @returns {() => void}
 */
export function watchJobDocument(jobDocId, onChange, onError) {
  return onSnapshot(
    doc(db, 'jobs', jobDocId),
    (snap) => {
      onChange(snap.exists() ? { id: snap.id, ...snap.data() } : null)
    },
    onError,
  )
}
