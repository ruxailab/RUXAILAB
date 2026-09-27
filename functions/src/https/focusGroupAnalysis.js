import { admin, functions } from '../core/firebase/f.firebase.js'
import { runAnalysisPipeline } from '../features/focusGroupAnalysis/index.js'

const ACCESS_LEVEL_ADMIN = 0

const error = (code, message) => new functions.https.HttpsError(code, message)

const getData = (request) => request?.data || request || {}

/** Facilitator = the study owner or a cooperator with accessLevel 0, mirroring
 * the role resolution in FocusGroupSessionView.vue's `accessLevel` computed. */
function isFacilitator({ study, uid, isSuperAdmin }) {
  if (isSuperAdmin) return true
  if (study?.testAdmin?.userDocId === uid) return true
  return study?.studyRoleMap?.[uid] === ACCESS_LEVEL_ADMIN
}

/** Replaces any NLP-suggested themes generated from this session on a prior
 * run, leaves every manually authored theme untouched. */
export function mergeThemes({ existingThemes, suggestedThemes, sessionId }) {
  const preserved = (existingThemes ?? []).filter((theme) => {
    const isNlpFromThisSession =
      theme.source === 'nlp' &&
      (theme.responseRefs ?? []).length > 0 &&
      (theme.responseRefs ?? []).every((ref) => ref.sessionId === sessionId)
    return !isNlpFromThisSession
  })
  return [...preserved, ...suggestedThemes]
}

export const runFocusGroupAnalysis = functions.onCall({
  handler: async (request) => {
    const uid = request?.auth?.uid
    if (!uid) throw error('unauthenticated', 'Authentication is required')

    const { studyId, answersDocId, sessionId } = getData(request)
    if (!studyId || !answersDocId || !sessionId) {
      throw error(
        'invalid-argument',
        'studyId, answersDocId, and sessionId are required',
      )
    }

    const db = admin.firestore()
    const [studySnap, userSnap] = await Promise.all([
      db.collection('tests').doc(studyId).get(),
      db.collection('users').doc(uid).get(),
    ])
    if (!studySnap.exists) throw error('not-found', 'Study not found')

    const study = studySnap.data()
    const isSuperAdmin = userSnap.exists && userSnap.data()?.accessLevel === 0
    if (!isFacilitator({ study, uid, isSuperAdmin })) {
      throw error(
        'permission-denied',
        'Only the facilitator can run session analysis',
      )
    }

    // The caller supplies both IDs, so do not let a facilitator attach a
    // different study's answers document to an otherwise authorized request.
    // The study document is the canonical owner of its answers document.
    if (study.answersDocId !== answersDocId) {
      throw error(
        'permission-denied',
        'The answer document does not belong to this study',
      )
    }

    const answerRef = db.collection('answers').doc(answersDocId)
    const answerSnap = await answerRef.get()
    if (!answerSnap.exists) throw error('not-found', 'Answer document not found')

    const answer = answerSnap.data()
    const session = answer?.sessions?.[sessionId]
    if (!session) throw error('not-found', 'Session not found')

    // Presence persists a numeric accessLevel alongside a localized display
    // role. Prefer that stable value and support older records whose role was
    // persisted as an English/Spanish label. Unknown roles fail closed.
    const participantIds = new Set(
      Object.entries(session.participants ?? {})
        .filter(([, participant]) => {
          if (participant?.accessLevel !== undefined && participant?.accessLevel !== null) {
            return Number(participant.accessLevel) === 1
          }
          return ['participant', 'participante'].includes(
            String(participant?.role ?? '').trim().toLowerCase(),
          )
        })
        .map(([participantId]) => participantId)
        .filter((participantId) => participantId !== session.facilitatorId),
    )

    const { perTopic, suggestedThemes } = runAnalysisPipeline({
      sessionId,
      messages: session.messages,
      participantIds,
    })

    const themes = mergeThemes({
      existingThemes: answer.themes,
      suggestedThemes,
      sessionId,
    })

    await answerRef.update({
      [`sessions.${sessionId}.analysis`]: {
        perTopic,
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      themes,
    })

    return { perTopic, suggestedThemes, themes }
  },
})
