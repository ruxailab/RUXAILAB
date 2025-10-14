import { admin, functions } from "../f.firebase.js";

/**
 * Cloud Function triggered on Firebase Storage file write (create/update/delete).
 */
export const onStorageUpdate = functions.onStorageTrigger({
  event: "finalized",
  handler: async (event) => {
    const object = event.data;
    try {
      const filePath = object.name;
      const match = filePath.match(/^tests\/([^\/]+)/);
      if (!match) {
        console.log("File path does not match expected pattern:", filePath);
        return null;
      }
      const testId = match[1];

      const db = admin.firestore();
      const usersRef = db.collection('users');
      const querySnapshot = await usersRef
        .where(`myTests.${testId}`, '!=', null)
        .get();

      if (querySnapshot.empty) {
        console.log(`No users found with testId: ${testId}`);
        return null;
      }

      const bucket = admin.storage().bucket();

      const batch = db.batch();
      for (const doc of querySnapshot.docs) {
        const userData = doc.data();
        const userTestIds = Object.keys(userData.myTests || {});

        let totalBytes = 0;
        for (const tid of userTestIds) {
          const [testFiles] = await bucket.getFiles({ prefix: `tests/${tid}` });
          for (const file of testFiles) {
            totalBytes += Number(file.metadata.size || 0);
          }
        }
        const totalSizeMB = (totalBytes / (1024 * 1024)).toFixed(2);

        batch.update(doc.ref, { storageUsageMB: parseFloat(totalSizeMB) });
      }

      await batch.commit();
      console.log(`Updated storage usage for testId: ${testId}`);
    } catch (error) {
      console.error("Error updating storage usage:", error);
    }
  }
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

    console.log("results", results);

    return {
      totalSizeMB: (totalBytes / (1024 * 1024)).toFixed(2),
      perTest: results,
    };
  } catch (error) {
    console.error("Error calculating storage usage:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});