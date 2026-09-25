import Controller from '@/app/plugins/firebase/FirebaseFirestoreRepository'
import { FirebaseFunctionsController } from '@/app/plugins/firebase/FirebaseFunctionsService'
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
  async updateStudyFields(id, fields) {
    const response =
      await FirebaseFunctionsController.callHttpsCallableFunction(
        'updateStudyWithAudit',
        { studyId: id, study: { ...fields, updateDate: Date.now() } },
      )
    return response.data
  }

  async getById(id) {
    const res = await this.readOne(COLLECTION, id)
    return instantiateStudyByType(STUDY_TYPES.FOCUS_GROUP, {
      id: res.id,
      ...res.data(),
    })
  }

  async updateDiscussionGuide(id, discussionGuide) {
    return this.updateStudyFields(id, {
      discussionGuide: discussionGuide.map((topic) =>
        typeof topic.toFirestore === 'function' ? topic.toFirestore() : topic,
      ),
    })
  }

  async updateConfig(id, config) {
    return this.updateStudyFields(id, {
      config:
        typeof config.toFirestore === 'function'
          ? config.toFirestore()
          : config,
    })
  }

  async updateStimuli(id, stimuli) {
    return this.updateStudyFields(id, {
      stimuli: stimuli.map((stimulus) =>
        typeof stimulus.toFirestore === 'function'
          ? stimulus.toFirestore()
          : stimulus,
      ),
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

  /**
   * Persist the facilitator's manual theme structuring (replaces the whole
   * `themes` array — themes are edited as one drag-and-drop board, not
   * field-by-field).
   */
  async saveThemes(answersDocId, themes) {
    return this.update(ANSWERS_COLLECTION, answersDocId, {
      themes: themes.map((theme) =>
        typeof theme.toFirestore === 'function' ? theme.toFirestore() : theme,
      ),
    })
  }
}
