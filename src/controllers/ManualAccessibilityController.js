import { db } from '@/firebase';
import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import ManualAccessibilityTest from '@/models/ManualAccessibilityTest';

/**
 * Controller for handling manual accessibility test operations
 */
export default class ManualAccessibilityController {
  /**
   * Creates a new manual accessibility test
   * @param {ManualAccessibilityTest} test - The test to create
   * @returns {Promise<ManualAccessibilityTest>} The created test with ID
   */
  static async createTest(test) {
    try {
      const testRef = doc(collection(db, 'tests'));
      const testData = test.toFirestore ? test.toFirestore() : test;

      await setDoc(testRef, {
        ...testData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return new ManualAccessibilityTest({
        id: testRef.id,
        ...testData
      });
    } catch (error) {
      console.error('Error creating test:', error);
      throw error;
    }
  }

  /**
   * Gets a test by ID
   * @param {string} testId - The ID of the test to get
   * @returns {Promise<ManualAccessibilityTest|null>} The test or null if not found
   */
  static async getTest(testId) {
    try {
      const testRef = doc(db, 'tests', testId);
      const testSnap = await getDoc(testRef);

      if (!testSnap.exists()) {
        return null;
      }

      return ManualAccessibilityTest.fromFirestore(testSnap.id, testSnap.data());
    } catch (error) {
      console.error('Error getting test:', error);
      throw error;
    }
  }

  /**
   * Updates a test
   * @param {string} testId - The ID of the test to update
   * @param {Object} updates - The updates to apply
   * @returns {Promise<void>}
   */
  static async updateTest(testId, updates) {
    try {
      const testRef = doc(db, 'tests', testId);
      await updateDoc(testRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating test:', error);
      throw error;
    }
  }

  /**
   * Deletes a test
   * @param {string} testId - The ID of the test to delete
   * @returns {Promise<void>}
   */
  static async deleteTest(testId) {
    try {
      const testRef = doc(db, 'tests', testId);
      await deleteDoc(testRef);
    } catch (error) {
      console.error('Error deleting test:', error);
      throw error;
    }
  }

  /**
   * Gets all tests for a user
   * @param {string} userId - The ID of the user
   * @returns {Promise<ManualAccessibilityTest[]>} Array of tests
   */
  static async getUserTests(userId) {
    try {
      const testsQuery = query(
        collection(db, 'tests'),
        where('testAdmin.userDocId', '==', userId),
        where('testType', '==', 'MANUAL')
      );

      const querySnapshot = await getDocs(testsQuery);
      return querySnapshot.docs.map(doc =>
        ManualAccessibilityTest.fromFirestore(doc.id, doc.data())
      );
    } catch (error) {
      console.error('Error getting user tests:', error);
      throw error;
    }
  }
}
