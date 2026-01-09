import { db } from '@/app/plugins/firebase';
import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';

const ASSESSMENTS_COLLECTION = 'assessments';

/**
 * Save or update an assessment in Firestore
 * @param {string} userId - The ID of the user
 * @param {string} testId - The ID of the test
 * @param {string} testType - The type of test (e.g., 'manual')
 * @param {Array} assessmentData - Array of assessment objects
 * @returns {Promise<Object>} - Success status and document ID
 */
export const saveAssessment = async (userId, testId, testType, assessmentData) => {
  try {
    const docRef = doc(db, ASSESSMENTS_COLLECTION, `${userId}_${testId}`);
    const docSnap = await getDoc(docRef);

    const assessment = {
      userId,
      testId,
      testType,
      assessmentData: docSnap.exists()
        ? [...docSnap.data().assessmentData, ...assessmentData]
        : assessmentData,
      updatedAt: new Date().toISOString(),
      ...(docSnap.exists() ? {} : { createdAt: new Date().toISOString() })
    };

    await setDoc(docRef, assessment, { merge: true });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error saving assessment:', error);
    throw new Error('Failed to save assessment');
  }
};

/**
 * Get an assessment by user ID and test ID
 * @param {string} userId - The ID of the user
 * @param {string} testId - The ID of the test
 * @returns {Promise<Object|null>} - The assessment data or null if not found
 */
export const getAssessment = async (userId, testId) => {
  try {
    const docRef = doc(db, ASSESSMENTS_COLLECTION, `${userId}_${testId}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting assessment:', error);
    throw new Error('Failed to get assessment');
  }
};

/**
 * Update a specific rule in the assessment
 * @param {string} userId - The ID of the user
 * @param {string} testId - The ID of the test
 * @param {Object} ruleAssessment - The updated rule assessment
 * @returns {Promise<Object>} - Success status
 */
export const updateRuleAssessment = async (userId, testId, ruleAssessment) => {
  try {
    const docRef = doc(db, ASSESSMENTS_COLLECTION, `${userId}_${testId}`);
    const docSnap = await getDoc(docRef);

    let updatedAssessmentData = [];

    if (docSnap.exists()) {
      // Remove existing rule if it exists
      const existingData = docSnap.data();
      updatedAssessmentData = existingData.assessmentData?.filter(
        item => item.ruleId !== ruleAssessment.ruleId
      ) || [];
    } else {
      // If document doesn't exist, create a new one with empty assessmentData
      await setDoc(docRef, {
        userId,
        testId,
        testType: 'manual',
        assessmentData: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // Add or update the rule assessment
    updatedAssessmentData.push(ruleAssessment);

    await updateDoc(docRef, {
      assessmentData: updatedAssessmentData,
      updatedAt: new Date().toISOString()
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating rule assessment:', error);
    throw new Error('Failed to update rule assessment: ' + error.message);
  }
};

/**
 * Delete an assessment
 * @param {string} userId - The ID of the user
 * @param {string} testId - The ID of the test
 * @returns {Promise<Object>} - Success status
 */
export const deleteAssessment = async (userId, testId) => {
  try {
    const docRef = doc(db, ASSESSMENTS_COLLECTION, `${userId}_${testId}`);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting assessment:', error);
    throw new Error('Failed to delete assessment');
  }
};

/**
 * Get all assessments for a user
 * @param {string} userId - The ID of the user
 * @returns {Promise<Array>} - Array of assessments
 */
export const getUserAssessments = async (userId) => {
  try {
    const q = query(
      collection(db, ASSESSMENTS_COLLECTION),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user assessments:', error);
    throw new Error('Failed to get user assessments');
  }
};

/**
 * Save or update configuration data in Firestore
 * @param {string} userId - The ID of the user
 * @param {string} testId - The ID of the test
 * @param {Object} configData - The configuration data to save
 * @returns {Promise<Object>} - Success status
 */
export const saveConfigData = async (userId, testId, configData) => {
  try {
    const docRef = doc(db, "tests", `${testId}`);
    await updateDoc(docRef, {
      configData,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error('Error saving configuration data:', error);
    throw new Error('Failed to save configuration data');
  }
};

/**
 * Get configuration data from Firestore
 * @param {string} userId - The ID of the user
 * @param {string} testId - The ID of the test
 * @returns {Promise<Object|null>} - The configuration data or null if not found
 */
export const getConfigData = async (userId, testId) => {
  try {
    const docRef = doc(db, "tests", `${testId}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().configData || null;
    }
    return null;
  } catch (error) {
    console.error('Error fetching configuration data:', error);
    throw new Error('Failed to fetch configuration data');
  }
};
