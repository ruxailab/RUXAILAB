import { moderatedSessionTimingReason } from '@/ux/UserTest/utils/moderatedSessionAvailability'

describe('moderated session availability', () => {
  const now = new Date('2026-09-01T13:00:00.000Z')

  it('allows a participant to arrive after the scheduled start', () => {
    expect(
      moderatedSessionTimingReason({
        now,
        scheduledAt: '2026-09-01T12:55:00.000Z',
        studyEndDate: '2026-09-02T00:00:00.000Z',
      }),
    ).toBeNull()
  })

  it('blocks a participant more than 24 hours before the session', () => {
    expect(
      moderatedSessionTimingReason({
        now,
        scheduledAt: '2026-09-03T13:00:00.000Z',
      }),
    ).toBe('test-session-too-far')
  })

  it('allows entry exactly 24 hours before the session', () => {
    expect(
      moderatedSessionTimingReason({
        now,
        scheduledAt: '2026-09-02T13:00:00.000Z',
      }),
    ).toBeNull()
  })

  it('blocks entry 24 hours and one millisecond before the session', () => {
    expect(
      moderatedSessionTimingReason({
        now,
        scheduledAt: '2026-09-02T13:00:00.001Z',
      }),
    ).toBe('test-session-too-far')
  })

  it('expires only after the study end date', () => {
    expect(
      moderatedSessionTimingReason({
        now,
        scheduledAt: '2026-09-01T12:55:00.000Z',
        studyEndDate: '2026-09-01T12:59:59.999Z',
      }),
    ).toBe('test-expired')
  })

  it('prioritizes an expired study over a future session', () => {
    expect(
      moderatedSessionTimingReason({
        now,
        scheduledAt: '2026-09-03T13:00:00.000Z',
        studyEndDate: '2026-09-01T12:59:59.999Z',
      }),
    ).toBe('test-expired')
  })
})
