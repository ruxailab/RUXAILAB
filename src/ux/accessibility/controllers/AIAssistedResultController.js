import { db, storage } from '@/app/plugins/firebase';
import {
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    getDocs
} from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import AIAssistedResult from '../models/AIAssistedResult';

const COLLECTION_NAME = 'aiassisted';

/**
 * Controller for managing AI-assisted accessibility test results
 */
class AIAssistedResultController {
    /**
     * Get or create a result document for a test
     * @param {string} testId - The test ID
     * @returns {Promise<AIAssistedResult>}
     */
    async getOrCreateResult(testId) {
        try {
            const docRef = doc(db, COLLECTION_NAME, testId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return AIAssistedResult.fromFirestore(docSnap);
            }

            // Create new result document
            const newResult = new AIAssistedResult({ testId });
            await setDoc(docRef, newResult.toFirestore());

            console.log('Created new AI-assisted result document:', testId);
            return newResult;
        } catch (error) {
            console.error('Error getting or creating result:', error);
            throw error;
        }
    }

    /**
     * Get result by test ID
     * @param {string} testId - The test ID
     * @returns {Promise<AIAssistedResult|null>}
     */
    async getResultByTestId(testId) {
        try {
            const docRef = doc(db, COLLECTION_NAME, testId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                return null;
            }

            return AIAssistedResult.fromFirestore(docSnap);
        } catch (error) {
            console.error('Error getting result:', error);
            throw error;
        }
    }

    /**
     * Upload HTML file to Firebase Storage
     * @param {string} testId - The test ID
     * @param {string} fileName - Original file name
     * @param {string} fileContent - HTML file content
     * @returns {Promise<Object>} - Object with storageRef and downloadUrl
     */
    async uploadSourceFile(testId, fileName, fileContent) {
        try {
            // Create a blob from the content
            const blob = new Blob([fileContent], { type: 'text/html' });

            // Create storage path
            const timestamp = Date.now();
            const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
            const storagePath = `aiassisted/${testId}/source_${timestamp}_${sanitizedFileName}`;

            // Upload to Firebase Storage
            const fileRef = storageRef(storage, storagePath);
            await uploadBytes(fileRef, blob);

            // Get download URL
            const downloadUrl = await getDownloadURL(fileRef);

            console.log('Source file uploaded:', storagePath);

            return {
                storageRef: storagePath,
                downloadUrl: downloadUrl
            };
        } catch (error) {
            console.error('Error uploading source file:', error);
            throw error;
        }
    }

    /**
     * Initialize result with input source (URL or file)
     * @param {string} testId - The test ID
     * @param {Object} inputData - Input data object
     * @param {string} inputData.type - 'url' or 'file'
     * @param {string} inputData.url - URL (if type is 'url')
     * @param {string} inputData.fileName - File name (if type is 'file')
     * @param {string} inputData.fileContent - File content (if type is 'file')
     * @returns {Promise<AIAssistedResult>}
     */
    async initializeResult(testId, inputData) {
        try {
            let result = await this.getResultByTestId(testId);

            if (!result) {
                result = new AIAssistedResult({ testId });
            }

            // Set input type
            result.inputType = inputData.type;

            if (inputData.type === 'url') {
                result.url = inputData.url;
            } else if (inputData.type === 'file') {
                // Upload file to storage
                const uploadResult = await this.uploadSourceFile(
                    testId,
                    inputData.fileName,
                    inputData.fileContent
                );

                result.sourceFile = uploadResult.storageRef;
                result.sourceFileName = inputData.fileName;
            }

            // Save to Firestore
            const docRef = doc(db, COLLECTION_NAME, testId);
            await setDoc(docRef, result.toFirestore(), { merge: true });

            console.log('Result initialized for test:', testId);
            return result;
        } catch (error) {
            console.error('Error initializing result:', error);
            throw error;
        }
    }

