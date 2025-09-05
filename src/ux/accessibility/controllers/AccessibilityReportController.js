import { db } from '@/app/plugins/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

/**
 * Fetches the accessibility report from Firestore by testId
 * @param {string} testId
 * @returns {Promise<Object|null>} The report data or null if not found
 */
export async function fetchReportByTestId(testId) {
    const q = query(collection(db, 'report'), where('ReportId', '==', testId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
        // Return the first matching report (or map if you expect multiple)
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    }
    return null;
}
