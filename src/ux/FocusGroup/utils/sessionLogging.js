import { FirebaseFunctionsController } from '@/app/plugins/firebase/FirebaseFunctionsService'

const SESSION_EVENTS = new Set(['SESSION_STARTED', 'SESSION_ENDED'])

/**
 * Ask the logging service to record that the facilitator started or ended a
 * scheduled session. The server checks the live room (start) or the scheduled
 * session's lifecycle (end), so call this only after that write succeeded.
 * Only ids are sent; topics, names and messages never reach logging. Logging
 * is fail-open: it never throws into the session workflow.
 */
export const logFocusGroupSessionEvent = async (
  { studyId, sessionId, eventType },
  callFunction = FirebaseFunctionsController.callHttpsCallableFunction,
) => {
  if (!studyId || !sessionId || !SESSION_EVENTS.has(eventType)) return null
  try {
    const response = await callFunction('requestLogEvent', {
      studyId,
      eventType,
      sessionRef: sessionId,
    })
    return response?.data || response || null
  } catch {
    return null
  }
}
