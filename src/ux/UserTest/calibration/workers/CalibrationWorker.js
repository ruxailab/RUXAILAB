/**
 * Calibration Web Worker
 * Offloads signal processing and metrics computation from main thread
 *
 * Usage:
 *   const worker = new Worker(new URL('./CalibrationWorker.js', import.meta.url))
 *   worker.postMessage({ type: 'FILTER', data: gazePoint })
 *   worker.onmessage = (e) => console.log(e.data)
 */

// Filter state
let kalmanFilterState = null
let movingAverageBuffer = []
let savitzkyGolayBuffer = []
let oneEuroState = null

// Configuration
let currentFilterType = 'kalman'
let currentFilterConfig = { R: 10, Q: 1, windowSize: 5, minCutoff: 1.0 }

// Message handler
self.onmessage = function(e) {
  const { type, data, config, id } = e.data

  try {
    let result

    switch (type) {
      case 'CONFIGURE':
        result = handleConfigure(config)
        break
      case 'FILTER':
        result = handleFilter(data)
        break
      case 'RESET':
        result = handleReset()
        break
      case 'COMPUTE_METRICS':
        result = handleComputeMetrics(data)
        break
      case 'ANALYZE_DRIFT':
        result = handleAnalyzeDrift(data)
        break
      default:
        result = { error: `Unknown message type: ${type}` }
    }

    self.postMessage({ id, type, result })
  } catch (error) {
    self.postMessage({ id, type, error: error.message })
  }
}

/**
 * Configure filter
 */
function handleConfigure(config) {
  currentFilterType = config.filterType || 'kalman'
  currentFilterConfig = { ...currentFilterConfig, ...config }

  // Reset filter states
  kalmanFilterState = null
  movingAverageBuffer = []
  savitzkyGolayBuffer = []
  oneEuroState = null

  return { success: true, filterType: currentFilterType }
}

/**
 * Filter a gaze point
 */
function handleFilter(data) {
  const { x, y, timestamp } = data
  const ts = timestamp || Date.now()

  let filtered

  switch (currentFilterType) {
    case 'kalman':
      filtered = applyKalmanFilter(x, y, ts)
      break
    case 'movingaverage':
      filtered = applyMovingAverage(x, y, ts)
      break
    case 'savitzkygolay':
      filtered = applySavitzkyGolay(x, y, ts)
      break
    case 'oneeuro':
      filtered = applyOneEuroFilter(x, y, ts)
      break
    default:
      filtered = { x, y }
  }

  return filtered
}

/**
 * Reset all filter states
 */
function handleReset() {
  kalmanFilterState = null
  movingAverageBuffer = []
  savitzkyGolayBuffer = []
  oneEuroState = null

  return { success: true }
}

/**
 * Compute accuracy metrics
 */
function handleComputeMetrics(data) {
  const { samples, totalExpected, totalActual, screenWidth, screenHeight, viewingDistance } = data

  const metrics = computeAllMetrics(samples, totalExpected, totalActual, screenWidth, screenHeight, viewingDistance)

  return metrics
}

/**
 * Analyze drift
 */
function handleAnalyzeDrift(data) {
  const { gazeHistory, baseline } = data

  const driftResult = analyzeDrift(gazeHistory, baseline)

  return driftResult
}

