import Controller from '@/app/plugins/firebase/FirebaseFirestoreRepository'
import {
  instantiateStudyByType,
  STUDY_TYPES,
} from '@/shared/constants/methodDefinitions'

const COLLECTION = 'tests'
const ANSWERS_COLLECTION = 'answers'

/**
 * Data access for Focus Group studies. Reads and persists the discussion guide
 * and session configuration on the underlying study document.
 */
export default class FocusGroupController extends Controller {
  async getById(id) {
    const res = await this.readOne(COLLECTION, id)
    return instantiateStudyByType(STUDY_TYPES.FOCUS_GROUP, {
      id: res.id,
      ...res.data(),
    })
  }

  async updateDiscussionGuide(id, discussionGuide) {
    return this.update(COLLECTION, id, {
      discussionGuide: discussionGuide.map((topic) =>
        typeof topic.toFirestore === 'function' ? topic.toFirestore() : topic,
      ),
      updateDate: Date.now(),
    })
  }

  async updateConfig(id, config) {
    return this.update(COLLECTION, id, {
      config:
        typeof config.toFirestore === 'function'
          ? config.toFirestore()
          : config,
      updateDate: Date.now(),
    })
  }

  async updateStimuli(id, stimuli) {
    return this.update(COLLECTION, id, {
      stimuli: stimuli.map((stimulus) =>
        typeof stimulus.toFirestore === 'function'
          ? stimulus.toFirestore()
          : stimulus,
      ),
      updateDate: Date.now(),
    })
  }

  /**
   * Persist a finished live session into the study's answer document, keyed by
   * session id under the `sessions` map.
   */
  async saveSessionAnswer(answersDocId, session) {
    return this.update(ANSWERS_COLLECTION, answersDocId, {
      [`sessions.${session.sessionId}`]: session,
    })
  }
}
