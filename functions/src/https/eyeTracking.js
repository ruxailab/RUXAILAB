import { admin, functions } from '../f.firebase.js'

export const receiveCalibration = functions.onRequest({
    handler: async (req, res) => {
        if (req.method !== "POST") {
            return res.status(405).send("Method Not Allowed");
        }

        try {
            const {
                session_id,
                screen_height,
                screen_width,
                k
            } = req.body;

            if (!session_id) {
                return res.status(400).json({ error: "session_id is required" });
            }

            const db = admin.firestore();

            const calibRef = db.collection("calibrations").doc();
            const calibId = calibRef.id;

            const calibrationData = {
                session_id,
                screen_height,
                screen_width,
                k,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            };

            await calibRef.set(calibrationData);

            const userDocRef = db.collection("users").doc(session_id);
            const userDoc = await userDocRef.get();

            if (userDoc.exists) {
                await userDocRef.update({
                    calibrationId: calibId
                });
            } else {
                await userDocRef.set({
                    calibrationId: calibId
                });
            }

            return res.status(200).json({ message: "Calibration saved and user updated successfully" })

        } catch (error) {
            console.error("Error saving calibration:", error);
            return res.status(500).json({ error: error.message });
        }
    }
});

