import {
  auditPeopleOptions,
  filterAuditEvents,
  timestampMilliseconds,
} from '@/shared/utils/auditTrailFilters'

describe('audit trail filters', () => {
  it('groups events into owner-friendly activity categories', () => {
    const events = [
      { id: 'study', action: 'study.edited' },
      { id: 'settings', action: 'study.settingsChanged' },
      { id: 'team', action: 'cooperator.roleChanged' },
      { id: 'file', action: 'storage.fileDeleted' },
      { id: 'report', action: 'report.downloadRequested' },
    ]

    expect(filterAuditEvents(events, { activity: 'team' })).toEqual([
      { id: 'team', action: 'cooperator.roleChanged' },
    ])
  })

  it('filters report download events', () => {
    const events = [
      { id: 'report', action: 'report.downloadRequested' },
      { id: 'study', action: 'study.edited' },
    ]

    expect(filterAuditEvents(events, { activity: 'reports' })).toEqual([
      { id: 'report', action: 'report.downloadRequested' },
    ])
  })

  it('filters events by a study owner or study member identity', () => {
    const events = [
      { id: 'owner-event', actorId: 'owner-id' },
      { id: 'member-event', actorEmail: 'member@example.com' },
      { id: 'other-event', actorId: 'other-id' },
    ]

    expect(filterAuditEvents(events, { person: 'member@example.com' })).toEqual(
      [{ id: 'member-event', actorEmail: 'member@example.com' }],
    )
  })

  it('filters to the selected recent time period', () => {
    const now = new Date('2026-07-15T12:00:00Z').getTime()
    const events = [
      { id: 'recent', timestamp: new Date('2026-07-10T12:00:00Z') },
      { id: 'old', timestamp: new Date('2026-07-01T12:00:00Z') },
    ]

    expect(filterAuditEvents(events, { when: 'last7Days' }, { now })).toEqual([
      { id: 'recent', timestamp: new Date('2026-07-10T12:00:00Z') },
    ])
  })

  it('filters events with plain Firestore timestamps, toMillis objects, and numbers', () => {
    const now = new Date('2026-07-15T12:00:00Z').getTime()
    const recentSec = Math.floor(
      new Date('2026-07-12T12:00:00Z').getTime() / 1000,
    )
    const oldSec = Math.floor(new Date('2026-06-01T12:00:00Z').getTime() / 1000)

    const events = [
      {
        id: 'firestore-plain',
        timestamp: { seconds: recentSec, nanoseconds: 0 },
      },
      {
        id: 'firestore-underscore',
        timestamp: { _seconds: recentSec, _nanoseconds: 0 },
      },
      {
        id: 'firestore-tomillis',
        timestamp: {
          toMillis: () => new Date('2026-07-13T12:00:00Z').getTime(),
        },
      },
      {
        id: 'numeric',
        timestamp: new Date('2026-07-14T12:00:00Z').getTime(),
      },
      {
        id: 'firestore-old',
        timestamp: { seconds: oldSec, nanoseconds: 0 },
      },
      {
        id: 'invalid-timestamp',
        timestamp: 'invalid-date',
      },
    ]

    const filtered = filterAuditEvents(events, { when: 'last7Days' }, { now })
    expect(filtered.map((event) => event.id)).toEqual([
      'firestore-plain',
      'firestore-underscore',
      'firestore-tomillis',
      'numeric',
    ])
  })

  it('parses timestamps in various formats with timestampMilliseconds', () => {
    const millis = 1720958400000
    const sec = 1720958400

    expect(timestampMilliseconds(null)).toBeNull()
    expect(timestampMilliseconds(undefined)).toBeNull()
    expect(timestampMilliseconds('invalid')).toBeNull()
    expect(timestampMilliseconds(millis)).toBe(millis)
    expect(timestampMilliseconds(new Date(millis))).toBe(millis)
    expect(timestampMilliseconds({ toMillis: () => millis })).toBe(millis)
    expect(
      timestampMilliseconds({ toDate: () => new Date(millis) }),
    ).toBe(millis)
    expect(
      timestampMilliseconds({ seconds: sec, nanoseconds: 0 }),
    ).toBe(millis)
    expect(
      timestampMilliseconds({ _seconds: sec, _nanoseconds: 0 }),
    ).toBe(millis)
  })

  it('offers the study owner and cooperators without duplicates', () => {
    expect(
      auditPeopleOptions({
        testAdmin: { userDocId: 'owner-id', email: 'owner@example.com' },
        cooperators: [
          { userDocId: 'member-id', email: 'member@example.com' },
          { userDocId: 'member-id', email: 'member@example.com' },
          { email: 'invited@example.com' },
        ],
      }),
    ).toEqual([
      {
        title: 'owner@example.com',
        value: 'owner-id',
      },
      {
        title: 'member@example.com',
        value: 'member-id',
      },
      {
        title: 'invited@example.com',
        value: 'invited@example.com',
      },
    ])
  })

  it('keeps former members available when they appear in audit history', () => {
    expect(
      auditPeopleOptions(
        {
          testAdmin: { userDocId: 'owner-id', email: 'owner@example.com' },
          cooperators: [],
        },
        [
          {
            actorId: 'former-member-id',
            actorEmail: 'former@example.com',
          },
        ],
      ),
    ).toEqual([
      { title: 'owner@example.com', value: 'owner-id' },
      { title: 'former@example.com', value: 'former-member-id' },
    ])
  })
})
