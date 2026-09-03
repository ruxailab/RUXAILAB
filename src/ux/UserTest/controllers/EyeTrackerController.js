// imports
import Controller from '@/app/plugins/firebase/FirebaseFirestoreRepository'
import {
  where,
  orderBy,
  collection,
  query,
  limit,
  getDocs,
} from 'firebase/firestore'
import { db } from '@/app/plugins/firebase'
import axios from 'axios'

const CALIB_COLLECTION = 'calibrations'

function summarizeNumericValues(values, screenWidth, screenHeight) {
  const numericValues = values.filter(
    (value) => typeof value === 'number' && Number.isFinite(value),
  )
  const sortedValues = [...numericValues].sort((a, b) => a - b)
  const mean = numericValues.length
    ? numericValues.reduce((sum, value) => sum + value, 0) /
      numericValues.length
    : null
  const variance = numericValues.length
    ? numericValues.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
      numericValues.length
    : null

  return {
    min: sortedValues[0] ?? null,
    max: sortedValues[sortedValues.length - 1] ?? null,
    mean,
    std: variance === null ? null : Math.sqrt(variance),
    constant: numericValues.length > 0 && new Set(numericValues).size === 1,
    invalid: values.filter(
      (value) => typeof value !== 'number' || !Number.isFinite(value),
    ).length,
    strings: values.filter((value) => typeof value === 'string').length,
    outsideScreenRange: numericValues.filter(
      (value) =>
        value < 0 || value > Math.max(screenWidth || 0, screenHeight || 0),
    ).length,
  }
}

function summarizeTrackingData(irisData, screenWidth, screenHeight) {
  const fields = ['left_iris_x', 'right_iris_x', 'left_iris_y', 'right_iris_y']
  const summary = Object.fromEntries(
    fields.map((field) => [
      field,
      summarizeNumericValues(
        irisData.map((sample) => sample?.[field]),
        screenWidth,
        screenHeight,
      ),
    ]),
  )
  const timestamps = irisData
    .map((sample) => sample?.timestamp)
    .filter((value) => typeof value === 'number' && Number.isFinite(value))
  const intervals = timestamps
    .slice(1)
    .map((timestamp, index) => timestamp - timestamps[index])

  return {
    sampleCount: irisData.length,
    invalidSamples: irisData.filter(
      (sample) =>
        !sample ||
        fields.some(
          (field) =>
            typeof sample[field] !== 'number' ||
            !Number.isFinite(sample[field]),
        ),
    ).length,
    timestampRange: {
      min: timestamps[0] ?? null,
      max: timestamps[timestamps.length - 1] ?? null,
    },
    timestampIntervals: summarizeNumericValues(intervals),
    fields: summary,
  }
}

function logTrackingSummary(label, summary, metadata) {
  console.info(`[eye-tracking-diagnostic] ${label}`, {
    ...metadata,
    ...summary,
  })
}

export default class EyeTrackerController extends Controller {
  constructor() {
    super()
  }

  async getLastCalibAndPredict(userId, studyId, irisData) {
    const lastCalib = await this.getCalibsByStudyAndUser(userId, studyId)
    if (!lastCalib) {
      throw new Error('No calibration data found for this user and study')
    }

    const response = await this.batchPredict({
      pointNumber: lastCalib.k,
      screenHeight: lastCalib.screenHeight,
      screenWidth: lastCalib.screenWidth,
      irisData: irisData,
      calibId: lastCalib.sessionId,
      model: lastCalib.model,
    })

    return response
  }

  async getCalibsByStudyAndUser(userId, studyId) {
    const q = await query(
      collection(db, CALIB_COLLECTION),
      where('userId', '==', userId),
      where('studyId', '==', studyId),
      orderBy('createdAt', 'desc'),
      limit(1),
    )

    const calibsSnap = await getDocs(q)
    const calibs = calibsSnap.docs.map((doc) => doc.data())
    return calibs[0] || null
  }

  async batchPredict(data) {
    const requestSummary = summarizeTrackingData(
      Array.isArray(data.irisData) ? data.irisData : [],
      data.screenWidth,
      data.screenHeight,
    )
    logTrackingSummary('batch request', requestSummary, {
      screen_width: data.screenWidth,
      screen_height: data.screenHeight,
      model_name: data.model,
      calib_id: data.calibId,
    })

    const response = await axios.post(
      process.env.VUE_APP_EYE_LAB_BACKEND_URL + '/api/session/batch_predict',
      {
        k: data.pointNumber,
        screen_height: data.screenHeight,
        screen_width: data.screenWidth,
        iris_tracking_data: data.irisData,
        calib_id: data.calibId,
        model_name: data.model,
      },
      { headers: { 'Content-Type': 'application/json' } },
    )

    const predictions = Array.isArray(response.data) ? response.data : []
    const predictedX = predictions.map((prediction) => prediction?.predicted_x)
    const predictedY = predictions.map((prediction) => prediction?.predicted_y)
    const normalizedX = predictions.map((prediction) =>
      typeof prediction?.predicted_x === 'number' && prediction?.screen_width
        ? prediction.predicted_x / prediction.screen_width
        : null,
    )
    logTrackingSummary(
      'batch response',
      {
        responseCount: predictions.length,
        predicted_x: summarizeNumericValues(predictedX),
        predicted_y: summarizeNumericValues(predictedY),
        normalized_x: summarizeNumericValues(normalizedX),
      },
      {
        screen_width: predictions[0]?.screen_width ?? data.screenWidth,
        screen_height: predictions[0]?.screen_height ?? data.screenHeight,
      },
    )

    return response.data
  }
}
