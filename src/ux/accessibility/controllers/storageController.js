import { storage } from '@/app/plugins/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject, getMetadata } from 'firebase/storage';

/**
 * Upload an image file to Firebase Storage for accessibility assessment notes
 * @param {File} file - The image file to upload
 * @param {string} userId - The ID of the user
 * @param {string} testId - The ID of the test
 * @param {string} ruleId - The ID of the rule
 * @param {number} noteIndex - The index of the note (for multiple notes per rule)
 * @returns {Promise<Object>} - The download URL and file metadata
 */
export const uploadAssessmentImage = async (file, userId, testId, ruleId, noteIndex = 0) => {
    try {
        if (!file || !userId || !testId || !ruleId) {
            throw new Error('Missing required parameters for image upload');
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            throw new Error('File size too large. Maximum size is 10MB.');
        }

        // Generate unique filename with timestamp to avoid conflicts
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop() || 'jpg';
        const sanitizedFileName = `${ruleId}_note_${noteIndex}_${timestamp}.${fileExtension}`;

        // Create storage reference with organized path structure
        const imagePath = `assessments/${testId}/${userId}/images/${sanitizedFileName}`;
        const imageRef = storageRef(storage, imagePath);

        console.log('Uploading image to path:', imagePath);

        // Upload the file
        const uploadResult = await uploadBytes(imageRef, file);
        console.log('Image uploaded successfully:', uploadResult);

        // Get the download URL
        const downloadURL = await getDownloadURL(uploadResult.ref);
        console.log('Download URL obtained:', downloadURL);

        return {
            success: true,
            downloadURL,
            fileName: sanitizedFileName,
            filePath: imagePath,
            fileSize: file.size,
            fileType: file.type,
            uploadedAt: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error uploading assessment image:', error);
        throw new Error(`Failed to upload image: ${error.message}`);
    }
};

/**
 * Delete an image from Firebase Storage
 * @param {string} filePath - The full path to the file in storage
 * @returns {Promise<Object>} - Success status
 */
export const deleteAssessmentImage = async (filePath) => {
    try {
        if (!filePath) {
            throw new Error('File path is required');
        }

        const imageRef = storageRef(storage, filePath);
        await deleteObject(imageRef);
        console.log('Image deleted successfully:', filePath);

        return { success: true };
    } catch (error) {
        console.error('Error deleting assessment image:', error);
        // Don't throw error if file doesn't exist
        if (error.code === 'storage/object-not-found') {
            console.log('File not found, considering as successfully deleted:', filePath);
            return { success: true };
        }
        throw new Error(`Failed to delete image: ${error.message}`);
    }
};

/**
 * Upload multiple images for a single assessment rule
 * @param {Array} files - Array of image files
 * @param {string} userId - The ID of the user
 * @param {string} testId - The ID of the test
 * @param {string} ruleId - The ID of the rule
 * @returns {Promise<Array>} - Array of upload results
 */
export const uploadMultipleAssessmentImages = async (files, userId, testId, ruleId) => {
    try {
        const uploadPromises = files.map((file, index) =>
            uploadAssessmentImage(file, userId, testId, ruleId, index)
        );

        const results = await Promise.allSettled(uploadPromises);

        const successfulUploads = [];
        const failedUploads = [];

        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                successfulUploads.push(result.value);
            } else {
                failedUploads.push({
                    index,
                    fileName: files[index].name,
                    error: result.reason.message
                });
            }
        });

        return {
            success: failedUploads.length === 0,
            successfulUploads,
            failedUploads,
            totalFiles: files.length,
            successCount: successfulUploads.length,
            failureCount: failedUploads.length
        };
    } catch (error) {
        console.error('Error uploading multiple images:', error);
        throw new Error(`Failed to upload images: ${error.message}`);
    }
};

/**
 * Get image metadata and check if it exists
 * @param {string} filePath - The full path to the file in storage
 * @returns {Promise<Object>} - File metadata or null if not found
 */
export const getImageMetadata = async (filePath) => {
    try {
        const imageRef = storageRef(storage, filePath);
        const metadata = await getMetadata(imageRef);

        return {
            exists: true,
            name: metadata.name,
            size: metadata.size,
            contentType: metadata.contentType,
            timeCreated: metadata.timeCreated,
            updated: metadata.updated
        };
    } catch (error) {
        if (error.code === 'storage/object-not-found') {
            return { exists: false };
        }
        console.error('Error getting image metadata:', error);
        throw new Error(`Failed to get image metadata: ${error.message}`);
    }
};