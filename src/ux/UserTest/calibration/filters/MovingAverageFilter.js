import SignalFilter from './SignalFilter.js'

/**
 * Moving Average Filter for gaze smoothing
 * Uses a sliding window of recent gaze points
 */
export default class MovingAverageFilter extends SignalFilter {
  constructor(config = {}) {
    super(config)

    this.windowSize = config.windowSize || 5
    this.buffer = []
    this.isInitialized = false
  }

  /**
   * Filter gaze point using moving average
   * @param {Object} gazePoint - { x, y, timestamp? }
   * @param {number} timestamp - optional timestamp
   * @returns {Object} filtered gaze point
   */
  filter(gazePoint, timestamp) {
    if (!SignalFilter.isValidGazePoint(gazePoint)) {
      return gazePoint
    }

    const ts = timestamp || gazePoint.timestamp || Date.now()

    // Add to buffer
    this.buffer.push({ x: gazePoint.x, y: gazePoint.y, timestamp: ts })

    // Keep only window size
    if (this.buffer.length > this.windowSize) {
      this.buffer.shift()
    }

    // Need at least 1 sample
    if (this.buffer.length === 0) {
      return gazePoint
    }

    // Compute moving average
    let sumX = 0
    let sumY = 0

    for (const point of this.buffer) {
      sumX += point.x
      sumY += point.y
    }

    const avgX = sumX / this.buffer.length
    const avgY = sumY / this.buffer.length

    this.lastTimestamp = ts
    this.lastGaze = { x: avgX, y: avgY }
    this.isInitialized = this.buffer.length >= this.windowSize

    return { x: avgX, y: avgY }
  }

  reset() {
    super.reset()
    this.buffer = []
    this.isInitialized = false
  }

  setConfig(config) {
    super.setConfig(config)
    if (config.windowSize && config.windowSize !== this.windowSize) {
      this.windowSize = config.windowSize
      // Trim buffer if needed
      while (this.buffer.length > this.windowSize) {
        this.buffer.shift()
      }
    }
  }
}
