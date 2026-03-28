/**
 * Drift Detector for Eye-Tracking
 * Detects gaze drift using velocity/acceleration analysis
 * and position-based drift detection over time
 */
export default class DriftDetector {
  constructor(config = {}) {
    // Velocity threshold (pixels per second) - above this indicates smooth pursuit
    this.velocityThreshold = config.velocityThreshold || 50

    // Acceleration threshold (pixels per second^2) - below this during smooth pursuit
    this.accelerationThreshold = config.accelerationThreshold || 100

    // Position drift threshold (pixels over 5 minutes)
    this.positionDriftThreshold = config.positionDriftThreshold || 100

    // Time window for drift assessment (ms)
    this.driftWindow = config.driftWindow || 300000 // 5 minutes

    // Minimum samples needed for reliable detection
    this.minSamples = config.minSamples || 30

    // History buffer
    this.gazeHistory = []
    this.velocityHistory = []

    // Drift state
    this.driftDetected = false
    this.driftVector = { x: 0, y: 0 }
    this.driftStartTime = null

    // Baseline calibration (set during calibration)
    this.baselineCalibration = null
    this.baselineTimestamp = null
  }

  /**
   * Add a gaze point to history
   * @param {Object} gazePoint - { x, y, timestamp? }
   * @param {number} timestamp - optional timestamp
   */
  addGazePoint(gazePoint, timestamp) {
    const ts = timestamp || gazePoint.timestamp || Date.now()

    // Store point with timestamp
    this.gazeHistory.push({
      x: gazePoint.x,
      y: gazePoint.y,
      timestamp: ts
    })

    // Remove old points outside drift window
    const cutoff = ts - this.driftWindow
    this.gazeHistory = this.gazeHistory.filter(p => p.timestamp >= cutoff)

    // Calculate velocity if we have previous points
    if (this.gazeHistory.length >= 2) {
      const prev = this.gazeHistory[this.gazeHistory.length - 2]
      const curr = this.gazeHistory[this.gazeHistory.length - 1]
      const dt = (curr.timestamp - prev.timestamp) / 1000 // seconds

      if (dt > 0) {
        const vx = (curr.x - prev.x) / dt
        const vy = (curr.y - prev.y) / dt
        const velocity = Math.sqrt(vx * vx + vy * vy)

        this.velocityHistory.push({
          vx,
          vy,
          velocity,
          timestamp: ts
        })

        // Keep velocity history shorter
        if (this.velocityHistory.length > 100) {
          this.velocityHistory.shift()
        }
      }
    }
  }

  /**
   * Set baseline calibration for drift comparison
   * @param {Object} calibration - baseline calibration data
   */
  setBaseline(calibration, timestamp) {
    this.baselineCalibration = calibration
    this.baselineTimestamp = timestamp || Date.now()
    this.driftDetected = false
    this.driftVector = { x: 0, y: 0 }
  }

  /**
   * Detect if drift is occurring
   * @returns {Object} { driftDetected, driftProbability, driftVector, recommendation }
   */
  detectDrift() {
    const result = {
      driftDetected: false,
      driftProbability: 0,
      driftVector: { x: 0, y: 0 },
      velocityMagnitude: 0,
      recommendation: 'none'
    }

    if (this.gazeHistory.length < this.minSamples) {
      result.recommendation = 'collecting_data'
      return result
    }

    // Check 1: Velocity-based detection
    const velocityCheck = this._checkVelocityDrift()
    result.velocityMagnitude = velocityCheck.velocityMagnitude

    // Check 2: Position-based drift (long-term)
    const positionCheck = this._checkPositionDrift()

    // Combine checks
    // If high velocity but low acceleration -> smooth pursuit (not drift)
    if (velocityCheck.isSmoothPursuit) {
      result.driftProbability = 0.1 // Very low probability during smooth pursuit
    } else {
      result.driftProbability = Math.max(
        velocityCheck.driftProbability,
        positionCheck.driftProbability
      )
    }

    // Determine if drift is detected
    if (result.driftProbability > 0.7) {
      result.driftDetected = true
      result.driftVector = positionCheck.driftVector
      this.driftDetected = true
    }

    // Generate recommendation
    result.recommendation = this._getRecommendation(result)

    return result
  }

