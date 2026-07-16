const EMPTY_VALUE = '-'

const ROLE_LABELS = {
  0: 'admin',
  1: 'evaluator',
  2: 'guest',
  3: 'observator',
  4: 'manager',
  5: 'user',
}

const FIELD_ORDER = [
  'testTitle',
  'testDescription',
  'isPublic',
  'status',
  'testStatus',
  'endDate',
]

const translate = (t, key, params = {}) =>
  typeof t === 'function' ? t(key, params) : key

const hasTranslation = (te, key) => (typeof te === 'function' ? te(key) : false)

const fieldLabel = (field, t, te) => {
  const key = `auditTrail.fields.${field}`
  return hasTranslation(te, key) ? translate(t, key) : field
}

const valueLabel = (value, t, te) => {
  if (value === true) return translate(t, 'auditTrail.values.enabled')
  if (value === false) return translate(t, 'auditTrail.values.disabled')
  if (value === null || value === undefined || value === '') {
    return translate(t, 'auditTrail.values.empty')
  }

  const key = `auditTrail.values.${String(value)}`
  return hasTranslation(te, key) ? translate(t, key) : String(value)
}

const roleLabel = (role, t, te) => {
  if (role === null || role === undefined || role === '') return EMPTY_VALUE
  const roleKey = ROLE_LABELS[role] || String(role)
  const key = `auditTrail.roles.${roleKey}`
  return hasTranslation(te, key) ? translate(t, key) : roleKey
}

const sortedChangedFields = (fields) =>
  [...new Set(fields || [])].sort((left, right) => {
    const leftIndex = FIELD_ORDER.indexOf(left)
    const rightIndex = FIELD_ORDER.indexOf(right)
    if (leftIndex === -1 && rightIndex === -1) return left.localeCompare(right)
    if (leftIndex === -1) return 1
    if (rightIndex === -1) return -1
    return leftIndex - rightIndex
  })

export function auditActorDisplay(event) {
  return (
    event?.actorEmail ||
    event?.actorLabel ||
    event?.actor ||
    event?.actorId ||
    EMPTY_VALUE
  )
}

export function auditDescriptionDisplay(event, t, te) {
  const target = auditTargetDisplay(event)
  const details = event?.details || {}
  const changes = details.changes || {}
  const changedFields = sortedChangedFields(
    details.changedFields || Object.keys(changes),
  )

  if (
    event?.action === 'study.edited' ||
    event?.action === 'study.settingsChanged'
  ) {
    if (changedFields.length > 0) {
      const parts = changedFields.map((field) => {
        const change = changes[field] || {}
        if (field === 'testTitle' && 'before' in change && 'after' in change) {
          return translate(t, 'auditTrail.descriptions.studyRenamed', {
            before: valueLabel(change.before, t, te),
            after: valueLabel(change.after, t, te),
          })
        }
        if (field === 'testDescription') {
          return translate(t, 'auditTrail.descriptions.studyDescriptionUpdated')
        }
        if (field === 'isPublic' && 'before' in change && 'after' in change) {
          return translate(t, 'auditTrail.descriptions.studyAccessChanged', {
            before: valueLabel(change.before ? 'public' : 'private', t, te),
            after: valueLabel(change.after ? 'public' : 'private', t, te),
          })
        }
        if (
          (field === 'status' || field === 'testStatus') &&
          'before' in change &&
          'after' in change
        ) {
          return translate(t, 'auditTrail.descriptions.studyStatusChanged', {
            before: valueLabel(change.before, t, te),
            after: valueLabel(change.after, t, te),
          })
        }

        return translate(t, 'auditTrail.descriptions.fieldUpdated', {
          field: fieldLabel(field, t, te),
        })
      })

      return parts.join('; ')
    }

    return translate(t, 'auditTrail.descriptions.studyUpdated', { target })
  }

  if (event?.action === 'cooperator.invited') {
    return translate(t, 'auditTrail.descriptions.cooperatorInvited', {
      target,
      role: roleLabel(details.role, t, te),
    })
  }

  if (event?.action === 'cooperator.invitationAccepted') {
    return translate(
      t,
      'auditTrail.descriptions.cooperatorInvitationAccepted',
      {
        target,
      },
    )
  }

  if (event?.action === 'cooperator.roleChanged') {
    return translate(t, 'auditTrail.descriptions.cooperatorRoleChanged', {
      target,
      before: roleLabel(details.previousRole, t, te),
      after: roleLabel(details.role, t, te),
    })
  }

  if (event?.action === 'cooperator.removed') {
    return translate(t, 'auditTrail.descriptions.cooperatorRemoved', {
      target,
      role: roleLabel(details.previousRole, t, te),
    })
  }

  if (event?.action === 'cooperator.invitationCancelled') {
    return translate(
      t,
      'auditTrail.descriptions.cooperatorInvitationCancelled',
      {
        target,
      },
    )
  }

  if (event?.action === 'storage.fileDeleted') {
    return translate(t, 'auditTrail.descriptions.storageFileDeleted', {
      target,
    })
  }

  return target
}

export function auditTargetDisplay(event) {
  return (
    event?.targetLabel ||
    event?.targetEmail ||
    event?.targetName ||
    event?.target ||
    EMPTY_VALUE
  )
}

export function normalizeAuditEvent(event, i18n = {}) {
  return {
    ...event,
    actorDisplay: auditActorDisplay(event),
    descriptionDisplay: auditDescriptionDisplay(event, i18n.t, i18n.te),
  }
}
