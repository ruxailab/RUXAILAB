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

    return response.data
  }
}
