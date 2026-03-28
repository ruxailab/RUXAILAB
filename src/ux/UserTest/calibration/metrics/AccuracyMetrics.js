/**
 * Accuracy Metrics for Eye-Tracking Calibration
 * Computes precision, accuracy, RMS error, and data loss metrics
 */
export default class AccuracyMetrics {
  constructor(config = {}) {
    // Screen dimensions for angular error calculation
    this.screenWidth = config.screenWidth || 1920
    this.screenHeight = config.screenHeight || 1080
    this.viewingDistance = config.viewingDistance || 600 // mm
    this.dpi = config.dpi || 96

    // Thresholds
    this.thresholds = {
      precision: {
        good: 0.5,    // degrees
        acceptable: 1.0
      },
      accuracy: {
        good: 1.0,    // degrees
        acceptable: 2.0
      },
      dataLoss: {
        good: 5,      // percent
        acceptable: 15
      },
      rmsError: {
        good: 50,     // pixels
        acceptable: 100
      }
    }
  }

  /**
   * Compute precision (standard deviation of gaze positions)
   * Lower is better - indicates stability
   * @param {Array} gazePoints - Array of { x, y } gaze positions
   * @returns {Object} { value: degrees, rating: 'good'|'acceptable'|'poor' }
   */
  computePrecision(gazePoints) {
    if (!gazePoints || gazePoints.length < 2) {
      return { value: Infinity, rating: 'poor', samples: 0 }
    }

    const n = gazePoints.length

    // Calculate centroid
    let sumX = 0, sumY = 0
    for (const point of gazePoints) {
      sumX += point.x
      sumY += point.y
    }
    const centroidX = sumX / n
    const centroidY = sumY / n

    // Calculate standard deviation
    let sumSqDist = 0
    for (const point of gazePoints) {
      const dx = point.x - centroidX
      const dy = point.y - centroidY
      sumSqDist += dx * dx + dy * dy
    }
    const variance = sumSqDist / n
    const stdDev = Math.sqrt(variance)

    // Convert to degrees
    // First convert pixels to mm using configured DPI
    const stdDevMm = (stdDev / this.dpi) * 25.4
    const stdDevDegrees = this._mmToDegrees(stdDevMm)

    return {
      value: stdDevDegrees,
      rating: this._rateValue(stdDevDegrees, this.thresholds.precision),
      samples: n
    }
  }

  /**
   * Compute accuracy (angular error between gaze and target)
   * @param {Array} samples - Array of { gaze: {x, y}, target: {x, y} }
   * @returns {Object} { value: degrees, rating: 'good'|'acceptable'|'poor', samples }
   */
  computeAccuracy(samples) {
    if (!samples || samples.length === 0) {
      return { value: Infinity, rating: 'poor', samples: 0 }
    }

    const n = samples.length
    let sumError = 0

    for (const sample of samples) {
      if (!sample.gaze || !sample.target) continue

      // Euclidean distance in pixels
      const dx = sample.gaze.x - sample.target.x
      const dy = sample.gaze.y - sample.target.y
      const distPixels = Math.sqrt(dx * dx + dy * dy)

      // Convert to degrees
      const distMm = (distPixels / 96) * 25.4 // assuming 96 DPI
      const errorDegrees = this._mmToDegrees(distMm)
      sumError += errorDegrees
    }

    const avgError = sumError / n

    return {
      value: avgError,
      rating: this._rateValue(avgError, this.thresholds.accuracy),
      samples: n
    }
  }

  /**
   * Compute RMS (Root Mean Square) error
   * @param {Array} samples - Array of { gaze: {x, y}, target: {x, y} }
   * @returns {Object} { value: pixels, rating: 'good'|'acceptable'|'poor', samples }
   */
  computeRMSError(samples) {
    if (!samples || samples.length === 0) {
      return { value: Infinity, rating: 'poor', samples: 0 }
    }

    const n = samples.length
    let sumSqError = 0

    for (const sample of samples) {
      if (!sample.gaze || !sample.target) continue

      const dx = sample.gaze.x - sample.target.x
      const dy = sample.gaze.y - sample.target.y
      const sqError = dx * dx + dy * dy
      sumSqError += sqError
    }

    const rmsPixels = Math.sqrt(sumSqError / n)

    return {
      value: rmsPixels,
      rating: this._rateValue(rmsPixels, this.thresholds.rmsError),
      samples: n
    }
  }

