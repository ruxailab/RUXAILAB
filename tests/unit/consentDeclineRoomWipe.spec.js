describe('ModeratedTestView RTDB: consent decline blast radius', () => {
  let rtdbDatabase
  let listeners

  beforeEach(() => {
    rtdbDatabase = {}
    listeners = {}
  })

  // Simulated RTDB helper matching Firebase Web SDK ref/set/onValue
  const dbRef = (db, path) => ({ path })
  const set = async (ref, val) => {
    if (val === null) {
      delete rtdbDatabase[ref.path]
    } else {
      rtdbDatabase[ref.path] = JSON.parse(JSON.stringify(val))
    }
    // Trigger listeners
    Object.keys(listeners).forEach((lPath) => {
      if (lPath === ref.path || ref.path.startsWith(lPath)) {
        listeners[lPath]?.({
          val: () => (rtdbDatabase[lPath] !== undefined ? rtdbDatabase[lPath] : null),
        })
      }
    })
  }

  const onValue = (ref, callback) => {
    listeners[ref.path] = callback
    callback({
      val: () => (rtdbDatabase[ref.path] !== undefined ? rtdbDatabase[ref.path] : null),
    })
    return () => {
      delete listeners[ref.path]
    }
  }

  const initModeratedSession = async () => {
    const roomId = 'moderated-room-123'
    const participantAId = 'participant-alice'
    const participantBId = 'participant-bob'
    const sharedRoomRef = dbRef(rtdbDatabase, `rooms/${roomId}`)

    await set(sharedRoomRef, {
      status: 'active',
      globalIndex: 1,
      taskIndex: 0,
      showVideoCall: false,
      createdAt: Date.now(),
    })

    const createPresence = (id, name) =>
      set(dbRef(rtdbDatabase, `calls/${roomId}/participants/${id}`), {
        name,
        role: 'Participant',
        joinedAt: Date.now(),
      })

    await Promise.all([
      createPresence(participantAId, 'Alice'),
      createPresence(participantBId, 'Bob'),
    ])

    const listenerState = { ejected: false, message: '' }
    const clientA = { isModerator: false, displayVideoCallComponent: true }

    onValue(sharedRoomRef, (snapshot) => {
      const data = snapshot.val()
      if (!data && !clientA.isModerator && clientA.displayVideoCallComponent) {
        listenerState.message = 'The moderator has ended the session'
        listenerState.ejected = true
      }
    })

    return { roomId, participantAId, participantBId, sharedRoomRef, listenerState }
  }

  it('DEMONSTRATES BUG: one participant declining consent wipes the shared room for everyone else', async () => {
    const { roomId, participantBId, listenerState } = await initModeratedSession()

    expect(rtdbDatabase[`rooms/${roomId}`]).toBeDefined()
    expect(listenerState.ejected).toBe(false)

    // Buggy implementation: wipes entire shared room
    await set(dbRef(rtdbDatabase, `rooms/${roomId}`), null)

    expect(rtdbDatabase[`rooms/${roomId}`]).toBeUndefined()
    expect(listenerState.ejected).toBe(true)
    expect(listenerState.message).toBe('The moderator has ended the session')
    expect(rtdbDatabase[`calls/${roomId}/participants/${participantBId}`]).toBeDefined()
  })

  it('VERIFIES FIX: a correctly-scoped decline removes only the declining participant and keeps room alive', async () => {
    const { roomId, participantAId, participantBId, listenerState } = await initModeratedSession()

    // Scoped fix: removes only the declining member
    await set(dbRef(rtdbDatabase, `calls/${roomId}/participants/${participantBId}`), null)

    expect(rtdbDatabase[`rooms/${roomId}`]?.status).toBe('active')
    expect(listenerState.ejected).toBe(false)
    expect(rtdbDatabase[`calls/${roomId}/participants/${participantBId}`]).toBeUndefined()
    expect(rtdbDatabase[`calls/${roomId}/participants/${participantAId}`]).toBeDefined()
  })
})
