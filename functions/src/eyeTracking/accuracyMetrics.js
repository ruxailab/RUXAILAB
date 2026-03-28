/**
 * Accuracy Metrics Computation for Eye-Tracking
 * Firebase Cloud Function for server-side accuracy analysis
 */

// Default thresholds
const DEFAULT_THRESHOLDS = {
  precision: { good: 0.5, acceptable: 1.0 }, // degrees
  accuracy: { good: 1.0, acceptable: 2.0 }, // degrees
  rmsError: { good: 50, acceptable: 100 }, // pixels
  dataLoss: { good: 5, acceptable: 15 } // percent
}

const DPI = 96 // Standard screen DPI

/**
 * Compute all accuracy metrics from calibration samples
 * @param {Object} data - { samples, totalExpected, totalActual, screenWidth, screenHeight, viewingDistance }
 * @param {Object} thresholds - Optional custom thresholds
 * @returns {Object} Comprehensive metrics
 */
export const computeAllMetrics = (data, thresholds = {}) => {
  const {
    samples = [],
    totalExpected = 0,
    totalActual = 0,
    screenWidth = 1920,
    screenHeight = 1080,
    viewingDistance = 600
  } = data

  const t = { ...DEFAULT_THRESHOLDS, ...thresholds }

  const precision = computePrecision(samples, t.precision, viewingDistance)
  const accuracy = computeAccuracy(samples, t.accuracy, viewingDistance)
  const rmsError = computeRMSError(samples, t.rmsError)
  const dataLoss = computeDataLoss(totalExpected, totalActual, t.dataLoss)
  const overall = computeOverallRating(precision, accuracy, rmsError, dataLoss)

  return {
    precision,
    accuracy,
    rmsError,
    dataLoss,
    overall,
    samples: samples.length
  }
}

/**
 * Compute precision (standard deviation of gaze positions)
 * Lower is better - indicates stability
 * @param {Array} gazePoints - Array of { x, y } or gaze positions
 * @param {Object} thresholds
 * @param {number} viewingDistance - mm
 * @returns {Object}
 */
export const computePrecision = (gazePoints, thresholds = DEFAULT_THRESHOLDS.precision, viewingDistance = 600) => {
  if (!gazePoints || gazePoints.length < 2) {
    return { value: Infinity, rating: 'poor', samples: 0 }
  }

  const n = gazePoints.length

  // Calculate centroid
  let sumX = 0, sumY = 0
  for (const point of gazePoints) {
    sumX += point.x || point.gaze?.x || 0
    sumY += point.y || point.gaze?.y || 0
  }
  const centroidX = sumX / n
  const centroidY = sumY / n

  // Calculate standard deviation
  let sumSqDist = 0
  for (const point of gazePoints) {
    const x = point.x || point.gaze?.x || 0
    const y = point.y || point.gaze?.y || 0
    const dx = x - centroidX
    const dy = y - centroidY
    sumSqDist += dx * dx + dy * dy
  }
  const variance = sumSqDist / n
  const stdDev = Math.sqrt(variance)

  // Convert to degrees
  const stdDevMm = (stdDev / DPI) * 25.4
  const stdDevDegrees = mmToDegrees(stdDevMm, viewingDistance)

  return {
    value: stdDevDegrees,
    rating: rateValue(stdDevDegrees, thresholds, false),
    samples: n
  }
}

/**
 * Compute accuracy (angular error between gaze and target)
 * @param {Array} samples - Array of { gaze: {x, y}, target: {x, y} }
 * @param {Object} thresholds
 * @param {number} viewingDistance - mm
 * @returns {Object}
 */
export const computeAccuracy = (samples, thresholds = DEFAULT_THRESHOLDS.accuracy, viewingDistance = 600) => {
  if (!samples || samples.length === 0) {
    return { value: Infinity, rating: 'poor', samples: 0 }
  }

  const n = samples.length
  let sumError = 0
  let validCount = 0

  for (const sample of samples) {
    if (!sample.gaze || !sample.target) continue

    const dx = sample.gaze.x - sample.target.x
    const dy = sample.gaze.y - sample.target.y
    const distPixels = Math.sqrt(dx * dx + dy * dy)

    const distMm = (distPixels / DPI) * 25.4
    const errorDegrees = mmToDegrees(distMm, viewingDistance)
    sumError += errorDegrees
    validCount++
  }

  if (validCount === 0) {
    return { value: Infinity, rating: 'poor', samples: 0 }
  }

  const avgError = sumError / validCount

  return {
    value: avgError,
    rating: rateValue(avgError, thresholds, false),
    samples: validCount
  }
}

/**
 * Compute RMS (Root Mean Square) error
 * @param {Array} samples - Array of { gaze: {x, y}, target: {x, y} }
 * @param {Object} thresholds
 * @returns {Object}
 */
