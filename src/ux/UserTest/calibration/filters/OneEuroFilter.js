import SignalFilter from './SignalFilter.js'

/**
 * One Euro Filter for low-latency gaze smoothing
 * Designed for real-time applications with configurable smoothing
 * See: "Adaptive Filtering for Low-Latency gaze Estimation" by Paanani et al.
 */
export default class OneEuroFilter extends SignalFilter {
  constructor(config = {}) {
    super(config)

    // Cutoff frequency for low-pass filter (Hz)
    this.minCutoff = config.minCutoff || 1.0

    // Cutoff slope (Hz/s) - how fast cutoff increases with speed
    this.cutoffSlope = config.cutoffSlope || 1.0

    // Derivative cutoff frequency (Hz)
    this.derivativeCutoff = config.derivativeCutoff || 1.0

    // Velocity threshold for beta calculation
    this.dCutoff = config.dCutoff || 1.0

    // Internal state
    this.prevRaw = null
    this.prevFiltered = null
    this.prevVelocity = null
    this.alphaRaw = 0
    this.alphaDerivative = 0

    this.isInitialized = false
  }

  /**
   * Filter gaze point using One Euro algorithm
   * @param {Object} gazePoint - { x, y, timestamp? }
   * @param {number} timestamp - optional timestamp
   * @returns {Object} filtered gaze point
   */
  filter(gazePoint, timestamp) {
    if (!SignalFilter.isValidGazePoint(gazePoint)) {
      return gazePoint
    }

    const ts = timestamp || gazePoint.timestamp || Date.now()
    const rawX = gazePoint.x
    const rawY = gazePoint.y

    if (!this.isInitialized) {
      this.prevRaw = { x: rawX, y: rawY }
      this.prevFiltered = { x: rawX, y: rawY }
      this.prevVelocity = { x: 0, y: 0 }
      this.lastTimestamp = ts
      this.isInitialized = true

      return { x: rawX, y: rawY }
    }

    const dt = this.getDt(ts)

    if (dt <= 0) {
      return this.prevFiltered
    }

    // Calculate velocity
    const velocityX = (rawX - this.prevRaw.x) / dt
    const velocityY = (rawY - this.prevRaw.y) / dt
    const velocity = Math.sqrt(velocityX * velocityX + velocityY * velocityY)

    // Compute adaptive cutoff using speed
    // cutoff = minCutoff + cutoffSlope * speed
    const cutoff = this.minCutoff + this.cutoffSlope * velocity

    // Alpha for low-pass filter: alpha = dt / (tau + dt)
    // where tau = 1 / (2 * pi * cutoff)
    const tau = 1.0 / (2.0 * Math.PI * cutoff)
    const alpha = dt / (tau + dt)

    // Apply low-pass filter to position
    const filteredX = alpha * rawX + (1 - alpha) * this.prevFiltered.x
    const filteredY = alpha * rawY + (1 - alpha) * this.prevFiltered.y

    // Compute alpha for derivative: alphaD = dt / (tauD + dt)
    const tauD = 1.0 / (2.0 * Math.PI * this.derivativeCutoff)
    const alphaD = dt / (tauD + dt)

    // Low-pass filter the velocity
    const smoothVelocityX = alphaD * velocityX + (1 - alphaD) * this.prevVelocity.x
    const smoothVelocityY = alphaD * velocityY + (1 - alphaD) * this.prevVelocity.y

    // Store state
    this.prevRaw = { x: rawX, y: rawY }
    this.prevFiltered = { x: filteredX, y: filteredY }
    this.prevVelocity = { x: smoothVelocityX, y: smoothVelocityY }
    this.lastTimestamp = ts

    return { x: filteredX, y: filteredY }
  }

  reset() {
    super.reset()
    this.prevRaw = null
    this.prevFiltered = null
    this.prevVelocity = null
    this.isInitialized = false
  }

  setConfig(config) {
    super.setConfig(config)
    if (config.minCutoff !== undefined) this.minCutoff = config.minCutoff
    if (config.cutoffSlope !== undefined) this.cutoffSlope = config.cutoffSlope
    if (config.derivativeCutoff !== undefined) this.derivativeCutoff = config.derivativeCutoff
    if (config.dCutoff !== undefined) this.dCutoff = config.dCutoff
  }

  /**
   * Get smoothing factor based on current velocity
   * Useful for debugging and visualization
   * @returns {number} current alpha value
   */
  getSmoothingFactor() {
    if (!this.isInitialized || this.lastTimestamp === null) {
      return 0
    }
    return this.minCutoff / (this.minCutoff + this.cutoffSlope)
  }
}
