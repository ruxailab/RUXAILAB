/**
 * EyeTracking Vuex Module
 * Manages eye-tracking calibration state, history, and metrics
 */

import AccuracyMetrics from '../../ux/UserTest/calibration/metrics/AccuracyMetrics.js'
import DriftDetector from '../../ux/UserTest/calibration/metrics/DriftDetector.js'
import CalibrationResult from '../../ux/UserTest/models/CalibrationResult.js'

const state = () => ({
  // Current calibration
  currentCalibration: null,

  // Calibration history
  calibrationHistory: [],

  // Session metrics
  currentSessionMetrics: null,

  // Drift state
  driftState: {
    isDrifted: false,
    driftProbability: 0,
    driftVector: { x: 0, y: 0 },
    lastCheck: null
  },

  // Filter state
  activeFilter: null,
  filterType: 'kalman',

  // Device info
  deviceInfo: {
    hardwareSource: 'WEBCAM',
    screenWidth: 1920,
    screenHeight: 1080,
    viewingDistance: 600
  },

  // Loading states
  isLoading: false,
  isCalibrating: false,
  isAnalyzing: false,

  // Errors
  error: null
})

const getters = {
  // Get current calibration result
  currentCalibration: (state) => state.currentCalibration,

  // Get calibration history for a user
  calibrationHistoryByUser: (state) => (userId) => {
    return state.calibrationHistory.filter(c => c.userId === userId)
  },

  // Get latest calibration for a user
  latestCalibrationByUser: (state) => (userId) => {
    const userCalibrations = state.calibrationHistory.filter(c => c.userId === userId)
    if (userCalibrations.length === 0) return null
    return userCalibrations.sort((a, b) => b.timestamp - a.timestamp)[0]
  },

  // Get current session metrics
  currentSessionMetrics: (state) => state.currentSessionMetrics,

  // Check if currently drifted
  isCurrentlyDrifted: (state) => state.driftState.isDrifted,

  // Get drift probability
  driftProbability: (state) => state.driftState.driftProbability,

  // Get overall quality rating
  overallQualityRating: (state) => {
    if (!state.currentCalibration) return 'unknown'
    return state.currentCalibration.qualityRating
  },

  // Get precision metric
  precisionMetric: (state) => {
    if (!state.currentSessionMetrics) return null
    return state.currentSessionMetrics.precision
  },

  // Get accuracy metric
  accuracyMetric: (state) => {
    if (!state.currentSessionMetrics) return null
    return state.currentSessionMetrics.accuracy
  },

  // Get RMS error metric
  rmsErrorMetric: (state) => {
    if (!state.currentSessionMetrics) return null
    return state.currentSessionMetrics.rmsError
  },

  // Get data loss metric
  dataLossMetric: (state) => {
    if (!state.currentSessionMetrics) return null
    return state.currentSessionMetrics.dataLoss
  },

  // Get filter info
  activeFilter: (state) => ({
    type: state.filterType,
    instance: state.activeFilter
  }),

  // Get device info
  deviceInfo: (state) => state.deviceInfo,

  // Loading states
  isLoading: (state) => state.isLoading,
  isCalibrating: (state) => state.isCalibrating,
  isAnalyzing: (state) => state.isAnalyzing,

  // Get error
  error: (state) => state.error
}

const mutations = {
  // Set current calibration
  SET_CURRENT_CALIBRATION(state, calibration) {
    state.currentCalibration = calibration
  },

  // Add to calibration history
  ADD_TO_CALIBRATION_HISTORY(state, calibration) {
    state.calibrationHistory.push(calibration)
  },

  // Clear calibration history
  CLEAR_CALIBRATION_HISTORY(state) {
    state.calibrationHistory = []
  },

  // Set session metrics
  SET_SESSION_METRICS(state, metrics) {
    state.currentSessionMetrics = metrics
  },

  // Update drift state
  SET_DRIFT_STATE(state, driftState) {
    state.driftState = {
      ...state.driftState,
      ...driftState,
      lastCheck: Date.now()
    }
  },

  // Reset drift state
  RESET_DRIFT_STATE(state) {
    state.driftState = {
      isDrifted: false,
      driftProbability: 0,
      driftVector: { x: 0, y: 0 },
      lastCheck: null
    }
  },

  // Set active filter
  SET_ACTIVE_FILTER(state, { type, instance }) {
    state.filterType = type
    state.activeFilter = instance
  },

  // Clear active filter
  CLEAR_ACTIVE_FILTER(state) {
    state.activeFilter = null
  },

  // Set device info
  SET_DEVICE_INFO(state, deviceInfo) {
    state.deviceInfo = {
      ...state.deviceInfo,
      ...deviceInfo
    }
  },

  // Set loading state
  SET_LOADING(state, isLoading) {
    state.isLoading = isLoading
  },

  // Set calibrating state
  SET_CALIBRATING(state, isCalibrating) {
    state.isCalibrating = isCalibrating
  },

  // Set analyzing state
  SET_ANALYZING(state, isAnalyzing) {
    state.isAnalyzing = isAnalyzing
  },

  // Set error
  SET_ERROR(state, error) {
    state.error = error
  },

  // Clear error
  CLEAR_ERROR(state) {
    state.error = null
  },

  // Reset all state
  RESET_STATE(state) {
    state.currentCalibration = null
    state.currentSessionMetrics = null
    state.driftState = {
      isDrifted: false,
      driftProbability: 0,
      driftVector: { x: 0, y: 0 },
      lastCheck: null
    }
    state.activeFilter = null
    state.isLoading = false
    state.isCalibrating = false
    state.isAnalyzing = false
    state.error = null
  }
}