export const computeRMSError = (samples, thresholds = DEFAULT_THRESHOLDS.rmsError) => {
  if (!samples || samples.length === 0) {
    return { value: Infinity, rating: 'poor', samples: 0 }
  }

  const n = samples.length
  let sumSqError = 0
  let validCount = 0

  for (const sample of samples) {
    if (!sample.gaze || !sample.target) continue

    const dx = sample.gaze.x - sample.target.x
    const dy = sample.gaze.y - sample.target.y
    const sqError = dx * dx + dy * dy
    sumSqError += sqError
    validCount++
  }

  if (validCount === 0) {
    return { value: Infinity, rating: 'poor', samples: 0 }
  }

  const rmsPixels = Math.sqrt(sumSqError / validCount)

  return {
    value: rmsPixels,
    rating: rateValue(rmsPixels, thresholds, false),
    samples: validCount
  }
}

/**
 * Compute data loss rate (missing samples)
 * @param {number} expectedSamples
 * @param {number} actualSamples
 * @param {Object} thresholds
 * @returns {Object}
 */
export const computeDataLoss = (expectedSamples, actualSamples, thresholds = DEFAULT_THRESHOLDS.dataLoss) => {
  if (expectedSamples === 0) {
    return { value: 0, rating: 'good', expected: 0, actual: 0 }
  }

  const lossPercent = ((expectedSamples - actualSamples) / expectedSamples) * 100

  return {
    value: Math.max(0, lossPercent),
    rating: rateValue(lossPercent, thresholds), // Lower is better
    expected: expectedSamples,
    actual: actualSamples
  }
}

/**
 * Compute overall calibration quality rating
 * @param {Object} precision
 * @param {Object} accuracy
 * @param {Object} rmsError
 * @param {Object} dataLoss
 * @returns {string}
 */
export const computeOverallRating = (precision, accuracy, rmsError, dataLoss) => {
  // If any metric is poor, overall is poor
  if (precision.rating === 'poor' ||
      accuracy.rating === 'poor' ||
      rmsError.rating === 'poor' ||
      dataLoss.rating === 'poor') {
    return 'poor'
  }

  // If all metrics are good, overall is good
  if (precision.rating === 'good' &&
      accuracy.rating === 'good' &&
      rmsError.rating === 'good' &&
      dataLoss.rating === 'good') {
    return 'good'
  }

  // Otherwise acceptable
  return 'acceptable'
}

/**
 * Rate a value against thresholds
 * @param {number} value
 * @param {Object} thresholds - { good, acceptable }
 * @param {boolean} inverted - true if higher is better
 * @returns {string}
 */
const rateValue = (value, thresholds, inverted = false) => {
  if (inverted) {
    if (value >= thresholds.good) return 'good'
    if (value >= thresholds.acceptable) return 'acceptable'
    return 'poor'
  }
  
  if (value <= thresholds.good) return 'good'
  if (value <= thresholds.acceptable) return 'acceptable'
  return 'poor'
}

/**
 * Convert millimeters to degrees of visual angle
 * @param {number} mm
 * @param {number} distance - viewing distance in mm
 * @returns {number} degrees
 */
const mmToDegrees = (mm, distance) => {
  return Math.atan2(mm, distance) * (180 / Math.PI)
}

/**
 * Generate a summary report for calibration
 * @param {Object} metrics
 * @param {Object} calibrationInfo - { calibrationId, userId, testId, timestamp }
 * @returns {Object}
 */
export const generateCalibrationReport = (metrics, calibrationInfo) => {
  return {
    calibrationId: calibrationInfo.calibrationId,
    userId: calibrationInfo.userId,
    testId: calibrationInfo.testId,
    timestamp: calibrationInfo.timestamp || Date.now(),
    overallRating: metrics.overall,
    metrics: {
      precision: {
        value: metrics.precision.value,
        rating: metrics.precision.rating,
        display: `${metrics.precision.value.toFixed(2)}°`
      },
      accuracy: {
        value: metrics.accuracy.value,
        rating: metrics.accuracy.rating,
        display: `${metrics.accuracy.value.toFixed(2)}°`
      },
      rmsError: {
        value: metrics.rmsError.value,
        rating: metrics.rmsError.rating,
        display: `${metrics.rmsError.value.toFixed(1)}px`
      },
      dataLoss: {
        value: metrics.dataLoss.value,
        rating: metrics.dataLoss.rating,
        display: `${metrics.dataLoss.value.toFixed(1)}%`
      }
    },
    samples: metrics.samples,
    passed:
      metrics.precision.rating !== 'poor' &&
      metrics.accuracy.rating !== 'poor' &&
      metrics.rmsError.rating !== 'poor' &&
      metrics.dataLoss.rating !== 'poor'
  }
}
