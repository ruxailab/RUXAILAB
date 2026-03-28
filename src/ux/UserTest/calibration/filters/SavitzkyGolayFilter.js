import SignalFilter from './SignalFilter.js'

/**
 * Savitzky-Golay Filter for gaze smoothing
 * Uses polynomial regression within sliding window
 * Good for preserving peaks and high-frequency features while smoothing
 */
export default class SavitzkyGolayFilter extends SignalFilter {
  constructor(config = {}) {
    super(config)

    this.windowSize = config.windowSize || 7
    this.polynomialOrder = config.polynomialOrder || 2

    // Precompute filter coefficients
    this._computeCoefficients()

    this.buffer = []
    this.timestamps = []
    this.isInitialized = false
  }

  /**
   * Filter gaze point using Savitzky-Golay algorithm
   * @param {Object} gazePoint - { x, y, timestamp? }
   * @param {number} timestamp - optional timestamp
   * @returns {Object} filtered gaze point
   */
  filter(gazePoint, timestamp) {
    if (!SignalFilter.isValidGazePoint(gazePoint)) {
      return gazePoint
    }

    const ts = timestamp || gazePoint.timestamp || Date.now()

    // Add to buffers
    this.buffer.push({ x: gazePoint.x, y: gazePoint.y })
    this.timestamps.push(ts)

    // Keep buffer at window size
    if (this.buffer.length > this.windowSize) {
      this.buffer.shift()
      this.timestamps.shift()
    }

    // Need at least polynomialOrder + 1 samples
    if (this.buffer.length < this.polynomialOrder + 1) {
      return gazePoint
    }

    // Apply Savitzky-Golay coefficients
    const centerIdx = Math.floor(this.windowSize / 2)
    let sumX = 0
    let sumY = 0

    for (let i = 0; i < this.windowSize; i++) {
      const coeff = this.coeffs[centerIdx][i]
      sumX += coeff * this.buffer[i].x
      sumY += coeff * this.buffer[i].y
    }

    const filteredX = sumX
    const filteredY = sumY

    this.lastTimestamp = ts
    this.lastGaze = { x: filteredX, y: filteredY }
    this.isInitialized = this.buffer.length >= this.windowSize

    return { x: filteredX, y: filteredY }
  }

  reset() {
    super.reset()
    this.buffer = []
    this.timestamps = []
    this.isInitialized = false
  }

  setConfig(config) {
    super.setConfig(config)
    let changed = false
    if (config.windowSize && config.windowSize !== this.windowSize) {
      this.windowSize = config.windowSize
      changed = true
    }
    if (config.polynomialOrder && config.polynomialOrder !== this.polynomialOrder) {
      this.polynomialOrder = config.polynomialOrder
      changed = true
    }
    if (changed) {
      this._computeCoefficients()
      this.buffer = []
      this.timestamps = []
      this.isInitialized = false
    }
  }

  /**
   * Precompute Savitzky-Golay coefficients
   * Uses least squares polynomial fitting
   */
  _computeCoefficients() {
    const m = this.windowSize
    const n = this.polynomialOrder + 1
    const centerIdx = Math.floor(m / 2)

    // Build Vandermonde matrix
    // Row i = [1, (i-centerIdx), (i-centerIdx)^2, ...]
    const A = []
    for (let i = 0; i < m; i++) {
      const row = []
      const x = i - centerIdx
      for (let j = 0; j < n; j++) {
        row.push(Math.pow(x, j))
      }
      A.push(row)
    }

    // Compute (A^T * A)^-1 * A^T
    const AT = this._transpose(A)
    const ATApinv = this._pseudoInverse(this._matMul(AT, A))
    const coeffsMatrix = this._matMul(ATApinv, AT)

    // Extract the center row (these are the convolution coefficients)
    this.coeffs = []
    for (let i = 0; i < m; i++) {
      const row = []
      for (let j = 0; j < m; j++) {
        // Coefficient for sample j when estimating center
        row.push(coeffsMatrix[i][j])
      }
      this.coeffs.push(row)
    }

    // Also store coefficients for center position (most commonly used)
    this.centerCoeffs = this.coeffs[centerIdx]
  }

  _transpose(M) {
    return M[0].map((_, i) => M.map(row => row[i]))
  }

  _matMul(A, B) {
    const result = []
    for (let i = 0; i < A.length; i++) {
      result[i] = []
      for (let j = 0; j < B[0].length; j++) {
        let sum = 0
        for (let k = 0; k < A[0].length; k++) {
          sum += A[i][k] * B[k][j]
        }
        result[i][j] = sum
      }
    }
    return result
  }

  _pseudoInverse(M) {
    // Use SVD-based pseudo-inverse for numerical stability
    // For small matrices, use (A^T * A)^-1 * A^T when A has full column rank
    const m = M.length
    const n = M[0].length

    // For our use case (small n), use regular inverse if possible
    if (m === n) {
      try {
        return this._inverse(M)
      } catch (e) {
        // Fall through to pseudo-inverse
      }
    }

    // Simplified: (M^T * M)^-1 * M^T for overdetermined systems
    const MT = this._transpose(M)
    const MTM = this._matMul(MT, M)
    const MTMinv = this._inverse(MTM)
    return this._matMul(MTMinv, MT)
  }

  _inverse(M) {
    const n = M.length
    const augmented = M.map((row, i) => {
      const newRow = [...row]
      for (let j = 0; j < n; j++) {
        newRow.push(i === j ? 1 : 0)
      }
      return newRow
    })

    // Gaussian elimination with partial pivoting
    for (let col = 0; col < n; col++) {
      // Find pivot
      let maxRow = col
      for (let row = col + 1; row < n; row++) {
        if (Math.abs(augmented[row][col]) > Math.abs(augmented[maxRow][col])) {
          maxRow = row
        }
      }
      ;[augmented[col], augmented[maxRow]] = [augmented[maxRow], augmented[col]]

      const pivot = augmented[col][col]
      if (Math.abs(pivot) < 1e-10) {
        throw new Error('Matrix is singular')
      }

      // Scale pivot row
      for (let j = 0; j < 2 * n; j++) {
        augmented[col][j] /= pivot
      }

      // Eliminate column
      for (let row = 0; row < n; row++) {
        if (row !== col) {
          const factor = augmented[row][col]
          for (let j = 0; j < 2 * n; j++) {
            augmented[row][j] -= factor * augmented[col][j]
          }
        }
      }
    }

    // Extract inverse
    return augmented.map(row => row.slice(n))
  }
}
