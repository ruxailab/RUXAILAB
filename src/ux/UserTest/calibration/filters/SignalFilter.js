/**
 * Abstract base class for signal filters used in eye-tracking
 * All filters must implement the filter() method
 */
export default class SignalFilter {
  constructor(config = {}) {
    this.config = config
    this.lastTimestamp = null
    this.lastGaze = null
    this.isInitialized = false
  }

  /**
   * Filter a single gaze point
   * @param {Object} gazePoint - { x, y, timestamp? }
   * @param {number} timestamp - timestamp in ms (optional, can be embedded in gazePoint)
   * @returns {Object} filtered gaze point { x, y }
   */
  filter(gazePoint, timestamp) {
    throw new Error('filter() must be implemented by subclass')
  }

  /**
   * Reset filter state
   */
  reset() {
    this.lastTimestamp = null
    this.lastGaze = null
    this.isInitialized = false
  }

  /**
   * Update filter configuration
   * @param {Object} config - new configuration
   */
  setConfig(config) {
    this.config = { ...this.config, ...config }
  }

  /**
   * Get filter type name
   * @returns {string}
   */
  getType() {
    return this.constructor.name
  }

  /**
   * Calculate time delta in seconds
   * @param {number} timestamp
   * @returns {number} dt in seconds
   */
  getDt(timestamp) {
    if (this.lastTimestamp === null) {
      return 0
    }
    return (timestamp - this.lastTimestamp) / 1000
  }

  /**
   * Validate gaze point format
   * @param {Object} gazePoint
   * @returns {boolean}
   */
  static isValidGazePoint(gazePoint) {
    return (
      gazePoint &&
      typeof gazePoint.x === 'number' &&
      typeof gazePoint.y === 'number' &&
      !isNaN(gazePoint.x) &&
      !isNaN(gazePoint.y)
    )
  }
}