// Kalman Filter Implementation
function applyKalmanFilter(x, y, timestamp) {
  if (!kalmanFilterState) {
    kalmanFilterState = {
      state: { x, y, vx: 0, vy: 0 },
      P: [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
      ],
      lastTimestamp: timestamp,
      initialized: true
    }
    return { x, y }
  }

  const dt = (timestamp - kalmanFilterState.lastTimestamp) / 1000
  if (dt <= 0) return { x: kalmanFilterState.state.x, y: kalmanFilterState.state.y }

  const R = currentFilterConfig.R || 10
  const Q = currentFilterConfig.Q || 1

  // State transition matrix
  const F = [
    [1, 0, dt, 0],
    [0, 1, 0, dt],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ]

  // Predict
  const predictedState = matVecMul(F, [
    kalmanFilterState.state.x,
    kalmanFilterState.state.y,
    kalmanFilterState.state.vx,
    kalmanFilterState.state.vy
  ])

  // Predict covariance
  const Fp = matMul(F, kalmanFilterState.P)
  const P = matAdd(matMul(Fp, transpose(F)), scaleMat(Q, [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ]))

  // Measurement
  const H = [[1, 0, 0, 0], [0, 1, 0, 0]]
  const z = [x, y]

  // Kalman gain
  const PHt = matMul(P, transpose(H))
  const S = matAdd(matMul(H, PHt), scaleMat(R, [[1, 0], [0, 1]]))
  const SInv = inverse2x2(S)
  const K = matMul(PHt, SInv)

  // Innovation
  const Hx = [predictedState[0], predictedState[1]]
  const innovation = [z[0] - Hx[0], z[1] - Hx[1]]

  // Update state
  const Ky = matVecMul(K, innovation)
  kalmanFilterState.state = {
    x: predictedState[0] + Ky[0],
    y: predictedState[1] + Ky[1],
    vx: predictedState[2],
    vy: predictedState[3]
  }

  // Update covariance
  const KH = matMul(K, H)
  kalmanFilterState.P = matMul(subMat([
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ], KH), P)

  kalmanFilterState.lastTimestamp = timestamp

  return {
    x: kalmanFilterState.state.x,
    y: kalmanFilterState.state.y
  }
}

// Moving Average Implementation
function applyMovingAverage(x, y, timestamp) {
  const windowSize = currentFilterConfig.windowSize || 5

  movingAverageBuffer.push({ x, y, timestamp })

  if (movingAverageBuffer.length > windowSize) {
    movingAverageBuffer.shift()
  }

  let sumX = 0, sumY = 0
  for (const p of movingAverageBuffer) {
    sumX += p.x
    sumY += p.y
  }

  return {
    x: sumX / movingAverageBuffer.length,
    y: sumY / movingAverageBuffer.length
  }
}

// Savitzky-Golay Implementation (simplified)
function applySavitzkyGolay(x, y, timestamp) {
  const windowSize = currentFilterConfig.windowSize || 7

  savitzkyGolayBuffer.push({ x, y, timestamp })

  if (savitzkyGolayBuffer.length > windowSize) {
    savitzkyGolayBuffer.shift()
  }

  if (savitzkyGolayBuffer.length < 3) {
    return { x, y }
  }

  // Simple quadratic fit for center element
  const n = savitzkyGolayBuffer.length
  const centerIdx = Math.floor(n / 2)

  // Use simple weighted average as approximation
  let sumX = 0, sumY = 0, weight = 0
  for (let i = 0; i < n; i++) {
    const w = 1 - Math.abs(i - centerIdx) / n
    sumX += savitzkyGolayBuffer[i].x * w
    sumY += savitzkyGolayBuffer[i].y * w
    weight += w
  }

  return {
    x: sumX / weight,
    y: sumY / weight
  }
}

// One Euro Filter Implementation (simplified)
function applyOneEuroFilter(x, y, timestamp) {
  const minCutoff = currentFilterConfig.minCutoff || 1.0
  const cutoffSlope = currentFilterConfig.cutoffSlope || 1.0

  if (!oneEuroState) {
    oneEuroState = {
      prevRaw: { x, y },
      prevFiltered: { x, y },
      prevVelocity: { x: 0, y: 0 },
      lastTimestamp: timestamp
    }
    return { x, y }
  }

  const dt = (timestamp - oneEuroState.lastTimestamp) / 1000
  if (dt <= 0) return oneEuroState.prevFiltered

  // Calculate velocity
  const vx = (x - oneEuroState.prevRaw.x) / dt
  const vy = (y - oneEuroState.prevRaw.y) / dt
  const velocity = Math.sqrt(vx * vx + vy * vy)

  // Adaptive cutoff
  const cutoff = minCutoff + cutoffSlope * velocity
  const tau = 1.0 / (2.0 * Math.PI * cutoff)
  const alpha = dt / (tau + dt)

  // Low-pass filter
  const filteredX = alpha * x + (1 - alpha) * oneEuroState.prevFiltered.x
  const filteredY = alpha * y + (1 - alpha) * oneEuroState.prevFiltered.y

  oneEuroState.prevRaw = { x, y }
  oneEuroState.prevFiltered = { x: filteredX, y: filteredY }
  oneEuroState.lastTimestamp = timestamp

  return { x: filteredX, y: filteredY }
}

