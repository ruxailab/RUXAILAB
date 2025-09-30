import { db } from '@/app/plugins/firebase';
import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';

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

/**
 * Saves accessibility test results to the autoassessment collection
 * @param {Object} testData - The test result data from the API
 * @param {string} testId - The test ID to associate with
 * @returns {Promise<string>} The document ID of the saved assessment
 */
export async function saveAccessibilityAssessment(testData, testId) {
    try {
        // Transform the API response to match the expected format
        const assessmentData = {
            testId: testId,
            ReportUrl: testData.url,
            ReportDateTime: testData.testDateTime,
            ReportIssues: testData.issues || [],
            issueCount: testData.issueCount || 0,
            documentTitle: testData.documentTitle || '',
            success: testData.success,
            message: testData.message,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Save to autoassessment collection
        const docRef = await addDoc(collection(db, 'autoassessment'), assessmentData);

        return docRef.id;
    } catch (error) {
        console.error('Error saving accessibility assessment:', error);
        throw new Error('Failed to save accessibility assessment');
    }
}

/**
 * Fetches accessibility assessment by test ID from autoassessment collection
 * @param {string} testId - The test ID
 * @returns {Promise<Object|null>} The assessment data or null if not found
 */
export async function fetchAssessmentByTestId(testId) {
    try {
        const q = query(collection(db, 'autoassessment'), where('testId', '==', testId));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            // Return the first matching assessment
            const docData = snapshot.docs[0].data();
            return {
                id: snapshot.docs[0].id,
                ...docData,
                // Transform to match expected format for backward compatibility
                ReportId: testId
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching assessment:', error);
        throw new Error('Failed to fetch accessibility assessment');
    }
}

/**
 * Fetches accessibility assessment by document ID
 * @param {string} docId - The document ID
 * @returns {Promise<Object|null>} The assessment data or null if not found
 */
export async function fetchAssessmentById(docId) {
    try {
        const docRef = doc(db, 'autoassessment', docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                // Transform to match expected format for backward compatibility
                ReportId: data.testId
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching assessment by ID:', error);
        throw new Error('Failed to fetch accessibility assessment');
    }
}
