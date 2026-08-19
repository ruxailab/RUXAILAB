import {
  normalizePresenceStatus,
  normalizeRoomParticipantsMap,
  getMemberIdentityKeys,
  removeStaffDuplicates,
  getPresenceStateFromMember,
  normalizeSessionMember,
} from '@/ux/UserTest/utils/sessionPresence'

describe('session presence helpers', () => {
  it('defaults a participant without explicit presence to waiting instead of connected', () => {
    expect(normalizePresenceStatus({ email: 'p1@test.com' })).toBe('waiting')
  })

  it('respects the connected boolean when no presenceStatus is persisted yet', () => {
    expect(normalizePresenceStatus({ connected: true, email: 'p1@test.com' })).toBe('connected')
    expect(normalizePresenceStatus({ connected: false, email: 'p1@test.com' })).toBe('disconnected')
  })

  it('keeps the explicit waiting status when a stale connected=false flag is still present', () => {
    const member = {
      userDocId: 'u-1',
      email: 'p1@test.com',
      presenceStatus: 'waiting',
      connected: false,
    }

    expect(getPresenceStateFromMember(member)).toMatchObject({
      status: 'waiting',
      label: 'waiting',
      color: 'orange',
    })
  })

  it('prefers a live connected state over a stale disconnected presenceStatus', () => {
    const member = {
      userDocId: 'u-3',
      email: 'moderator@test.com',
      presenceStatus: 'disconnected',
      connected: true,
      role: 'FACILITATOR',
    }

    expect(getPresenceStateFromMember(member)).toMatchObject({
      status: 'connected',
      connected: true,
      label: 'connected',
      color: 'green',
    })
  })

  it('derives the UI presence badge from presenceStatus instead of the stale connected flag', () => {
    const member = {
      userDocId: 'u-1',
      email: 'p1@test.com',
      presenceStatus: 'waiting',
      connected: false,
    }

    expect(getPresenceStateFromMember(member)).toMatchObject({
      status: 'waiting',
      connected: false,
      label: 'waiting',
      color: 'orange',
    })
  })

  it('preserves waiting presence when session members are normalized for display', () => {
    const member = {
      userDocId: 'u-1',
      email: 'p1@test.com',
      presenceStatus: 'waiting',
      connected: false,
      role: 'participant',
    }

    expect(normalizeSessionMember(member, 'participant')).toMatchObject({
      presenceStatus: 'waiting',
      connected: false,
    })
  })

  it('normalizes facilitator and observer role strings to the canonical UI labels', () => {
    expect(normalizeSessionMember({ userDocId: 'u-1', role: 'FACILITATOR' }, 'participant')).toMatchObject({
      role: 'moderator',
      accessLevel: 'ADMIN',
      isModerator: true,
    })

    expect(normalizeSessionMember({ userDocId: 'u-2', role: 'OBSERVER' }, 'participant')).toMatchObject({
      role: 'observator',
      accessLevel: 'OBSERVATOR',
      isModerator: false,
    })
  })

  it('removes a moderator from participants when the same user already exists in staff', () => {
    const staff = [{
      userDocId: 'facilitator-1',
      email: 'moderator@test.com',
      role: 'FACILITATOR',
      presenceStatus: 'connected',
      connected: true,
    }]

    const participants = [
      {
        userDocId: 'facilitator-1',
        email: 'moderator@test.com',
        presenceStatus: 'disconnected',
        connected: false,
        role: 5,
      },
      {
        userDocId: 'participant-2',
        email: 'p2@test.com',
        presenceStatus: 'waiting',
        connected: false,
        role: 5,
      },
    ]

    expect(removeStaffDuplicates(participants, staff)).toHaveLength(1)
    expect(removeStaffDuplicates(participants, staff)[0].email).toBe('p2@test.com')
  })

  it('matches members by email when the userDocId differs across session records', () => {
    const user = { id: 'different-id', email: 'moderator@test.com' }
    const staffMember = {
      userDocId: 'staff-id',
      email: 'moderator@test.com',
      presenceStatus: 'connected',
      connected: true,
    }
    const participantMember = {
      userDocId: 'participant-id',
      email: 'moderator@test.com',
      presenceStatus: 'disconnected',
      connected: false,
    }

    expect(removeStaffDuplicates([participantMember], [staffMember])).toHaveLength(0)
    expect(
      getMemberIdentityKeys(staffMember).some((key) =>
        getMemberIdentityKeys(user).includes(key),
      ),
    ).toBe(true)
  })

  it('normalizes the realtime room participant map used by the session room', () => {
    const roomParticipants = {
      aa111: {
        connected: true,
        email: 'karine.pistili@gmail.com',
        isModerator: false,
        joinedAt: 1787142452574,
        media: { cameraEnabled: true, microphoneEnabled: true },
        name: 'karine.pistili',
        taskIndex: 0,
      },
      bb222: {
        connected: true,
        email: 'marcgc21@gmail.com',
        isModerator: true,
        joinedAt: 1787142450697,
        media: { cameraEnabled: true, microphoneEnabled: true },
        name: 'marcgc21',
        taskIndex: 0,
      },
    }

    const normalized = normalizeRoomParticipantsMap(roomParticipants)

    expect(normalized).toHaveLength(2)
    expect(normalized.find((member) => member.isModerator)?.email).toBe('marcgc21@gmail.com')
    expect(normalized.find((member) => !member.isModerator)?.presenceStatus).toBeNull()
    expect(normalized.every((member) => member.connected === true)).toBe(true)
  })

  it('prefers the effective connected state over a stale disconnected presenceStatus in the room map', () => {
    const normalized = normalizeRoomParticipantsMap({
      mod: {
        userDocId: 'mod-1',
        email: 'mod@test.com',
        isModerator: true,
        role: 'FACILITATOR',
        connected: false,
        presenceStatus: 'connected',
      },
    })

    expect(normalized).toHaveLength(1)
    expect(normalized[0].connected).toBe(false)
    expect(normalized[0].presenceStatus).toBe('connected')
    expect(normalized[0].isModerator).toBe(true)
  })

  it('keeps the presence status and update timestamp visible when a participant connects', () => {
    const participant = {
      connected: true,
      presenceStatus: 'connected',
      status: 'connected',
      presenceUpdatedAt: 1712345678901,
    }

    const normalized = normalizeRoomParticipantsMap({ user123: participant })

    expect(normalized).toHaveLength(1)
    expect(normalized[0].connected).toBe(true)
    expect(normalized[0].presenceStatus).toBe('connected')
    expect(normalized[0].presenceUpdatedAt).toBe(1712345678901)
    expect(Object.prototype.hasOwnProperty.call(normalized[0], 'status')).toBe(false)
  })

  it('does not invent presence fields when the RTDB fields are absent', () => {
    const participant = {
      joinedAt: 1712345678901,
      updatedAt: 1712345678902,
    }

    const normalized = normalizeRoomParticipantsMap({ user123: participant })

    expect(normalized).toHaveLength(1)
    expect(normalized[0].presenceStatus).toBeNull()
    expect(normalized[0].connected).toBeNull()
    expect(normalized[0].presenceUpdatedAt).toBeNull()
  })

  it('does not force other staff members to connected when the call object is created', () => {
    const staff = [
      { userDocId: 'staff-1', email: 'staff1@test.com', role: 'SUPPORT' },
      {
        userDocId: 'staff-2',
        email: 'staff2@test.com',
        role: 'FACILITATOR',
        connected: true,
        presenceStatus: 'connected',
      },
    ]

    const entries = normalizeRoomParticipantsMap(
      Object.fromEntries(
        staff.map((member) => [member.userDocId, { ...member, joinedAt: Date.now() }]),
      ),
    )

    expect(entries).toHaveLength(2)
    expect(entries.find((member) => member.userDocId === 'staff-1')?.presenceStatus).toBeNull()
    expect(entries.find((member) => member.userDocId === 'staff-2')?.presenceStatus).toBe('connected')
    expect(entries.find((member) => member.userDocId === 'staff-1')?.connected).toBeNull()
  })

  it('does not copy stale presence fields from staff members into the call seed', () => {
    const staffEntry = {
      userDocId: 'staff-9',
      email: 'staff9@test.com',
      role: 'SUPPORT',
      connected: true,
      presenceStatus: 'connected',
      presenceUpdatedAt: 123456,
    }

    const seeded = {
      ...staffEntry,
      userDocId: 'staff-9',
      name: 'staff9',
      joinedAt: Date.now(),
      media: { cameraEnabled: true, microphoneEnabled: true },
    }

    delete seeded.connected
    delete seeded.presenceStatus
    delete seeded.presenceUpdatedAt

    expect(seeded.connected).toBeUndefined()
    expect(seeded.presenceStatus).toBeUndefined()
    expect(seeded.presenceUpdatedAt).toBeUndefined()
  })
})