    /**
     * Save ChromaCheck analysis results
     * @param {string} testId - The test ID
     * @param {Object} chromaData - ChromaCheck analysis data
     * @returns {Promise<AIAssistedResult>}
     */
    async saveChromaCheckResult(testId, chromaData) {
        try {
            let result = await this.getOrCreateResult(testId);

            // Initialize input source if not already set (from sessionStorage)
            if (!result.inputType || result.inputType === 'url' && !result.url) {
                await this._ensureInputSource(result, testId);
            }

            result.updateChromaCheck(chromaData);

            const docRef = doc(db, COLLECTION_NAME, testId);
            await updateDoc(docRef, {
                inputType: result.inputType,
                url: result.url,
                sourceFile: result.sourceFile,
                sourceFileName: result.sourceFileName,
                chroma_check: result.chroma_check,
                lastAnalyzedTool: result.lastAnalyzedTool,
                updatedAt: result.updatedAt,
                toolsCompleted: result.toolsCompleted,
                totalIssues: result.totalIssues
            });

            console.log('ChromaCheck results saved for test:', testId);
            return result;
        } catch (error) {
            console.error('Error saving ChromaCheck result:', error);
            throw error;
        }
    }

    /**
     * Save AnchorSense analysis results
     * @param {string} testId - The test ID
     * @param {Object} anchorData - AnchorSense analysis data
     * @returns {Promise<AIAssistedResult>}
     */
    async saveAnchorSenseResult(testId, anchorData) {
        try {
            let result = await this.getOrCreateResult(testId);

            // Initialize input source if not already set (from sessionStorage)
            if (!result.inputType || result.inputType === 'url' && !result.url) {
                await this._ensureInputSource(result, testId);
            }

            result.updateAnchorSense(anchorData);

            const docRef = doc(db, COLLECTION_NAME, testId);
            await updateDoc(docRef, {
                inputType: result.inputType,
                url: result.url,
                sourceFile: result.sourceFile,
                sourceFileName: result.sourceFileName,
                anchor_sense: result.anchor_sense,
                lastAnalyzedTool: result.lastAnalyzedTool,
                updatedAt: result.updatedAt,
                toolsCompleted: result.toolsCompleted,
                totalIssues: result.totalIssues
            });

            console.log('AnchorSense results saved for test:', testId);
            return result;
        } catch (error) {
            console.error('Error saving AnchorSense result:', error);
            throw error;
        }
    }

    /**
     * Save ImgTagTip analysis results
     * @param {string} testId - The test ID
     * @param {Object} imgTipData - ImgTagTip analysis data
     * @returns {Promise<AIAssistedResult>}
     */
    async saveImgTipResult(testId, imgTipData) {
        try {
            let result = await this.getOrCreateResult(testId);

            // Initialize input source if not already set (from sessionStorage)
            if (!result.inputType || result.inputType === 'url' && !result.url) {
                await this._ensureInputSource(result, testId);
            }

            result.updateImgTip(imgTipData);

            const docRef = doc(db, COLLECTION_NAME, testId);
            await updateDoc(docRef, {
                inputType: result.inputType,
                url: result.url,
                sourceFile: result.sourceFile,
                sourceFileName: result.sourceFileName,
                img_tip: result.img_tip,
                lastAnalyzedTool: result.lastAnalyzedTool,
                updatedAt: result.updatedAt,
                toolsCompleted: result.toolsCompleted,
                totalIssues: result.totalIssues
            });

            console.log('ImgTagTip results saved for test:', testId);
            return result;
        } catch (error) {
            console.error('Error saving ImgTagTip result:', error);
            throw error;
        }
    }

    /**
     * Update input source (URL or file)
     * @param {string} testId - The test ID
     * @param {Object} inputData - New input data
     * @returns {Promise<AIAssistedResult>}
     */
    async updateInputSource(testId, inputData) {
        try {
            let result = await this.getOrCreateResult(testId);

            // Clear old file if switching from file to URL or changing file
            if (result.sourceFile && inputData.type === 'url') {
                await this.deleteSourceFile(result.sourceFile);
            }

            // Reset all tool results when input changes
            result.chroma_check = null;
            result.anchor_sense = null;
            result.img_tip = null;
            result.toolsCompleted = [];
            result.totalIssues = 0;

            // Update input
            result.inputType = inputData.type;

            if (inputData.type === 'url') {
                result.url = inputData.url;
                result.sourceFile = '';
                result.sourceFileName = '';
            } else if (inputData.type === 'file') {
                const uploadResult = await this.uploadSourceFile(
                    testId,
                    inputData.fileName,
                    inputData.fileContent
                );
                result.sourceFile = uploadResult.storageRef;
                result.sourceFileName = inputData.fileName;
                result.url = '';
            }

            const docRef = doc(db, COLLECTION_NAME, testId);
            await setDoc(docRef, result.toFirestore());

            console.log('Input source updated for test:', testId);
            return result;
        } catch (error) {
            console.error('Error updating input source:', error);
            throw error;
        }
    }