  /**
   * Compute data loss rate (missing samples)
   * @param {number} expectedSamples - Expected number of samples
   * @param {number} actualSamples - Actual number of samples received
   * @returns {Object} { value: percent, rating: 'good'|'acceptable'|'poor' }
   */
  computeDataLoss(expectedSamples, actualSamples) {
    if (expectedSamples === 0) {
      return { value: 0, rating: 'good' }
    }

    const lossPercent = ((expectedSamples - actualSamples) / expectedSamples) * 100

    return {
      value: lossPercent,
      rating: this._rateValue(lossPercent, this.thresholds.dataLoss, true), // inverted
      expected: expectedSamples,
      actual: actualSamples
    }
  }

  /**
   * Compute all metrics from calibration samples
   * @param {Object} calibrationData - { samples: [{gaze, target}], totalExpected, totalActual }
   * @returns {Object} comprehensive metrics object
   */
  computeAll(calibrationData) {
    const { samples, totalExpected, totalActual } = calibrationData

    return {
      precision: this.computePrecision(samples.map(s => s.gaze)),
      accuracy: this.computeAccuracy(samples),
      rmsError: this.computeRMSError(samples),
      dataLoss: this.computeDataLoss(totalExpected, totalActual),
      overall: this._computeOverallRating(calibrationData)
    }
  }

  /**
   * Compute overall calibration quality rating
   * @param {Object} calibrationData
   * @returns {string} 'good' | 'acceptable' | 'poor'
   */
  _computeOverallRating(calibrationData) {
    const { samples, totalExpected, totalActual } = calibrationData

    // Compute individual metrics (avoiding recursion through computeAll)
    const precision = this.computePrecision(samples.map(s => s.gaze))
    const accuracy = this.computeAccuracy(samples)
    const dataLoss = this.computeDataLoss(totalExpected, totalActual)

    // If any metric is poor, overall is poor
    if (precision.rating === 'poor' ||
        accuracy.rating === 'poor' ||
        dataLoss.rating === 'poor') {
      return 'poor'
    }

    // If all metrics are good, overall is good
    if (precision.rating === 'good' &&
        accuracy.rating === 'good' &&
        dataLoss.rating === 'good') {
      return 'good'
    }

    // Otherwise acceptable
    return 'acceptable'
  }

  /**
   * Convert millimeters to degrees of visual angle
   * @param {number} mm
   * @returns {number} degrees
   */
  _mmToDegrees(mm) {
    // degrees = atan2(mm, viewingDistance) * (180/π)
    return Math.atan2(mm, this.viewingDistance) * (180 / Math.PI)
  }

  /**
   * Rate a value against thresholds
   * @param {number} value
   * @param {Object} thresholds - { good, acceptable }
   * @param {boolean} inverted - true if lower is better
   */
  _rateValue(value, thresholds, inverted = false) {
    if (inverted) {
      if (value <= thresholds.good) return 'good'
      if (value <= thresholds.acceptable) return 'acceptable'
      return 'poor'
    } else {
      if (value <= thresholds.good) return 'good'
      if (value <= thresholds.acceptable) return 'acceptable'
      return 'poor'
    }
  }

  /**
   * Set screen configuration
   * @param {number} width
   * @param {number} height
   * @param {number} distance
   */
  setScreenConfig(width, height, distance) {
    this.screenWidth = width
    this.screenHeight = height
    this.viewingDistance = distance
  }

  /**
   * Update thresholds
   * @param {Object} thresholds
   */
  setThresholds(thresholds) {
    this.thresholds = { ...this.thresholds, ...thresholds }
  }
}
