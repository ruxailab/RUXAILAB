import { admin, functions } from '../f.firebase.js'
import logger from '../utils/logger.js'
import { analyzeDrift, applyDriftCompensation, updateCalibrationBaseline } from '../eyeTracking/driftCompensation.js'
import { computeAllMetrics, generateCalibrationReport } from '../eyeTracking/accuracyMetrics.js'

const calibrationCorsOrigins = (process.env.EYE_LAB_CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

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
      logger.error('Error saving calibration:', { error })
      return res.status(500).json({ error: error.message })
    }
  },
})

export const getCalibrationConfig = functions.onRequest({
  opts: {
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

/**
 * Advanced calibration endpoint with full metrics computation
 * POST /api/eyeTracking/calibrate
 */
export const calibrateEyeTracking = functions.onRequest({
  opts: {
    cors: calibrationCorsOrigins,
  },
  handler: async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed')
    }

    try {
      const {
        calibration_data,
        device_info,
        filter_config,
        screen_width,
        screen_height,
        viewing_distance
      } = req.body

      if (!calibration_data || !Array.isArray(calibration_data)) {
        return res.status(400).json({ error: 'calibration_data array is required' })
      }

      // Compute accuracy metrics
      const metrics = computeAllMetrics({
        samples: calibration_data,
        totalExpected: calibration_data.length,
        totalActual: calibration_data.length,
        screenWidth: screen_width || 1920,
        screenHeight: screen_height || 1080,
        viewingDistance: viewing_distance || 600
      })

      // Store calibration result in Firestore
      const db = admin.firestore()
      const calibRef = db.collection('calibrations').doc()
      const calibId = calibRef.id

      const calibrationRecord = {
        calibrationId: calibId,
        calibrationData: calibration_data,
        deviceInfo: device_info || { hardwareSource: 'WEBCAM' },
        filterConfig: filter_config,
        metrics,
        screenWidth: screen_width || 1920,
        screenHeight: screen_height || 1080,
        viewingDistance: viewing_distance || 600,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        status: metrics.overall === 'good' || metrics.overall === 'acceptable' ? 'valid' : 'needs_review'
      }

      await calibRef.set(calibrationRecord)

      // Generate report
      const report = generateCalibrationReport(metrics, { calibrationId: calibId })

      return res.status(200).json({
        success: true,
        calibrationId: calibId,
        metrics,
        report,
        passed: metrics.overall !== 'poor'
      })
    } catch (error) {
      logger.error('Error in calibrateEyeTracking:', { error })
      return res.status(500).json({ error: error.message })
    }
  },
})

/**
 * Validation endpoint for checking calibration quality
 * POST /api/eyeTracking/validate
 */
export const validateCalibration = functions.onRequest({
  opts: {
    cors: calibrationCorsOrigins,
  },
  handler: async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed')
    }

    try {
      const {
        validation_data,
        calibration_id,
        screen_width,
        screen_height,
        viewing_distance
      } = req.body

      if (!validation_data || !Array.isArray(validation_data)) {
        return res.status(400).json({ error: 'validation_data array is required' })
      }

      // Compute validation metrics
      const metrics = computeAllMetrics({
        samples: validation_data,
        totalExpected: validation_data.length,
        totalActual: validation_data.length,
        screenWidth: screen_width || 1920,
        screenHeight: screen_height || 1080,
        viewingDistance: viewing_distance || 600
      })

      const isValid = metrics.overall !== 'poor'

      // Update calibration record if provided
      if (calibration_id) {
        const db = admin.firestore()
        await db.collection('calibrations').doc(calibration_id).update({
          validationMetrics: metrics,
          validatedAt: admin.firestore.FieldValue.serverTimestamp(),
          validationPassed: isValid
        })
      }

      return res.status(200).json({
        success: true,
        isValid,
        metrics,
        recommendations: getRecommendations(metrics)
      })
    } catch (error) {
      logger.error('Error in validateCalibration:', { error })
      return res.status(500).json({ error: error.message })
    }
  },
})

/**
 * Drift assessment endpoint
 * POST /api/eyeTracking/driftAssess
 */
export const assessDrift = functions.onRequest({
  opts: {
    cors: calibrationCorsOrigins,
  },
  handler: async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed')
    }

    try {
      const {
        recent_gaze_data,
        baseline_calibration,
        calibration_id
      } = req.body

      if (!recent_gaze_data || !Array.isArray(recent_gaze_data)) {
        return res.status(400).json({ error: 'recent_gaze_data array is required' })
      }

      // Analyze drift
      const driftResult = analyzeDrift(recent_gaze_data, baseline_calibration)

      // Apply compensation if drift detected
      let compensatedGaze = null
      if (driftResult.driftDetected && driftResult.driftVector) {
        compensatedGaze = applyDriftCompensation(
          recent_gaze_data,
          driftResult.driftVector,
          baseline_calibration?.timestamp
        )

        // Update calibration baseline if significant drift
        if (driftResult.driftProbability > 0.8 && calibration_id) {
          const updatedBaseline = updateCalibrationBaseline(
            baseline_calibration,
            driftResult.driftVector
          )

          const db = admin.firestore()
          await db.collection('calibrations').doc(calibration_id).update({
            baselineCalibration: updatedBaseline,
            lastDriftUpdate: admin.firestore.FieldValue.serverTimestamp()
          })
        }
      }

      return res.status(200).json({
        success: true,
        driftDetected: driftResult.driftDetected,
        driftProbability: driftResult.driftProbability,
        driftVector: driftResult.driftVector,
        recommendation: driftResult.recommendation,
        compensatedGaze: driftResult.driftDetected ? compensatedGaze : null
      })
    } catch (error) {
      logger.error('Error in assessDrift:', { error })
      return res.status(500).json({ error: error.message })
    }
  },
})

/**
 * Get recommendations based on metrics
 * @param {Object} metrics
 * @returns {Array}
 */
const getRecommendations = (metrics) => {
  const recommendations = []

  if (metrics.precision.rating === 'poor') {
    recommendations.push({
      metric: 'precision',
      issue: 'Gaze positions are too variable',
      suggestion: 'Ensure consistent head position during calibration'
    })
  }

  if (metrics.accuracy.rating === 'poor') {
    recommendations.push({
      metric: 'accuracy',
      issue: 'Gaze offset from targets is too large',
      suggestion: 'Recalibrate with better lighting and face positioning'
    })
  }

  if (metrics.rmsError.rating === 'poor') {
    recommendations.push({
      metric: 'rmsError',
      issue: 'Overall tracking error is high',
      suggestion: 'Check camera focus and lighting conditions'
    })
  }

  if (metrics.dataLoss.rating === 'poor') {
    recommendations.push({
      metric: 'dataLoss',
      issue: 'Many gaze samples were lost',
      suggestion: 'Improve lighting or adjust camera angle'
    })
  }

  if (recommendations.length === 0) {
    recommendations.push({
      metric: 'overall',
      issue: 'None',
      suggestion: 'Calibration quality is acceptable'
    })
  }

  return recommendations
}