const actions = {
  // Initialize eye tracking
  async initEyeTracking({ commit, dispatch }, deviceInfo) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')

    try {
      // Set device info
      if (deviceInfo) {
        commit('SET_DEVICE_INFO', deviceInfo)
      }

      // Initialize accuracy metrics calculator
      const metricsCalculator = new AccuracyMetrics({
        screenWidth: deviceInfo?.screenWidth || 1920,
        screenHeight: deviceInfo?.screenHeight || 1080,
        viewingDistance: deviceInfo?.viewingDistance || 600
      })

      // Initialize drift detector
      const driftDetector = new DriftDetector()

      commit('SET_LOADING', false)
      return { metricsCalculator, driftDetector }
    } catch (error) {
      commit('SET_ERROR', error.message)
      commit('SET_LOADING', false)
      throw error
    }
  },

  // Start calibration
  async startCalibration({ commit, rootGetters }) {
    commit('SET_CALIBRATING', true)
    commit('CLEAR_ERROR')
    commit('RESET_DRIFT_STATE')

    try {
      // Get device info from test settings
      const test = rootGetters.currentTest
      const deviceInfo = {
        hardwareSource: 'WEBCAM',
        screenWidth: test?.screenWidth || 1920,
        screenHeight: test?.screenHeight || 1080,
        viewingDistance: test?.viewingDistance || 600
      }

      // Create new calibration result
      const calibration = new CalibrationResult({
        deviceInfo,
        settings: test?.calibrationConfig || {}
      })

      commit('SET_CURRENT_CALIBRATION', calibration)
      return calibration
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  // Complete calibration
  async completeCalibration({ commit, state }, calibrationData) {
    commit('SET_CALIBRATING', false)

    try {
      // Update current calibration with results
      if (state.currentCalibration) {
        state.currentCalibration.setInitialStage(calibrationData)

        if (calibrationData.metrics) {
          state.currentCalibration.metrics = calibrationData.metrics
        }

        if (calibrationData.qualityRating) {
          state.currentCalibration.qualityRating = calibrationData.qualityRating
        }

        // Add to history
        commit('ADD_TO_CALIBRATION_HISTORY', state.currentCalibration)
      }

      return state.currentCalibration
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  // Analyze session metrics
  async analyzeSessionMetrics({ commit }, { samples, expectedSamples, actualSamples }) {
    commit('SET_ANALYZING', true)
    commit('CLEAR_ERROR')

    try {
      const metricsCalculator = new AccuracyMetrics()

      const metrics = metricsCalculator.computeAll({
        samples,
        totalExpected: expectedSamples,
        totalActual: actualSamples
      })

      commit('SET_SESSION_METRICS', metrics)
      commit('SET_ANALYZING', false)

      return metrics
    } catch (error) {
      commit('SET_ERROR', error.message)
      commit('SET_ANALYZING', false)
      throw error
    }
  },

  // Update drift state
  async updateDriftState({ commit, state }, gazePoint) {
    try {
      if (!state.currentCalibration) {
        return null
      }

      // This would integrate with a drift detector instance
      // For now, return current state
      return state.driftState
    } catch (error) {
      commit('SET_ERROR', error.message)
      return null
    }
  },

  // Set filter
  async setFilter({ commit }, { type, config }) {
    commit('SET_ACTIVE_FILTER', { type, instance: null })
    return true
  },

  // Clear filter
  async clearFilter({ commit }) {
    commit('CLEAR_ACTIVE_FILTER')
    return true
  },

  // Save calibration to server
  async saveCalibrationToServer({ commit, state }, { userId, testId }) {
    commit('SET_LOADING', true)

    try {
      if (!state.currentCalibration) {
        throw new Error('No calibration to save')
      }

      // Set IDs
      state.currentCalibration.userId = userId
      state.currentCalibration.testId = testId

      // Call API
      const response = await fetch('/api/eyeTracking/calibrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calibration_data: state.currentCalibration.calibrationPoints,
          device_info: state.currentCalibration.deviceInfo,
          filter_config: state.currentCalibration.settings.filterConfig,
          screen_width: state.currentCalibration.deviceInfo.screenWidth,
          screen_height: state.currentCalibration.deviceInfo.screenHeight,
          viewing_distance: state.currentCalibration.deviceInfo.viewingDistance
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save calibration')
      }

      // Update with server response
      state.currentCalibration.calibrationId = result.calibrationId

      commit('SET_LOADING', false)
      return result
    } catch (error) {
      commit('SET_ERROR', error.message)
      commit('SET_LOADING', false)
      throw error
    }
  },

  // Reset eye tracking state
  resetEyeTracking({ commit }) {
    commit('RESET_STATE')
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
