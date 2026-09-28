import Controller from '@/app/plugins/firebase/FirebaseFirestoreRepository'
import StudyController from '@/controllers/StudyController'
import { collectionGroup, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '@/app/plugins/firebase'
import { dedupeSessionsByPath } from '@/shared/utils/sessionList'
import { FirebaseFunctionsController } from '@/app/plugins/firebase/FirebaseFunctionsService'

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

  /** Persist the ended state for a scheduled Focus Group through a trusted
   * callable; session attendees must not gain direct Firestore write access. */
  async markFocusGroupSessionEnded({ studyId, sessionId }) {
    try {
      await FirebaseFunctionsController.callHttpsCallableFunction(
        'markFocusGroupSessionEnded',
        { studyId, sessionId },
      )
      return { success: true }
    } catch (error) {
      return { success: false, error }
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
      const normalizedEmail = (email || '').trim().toLowerCase()

      const [
        participantSessions,
        participantIdSessions,
        staffSessions,
        staffEmailSessions,
      ] = await Promise.all([
          normalizedEmail
            ? super.readCollectionGroup('sessions', [
                {
                  field: 'participantEmails',
                  operator: 'array-contains',
                  value: normalizedEmail,
                },
              ])
            : Promise.resolve([]),
          userId
            ? super.readCollectionGroup('sessions', [
                {
                  field: 'participantIds',
                  operator: 'array-contains',
                  value: userId,
                },
              ])
            : Promise.resolve([]),
          userId
            ? super.readCollectionGroup('sessions', [
                {
                  field: 'staffIds',
                  operator: 'array-contains',
                  value: userId,
                },
              ])
            : Promise.resolve([]),
          normalizedEmail
            ? super.readCollectionGroup('sessions', [
                {
                  field: 'staffEmails',
                  operator: 'array-contains',
                  value: normalizedEmail,
                },
              ])
            : Promise.resolve([]),
        ])

      const sessions = dedupeSessionsByPath(
        participantSessions,
        participantIdSessions,
        staffSessions,
        staffEmailSessions,
      )

      const studies = await Promise.all(
        sessions.map((session) =>
          new StudyController().getStudyForSession({
            studyId: session.parentId,
            sessionId: session.id,
          }),
        ),
      )

      const studiesById = new Map(
        studies.filter(Boolean).map((study) => [study.id, study]),
      )

      return {
        success: true,
        sessions: sessions.map((session) => ({
          id: session.id,
          studyId: session.parentId,

          title: session.title || 'Session',
          scheduledAt: session.scheduledAt,
          lifecycleStatus: session.lifecycleStatus,
          endedAt: session.endedAt,

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

  subscribeInvitedSessions({ email, userId, onChange, onError }) {
    const normalizedEmail = (email || '').trim().toLowerCase()
    const queries = []
    if (normalizedEmail) {
      queries.push(
        query(
          collectionGroup(db, 'sessions'),
          where('participantEmails', 'array-contains', normalizedEmail),
        ),
        query(
          collectionGroup(db, 'sessions'),
          where('staffEmails', 'array-contains', normalizedEmail),
        ),
      )
    }
    if (userId) {
      queries.push(
        query(
          collectionGroup(db, 'sessions'),
          where('staffIds', 'array-contains', userId),
        ),
        query(
          collectionGroup(db, 'sessions'),
          where('participantIds', 'array-contains', userId),
        ),
      )
    }

    let refreshRunning = false
    let refreshQueued = false
    const refresh = async () => {
      if (refreshRunning) {
        refreshQueued = true
        return
      }
      refreshRunning = true
      do {
        refreshQueued = false
        try {
          const result = await this.getInvitedSessions({ email, userId })
          if (result.success) onChange?.(result.sessions)
          else onError?.(result.error)
        } catch (error) {
          onError?.(error)
        }
      } while (refreshQueued)
      refreshRunning = false
    }

    const unsubscribers = queries.map((sessionQuery) =>
      onSnapshot(sessionQuery, refresh, onError),
    )
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe())
  }

  async getSession(studyId, sessionId) {
    const res = await super.readOne(`tests/${studyId}/sessions`, sessionId)
    if (!res.exists()) return null

    return {
      id: res.id,
      ...res.data(),
    }
  }
}
