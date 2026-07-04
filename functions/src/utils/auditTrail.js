import { admin } from '../f.firebase.js'

export function writeAuditEvent(
  transaction,
  studyRef,
  { action, actorId, target = '', details = {} },
) {
  const auditRef = studyRef.collection('auditTrail').doc()
  transaction.set(auditRef, {
    action,
    actorId,
    target,
    details,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  })
}
