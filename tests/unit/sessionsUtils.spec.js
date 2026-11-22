import { getSessionStatus, SESSION_STATUSES } from '@/shared/utils/sessionsUtils'

describe('getSessionStatus', () => {
  it('reports a recorded lifecycle end before applying date-based status', () => {
    expect(getSessionStatus(new Date(), 'ended')).toBe(SESSION_STATUSES.ENDED)
    expect(getSessionStatus(null, 'ended')).toBe(SESSION_STATUSES.ENDED)
  })

  it('keeps date-based status for sessions without a lifecycle state', () => {
    expect(getSessionStatus(null)).toBe(SESSION_STATUSES.UNKNOWN)
    expect(getSessionStatus(new Date(), 'scheduled')).toBe(SESSION_STATUSES.TODAY)
  })

  it('returns UNKNOWN for invalid dates or invalid objects', () => {
    expect(getSessionStatus('invalid-date')).toBe(SESSION_STATUSES.UNKNOWN)
    expect(getSessionStatus({})).toBe(SESSION_STATUSES.UNKNOWN)
    expect(getSessionStatus([])).toBe(SESSION_STATUSES.UNKNOWN)
  })

  it('correctly handles future Firestore timestamp with toDate() method', () => {
    const futureDate = new Date(Date.now() + 86400000 * 5)
    const firestoreTimestamp = { toDate: () => futureDate }
    expect(getSessionStatus(firestoreTimestamp)).toBe(SESSION_STATUSES.UPCOMING)
  })

  it('correctly handles serialized Firestore timestamp with seconds', () => {
    const futureDate = new Date(Date.now() + 86400000 * 5)
    const plainTimestamp = {
      seconds: Math.floor(futureDate.getTime() / 1000),
      nanoseconds: 0,
    }
    expect(getSessionStatus(plainTimestamp)).toBe(SESSION_STATUSES.UPCOMING)
  })

  it('correctly handles past sessions as COMPLETED', () => {
    const pastDate = new Date(Date.now() - 86400000 * 5)
    expect(getSessionStatus(pastDate)).toBe(SESSION_STATUSES.COMPLETED)
  })
})
