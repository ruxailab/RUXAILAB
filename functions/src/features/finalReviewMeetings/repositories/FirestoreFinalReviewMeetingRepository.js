import { writeAuditEvent } from '../../../utils/auditTrail.js'

/**
 * Firestore adapter for final-review meeting persistence.
 * Services receive transaction-scoped operations rather than Firestore
 * references, keeping persistence details out of the domain layer.
 */
export class FirestoreFinalReviewMeetingRepository {
  constructor({ db, FieldValue }) {
    this.db = db
    this.FieldValue = FieldValue
  }

  runTransaction(callback) {
    return this.db.runTransaction((firestoreTransaction) => {
      const studyRef = (studyId) => this.db.collection('tests').doc(studyId)
      const meetingRef = (studyId, meetingId) =>
        studyRef(studyId).collection('finalReviewMeetings').doc(meetingId)

      const transaction = {
        getStudy: (studyId) => firestoreTransaction.get(studyRef(studyId)),
        getUser: (uid) =>
          firestoreTransaction.get(this.db.collection('users').doc(uid)),
        getAnswers: (answersDocId) =>
          firestoreTransaction.get(this.db.collection('answers').doc(answersDocId)),
        getMeeting: (studyId, meetingId) =>
          firestoreTransaction.get(meetingRef(studyId, meetingId)),
        getSourceEvaluations: (studyId, meetingId) =>
          firestoreTransaction.get(
            meetingRef(studyId, meetingId).collection('sourceEvaluations'),
          ),
        getDecision: (studyId, meetingId, decisionId) =>
          firestoreTransaction.get(
            meetingRef(studyId, meetingId).collection('decisions').doc(decisionId),
          ),
        getDecisions: (studyId, meetingId) =>
          firestoreTransaction.get(meetingRef(studyId, meetingId).collection('decisions')),
        createMeeting: (studyId, data) => {
          const ref = studyRef(studyId).collection('finalReviewMeetings').doc()
          firestoreTransaction.create(ref, data)
          return ref.id
        },
        createSourceEvaluation: (studyId, meetingId, evaluatorId, data) =>
          firestoreTransaction.create(
            meetingRef(studyId, meetingId)
              .collection('sourceEvaluations')
              .doc(evaluatorId),
            data,
          ),
        createDecisionHistory: (studyId, meetingId, data) =>
          firestoreTransaction.create(
            meetingRef(studyId, meetingId).collection('decisionHistory').doc(),
            data,
          ),
        setDecision: (studyId, meetingId, decisionId, data) =>
          firestoreTransaction.set(
            meetingRef(studyId, meetingId).collection('decisions').doc(decisionId),
            data,
          ),
        updateMeeting: (studyId, meetingId, data) =>
          firestoreTransaction.update(meetingRef(studyId, meetingId), data),
        serverTimestamp: () => this.FieldValue.serverTimestamp(),
        writeAuditEvent: (studyId, event) =>
          writeAuditEvent(firestoreTransaction, studyRef(studyId), event),
      }

      return callback(transaction)
    })
  }
}
