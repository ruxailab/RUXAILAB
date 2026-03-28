/**
 * Calibration Result Data Model
 * Stores comprehensive results from multi-stage calibration process
 */
export default class CalibrationResult {
  constructor(params = {}) {
    // Calibration identification
    this.calibrationId = params.calibrationId || this._generateId()
    this.userId = params.userId || null
    this.testId = params.testId || null
    this.timestamp = params.timestamp || Date.now()

    // Calibration settings used
    this.settings = params.settings || {}

    // Stage results
    this.stages = {
      initial: params.initialStage || null,
      validation: params.validationStage || null,
      driftReference: params.driftReferenceStage || null
    }

    // Overall metrics
    this.metrics = params.metrics || {
      precision: null,      // degrees
      accuracy: null,       // degrees
      rmsError: null,       // pixels
      dataLoss: null,       // percent
      driftRate: null       // mm/min
    }

    // Overall quality rating
    this.qualityRating = params.qualityRating || 'unknown' // 'good' | 'acceptable' | 'poor' | 'unknown'

    // Calibration data points (raw gaze samples)
    this.calibrationPoints = params.calibrationPoints || []

    // Model coefficients (from regression)
    this.modelCoefficients = params.modelCoefficients || null

    // Device info
    this.deviceInfo = params.deviceInfo || {
      hardwareSource: 'WEBCAM',
      screenWidth: 1920,
      screenHeight: 1080,
      viewingDistance: 600
    }

    // Status
    this.status = params.status || 'completed' // 'pending' | 'in_progress' | 'completed' | 'failed' | 'expired'

    // Error info if failed
    this.error = params.error || null
  }

  /**
   * Generate unique calibration ID
   * @private
   */
  _generateId() {
    return `calib_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Set initial stage result
   * @param {Object} stageResult
   */
  setInitialStage(stageResult) {
    this.stages.initial = {
      ...stageResult,
      completedAt: Date.now()
    }
    this._recalculateOverallMetrics()
  }

  /**
   * Set validation stage result
   * @param {Object} stageResult
   */
  setValidationStage(stageResult) {
    this.stages.validation = {
      ...stageResult,
      completedAt: Date.now()
    }
    this._recalculateOverallMetrics()
  }

  /**
   * Set drift reference stage result
   * @param {Object} stageResult
   */
  setDriftReferenceStage(stageResult) {
    this.stages.driftReference = {
      ...stageResult,
      completedAt: Date.now()
    }
  }

  /**
   * Recalculate overall metrics from stage data
   * @private
   */
  _recalculateOverallMetrics() {
    if (this.stages.validation && this.stages.validation.metrics) {
      this.metrics = {
        ...this.metrics,
        ...this.stages.validation.metrics
      }
      this.qualityRating = this._computeQualityRating()
    }
  }

  /**
   * Compute overall quality rating
   * @private
   */
  _computeQualityRating() {
    const { precision, accuracy, rmsError, dataLoss } = this.metrics

    // Check if we have enough data
    if (precision === null || accuracy === null) {
      return 'unknown'
    }

    // If any metric is poor, overall is poor
    if (precision > 1.0 || accuracy > 2.0 || rmsError > 100 || dataLoss > 15) {
      return 'poor'
    }

    // If all metrics are good, overall is good
    if (precision <= 0.5 && accuracy <= 1.0 && rmsError <= 50 && dataLoss <= 5) {
      return 'good'
    }

    // Otherwise acceptable
    return 'acceptable'
  }

  /**
   * Add a calibration point sample
   * @param {Object} point - { targetX, targetY, gazeX, gazeY, timestamp, quality }
   */
  addCalibrationPoint(point) {
    this.calibrationPoints.push({
      ...point,
      timestamp: point.timestamp || Date.now()
    })
  }

  /**
   * Get calibration points for a specific target
   * @param {number} targetIndex
   * @returns {Array}
   */
  getPointsForTarget(targetIndex) {
    return this.calibrationPoints.filter(p => p.targetIndex === targetIndex)
  }

  /**
   * Check if calibration meets minimum quality threshold
   * @param {Object} thresholds
   * @returns {boolean}
   */
  meetsQualityThreshold(thresholds = {}) {
    const t = { ...this.settings.validationThreshold, ...thresholds }

    if (this.metrics.precision > t.precisionAcceptable) return false
    if (this.metrics.accuracy > t.accuracyAcceptable) return false
    if (this.metrics.rmsError > t.rmsErrorAcceptable) return false
    if (this.metrics.dataLoss > t.dataLossAcceptable) return false

    return true
  }

  /**
   * Check if calibration has expired
   * @param {number} maxAgeMs - maximum age in milliseconds
   * @returns {boolean}
   */
  isExpired(maxAgeMs = 24 * 60 * 60 * 1000) { // Default 24 hours
    return Date.now() - this.timestamp > maxAgeMs
  }

  /**
   * Set model coefficients
   * @param {Object} coefficients
   */
  setModelCoefficients(coefficients) {
    this.modelCoefficients = coefficients
  }

  /**
   * Mark calibration as failed
   * @param {string} errorMessage
   */
  setFailed(errorMessage) {
    this.status = 'failed'
    this.error = {
      message: errorMessage,
      timestamp: Date.now()
    }
  }

  /**
   * Convert to Firestore format
   * @returns {Object}
   */
  toFirestore() {
    return {
      calibrationId: this.calibrationId,
      userId: this.userId,
      testId: this.testId,
      timestamp: this.timestamp,
      settings: this.settings,
      stages: this.stages,
      metrics: this.metrics,
      qualityRating: this.qualityRating,
      calibrationPoints: this.calibrationPoints.map(p => ({
        ...p,
        timestamp: p.timestamp
      })),
      modelCoefficients: this.modelCoefficients,
      deviceInfo: this.deviceInfo,
      status: this.status,
      error: this.error
    }
  }

  /**
   * Create from Firestore document
   * @param {Object} data
   * @returns {CalibrationResult}
   */
  static fromFirestore(data) {
    return new CalibrationResult({
      calibrationId: data.calibrationId,
      userId: data.userId,
      testId: data.testId,
      timestamp: data.timestamp?.toMillis ? data.timestamp.toMillis() : data.timestamp,
      settings: data.settings,
      initialStage: data.stages?.initial,
      validationStage: data.stages?.validation,
      driftReferenceStage: data.stages?.driftReference,
      metrics: data.metrics,
      qualityRating: data.qualityRating,
      calibrationPoints: data.calibrationPoints || [],
      modelCoefficients: data.modelCoefficients,
      deviceInfo: data.deviceInfo,
      status: data.status,
      error: data.error
    })
  }

  /**
   * Create a summary object for display
   * @returns {Object}
   */
  toSummary() {
    return {
      id: this.calibrationId,
      timestamp: this.timestamp,
      quality: this.qualityRating,
      precision: this.metrics.precision ? `${this.metrics.precision.toFixed(2)}°` : 'N/A',
      accuracy: this.metrics.accuracy ? `${this.metrics.accuracy.toFixed(2)}°` : 'N/A',
      rmsError: this.metrics.rmsError ? `${this.metrics.rmsError.toFixed(1)}px` : 'N/A',
      status: this.status,
      isExpired: this.isExpired()
    }
  }
}
