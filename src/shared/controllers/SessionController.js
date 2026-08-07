import Controller from '@/app/plugins/firebase/FirebaseFirestoreRepository'
import StudyController from '@/controllers/StudyController'

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

  /**
   * Gets every session where the user participates.
   *
   * @param {Object} params
   * @param {string} params.email
   * @param {string} params.userId
   */
  async getInvitedSessions({ email, userId }) {
    try {
      const normalizedEmail = email.toLowerCase()

      const [participantSessions, staffSessions] = await Promise.all([
        super.readCollectionGroup('sessions', [
          {
            field: 'participantEmails',
            operator: 'array-contains',
            value: normalizedEmail,
          },
        ]),
        super.readCollectionGroup('sessions', [
          {
            field: 'staffIds',
            operator: 'array-contains',
            value: userId,
          },
        ]),
      ])

      const sessions = [...participantSessions, ...staffSessions].filter(
        (session, index, array) =>
          array.findIndex((item) => item.path === session.path) === index,
      )

      const studyIds = [
        ...new Set(sessions.map((session) => session.parentId).filter(Boolean)),
      ]

      const studies = await Promise.all(
        studyIds.map((studyId) =>
          new StudyController().getStudy({ id: studyId }),
        ),
      )

      const studiesById = new Map(studies.map((study) => [study.id, study]))

      return {
        success: true,
        sessions: sessions.map((session) => ({
          id: session.id,
          studyId: session.parentId,

          title: session.title || 'Session',
          scheduledAt: session.scheduledAt,

          staff: session.staff || [],
          participants: session.participants || [],

          participantEmails: session.participantEmails || [],

          message: session.message,

          createdAt: session.createdAt,
          updatedAt: session.updatedAt,

          study: studiesById.get(session.parentId) || null,
        })),
      }
    } catch (error) {
      return {
        success: false,
        error,
      }
    }
  }
}
