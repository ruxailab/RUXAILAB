/**
 * Image Upload Testing Utilities for Accessibility Assessment
 * 
 * This file contains utility functions to test the end-to-end image upload functionality
 */

import { uploadAssessmentImage, deleteAssessmentImage } from '../controllers/storageController';
import { updateRuleAssessment, uploadNoteImages } from '../controllers/assessmentController';

/**
 * Test image upload functionality
 * @param {string} userId - Test user ID
 * @param {string} testId - Test ID  
 * @param {string} ruleId - Rule ID
 * @returns {Promise<Object>} - Test results
 */
export const testImageUpload = async (userId, testId, ruleId) => {
    const testResults = {
        success: false,
        steps: [],
        errors: []
    };

    try {
        // Step 1: Create a test image file
        testResults.steps.push('Creating test image file...');
        const testImageBlob = new Blob(['test image data'], { type: 'image/png' });
        const testFile = new File([testImageBlob], 'test-image.png', { type: 'image/png' });
        testResults.steps.push('✓ Test image file created');

        // Step 2: Test direct storage upload
        testResults.steps.push('Testing direct storage upload...');
        const uploadResult = await uploadAssessmentImage(testFile, userId, testId, ruleId, 0);
        testResults.steps.push(`✓ Direct storage upload successful: ${uploadResult.fileName}`);
        testResults.uploadResult = uploadResult;

        // Step 3: Test assessment controller upload
        testResults.steps.push('Testing assessment controller upload...');
        const assessmentData = {
            ruleId,
            severity: 'medium',
            status: 'fail',
            notes: [{
                text: 'Test note with image',
                imageName: testFile.name
            }]
        };

        const assessmentResult = await updateRuleAssessment(
            userId,
            testId,
            assessmentData,
            [testFile]
        );
        testResults.steps.push('✓ Assessment controller upload successful');
        testResults.assessmentResult = assessmentResult;

        // Step 4: Test image cleanup
        testResults.steps.push('Testing image cleanup...');
        await deleteAssessmentImage(uploadResult.filePath);
        testResults.steps.push('✓ Image cleanup successful');

        testResults.success = true;
        testResults.message = 'All image upload tests passed successfully';

    } catch (error) {
        testResults.errors.push(error.message);
        testResults.success = false;
        testResults.message = `Image upload test failed: ${error.message}`;
    }

    return testResults;
};

/**
 * Test multiple image upload
 * @param {string} userId - Test user ID
 * @param {string} testId - Test ID
 * @param {string} ruleId - Rule ID
 * @param {number} imageCount - Number of images to test
 * @returns {Promise<Object>} - Test results
 */
export const testMultipleImageUpload = async (userId, testId, ruleId, imageCount = 3) => {
    const testResults = {
        success: false,
        steps: [],
        errors: [],
        uploadedFiles: []
    };

    try {
        // Create multiple test files
        testResults.steps.push(`Creating ${imageCount} test image files...`);
        const testFiles = [];

        for (let i = 0; i < imageCount; i++) {
            const testImageBlob = new Blob([`test image data ${i}`], { type: 'image/png' });
            const testFile = new File([testImageBlob], `test-image-${i}.png`, { type: 'image/png' });
            testFiles.push(testFile);
        }
        testResults.steps.push(`✓ Created ${imageCount} test files`);

        // Test multiple upload
        testResults.steps.push('Testing multiple image upload...');
        const uploadResults = await uploadNoteImages(testFiles, userId, testId, ruleId);
        testResults.steps.push(`✓ Multiple upload successful: ${uploadResults.length} files`);
        testResults.uploadResults = uploadResults;

        // Test assessment with multiple images
        testResults.steps.push('Testing assessment with multiple images...');
        const notes = testFiles.map((file, index) => ({
            text: `Test note ${index + 1} with image`,
            imageName: file.name
        }));

        const assessmentData = {
            ruleId,
            severity: 'high',
            status: 'fail',
            notes
        };

        const assessmentResult = await updateRuleAssessment(
            userId,
            testId,
            assessmentData,
            testFiles
        );
        testResults.steps.push('✓ Assessment with multiple images successful');
        testResults.assessmentResult = assessmentResult;

        // Cleanup
        testResults.steps.push('Cleaning up test files...');
        const cleanupPromises = uploadResults.map(result =>
            deleteAssessmentImage(result.filePath).catch(error => {
                console.warn('Cleanup warning:', error);
            })
        );
        await Promise.all(cleanupPromises);
        testResults.steps.push('✓ Cleanup completed');

        testResults.success = true;
        testResults.message = 'Multiple image upload test passed successfully';

    } catch (error) {
        testResults.errors.push(error.message);
        testResults.success = false;
        testResults.message = `Multiple image upload test failed: ${error.message}`;
    }

    return testResults;
};

