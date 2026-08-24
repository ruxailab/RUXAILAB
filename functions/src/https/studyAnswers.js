import { admin, functions } from '../core/firebase/f.firebase.js'

const ROLE = Object.freeze({
  ADMIN: 0,
  EVALUATOR: 1,
  OBSERVATOR: 3,
  MANAGER: 4,
  USER: 5,
})

const error = (code, message) =>
  new functions.https.HttpsError(code, message)

const getData = (request) => request?.data || request || {}

const normalizeStudyType = (type) => {
  const normalized = String(type || '').toUpperCase()
  return normalized === 'HEURISTICS' ? 'HEURISTIC' : normalized
}

const roleFor = (study, uid) => study?.studyRoleMap?.[uid] ?? null

const canAnswerStudy = ({ study, uid, isSuperAdmin = false }) => {
  const studyType = normalizeStudyType(study?.testType)
  const role = roleFor(study, uid)

  return (
    study?.isPublic === true ||
    isSuperAdmin ||
    study?.testAdmin?.userDocId === uid ||
    role === ROLE.ADMIN ||
    role === ROLE.MANAGER ||
    (studyType === 'USER' &&
      (role === ROLE.USER ||
        (role === ROLE.OBSERVATOR && study?.subType === 'USER_MODERATED'))) ||
    (studyType === 'HEURISTIC' && role === ROLE.EVALUATOR)
  )
}

export const getOwnAnswerPayload = ({ answerId, answer, study, uid }) => {
  const type = normalizeStudyType(answer?.type || study?.testType)
  const base = {
    id: answerId,
    type,
    studyId: answer?.studyId || null,
    createdBy: answer?.createdBy || null,
  }

  if (type === 'USER') {
    const ownAnswer = answer?.taskAnswers?.[uid]
    return {
      ...base,
      taskAnswers: ownAnswer ? { [uid]: ownAnswer } : {},
    }
  }

  if (type === 'HEURISTIC') {
    const ownAnswer = answer?.heuristicAnswers?.[uid]
    return {
      ...base,
      heuristicAnswers: ownAnswer ? { [uid]: ownAnswer } : {},
    }
  }

  throw error('failed-precondition', 'Study answer type is not supported')
}

export const getMyStudyAnswer = functions.onCall({
  handler: async (request) => {
    const uid = request?.auth?.uid
    if (!uid) throw error('unauthenticated', 'Authentication is required')

    const { studyId } = getData(request)
    if (!studyId) throw error('invalid-argument', 'studyId is required')

    const db = admin.firestore()
    const [studySnap, userSnap] = await Promise.all([
      db.collection('tests').doc(studyId).get(),
      db.collection('users').doc(uid).get(),
    ])

    if (!studySnap.exists) throw error('not-found', 'Study not found')

    const study = studySnap.data()
    const isSuperAdmin = userSnap.exists && userSnap.data()?.accessLevel === 0

    if (!canAnswerStudy({ study, uid, isSuperAdmin })) {
      throw error('permission-denied', 'Study answering is not permitted')
    }

    if (!study.answersDocId) {
      throw error('failed-precondition', 'Study has no answer document')
    }

    const answerSnap = await db
      .collection('answers')
      .doc(study.answersDocId)
      .get()
    if (!answerSnap.exists) throw error('not-found', 'Answer document not found')

    return getOwnAnswerPayload({
      answerId: answerSnap.id,
      answer: answerSnap.data(),
      study,
      uid,
    })
  },
})
