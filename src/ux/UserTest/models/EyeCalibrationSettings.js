export default class EyeCalibrationSettings {
  constructor(params = {}) {
    this.calibName = params.calibName || ''
    this.pointNumber = params.pointNumber || 8
    this.samplePerPoint = params.samplePerPoint || 90
    this.radius = params.radius || 20
    this.offset = params.offset || 100
    this.backgroundColor = params.backgroundColor || '#FFFFFFFF'
    this.pointColor = params.pointColor || '#000000FF'
    this.customColors = params.customColors || false
    this.models = params.models || 'Linear Regression'
    this.blinkFilter = params.blinkFilter ?? true
    this.leftEyeTreshold = params.leftEyeTreshold || 5
    this.rightEyeTreshold = params.rightEyeTreshold || 5
    this.index = params.index || 0
    this.msPerCapture = params.msPerCapture || 100
    this.mockPattern = params.mockPattern || []
    this.threshold = params.threshold || 200
    this.calibrations = params.calibrations || []
    this.fromDashboard = params.fromDashboard || false
    
    // Advanced Tracking Framework Options
    this.useKalmanFilter = params.useKalmanFilter ?? true
    this.useDriftCompensation = params.useDriftCompensation ?? true
    this.acceptableAccuracyThreshold = params.acceptableAccuracyThreshold || 1.5 // in px or degrees
    this.hardwareSource = params.hardwareSource || 'WEBCAM' // 'WEBCAM' | 'EXTERNAL_API' | 'TOBII'

    // Signal Filter Configuration
    this.filterType = params.filterType || 'kalman' // 'kalman' | 'movingaverage' | 'savitzkygolay' | 'oneeuro'
    this.filterConfig = params.filterConfig || this._getDefaultFilterConfig(this.filterType)

    // Calibration Quality Thresholds
    this.validationThreshold = params.validationThreshold || {
      precisionGood: 0.5,    // degrees
      precisionAcceptable: 1.0,
      accuracyGood: 1.0,     // degrees
      accuracyAcceptable: 2.0,
      rmsErrorGood: 50,      // pixels
      rmsErrorAcceptable: 100,
      dataLossGood: 5,       // percent
      dataLossAcceptable: 15
    }

    // Drift Detection Configuration
    this.driftThreshold = params.driftThreshold || {
      velocityThreshold: 50,        // pixels/sec
      accelerationThreshold: 100,    // pixels/sec^2
      positionDriftThreshold: 100,   // pixels
      driftWindow: 300000            // 5 minutes in ms
    }

    // Multi-Stage Calibration Options
    this.calibrationStages = params.calibrationStages || {
      initial: true,
      validation: true,
      driftReference: true
    }
    this.enableAdaptiveSampling = params.enableAdaptiveSampling ?? true
    this.qualityThreshold = params.qualityThreshold || 0.7 // 0-1, minimum quality per point
  }

  /**
   * Get default filter configuration based on filter type
   * @param {string} filterType
   * @returns {Object}
   */
  _getDefaultFilterConfig(filterType) {
    switch (filterType) {
      case 'kalman':
        return { R: 10, Q: 1 }
      case 'movingaverage':
        return { windowSize: 5 }
      case 'savitzkygolay':
        return { windowSize: 7, polynomialOrder: 2 }
      case 'oneeuro':
        return { minCutoff: 1.0, cutoffSlope: 1.0, derivativeCutoff: 1.0 }
      default:
        return {}
    }
  }

  toFirestore() {
    return {
      calibName: this.calibName,
      pointNumber: this.pointNumber,
      samplePerPoint: this.samplePerPoint,
      radius: this.radius,
      offset: this.offset,
      backgroundColor: this.backgroundColor,
      pointColor: this.pointColor,
      customColors: this.customColors,
      models: this.models,
      blinkFilter: this.blinkFilter,
      leftEyeTreshold: this.leftEyeTreshold,
      rightEyeTreshold: this.rightEyeTreshold,
      index: this.index,
      msPerCapture: this.msPerCapture,
      mockPattern: this.mockPattern,
      threshold: this.threshold,
      calibrations: this.calibrations,
      fromDashboard: this.fromDashboard,
      useKalmanFilter: this.useKalmanFilter,
      useDriftCompensation: this.useDriftCompensation,
      acceptableAccuracyThreshold: this.acceptableAccuracyThreshold,
      hardwareSource: this.hardwareSource,
      filterType: this.filterType,
      filterConfig: this.filterConfig,
      validationThreshold: this.validationThreshold,
      driftThreshold: this.driftThreshold,
      calibrationStages: this.calibrationStages,
      enableAdaptiveSampling: this.enableAdaptiveSampling,
      qualityThreshold: this.qualityThreshold
    }
  }

  static fromObject(data = {}) {
    return new EyeCalibrationSettings(data)
  }
}