/**
 * Test error handling for invalid files
 * @param {string} userId - Test user ID
 * @param {string} testId - Test ID
 * @param {string} ruleId - Rule ID
 * @returns {Promise<Object>} - Test results
 */
export const testErrorHandling = async (userId, testId, ruleId) => {
    const testResults = {
        success: false,
        steps: [],
        errors: [],
        expectedErrors: []
    };

    try {
        // Test 1: Invalid file type
        testResults.steps.push('Testing invalid file type...');
        const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });

        try {
            await uploadAssessmentImage(invalidFile, userId, testId, ruleId, 0);
            testResults.errors.push('Should have rejected invalid file type');
        } catch (error) {
            testResults.expectedErrors.push('✓ Invalid file type correctly rejected');
        }

        // Test 2: Large file size
        testResults.steps.push('Testing oversized file...');
        const largeData = new ArrayBuffer(11 * 1024 * 1024); // 11MB
        const largeFile = new File([largeData], 'large.jpg', { type: 'image/jpeg' });

        try {
            await uploadAssessmentImage(largeFile, userId, testId, ruleId, 0);
            testResults.errors.push('Should have rejected oversized file');
        } catch (error) {
            testResults.expectedErrors.push('✓ Oversized file correctly rejected');
        }

        // Test 3: Missing parameters
        testResults.steps.push('Testing missing parameters...');
        const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

        try {
            await uploadAssessmentImage(null, userId, testId, ruleId, 0);
            testResults.errors.push('Should have rejected null file');
        } catch (error) {
            testResults.expectedErrors.push('✓ Null file correctly rejected');
        }

        testResults.success = testResults.errors.length === 0;
        testResults.message = testResults.success
            ? 'Error handling tests passed successfully'
            : 'Some error handling tests failed';

    } catch (error) {
        testResults.errors.push(error.message);
        testResults.success = false;
        testResults.message = `Error handling test failed: ${error.message}`;
    }

    return testResults;
};

/**
 * Run comprehensive image upload tests
 * @param {string} userId - Test user ID
 * @param {string} testId - Test ID
 * @param {string} ruleId - Rule ID
 * @returns {Promise<Object>} - Complete test results
 */
export const runImageUploadTests = async (userId, testId, ruleId) => {
    console.log('🧪 Starting comprehensive image upload tests...');

    const allResults = {
        overall: false,
        timestamp: new Date().toISOString(),
        tests: {}
    };

    try {
        // Test 1: Basic image upload
        console.log('Running basic image upload test...');
        allResults.tests.basic = await testImageUpload(userId, testId, ruleId);

        // Test 2: Multiple image upload
        console.log('Running multiple image upload test...');
        allResults.tests.multiple = await testMultipleImageUpload(userId, testId, ruleId, 3);

        // Test 3: Error handling
        console.log('Running error handling test...');
        allResults.tests.errorHandling = await testErrorHandling(userId, testId, ruleId);

        // Overall success
        allResults.overall = Object.values(allResults.tests).every(test => test.success);

        console.log('🎉 Image upload tests completed!');
        console.log('Overall result:', allResults.overall ? 'PASS' : 'FAIL');

        return allResults;

    } catch (error) {
        console.error('❌ Image upload tests failed:', error);
        allResults.overall = false;
        allResults.error = error.message;
        return allResults;
    }
};

export default {
    testImageUpload,
    testMultipleImageUpload,
    testErrorHandling,
    runImageUploadTests
};