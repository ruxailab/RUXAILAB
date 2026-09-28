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
})