    /**
     * Delete source file from storage
     * @param {string} storagePath - Storage path
     * @returns {Promise<void>}
     */
    async deleteSourceFile(storagePath) {
        try {
            if (!storagePath) return;

            const fileRef = storageRef(storage, storagePath);
            await deleteObject(fileRef);
            console.log('Source file deleted:', storagePath);
        } catch (error) {
            console.error('Error deleting source file:', error);
            // Don't throw - file might already be deleted
        }
    }

    /**
     * Delete result document and associated files
     * @param {string} testId - The test ID
     * @returns {Promise<void>}
     */
    async deleteResult(testId) {
        try {
            // Get result to find storage references
            const result = await this.getResultByTestId(testId);

            if (result && result.sourceFile) {
                await this.deleteSourceFile(result.sourceFile);
            }

            // Delete Firestore document
            const docRef = doc(db, COLLECTION_NAME, testId);
            await deleteDoc(docRef);

            console.log('Result deleted for test:', testId);
        } catch (error) {
            console.error('Error deleting result:', error);
            throw error;
        }
    }

    /**
     * Private method to ensure input source is set from sessionStorage
     * @param {AIAssistedResult} result - The result object to update
     * @param {string} testId - The test ID
     * @private
     */
    async _ensureInputSource(result, testId) {
        try {
            // Try to get input data from sessionStorage (browser environment)
            if (typeof sessionStorage !== 'undefined') {
                const inputType = sessionStorage.getItem('ai_examine_input_type');

                if (inputType === 'url') {
                    const url = sessionStorage.getItem('ai_examine_url');
                    if (url) {
                        result.inputType = 'url';
                        result.url = url;
                        result.sourceFile = '';
                        result.sourceFileName = '';
                        console.log('Input source initialized from sessionStorage: URL');
                    }
                } else if (inputType === 'file') {
                    const fileName = sessionStorage.getItem('ai_examine_file_name');
                    const fileContent = sessionStorage.getItem('ai_examine_file_content');

                    if (fileName && fileContent) {
                        // Upload file to storage
                        const uploadResult = await this.uploadSourceFile(testId, fileName, fileContent);
                        result.inputType = 'file';
                        result.sourceFile = uploadResult.storageRef;
                        result.sourceFileName = fileName;
                        result.url = '';
                        console.log('Input source initialized from sessionStorage: File');
                    }
                }
            }
        } catch (error) {
            console.error('Error ensuring input source:', error);
            // Don't throw - allow the tool result to be saved even if input source can't be determined
        }
    }

    /**
     * Get analysis summary for a test
     * @param {string} testId - The test ID
     * @returns {Promise<Object|null>}
     */
    async getAnalysisSummary(testId) {
        try {
            const result = await this.getResultByTestId(testId);
            return result ? result.getSummary() : null;
        } catch (error) {
            console.error('Error getting analysis summary:', error);
            throw error;
        }
    }

    /**
     * Check if a specific tool has been completed
     * @param {string} testId - The test ID
     * @param {string} toolName - Tool name ('chroma_check', 'anchor_sense', 'img_tip')
     * @returns {Promise<boolean>}
     */
    async isToolCompleted(testId, toolName) {
        try {
            const result = await this.getResultByTestId(testId);
            return result ? result.isToolCompleted(toolName) : false;
        } catch (error) {
            console.error('Error checking tool completion:', error);
            return false;
        }
    }

    /**
     * Get all results (admin function)
     * @returns {Promise<AIAssistedResult[]>}
     */
    async getAllResults() {
        try {
            const colRef = collection(db, COLLECTION_NAME);
            const snapshot = await getDocs(colRef);

            return snapshot.docs.map(doc => AIAssistedResult.fromFirestore(doc));
        } catch (error) {
            console.error('Error getting all results:', error);
            throw error;
        }
    }
}

// Export singleton instance
export default new AIAssistedResultController();
