import { db } from '@/app/plugins/firebase'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore'

/**
 * Fetches the accessibility report from Firestore by testId
 * @param {string} testId
 * @returns {Promise<Object|null>} The report data or null if not found
 */
export async function fetchReportByTestId(testId) {
  const q = query(collection(db, 'report'), where('ReportId', '==', testId))
  const snapshot = await getDocs(q)
  if (!snapshot.empty) {
    // Return the first matching report (or map if you expect multiple)
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
  }
  return null
}

/**
 * Saves (or updates) the accessibility report in Firestore.
 * `createdAt` is only stamped on the first write; `updatedAt` is always refreshed.
 *
 * @param {string} testId
 * @param {Object} reportData
 * @returns {Promise<{ success: boolean, id: string }>}
 */
export async function saveReportByTestId(testId, reportData) {
  const docRef = doc(db, 'report', testId)

  const existing = await getDoc(docRef)
  const now = new Date().toISOString()

  const report = {
    ...reportData,
    ReportId: testId,
    updatedAt: now,
    // Only stamp createdAt when the document does not yet exist.
    ...(existing.exists() ? {} : { createdAt: now }),
  }

  try {
    await setDoc(docRef, report, { merge: true })
    return { success: true, id: docRef.id }
  } catch (error) {
    throw new Error('Failed to save accessibility report: ' + error.message)
  }
}
