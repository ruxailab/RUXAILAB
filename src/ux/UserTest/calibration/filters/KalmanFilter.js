import SignalFilter from './SignalFilter.js'

/**
 * Kalman Filter for gaze smoothing
 * Uses constant velocity state model
 * State: [x, y, vx, vy]
 * Measurement: [x, y]
 */
export default class KalmanFilter extends SignalFilter {
  constructor(config = {}) {
    super(config)

    // State vector: [x, y, vx, vy]
    this.state = { x: 0, y: 0, vx: 0, vy: 0 }

    // Measurement matrix (we only measure position)
    this.H = [
      [1, 0, 0, 0],
      [0, 1, 0, 0]
    ]

    // Measurement noise covariance (configurable)
    this.R = config.R || 10 // measurement noise

    // Process noise covariance (configurable)
    this.Q = config.Q || 1 // process noise

    // Error covariance matrix
    this.P = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ]

    this.isInitialized = false
  }

  /**
   * Filter gaze point using Kalman filter
   * @param {Object} gazePoint - { x, y, timestamp? }
   * @param {number} timestamp - optional timestamp
   * @returns {Object} filtered gaze point
   */
  filter(gazePoint, timestamp) {
    if (!SignalFilter.isValidGazePoint(gazePoint)) {
      return gazePoint
    }

    const ts = timestamp || gazePoint.timestamp || Date.now()
    const measurement = [gazePoint.x, gazePoint.y]

    if (!this.isInitialized) {
      // Initialize state with first measurement
      this.state = {
        x: measurement[0],
        y: measurement[1],
        vx: 0,
        vy: 0
      }

      this.lastTimestamp = ts
      this.isInitialized = true

      return { x: this.state.x, y: this.state.y }
    }

    // Time update (predict)
    const dt = this.getDt(ts)

    // State transition matrix
    const F = [
      [1, 0, dt, 0],
      [0, 1, 0, dt],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ]

    // Predict state: x = F * x
    const predictedState = this._matVecMul(F, [
      this.state.x,
      this.state.y,
      this.state.vx,
      this.state.vy
    ])

    // Predict error covariance: P = F * P * F' + Q
    const Fp = this._matMul(F, this.P)
    const Fpf = this._matMul(Fp, this._transpose(F))
    this.P = this._matAdd(Fpf, this._scaleMat(this.Q, [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ]))

    // Measurement update (correct)
    // S = H * P * H' + R
    const HP = this._matMul(this.H, this.P)
    const HPHt = this._matMul(HP, this._transpose(this.H))
    const S = this._matAdd(HPHt, this._scaleMat(this.R, [[1, 0], [0, 1]]))

    // Kalman gain: K = P * H' * S^-1
    const PHt = this._matMul(this.P, this._transpose(this.H))
    const SInv = this._inverse2x2(S)
    const K = this._matMul(PHt, SInv)

    // Innovation: y = z - H * x
    const Hx = [
      this.H[0][0] * predictedState[0] + this.H[0][1] * predictedState[1],
      this.H[1][0] * predictedState[0] + this.H[1][1] * predictedState[1]
    ]
    const innovation = [measurement[0] - Hx[0], measurement[1] - Hx[1]]

    // Update state: x = x + K * y
    const Ky = this._matVecMul(K, innovation)
    this.state = {
      x: predictedState[0] + Ky[0],
      y: predictedState[1] + Ky[1],
      vx: predictedState[2],
      vy: predictedState[3]
    }

    // Update error covariance: P = (I - K * H) * P
    const KH = this._matMul(K, this.H)
    const IminusKH = this._matSub([
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ], KH)
    this.P = this._matMul(IminusKH, this.P)

    this.lastTimestamp = ts
    this.lastGaze = { x: this.state.x, y: this.state.y }

    return { x: this.state.x, y: this.state.y }
  }

  reset() {
    super.reset()
    this.state = { x: 0, y: 0, vx: 0, vy: 0 }
    this.P = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ]
    this.isInitialized = false
  }

  setConfig(config) {
    super.setConfig(config)
    if (config.R !== undefined) this.R = config.R
    if (config.Q !== undefined) this.Q = config.Q
  }

  // Matrix operations
  _matVecMul(M, v) {
    const rows = M.length
    const result = new Array(rows).fill(0)
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < M[i].length; j++) {
        result[i] += M[i][j] * v[j]
      }
    }
    return result
  }

  _matMul(A, B) {
    const rowsA = A.length
    const colsA = A[0].length
    const colsB = B[0].length
    const result = Array.from({ length: rowsA }, () => new Array(colsB).fill(0))
    for (let i = 0; i < rowsA; i++) {
      for (let j = 0; j < colsB; j++) {
        for (let k = 0; k < colsA; k++) {
          result[i][j] += A[i][k] * B[k][j]
        }
      }
    }
    return result
  }

  _transpose(M) {
    const rows = M.length
    const cols = M[0].length
    const result = Array.from({ length: cols }, () => new Array(rows))
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        result[j][i] = M[i][j]
      }
    }
    return result
  }

  _matAdd(A, B) {
    return A.map((row, i) => row.map((val, j) => val + B[i][j]))
  }

  _matSub(A, B) {
    return A.map((row, i) => row.map((val, j) => val - B[i][j]))
  }

  _scaleMat(s, M) {
    return M.map(row => row.map(val => val * s))
  }

  _inverse2x2(M) {
    const det = M[0][0] * M[1][1] - M[0][1] * M[1][0]
    if (Math.abs(det) < 1e-10) {
      return [[1, 0], [0, 1]] // Return identity on singular
    }
    return [
      [M[1][1] / det, -M[0][1] / det],
      [-M[1][0] / det, M[0][0] / det]
    ]
  }
}
