import { admin, functions } from '../core/firebase/f.firebase.js'

const error = (code, message) => new functions.https.HttpsError(code, message)

const normalizeEmail = (email) => String(email || '').trim().toLowerCase()

const includesMember = (members, uid, email) =>
  (Array.isArray(members) ? members : []).some((member) => {
    const entry = typeof member === 'string' ? { email: member } : member
    return (
      entry?.userDocId === uid ||
      (email && normalizeEmail(entry?.email) === email)
    )
  })

const isSessionFacilitator = ({ session, uid, email }) =>
  (Array.isArray(session?.staff) ? session.staff : []).some((member) => {
    const entry = typeof member === 'string' ? { email: member } : member
    return (
      entry?.role === 'FACILITATOR' &&
      (entry?.userDocId === uid ||
        (email && normalizeEmail(entry?.email) === normalizeEmail(email)))
    )
  })

export const isStudySessionMember = ({ study, session, uid, email }) => {
  const normalizedEmail = normalizeEmail(email)
  const hasStudyRole = Object.hasOwn(study?.studyRoleMap || {}, uid)
  const isStudyOwner = study?.testAdmin?.userDocId === uid
  const isSessionMember =
    (session?.staffIds || []).includes(uid) ||
    (session?.participantIds || []).includes(uid) ||
    (normalizedEmail &&
      ((session?.staffEmails || []).some(
        (entry) => normalizeEmail(entry) === normalizedEmail,
      ) ||
        (session?.participantEmails || []).some(
          (entry) => normalizeEmail(entry) === normalizedEmail,
        ))) ||
    includesMember(session?.staff, uid, normalizedEmail) ||
    includesMember(session?.participants, uid, normalizedEmail)

  return hasStudyRole || isStudyOwner || isSessionMember
}

/** Return a study only to a member of that specific scheduled session. */
export const getStudyForSession = functions.onCall({
  handler: async (request) => {
    const uid = request?.auth?.uid
    if (!uid) throw error('unauthenticated', 'Authentication is required')

    const { studyId, sessionId } = request?.data || {}
    if (!studyId || !sessionId) {
      throw error('invalid-argument', 'studyId and sessionId are required')
    }

    const db = admin.firestore()
    const studyRef = db.collection('tests').doc(studyId)
    const sessionRef = studyRef.collection('sessions').doc(sessionId)
    const [studySnap, sessionSnap] = await Promise.all([
      studyRef.get(),
      sessionRef.get(),
    ])

    if (!studySnap.exists || !sessionSnap.exists) {
      throw error('not-found', 'Study session not found')
    }

    const study = studySnap.data()
    const session = sessionSnap.data()
    if (
      !isStudySessionMember({
        study,
        session,
        uid,
        email: request?.auth?.token?.email,
      })
    ) {
      throw error('permission-denied', 'You are not a member of this session')
    }

    return { study: { id: studySnap.id, ...study } }
  },
})

/** Mark a scheduled Focus Group as ended, without granting attendees direct
 * write access to the session document. */
export const markFocusGroupSessionEnded = functions.onCall({
  handler: async (request) => {
    const uid = request?.auth?.uid
    if (!uid) throw error('unauthenticated', 'Authentication is required')

    const { studyId, sessionId } = request?.data || {}
    if (!studyId || !sessionId) {
      throw error('invalid-argument', 'studyId and sessionId are required')
    }

    const db = admin.firestore()
    const studyRef = db.collection('tests').doc(studyId)
    const sessionRef = studyRef.collection('sessions').doc(sessionId)
    const userRef = db.collection('users').doc(uid)
    const [studySnap, sessionSnap, userSnap] = await Promise.all([
      studyRef.get(),
      sessionRef.get(),
      userRef.get(),
    ])

    if (!studySnap.exists || !sessionSnap.exists) {
      throw error('not-found', 'Study session not found')
    }

    const study = studySnap.data()
    const session = sessionSnap.data()
    const isStudyAdmin =
      (userSnap.exists && userSnap.data()?.accessLevel === 0) ||
      study?.testAdmin?.userDocId === uid ||
      study?.studyRoleMap?.[uid] === 0
    const isFacilitator = isSessionFacilitator({
      session,
      uid,
      email: request?.auth?.token?.email,
    })

    if (
      study?.testType !== 'FOCUS_GROUP' ||
      !(isStudyAdmin || isFacilitator)
    ) {
      throw error(
        'permission-denied',
        'Only this session’s facilitator can end it',
      )
    }

    await sessionRef.update({
      lifecycleStatus: 'ended',
      endedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    return { success: true }
  },
})
