import {
  auditPeopleOptions,
  filterAuditEvents,
} from '@/shared/utils/auditTrailFilters'

describe('audit trail filters', () => {
  it('groups events into owner-friendly activity categories', () => {
    const events = [
      { id: 'study', action: 'study.edited' },
      { id: 'settings', action: 'study.settingsChanged' },
      { id: 'team', action: 'cooperator.roleChanged' },
      { id: 'file', action: 'storage.fileDeleted' },
    ]

    expect(filterAuditEvents(events, { activity: 'team' })).toEqual([
      { id: 'team', action: 'cooperator.roleChanged' },
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
