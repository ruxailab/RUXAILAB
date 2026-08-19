export const SESSION_PRESENCE_STATUS = {
  WAITING: 'waiting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  LEFT: 'left',
}

export const normalizePresenceStatus = (
  member,
  fallback = SESSION_PRESENCE_STATUS.WAITING,
) => {
  if (!member) return fallback

  if (member.connected === true) {
    return SESSION_PRESENCE_STATUS.CONNECTED
  }

  const rawStatus = member.presenceStatus ?? member.status ?? null
  if (rawStatus != null) {
    const normalized = String(rawStatus).trim().toLowerCase()

    switch (normalized) {
      case 'connected':
      case 'in-room':
      case 'joined':
        return SESSION_PRESENCE_STATUS.CONNECTED
      case 'waiting':
      case 'lobby':
      case 'pending':
        return SESSION_PRESENCE_STATUS.WAITING
      case 'disconnected':
      case 'offline':
      case 'left':
      case 'exited':
        return SESSION_PRESENCE_STATUS.DISCONNECTED
      default:
        break
    }
  }

  if (member.connected === false) {
    return SESSION_PRESENCE_STATUS.DISCONNECTED
  }

  return fallback
}

export const getMemberIdentityKeys = (member = null) => {
  if (!member) return []

  const rawValues = [
    member.userDocId,
    member.id,
    member.email,
    member.name,
    member.displayName,
  ]

  const normalized = new Set()

  rawValues.forEach((value) => {
    if (value == null || !String(value).trim()) return

    const str = String(value).trim().toLowerCase()
    normalized.add(str)
    normalized.add(str.replace(/[^a-z0-9]/g, ''))

    const localPart = str.includes('@') ? str.split('@')[0] : str
    if (localPart) {
      normalized.add(localPart)
      normalized.add(localPart.replace(/[^a-z0-9]/g, ''))
    }
  })

  return [...normalized]
}

export const removeStaffDuplicates = (participants = [], staff = []) => {
  const staffKeys = new Set(
    (Array.isArray(staff) ? staff : [])
      .flatMap((member) => getMemberIdentityKeys(member))
      .filter(Boolean)
      .map((key) => String(key).trim().toLowerCase()),
  )

  return (Array.isArray(participants) ? participants : []).filter((member) => {
    const memberKeys = getMemberIdentityKeys(member)
    return !memberKeys.some((key) =>
      staffKeys.has(String(key).trim().toLowerCase()),
    )
  })
}

const getCanonicalRole = (member, fallback = 'participant') => {
  if (!member || typeof member !== 'object') return fallback

  if (member.isModerator === true) return 'moderator'

  const accessLevel = member.accessLevel
  const roleValue = String(member.role ?? '')
    .trim()
    .toUpperCase()

  if (
    roleValue === 'FACILITATOR' ||
    roleValue === 'MODERATOR' ||
    accessLevel === 'ADMIN' ||
    accessLevel === 1 ||
    accessLevel === '1'
  ) {
    return 'moderator'
  }

  if (
    roleValue === 'OBSERVER' ||
    roleValue === 'OBSERVATOR' ||
    accessLevel === 'OBSERVATOR' ||
    accessLevel === 3 ||
    accessLevel === '3'
  ) {
    return 'observator'
  }

  if (roleValue === 'PARTICIPANT' || accessLevel === 5 || accessLevel === '5') {
    return 'participant'
  }

  return fallback
}

export const normalizeRoomParticipantsMap = (participants = {}) => {
  if (!participants || typeof participants !== 'object') return []

  return Object.entries(participants)
    .map(([userId, member]) => {
      if (!member || typeof member !== 'object') return null

      const normalizedStatus = member.presenceStatus ?? member.status ?? null
      const canonicalRole = getCanonicalRole(member, 'participant')

      return {
        id: member.id ?? member.userDocId ?? userId,
        userDocId: member.userDocId ?? member.id ?? userId,
        email: member.email ?? null,
        name:
          member.name ??
          member.displayName ??
          member.email?.split('@')[0] ??
          userId,
        role: canonicalRole,
        accessLevel:
          member.accessLevel ??
          (member.isModerator
            ? 'ADMIN'
            : canonicalRole === 'observator'
              ? 'OBSERVATOR'
              : 5),
        isModerator: canonicalRole === 'moderator',
        connected: member.connected ?? null,
        presenceStatus: normalizedStatus,
        presenceUpdatedAt: member.presenceUpdatedAt ?? null,
        media: member.media ?? {
          cameraEnabled: member.mediacameraEnabled ?? true,
          microphoneEnabled: member.microphoneEnabled ?? true,
        },
        taskIndex: member.taskIndex ?? 0,
        joinedAt: member.joinedAt ?? null,
      }
    })
    .filter(Boolean)
}

export const normalizeSessionMember = (
  member,
  fallbackType = 'participant',
) => {
  if (!member) return null

  const memberId = member.userDocId || member.id || member.email
  if (!memberId) return null

  const presenceStatus = member.presenceStatus ?? member.status ?? null
  const role = getCanonicalRole(member, fallbackType)

  return {
    ...member,
    id: memberId,
    userDocId: member.userDocId || member.id || member.email,
    email: member.email,
    name:
      member.name ||
      member.displayName ||
      member.email?.split('@')[0] ||
      fallbackType,
    role,
    accessLevel:
      member.accessLevel ??
      (role === 'moderator'
        ? 'ADMIN'
        : role === 'observator'
          ? 'OBSERVATOR'
          : 5),
    connected: member.connected ?? null,
    presenceStatus,
    isStaff: fallbackType === 'staff',
    isModerator: role === 'moderator',
    presenceUpdatedAt: member.presenceUpdatedAt ?? null,
  }
}

export const getPresenceStateFromMember = (member) => {
  const normalized = normalizePresenceStatus(
    member,
    SESSION_PRESENCE_STATUS.WAITING,
  )

  return {
    status: normalized,
    connected: normalized === SESSION_PRESENCE_STATUS.CONNECTED,
    label: normalized,
    color:
      normalized === SESSION_PRESENCE_STATUS.CONNECTED
        ? 'green'
        : normalized === SESSION_PRESENCE_STATUS.WAITING
          ? 'orange'
          : 'grey',
  }
}
