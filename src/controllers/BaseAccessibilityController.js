import { db } from '@/firebase';
import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

/**
 * Base controller for handling accessibility test operations
 */
export default class BaseAccessibilityController {
    /**
     * @param {Object} model - The model class (ManualAccessibilityTest or AutomaticAccessibilityTest)
     * @param {string} testType - The type of test ('MANUAL' or 'AUTOMATIC')
     */
    constructor(model, testType) {
        this.model = model;
        this.testType = testType;
    }

    /**
     * Creates a new accessibility test
     * @param {Object} test - The test to create
     * @returns {Promise<Object>} The created test with ID
     */
    async createTest(test) {
        try {
            const testRef = doc(collection(db, 'tests'));
            const testData = test.toFirestore ? test.toFirestore() : test;

            await setDoc(testRef, {
                ...testData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                testType: this.testType
            });

            return new this.model({
                id: testRef.id,
                ...testData
            });
        } catch (error) {
            console.error(`Error creating ${this.testType.toLowerCase()} accessibility test:`, error);
            throw error;
        }
    }

    /**
     * Gets a test by ID
     * @param {string} testId - The ID of the test to get
     * @returns {Promise<Object|null>} The test or null if not found
     */
    async getTest(testId) {
        try {
            const testRef = doc(db, 'tests', testId);
            const testSnap = await getDoc(testRef);

            if (!testSnap.exists()) {
                return null;
            }

            return this.model.fromFirestore(testSnap.id, testSnap.data());
        } catch (error) {
            console.error(`Error getting ${this.testType.toLowerCase()} accessibility test:`, error);
            throw error;
        }
    }

    /**
     * Updates a test
     * @param {string} testId - The ID of the test to update
     * @param {Object} updates - The updates to apply
     * @returns {Promise<void>}
     */
    async updateTest(testId, updates) {
        try {
            const testRef = doc(db, 'tests', testId);
            await updateDoc(testRef, {
                ...updates,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error(`Error updating ${this.testType.toLowerCase()} accessibility test:`, error);
            throw error;
        }
    }

    /**
     * Deletes a test
     * @param {string} testId - The ID of the test to delete
     * @returns {Promise<void>}
     */
    async deleteTest(testId) {
        try {
            const testRef = doc(db, 'tests', testId);
            await deleteDoc(testRef);
        } catch (error) {
            console.error(`Error deleting ${this.testType.toLowerCase()} accessibility test:`, error);
            throw error;
        }
    }

    /**
     * Gets all tests for a user
     * @param {string} userId - The ID of the user
     * @returns {Promise<Object[]>} Array of tests
     */
    async getUserTests(userId) {
        try {
            const testsQuery = query(
                collection(db, 'tests'),
                where('testAdmin.userDocId', '==', userId),
                where('testType', '==', this.testType)
            );

            const querySnapshot = await getDocs(testsQuery);
            return querySnapshot.docs.map(doc =>
                this.model.fromFirestore(doc.id, doc.data())
            );
        } catch (error) {
            console.error(`Error getting user ${this.testType.toLowerCase()} accessibility tests:`, error);
            throw error;
        }
    }
}
