import { db } from '@/app/plugins/firebase'
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore'

const ASSESSMENTS_COLLECTION = 'assessments'

/**
 * Accessibility assessment controller: save/get/update/delete assessments and config in Firestore
 * @class AssessmentController
 */
export default class AssessmentController {
  /**
   * Save or update an assessment in Firestore
   * @param {string} userId - The ID of the user
   * @param {string} testId - The ID of the test
   * @param {string} testType - The type of test (e.g., 'manual')
   * @param {Array} assessmentData - Array of assessment objects
   * @returns {Promise<Object>} - Success status and document ID
   * @example
   * const controller = new AssessmentController()
   * const result = await controller.saveAssessment('user123', 'test456', 'manual', assessmentData)
   * console.log(result.success, result.id)
   */
  async saveAssessment(userId, testId, testType, assessmentData) {
    try {
      const docRef = doc(db, ASSESSMENTS_COLLECTION, `${userId}_${testId}`)
      const docSnap = await getDoc(docRef)

      const assessment = {
        userId,
        testId,
        testType,
        assessmentData: docSnap.exists()
          ? [...docSnap.data().assessmentData, ...assessmentData]
          : assessmentData,
        updatedAt: new Date().toISOString(),
        ...(docSnap.exists() ? {} : { createdAt: new Date().toISOString() }),
      }

      await setDoc(docRef, assessment, { merge: true })
      return { success: true, id: docRef.id }
    } catch {
      throw new Error('Failed to save assessment')
    }
  }

  /**
   * Get an assessment by user ID and test ID
   * @param {string} userId - The ID of the user
   * @param {string} testId - The ID of the test
   * @returns {Promise<Object|null>} - The assessment data or null if not found
   * @example
   * const controller = new AssessmentController()
   * const assessment = await controller.getAssessment('user123', 'test456')
   * if (assessment) console.log(assessment.id)
   */
  async getAssessment(userId, testId) {
    try {
      const docRef = doc(db, ASSESSMENTS_COLLECTION, `${userId}_${testId}`)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() }
      }
      return null
    } catch {
      throw new Error('Failed to get assessment')
    }
  }

  /**
   * Update a specific rule in the assessment
   * @param {string} userId - The ID of the user
   * @param {string} testId - The ID of the test
   * @param {Object} ruleAssessment - The updated rule assessment
   * @returns {Promise<Object>} - Success status
   * @example
   * const controller = new AssessmentController()
   * const result = await controller.updateRuleAssessment('user123', 'test456', ruleData)
   * console.log(result.success)
   */
  async updateRuleAssessment(userId, testId, ruleAssessment) {
    try {
      const docRef = doc(db, ASSESSMENTS_COLLECTION, `${userId}_${testId}`)
      const docSnap = await getDoc(docRef)

      let updatedAssessmentData = []

      if (docSnap.exists()) {
        // Remove existing rule if it exists
        const existingData = docSnap.data()
        updatedAssessmentData =
          existingData.assessmentData?.filter(
            (item) => item.ruleId !== ruleAssessment.ruleId,
          ) || []
      } else {
        // If document doesn't exist, create a new one with empty assessmentData
        await setDoc(docRef, {
          userId,
          testId,
          testType: 'manual',
          assessmentData: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      }

      // Add or update the rule assessment
      updatedAssessmentData.push(ruleAssessment)

      await updateDoc(docRef, {
        assessmentData: updatedAssessmentData,
        updatedAt: new Date().toISOString(),
      })

      return { success: true }
    } catch (error) {
      throw new Error('Failed to update rule assessment: ' + error.message)
    }
  }

  /**
   * Delete an assessment
   * @param {string} userId - The ID of the user
   * @param {string} testId - The ID of the test
   * @returns {Promise<Object>} - Success status
   * @example
   * const controller = new AssessmentController()
   * const result = await controller.deleteAssessment('user123', 'test456')
   * console.log(result.success)
   */
  async deleteAssessment(userId, testId) {
    try {
      const docRef = doc(db, ASSESSMENTS_COLLECTION, `${userId}_${testId}`)
      await deleteDoc(docRef)
      return { success: true }
    } catch {
      throw new Error('Failed to delete assessment')
    }
  }

  /**
   * Get all assessments for a user
   * @param {string} userId - The ID of the user
   * @returns {Promise<Array>} - Array of assessments
   * @example
   * const controller = new AssessmentController()
   * const assessments = await controller.getUserAssessments('user123')
   * console.log(assessments.length)
   */
  async getUserAssessments(userId) {
    try {
      const q = query(
        collection(db, ASSESSMENTS_COLLECTION),
        where('userId', '==', userId),
      )

      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch {
      throw new Error('Failed to get user assessments')
    }
  }

  /**
   * Save or update configuration data in Firestore
   * @param {string} userId - The ID of the user
   * @param {string} testId - The ID of the test
   * @param {Object} configData - The configuration data to save
   * @returns {Promise<Object>} - Success status
   * @example
   * const controller = new AssessmentController()
   * const result = await controller.saveConfigData('user123', 'test456', config)
   * console.log(result.success)
   */
  async saveConfigData(userId, testId, configData) {
    try {
      const docRef = doc(db, 'tests', `${testId}`)
      await updateDoc(docRef, {
        configData,
        updatedAt: new Date().toISOString(),
      })
      return { success: true }
    } catch {
      throw new Error('Failed to save configuration data')
    }
  }

  /**
   * Get configuration data from Firestore
   * @param {string} userId - The ID of the user
   * @param {string} testId - The ID of the test
   * @returns {Promise<Object|null>} - The configuration data or null if not found
   * @example
   * const controller = new AssessmentController()
   * const config = await controller.getConfigData('user123', 'test456')
   * if (config) console.log(config.settings)
   */
  async getConfigData(userId, testId) {
    try {
      const docRef = doc(db, 'tests', `${testId}`)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return docSnap.data().configData || null
      }
      return null
    } catch {
      throw new Error('Failed to fetch configuration data')
    }
  }
}