  /**
   * Check drift using velocity and acceleration patterns
   * @private
   */
  _checkVelocityDrift() {
    const result = {
      isSmoothPursuit: false,
      driftProbability: 0,
      velocityMagnitude: 0
    }

    if (this.velocityHistory.length < 10) {
      return result
    }

    // Calculate average velocity and acceleration
    let sumVx = 0, sumVy = 0, sumVA = 0
    let count = 0

    for (let i = 1; i < this.velocityHistory.length; i++) {
      const prev = this.velocityHistory[i - 1]
      const curr = this.velocityHistory[i]
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
    if (avgVelocity > this.velocityThreshold && avgAcceleration < this.accelerationThreshold) {
      result.isSmoothPursuit = true
      result.driftProbability = 0.1
    }
    // Potential drift: moderate velocity with moderate acceleration
    else if (avgVelocity > this.velocityThreshold * 0.5) {
      // Calculate drift probability based on velocity/acceleration ratio
      const ratio = avgAcceleration / Math.max(avgVelocity, 1)
      result.driftProbability = Math.min(ratio / 10, 1) // Normalize to 0-1
    }

    return result
  }

  /**
   * Check drift using position comparison to baseline
   * @private
   */
  _checkPositionDrift() {
    const result = {
      driftProbability: 0,
      driftVector: { x: 0, y: 0 }
    }

    if (!this.baselineCalibration || this.gazeHistory.length < this.minSamples) {
      return result
    }

    // Get baseline center position (typically the center of screen)
    const baselineCenter = this.baselineCalibration.centerPosition || {
      x: this.baselineCalibration.screenWidth / 2,
      y: this.baselineCalibration.screenHeight / 2
    }

    // Get recent gaze points (last 20% of window)
    const recentPoints = this.gazeHistory.slice(-Math.floor(this.gazeHistory.length * 0.2))

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
    if (driftMagnitude > this.positionDriftThreshold * 2) {
      result.driftProbability = 1.0
    } else if (driftMagnitude > this.positionDriftThreshold * 0.5) {
      result.driftProbability = (driftMagnitude - this.positionDriftThreshold * 0.5) /
                               (this.positionDriftThreshold * 1.5)
    } else {
      result.driftProbability = 0
    }

    return result
  }

  /**
   * Get recommended action based on drift analysis
   * @private
   */
  _getRecommendation(driftResult) {
    if (!this.baselineCalibration) {
      return 'calibrate'
    }

    if (driftResult.driftDetected) {
      if (driftResult.driftProbability > 0.9) {
        return 'recalibrate'
      } else {
        return 'monitor'
      }
    }

    // Check if approaching threshold
    if (driftResult.driftProbability > 0.5) {
      return 'prepare_recalibration'
    }

    return 'none'
  }

  /**
   * Get compensated gaze point (apply drift correction)
   * @param {Object} gazePoint
   * @returns {Object} compensated gaze point
   */
  getCompensatedGaze(gazePoint) {
    if (!this.driftDetected || !this.driftVector) {
      return gazePoint
    }

    // Simple linear drift compensation
    // Subtract drift vector scaled by how long drift has been occurring
    const driftAge = this.baselineTimestamp
      ? (Date.now() - this.baselineTimestamp) / 1000
      : 0

    // Decay factor: don't fully compensate, just reduce
    const compensationFactor = Math.min(driftAge / 300, 0.5) // Max 50% compensation

    return {
      x: gazePoint.x - this.driftVector.x * compensationFactor,
      y: gazePoint.y - this.driftVector.y * compensationFactor,
      compensated: true,
      originalX: gazePoint.x,
      originalY: gazePoint.y
    }
  }

  /**
   * Reset drift detector
   */
  reset() {
    this.gazeHistory = []
    this.velocityHistory = []
    this.driftDetected = false
    this.driftVector = { x: 0, y: 0 }
    this.driftStartTime = null
  }

  /**
   * Update configuration
   * @param {Object} config
   */
  setConfig(config) {
    if (config.velocityThreshold !== undefined) {
      this.velocityThreshold = config.velocityThreshold
    }
    if (config.accelerationThreshold !== undefined) {
      this.accelerationThreshold = config.accelerationThreshold
    }
    if (config.positionDriftThreshold !== undefined) {
      this.positionDriftThreshold = config.positionDriftThreshold
    }
    if (config.driftWindow !== undefined) {
      this.driftWindow = config.driftWindow
    }
    if (config.minSamples !== undefined) {
      this.minSamples = config.minSamples
    }
  }

  /**
   * Get current drift state
   * @returns {Object}
   */
  getState() {
    return {
      driftDetected: this.driftDetected,
      driftVector: this.driftVector,
      baselineSet: this.baselineCalibration !== null,
      samplesInHistory: this.gazeHistory.length,
      velocityHistorySize: this.velocityHistory.length
    }
  }
}
