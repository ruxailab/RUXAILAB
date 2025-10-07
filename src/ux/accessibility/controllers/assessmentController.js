import { db } from '@/app/plugins/firebase';
import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { uploadAssessmentImage, deleteAssessmentImage } from './storageController';

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
 * Update a specific rule in the assessment with image handling
 * @param {string} userId - The ID of the user
 * @param {string} testId - The ID of the test
 * @param {Object} ruleAssessment - The updated rule assessment
 * @param {Array} imageFiles - Optional array of image files to upload
 * @returns {Promise<Object>} - Success status with image URLs
 */
export const updateRuleAssessment = async (userId, testId, ruleAssessment, imageFiles = []) => {
  try {
    const docRef = doc(db, ASSESSMENTS_COLLECTION, `${userId}_${testId}`);
    const docSnap = await getDoc(docRef);

    let updatedAssessmentData = [];
    let existingRuleData = null;

    if (docSnap.exists()) {
      // Get existing data and find existing rule
      const existingData = docSnap.data();
      updatedAssessmentData = existingData.assessmentData?.filter(
        item => item.ruleId !== ruleAssessment.ruleId
      ) || [];

      existingRuleData = existingData.assessmentData?.find(
        item => item.ruleId === ruleAssessment.ruleId
      );
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

    // Handle image uploads if provided
    const uploadedImages = [];
    if (imageFiles && imageFiles.length > 0) {
      console.log('Processing image uploads for rule:', ruleAssessment.ruleId);

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        if (file && file instanceof File) {
          try {
            const uploadResult = await uploadAssessmentImage(
              file,
              userId,
              testId,
              ruleAssessment.ruleId,
              i
            );
            uploadedImages.push({
              fileName: uploadResult.fileName,
              downloadURL: uploadResult.downloadURL,
              filePath: uploadResult.filePath,
              fileSize: uploadResult.fileSize,
              uploadedAt: uploadResult.uploadedAt
            });
            console.log('Image uploaded successfully:', uploadResult.fileName);
          } catch (uploadError) {
            console.error('Failed to upload image:', uploadError);
            // Continue with other images, don't fail the entire operation
          }
        }
      }
    }

    // Prepare notes with image metadata
    let processedNotes = [];
    if (ruleAssessment.notes && Array.isArray(ruleAssessment.notes)) {
      processedNotes = ruleAssessment.notes.map((note, index) => {
        const uploadedImage = uploadedImages[index];
        return {
          text: note.text || '',
          imageName: uploadedImage ? uploadedImage.fileName : (note.imageName || null),
          imageUrl: uploadedImage ? uploadedImage.downloadURL : (note.imageUrl || null),
          filePath: uploadedImage ? uploadedImage.filePath : (note.filePath || null),
          uploadedAt: uploadedImage ? uploadedImage.uploadedAt : (note.uploadedAt || null)
        };
      });
    }

    // Add or update the rule assessment with processed notes
    const updatedRuleAssessment = {
      ...ruleAssessment,
      notes: processedNotes,
      updatedAt: new Date().toISOString()
    };

    updatedAssessmentData.push(updatedRuleAssessment);

    await updateDoc(docRef, {
      assessmentData: updatedAssessmentData,
      updatedAt: new Date().toISOString()
    });

    return {
      success: true,
      uploadedImages,
      updatedNotes: processedNotes
    };
  } catch (error) {
    console.error('Error updating rule assessment:', error);
    throw new Error('Failed to update rule assessment: ' + error.message);
  }
};

/**
 * Delete an assessment and cleanup associated images
 * @param {string} userId - The ID of the user
 * @param {string} testId - The ID of the test
 * @returns {Promise<Object>} - Success status
 */
export const deleteAssessment = async (userId, testId) => {
  try {
    const docRef = doc(db, ASSESSMENTS_COLLECTION, `${userId}_${testId}`);
    const docSnap = await getDoc(docRef);

    // Clean up images before deleting assessment
    if (docSnap.exists()) {
      const assessmentData = docSnap.data();
      const imageCleanupPromises = [];

      // Collect all image file paths from notes
      assessmentData.assessmentData?.forEach(rule => {
        rule.notes?.forEach(note => {
          if (note.filePath) {
            imageCleanupPromises.push(
              deleteAssessmentImage(note.filePath).catch(error => {
                console.warn('Failed to delete image:', note.filePath, error);
                // Don't fail the entire operation if image deletion fails
              })
            );
          }
        });
      });

      // Wait for image cleanup (with timeout)
      if (imageCleanupPromises.length > 0) {
        console.log('Cleaning up images for assessment:', `${userId}_${testId}`);
        await Promise.allSettled(imageCleanupPromises);
      }
    }

    // Delete the assessment document
    await deleteDoc(docRef);
    console.log('Assessment deleted successfully:', `${userId}_${testId}`);

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

/**
 * Upload images for assessment notes
 * @param {Array} imageFiles - Array of image File objects
 * @param {string} userId - The ID of the user
 * @param {string} testId - The ID of the test
 * @param {string} ruleId - The ID of the rule
 * @returns {Promise<Array>} - Array of uploaded image metadata
 */
export const uploadNoteImages = async (imageFiles, userId, testId, ruleId) => {
  try {
    if (!Array.isArray(imageFiles) || imageFiles.length === 0) {
      return [];
    }

    const uploadPromises = imageFiles.map(async (file, index) => {
      if (file && file instanceof File) {
        return await uploadAssessmentImage(file, userId, testId, ruleId, index);
      }
      return null;
    });

    const results = await Promise.allSettled(uploadPromises);

    return results
      .filter(result => result.status === 'fulfilled' && result.value !== null)
      .map(result => result.value);
  } catch (error) {
    console.error('Error uploading note images:', error);
    throw new Error('Failed to upload note images');
  }
};

/**
 * Delete specific images for a rule
 * @param {string} userId - The ID of the user  
 * @param {string} testId - The ID of the test
 * @param {string} ruleId - The ID of the rule
 * @param {Array} filePaths - Array of file paths to delete
 * @returns {Promise<Object>} - Success status and cleanup results
 */
export const deleteRuleImages = async (userId, testId, ruleId, filePaths) => {
  try {
    if (!Array.isArray(filePaths) || filePaths.length === 0) {
      return { success: true, deletedCount: 0 };
    }

    const deletePromises = filePaths.map(filePath =>
      deleteAssessmentImage(filePath).catch(error => {
        console.warn('Failed to delete image:', filePath, error);
        return { success: false, error: error.message };
      })
    );

    const results = await Promise.allSettled(deletePromises);
    const successCount = results.filter(result =>
      result.status === 'fulfilled' && result.value.success
    ).length;

    return {
      success: true,
      deletedCount: successCount,
      totalRequested: filePaths.length
    };
  } catch (error) {
    console.error('Error deleting rule images:', error);
    throw new Error('Failed to delete rule images');
  }
};
