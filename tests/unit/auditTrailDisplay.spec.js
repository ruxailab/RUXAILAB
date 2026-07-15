import {
  auditActorDisplay,
  auditDescriptionDisplay,
  normalizeAuditEvent,
} from '@/shared/utils/auditTrailDisplay'

const translations = {
  'auditTrail.descriptions.studyRenamed':
    'Renamed study from "{before}" to "{after}"',
  'auditTrail.descriptions.studyDescriptionUpdated':
    'Updated study description',
  'auditTrail.descriptions.studyAccessChanged':
    'Changed access from {before} to {after}',
  'auditTrail.descriptions.cooperatorInvited': 'Invited {target} as {role}',
  'auditTrail.descriptions.storageFileDeleted': 'Deleted {target}',
  'auditTrail.values.public': 'Public',
  'auditTrail.values.private': 'Private',
  'auditTrail.values.empty': 'Empty',
  'auditTrail.roles.observator': 'Observator',
}

const t = (key, params = {}) =>
  Object.entries(params).reduce(
    (message, [name, value]) => message.replace(`{${name}}`, value),
    translations[key] || key,
  )

const te = (key) => key in translations

describe('auditTrailDisplay', () => {
  it('prefers readable actor labels over stored identifiers', () => {
    const event = normalizeAuditEvent(
      {
        actorId: 'uid-1',
        actorEmail: 'owner@example.com',
      },
      { t, te },
    )

    expect(event.actorDisplay).toBe('owner@example.com')
  })

  it('falls back to stable IDs for older audit events', () => {
    expect(auditActorDisplay({ actorId: 'uid-1' })).toBe('uid-1')
    expect(auditDescriptionDisplay({ target: 'study-1' }, t, te)).toBe(
      'study-1',
    )
  })

  it('describes study title, description, and public access changes', () => {
    expect(
      auditDescriptionDisplay(
        {
          action: 'study.settingsChanged',
          details: {
            changedFields: ['testDescription', 'isPublic', 'testTitle'],
            changes: {
              testTitle: { before: 'Old title', after: 'New title' },
              testDescription: { before: 'Old', after: 'New' },
              isPublic: { before: true, after: false },
            },
          },
        },
        t,
        te,
      ),
    ).toBe(
      'Renamed study from "Old title" to "New title"; Updated study description; Changed access from Public to Private',
    )
  })

  it('describes cooperator and storage events', () => {
    expect(
      auditDescriptionDisplay(
        {
          action: 'cooperator.invited',
          targetLabel: 'user@example.com',
          details: { role: 3 },
        },
        t,
        te,
      ),
    ).toBe('Invited user@example.com as Observator')

    expect(
      auditDescriptionDisplay(
        {
          action: 'storage.fileDeleted',
          targetLabel: 'session.webm',
        },
        t,
        te,
      ),
    ).toBe('Deleted session.webm')
  })
})
