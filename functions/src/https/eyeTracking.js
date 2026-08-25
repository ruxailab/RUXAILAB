import { admin, functions } from '../core/firebase/f.firebase.js'
import logger from '../utils/logger.js'

const calibrationCorsOrigins = (process.env.EYE_LAB_CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

export const receiveCalibration = functions.onRequest({
  options: {
    cors: calibrationCorsOrigins,
  },
  handler: async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed')
    }

    try {
      const {
        session_id,
        screen_height,
        screen_width,
        k,
        model,
        study_id,
        user_id,
      } = req.body

      if (!session_id) {
        return res.status(400).json({ error: 'session_id is required' })
      }

      const db = admin.firestore()

      const calibRef = db.collection('calibrations').doc()
      const calibId = calibRef.id

      const calibrationData = {
        sessionId: session_id,
        screenHeight: screen_height,
        screenWidth: screen_width,
        k,
        model,
        userId: user_id,
        studyId: study_id,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      }

      await calibRef.set(calibrationData)

      const userDocRef = db.collection('users').doc(user_id)
      const userDoc = await userDocRef.get()

      if (userDoc.exists) {
        await userDocRef.update({
          lastCalibrationId: calibId,
        })
      }

      return res
        .status(200)
        .json({ message: 'Calibration saved and user updated successfully' })
    } catch (error) {
      logger.error('Error saving calibration:', { error })
      return res.status(500).json({ error: error.message })
    }
  },
})

export const getCalibrationConfig = functions.onRequest({
  options: {
    cors: calibrationCorsOrigins,
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
      logger.error('Error getting calibration config:', { error })
      return res.status(500).json({ error: error.message })
    }
  },
})
