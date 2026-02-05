import { db } from '@/app/plugins/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'

/**
 * Controller for fetching accessibility reports from Firestore by test ID
 * @class AccessibilityReportController
 */
export default class AccessibilityReportController {
  /**
   * Fetches the accessibility report from Firestore by testId.
   * @param {string} testId - The test document ID to fetch the report for
   * @returns {Promise<Object|null>} The report data or null if not found
   * @example
   * const controller = new AccessibilityReportController()
   * const report = await controller.fetchReportByTestId('test-abc123')
   * if (report) console.log(report.id, report)
   */
  async fetchReportByTestId(testId) {
    const q = query(collection(db, 'report'), where('ReportId', '==', testId))
    const snapshot = await getDocs(q)
    if (!snapshot.empty) {
      // Return the first matching report (or map if you expect multiple)
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
    }
    return null
  }
}