// Matrix operations
function matVecMul(M, v) {
  const rows = M.length, cols = M[0].length
  const result = Array(rows).fill(0)
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[i] += M[i][j] * v[j]
    }
  }
  return result
}

function matMul(A, B) {
  const rowsA = A.length, colsA = A[0].length, colsB = B[0].length
  const result = Array(rowsA).fill(0).map(() => Array(colsB).fill(0))
  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      for (let k = 0; k < colsA; k++) {
        result[i][j] += A[i][k] * B[k][j]
      }
    }
  }
  return result
}

function transpose(M) {
  const rows = M.length, cols = M[0].length
  const result = Array(cols).fill(0).map(() => Array(rows).fill(0))
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j][i] = M[i][j]
    }
  }
  return result
}

function matAdd(A, B) {
  const rows = A.length, cols = A[0].length
  const result = Array(rows).fill(0).map(() => Array(cols).fill(0))
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[i][j] = A[i][j] + B[i][j]
    }
  }
  return result
}

function subMat(A, B) {
  const rows = A.length, cols = A[0].length
  const result = Array(rows).fill(0).map(() => Array(cols).fill(0))
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[i][j] = A[i][j] - B[i][j]
    }
  }
  return result
}

function scaleMat(s, M) {
  return M.map(row => row.map(val => val * s))
}

function inverse2x2(M) {
  const det = M[0][0] * M[1][1] - M[0][1] * M[1][0]
  if (Math.abs(det) < 1e-10) return [[1, 0], [0, 1]]
  return [
    [M[1][1] / det, -M[0][1] / det],
    [-M[1][0] / det, M[0][0] / det]
  ]
}

// Metrics computation
function computeAllMetrics(samples, totalExpected, totalActual, screenWidth, screenHeight, viewingDistance) {
  const DPI = 96
  const vd = viewingDistance || 600

  const precision = computePrecision(samples, DPI, vd)
  const accuracy = computeAccuracy(samples, DPI, vd)
  const rmsError = computeRMSError(samples)
  const dataLoss = computeDataLoss(totalExpected, totalActual)

  const overall = computeOverallRating(precision, accuracy, rmsError, dataLoss)

  return { precision, accuracy, rmsError, dataLoss, overall }
}

function computePrecision(gazePoints, dpi, viewingDist) {
  if (!gazePoints || gazePoints.length < 2) {
    return { value: Infinity, rating: 'poor', samples: 0 }
  }

  let sumX = 0, sumY = 0
  for (const p of gazePoints) {
    sumX += p.x || p.gaze?.x || 0
    sumY += p.y || p.gaze?.y || 0
  }
  const cx = sumX / gazePoints.length
  const cy = sumY / gazePoints.length

  let sumSqDist = 0
  for (const p of gazePoints) {
    const x = p.x || p.gaze?.x || 0
    const y = p.y || p.gaze?.y || 0
    sumSqDist += (x - cx) ** 2 + (y - cy) ** 2
  }

  const stdDev = Math.sqrt(sumSqDist / gazePoints.length)
  const stdDevMm = (stdDev / dpi) * 25.4
  const stdDevDeg = Math.atan2(stdDevMm, viewingDist) * (180 / Math.PI)

  const safeValue = Number.isFinite(stdDevDeg) ? stdDevDeg : Infinity

  return {
    value: safeValue,
    rating: safeValue <= 0.5 ? 'good' : safeValue <= 1.0 ? 'acceptable' : 'poor',
    samples: gazePoints.length
  }
}

