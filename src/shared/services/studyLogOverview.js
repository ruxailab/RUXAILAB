import {
  collection,
  getCountFromServer,
  query,
  where,
} from 'firebase/firestore'
import { getStudyLogCount, getStudyLogPage } from './studyLogQuery'

const countSessions = async (db, studyId, constraints = []) => {
  const snapshot = await getCountFromServer(
    query(collection(db, `tests/${studyId}/studySessions`), ...constraints),
  )
  return snapshot.data().count
}

/**
 * Overview counts are live `count()` queries over the same collections and
 * filters as the Log Explorer, so a card's number always matches the
 * Explorer view it links to. Each count costs about one read per 1,000
 * matching documents; no aggregate document or backfill is needed.
 *
 * @param {object} params
 * @param {import('firebase/firestore').Firestore} params.db
 * @param {string} params.studyId
 */
export const getStudyLogOverview = async ({ db, studyId }) => {
  const count = (filters) => getStudyLogCount({ db, studyId, filters })
  const [sessions, submittedSessions, events, warnings, errors, latest] =
    await Promise.all([
      countSessions(db, studyId),
      countSessions(db, studyId, [where('submittedAt', '!=', null)]),
      count({}),
      count({ level: 'warning' }),
      count({ level: 'error' }),
      getStudyLogPage({ db, studyId, pageSize: 5 }),
    ])
  return {
    sessions,
    submittedSessions,
    events,
    warnings,
    errors,
    latestEvents: latest.events,
  }
}
