import { admin, functions } from '../f.firebase.js'

export const receiveCalibration = functions.onRequest({
  handler: async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed')
    }

    try {
      const { session_id, screen_height, screen_width, k } = req.body

      if (!session_id) {
        return res.status(400).json({ error: 'session_id is required' })
      }

      const db = admin.firestore()

      const calibRef = db.collection('calibrations').doc()
      const calibId = calibRef.id

      const calibrationData = {
        session_id,
        screen_height,
        screen_width,
        k,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      }

      await calibRef.set(calibrationData)

      const userDocRef = db.collection('users').doc(session_id)
      const userDoc = await userDocRef.get()

      if (userDoc.exists) {
        await userDocRef.update({
          calibrationId: calibId,
        })
      } else {
        await userDocRef.set({
          calibrationId: calibId,
        })
      }

      return res
        .status(200)
        .json({ message: 'Calibration saved and user updated successfully' })
    } catch (error) {
      console.error('Error saving calibration:', error)
      return res.status(500).json({ error: error.message })
    }
  },
})

export const getCalibrationConfig = functions.onRequest({
  opts: {
    cors: [
      'http://localhost:8081',
      'http://127.0.0.1:8081',
      'https://eye-tracking-28179.web.app',
    ],
  },
  handler: async (req, res) => {
    if (req.method !== 'GET') {
      return res.status(405).send('Method Not Allowed')
    }

    try {
      const { testId } = req.query

      if (!testId) {
        return res.status(400).json({ error: 'testId is required' })
      }

      const db = admin.firestore()
      const testRef = db.collection('tests').doc(testId)
      const testDoc = await testRef.get()

      if (!testDoc.exists) {
        return res.status(404).json({ error: 'Test not found' })
      }

      const testData = testDoc.data()
      const calibrationConfig = testData.calibrationConfig || null

      if (!calibrationConfig) {
        return res
          .status(404)
          .json({ error: 'Calibration config not found in test' })
      }

      return res.status(200).json({
        testId,
        calibrationConfig,
      })
    } catch (error) {
      console.error('Error getting calibration config:', error)
      return res.status(500).json({ error: error.message })
    }
  },
})