function computeAccuracy(samples, dpi, viewingDist) {
  if (!samples || samples.length === 0) {
    return { value: Infinity, rating: 'poor', samples: 0 }
  }

  let sumError = 0
  let count = 0

  for (const s of samples) {
    if (!s.gaze || !s.target) continue
    const dx = s.gaze.x - s.target.x
    const dy = s.gaze.y - s.target.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const distMm = (dist / dpi) * 25.4
    sumError += Math.atan2(distMm, viewingDist) * (180 / Math.PI)
    count++
  }

  if (count === 0) return { value: Infinity, rating: 'poor', samples: 0 }

  const avgError = sumError / count
  const safeValue = Number.isFinite(avgError) ? avgError : Infinity
  return {
    value: safeValue,
    rating: safeValue <= 1.0 ? 'good' : safeValue <= 2.0 ? 'acceptable' : 'poor',
    samples: count
  }
}

function computeRMSError(samples) {
  if (!samples || samples.length === 0) {
    return { value: Infinity, rating: 'poor', samples: 0 }
  }

  let sumSqError = 0
  let count = 0

  for (const s of samples) {
    if (!s.gaze || !s.target) continue
    const dx = s.gaze.x - s.target.x
    const dy = s.gaze.y - s.target.y
    sumSqError += dx * dx + dy * dy
    count++
  }

  if (count === 0) return { value: Infinity, rating: 'poor', samples: 0 }

  const rms = Math.sqrt(sumSqError / count)
  return {
    value: rms,
    rating: rms <= 50 ? 'good' : rms <= 100 ? 'acceptable' : 'poor',
    samples: count
  }
}

function computeDataLoss(expected, actual) {
  if (expected === 0) return { value: 0, rating: 'good', expected: 0, actual: 0 }
  const loss = ((expected - actual) / expected) * 100
  return {
    value: Math.max(0, loss),
    rating: loss <= 5 ? 'good' : loss <= 15 ? 'acceptable' : 'poor',
    expected,
    actual
  }
}

function computeOverallRating(precision, accuracy, rmsError, dataLoss) {
  if (precision.rating === 'poor' || accuracy.rating === 'poor' ||
      rmsError.rating === 'poor' || dataLoss.rating === 'poor') {
    return 'poor'
  }
  if (precision.rating === 'good' && accuracy.rating === 'good' &&
      rmsError.rating === 'good' && dataLoss.rating === 'good') {
    return 'good'
  }
  return 'acceptable'
}

// Drift analysis
function analyzeDrift(gazeHistory, baseline) {
  const VELOCITY_THRESHOLD = 50
  const MIN_SAMPLES = 30

  if (!gazeHistory || gazeHistory.length < MIN_SAMPLES) {
    return { driftDetected: false, driftProbability: 0, recommendation: 'collecting_data' }
  }

  // Calculate average position
  let sumX = 0, sumY = 0
  for (const p of gazeHistory) {
    sumX += p.x
    sumY += p.y
  }
  const avgX = sumX / gazeHistory.length
  const avgY = sumY / gazeHistory.length

  // Compare to baseline
  const baselineCenter = baseline?.centerPosition || { x: 960, y: 540 }
  const driftX = avgX - baselineCenter.x
  const driftY = avgY - baselineCenter.y
  const driftMag = Math.sqrt(driftX * driftX + driftY * driftY)

  let driftProbability = 0
  if (driftMag > 200) driftProbability = 1.0
  else if (driftMag > 50) driftProbability = (driftMag - 50) / 150

  return {
    driftDetected: driftProbability > 0.7,
    driftProbability,
    driftVector: { x: driftX, y: driftY },
    recommendation: driftProbability > 0.9 ? 'recalibrate' :
                   driftProbability > 0.5 ? 'monitor' : 'none'
  }
}
