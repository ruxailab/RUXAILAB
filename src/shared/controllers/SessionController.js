import Controller from '@/app/plugins/firebase/FirebaseFirestoreRepository'

export default class SessionController extends Controller {
  constructor() {
    super()
  }

  /**
   * Creates a new session inside a study.
   *
   * @param {Object} params
   * @param {string} params.studyId
   * @param {Object} params.session
   */
  async createSession({ studyId, session }) {
    try {
      const sessionData = {
        ...session,
        createdAt: new Date(),
      }

      const sessionRef = await super.create(
        `tests/${studyId}/sessions`,
        sessionData,
      )

      return {
        success: true,
        session: {
          id: sessionRef.id,
          ...sessionData,
          startDate: sessionData.scheduledAt,
          title: sessionData.title || 'Session',
        },
      }
    } catch (error) {
      return {
        success: false,
        error,
      }
    }
  }

  /**
   * Gets all sessions from a study.
   *
   * @param {Object} params
   * @param {string} params.studyId
   */
  async getSessions({ studyId }) {
    try {
      const sessions = await super.readAll(`tests/${studyId}/sessions`)

      return {
        success: true,
        sessions: sessions.map((session) => ({
          ...session,
          startDate: session.scheduledAt,
          title: session.title || 'Session',
        })),
      }
    } catch (error) {
      return {
        success: false,
        error,
      }
    }
  }

  /**
   * Updates a session.
   *
   * @param {Object} params
   * @param {string} params.studyId
   * @param {string} params.sessionId
   * @param {Object} params.data
   */
  async updateSession({ studyId, sessionId, session }) {
    try {
      await super.update(`tests/${studyId}/sessions`, sessionId, {
        ...session,
        updatedAt: new Date(),
      })

      return {
        success: true,
      }
    } catch (error) {
      return {
        success: false,
        error,
      }
    }
  }

  /**
   * Deletes a session.
   *
   * @param {Object} params
   * @param {string} params.studyId
   * @param {string} params.sessionId
   */
  async deleteSession({ studyId, sessionId }) {
    try {
      await super.delete(`tests/${studyId}/sessions`, sessionId)

      return {
        success: true,
      }
    } catch (error) {
      return {
        success: false,
        error,
      }
    }
  }
}
