import Sentiment from '@/ai/sentiment/Sentiment'
import Controller from '@/app/plugins/firebase/FirebaseFirestoreRepository'

const COLLECTION = 'sentiment'

/**
 * Client access to per-user/per-task sentiment documents.
 */
export default class SentimentController extends Controller {
  /**
   * @param {string} id
   * @returns {Promise<Sentiment|null>}
   */
  async getById(id) {
    if (!id) return null
    const snap = await super.readOne(COLLECTION, id)
    if (!snap.exists()) return null
    return Sentiment.fromFirestore(snap.data(), snap.id)
  }
}
