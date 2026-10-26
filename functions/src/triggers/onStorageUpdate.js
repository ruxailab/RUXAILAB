import { admin, functions } from "../core/firebase/f.firebase.js";
import logger from "../utils/logger.js";

/**
 * Recalculates storage usage for every user that owns the changed test.
 */
const updateStorageUsageForPath = async (filePath) => {
  try {
    const match = filePath?.match(/^tests\/([^\/]+)/);
    if (!match) {
      logger.info("File path does not match expected pattern:", { filePath });
      return null;
    }

    const testId = match[1];
    const db = admin.firestore();
    const usersRef = db.collection('users');
    const querySnapshot = await usersRef
      .where(`myTests.${testId}`, '!=', null)
      .get();

    if (querySnapshot.empty) {
      logger.info(`No users found with testId: ${testId}`);
      return null;
    }

    const bucket = admin.storage().bucket();
    const batch = db.batch();

    for (const doc of querySnapshot.docs) {
      const userData = doc.data();
      const userTestIds = Object.keys(userData.myTests || {});

      const filePromises = userTestIds.map((tid) =>
        bucket.getFiles({ prefix: `tests/${tid}` }),
      );
      const fileResults = await Promise.all(filePromises);

      let totalBytes = 0;
      for (const [testFiles] of fileResults) {
        for (const file of testFiles) {
          totalBytes += Number(file.metadata.size || 0);
        }
      }

      batch.update(doc.ref, {
        storageUsageMB: parseFloat((totalBytes / (1024 * 1024)).toFixed(2)),
      });
    }

    await batch.commit();
    logger.info(`Updated storage usage for testId: ${testId}`);
    return null;
  } catch (error) {
    logger.error("Error updating storage usage:", { error });
    return null;
  }
};

/**
 * Cloud Function triggered when a file is created or overwritten.
 */
export const onStorageUpdate = functions.onStorageTrigger({
  event: "finalized",
  handler: async (event) => updateStorageUsageForPath(event.data?.name),
});

/**
 * Cloud Function triggered when a file is deleted.
 */
export const onStorageDelete = functions.onStorageTrigger({
  event: "deleted",
  handler: async (event) => updateStorageUsageForPath(event.data?.name),
});

/**
 * Cloud Function to calculate Firebase Storage usage per test ID.
 * Callable from frontend.
 */
export const calculateStorageUsage = functions.https.onCall(async (data) => {
  try {
    const testIds = data.testIds;
    if (!Array.isArray(testIds) || testIds.length === 0) {
      throw new Error("No testIds provided.");
    }

    const bucket = admin.storage().bucket();
    let totalBytes = 0;
    const results = [];

    for (const testId of testIds) {
      const [files] = await bucket.getFiles({ prefix: `tests/${testId}` });
      let testBytes = 0;

      for (const file of files) {
        testBytes += Number(file.metadata.size || 0);
      }

      results.push({
        testId,
        sizeMB: (testBytes / (1024 * 1024)).toFixed(2),
      });

      totalBytes += testBytes;
    }

    logger.info("results", { results });

    return {
      totalSizeMB: (totalBytes / (1024 * 1024)).toFixed(2),
      perTest: results,
    };
  } catch (error) {
    logger.error("Error calculating storage usage:", { error });
    throw new functions.https.HttpsError("internal", error.message);
  }
});
