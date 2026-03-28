/**
 * Drift Compensation for Eye-Tracking
 * Firebase Cloud Function for server-side drift detection and compensation
 */

const VELOCITY_THRESHOLD = 50 // pixels/sec
const ACCELERATION_THRESHOLD = 100 // pixels/sec^2
const POSITION_DRIFT_THRESHOLD = 100 // pixels
const DRIFT_WINDOW = 300000 // 5 minutes in ms
const MIN_SAMPLES = 30

/**
 * Analyze gaze history for drift
 * @param {Array} gazeHistory - Array of { x, y, timestamp }
 * @param {Object} baseline - Baseline calibration { centerPosition, screenWidth, screenHeight }
 * @returns {Object} Drift analysis result
 */
export const analyzeDrift = (gazeHistory, baseline) => {
  if (!gazeHistory || gazeHistory.length < MIN_SAMPLES) {
    return {
      driftDetected: false,
      driftProbability: 0,
      driftVector: { x: 0, y: 0 },
      recommendation: 'collecting_data',
      samples: gazeHistory?.length || 0
    }
  }

  // Calculate velocity history
  const velocityHistory = []
  for (let i = 1; i < gazeHistory.length; i++) {
    const prev = gazeHistory[i - 1]
    const curr = gazeHistory[i]
    const dt = (curr.timestamp - prev.timestamp) / 1000 // seconds

    if (dt > 0) {
      velocityHistory.push({
        vx: (curr.x - prev.x) / dt,
        vy: (curr.y - prev.y) / dt,
        timestamp: curr.timestamp
      })
    }
  }

  // Check velocity-based drift
  const velocityCheck = checkVelocityDrift(velocityHistory)

  // Check position-based drift
  const positionCheck = checkPositionDrift(gazeHistory, baseline)

  // Combine results
  let driftProbability = Math.max(
    velocityCheck.driftProbability,
    positionCheck.driftProbability
  )

  // Smooth pursuit check
  if (velocityCheck.isSmoothPursuit) {
    driftProbability = Math.min(driftProbability, 0.1)
  }

  const driftDetected = driftProbability > 0.7

  return {
    driftDetected,
    driftProbability,
    driftVector: positionCheck.driftVector,
    velocityMagnitude: velocityCheck.velocityMagnitude,
    recommendation: getRecommendation(driftDetected, driftProbability),
    samples: gazeHistory.length
  }
}

/**
 * Check drift using velocity patterns
 * @param {Array} velocityHistory
 * @returns {Object}
 */
const checkVelocityDrift = (velocityHistory) => {
  const result = {
    isSmoothPursuit: false,
    driftProbability: 0,
    velocityMagnitude: 0
  }

  if (velocityHistory.length < 10) {
    return result
  }

  let sumVx = 0, sumVy = 0, sumVA = 0
  let count = 0

  for (let i = 1; i < velocityHistory.length; i++) {
    const prev = velocityHistory[i - 1]
    const curr = velocityHistory[i]
    const dt = (curr.timestamp - prev.timestamp) / 1000

    if (dt > 0) {
      const ax = (curr.vx - prev.vx) / dt
      const ay = (curr.vy - prev.vy) / dt
      const acceleration = Math.sqrt(ax * ax + ay * ay)

      sumVx += Math.abs(curr.vx)
      sumVy += Math.abs(curr.vy)
      sumVA += acceleration
      count++
    }
  }

  if (count === 0) return result

  const avgVelocity = Math.sqrt(
    Math.pow(sumVx / count, 2) + Math.pow(sumVy / count, 2)
  )
  const avgAcceleration = sumVA / count

  result.velocityMagnitude = avgVelocity

  // Smooth pursuit: high velocity, low acceleration
  if (avgVelocity > VELOCITY_THRESHOLD && avgAcceleration < ACCELERATION_THRESHOLD) {
    result.isSmoothPursuit = true
    result.driftProbability = 0.1
  } else if (avgVelocity > VELOCITY_THRESHOLD * 0.5) {
    const ratio = avgAcceleration / Math.max(avgVelocity, 1)
    result.driftProbability = Math.min(ratio / 10, 1)
  }

  return result
}

/**
 * Check drift using position comparison to baseline
 * @param {Array} gazeHistory
 * @param {Object} baseline
 * @returns {Object}
 */
const checkPositionDrift = (gazeHistory, baseline) => {
  const result = {
    driftProbability: 0,
    driftVector: { x: 0, y: 0 }
  }

  if (!baseline || gazeHistory.length < MIN_SAMPLES) {
    return result
  }

  const baselineCenter = baseline.centerPosition || {
    x: baseline.screenWidth / 2,
    y: baseline.screenHeight / 2
  }

  // Get recent gaze points (last 20% of window)
  const recentPoints = gazeHistory.slice(-Math.floor(gazeHistory.length * 0.2))

  // Calculate average recent position
  let sumX = 0, sumY = 0
  for (const point of recentPoints) {
    sumX += point.x
    sumY += point.y
  }
  const recentCenter = {
    x: sumX / recentPoints.length,
    y: sumY / recentPoints.length
  }

  // Calculate drift vector
  const driftX = recentCenter.x - baselineCenter.x
  const driftY = recentCenter.y - baselineCenter.y
  const driftMagnitude = Math.sqrt(driftX * driftX + driftY * driftY)

  result.driftVector = { x: driftX, y: driftY }

  // Calculate drift probability based on threshold
  if (driftMagnitude > POSITION_DRIFT_THRESHOLD * 2) {
    result.driftProbability = 1.0
  } else if (driftMagnitude > POSITION_DRIFT_THRESHOLD * 0.5) {
    result.driftProbability = (driftMagnitude - POSITION_DRIFT_THRESHOLD * 0.5) /
                             (POSITION_DRIFT_THRESHOLD * 1.5)
  }

  return result
}

/**
 * Get recommended action based on drift analysis
 * @param {boolean} driftDetected
 * @param {number} driftProbability
 * @returns {string}
 */
const getRecommendation = (driftDetected, driftProbability) => {
  if (driftDetected) {
    if (driftProbability > 0.9) {
      return 'recalibrate'
    } else {
      return 'monitor'
    }
  }

  if (driftProbability > 0.5) {
    return 'prepare_recalibration'
  }

  return 'none'
}

/**
 * Apply drift compensation to gaze points
 * @param {Array} gazePoints - Array of { x, y, timestamp }
 * @param {Object} driftVector - { x, y } compensation vector
 * @param {number} baselineTimestamp - When calibration was performed
 * @returns {Array} Compensated gaze points
 */
export const applyDriftCompensation = (gazePoints, driftVector, baselineTimestamp) => {
  if (!driftVector || !baselineTimestamp) {
    return gazePoints
  }

  return gazePoints.map(point => {
    const driftAge = (point.timestamp - baselineTimestamp) / 1000 // seconds
    const compensationFactor = Math.min(driftAge / 300, 0.5) // Max 50% compensation

    return {
      ...point,
      x: point.x - driftVector.x * compensationFactor,
      y: point.y - driftVector.y * compensationFactor,
      compensated: true,
      originalX: point.x,
      originalY: point.y
    }
  })
}

/**
 * Update calibration baseline with new drift-corrected position
 * @param {Object} currentBaseline
 * @param {Object} driftVector
 * @returns {Object} Updated baseline
 */
export const updateCalibrationBaseline = (currentBaseline, driftVector) => {
  return {
    ...currentBaseline,
    centerPosition: {
      x: currentBaseline.centerPosition.x + driftVector.x,
      y: currentBaseline.centerPosition.y + driftVector.y
    },
    lastUpdate: Date.now()
  }
}
