import { admin } from '../core/firebase/f.firebase.js'

export function buildAuditEvent({
  action,
  actorId,
  actorEmail = '',
  actorLabel = '',
  target = '',
  targetLabel = '',
  targetType = '',
  details = {},
}) {
  const event = {
    action,
    actorId,
    target,
    details,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  }

  if (actorEmail) event.actorEmail = actorEmail
  if (actorLabel) event.actorLabel = actorLabel
  if (targetLabel) event.targetLabel = targetLabel
  if (targetType) event.targetType = targetType

  return event
}

export function writeAuditEvent(transaction, studyRef, event) {
  const auditRef = studyRef.collection('auditTrail').doc()
  transaction.set(auditRef, buildAuditEvent(event))
}
