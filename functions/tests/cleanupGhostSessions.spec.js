import { jest } from '@jest/globals'

const mockUpdate = jest.fn()
const refs = {}

jest.unstable_mockModule('firebase-functions/v2/scheduler', () => ({
  // Hand the raw handler back so tests can drive the scheduled job directly.
  onSchedule: jest.fn((schedule, handler) => handler),
}))

jest.unstable_mockModule('../src/core/firebase/f.firebase.js', () => ({
  admin: {
    database: () => ({
      ref: (path) =>
        path === undefined
          ? { update: mockUpdate }
          : {
              // An array stands for successive reads of the same path, so a
              // test can change what `calls` holds between the sweep's first
              // read and its re-check; the last entry repeats.
              get: async () => {
                const value = refs[path]
                if (!Array.isArray(value)) return value ?? snapshot({})
                return value.length > 1 ? value.shift() : value[0]
              },
            },
    }),
  },
}))

jest.unstable_mockModule('../src/utils/logger.js', () => ({
  default: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}))

/** Minimal stand-in for an RTDB DataSnapshot over a plain object. */
function snapshot(data) {
  return {
    exists: () => Object.keys(data).length > 0,
    forEach: (cb) =>
      Object.entries(data).forEach(([key, value]) =>
        cb({ key, val: () => value }),
      ),
    hasChild: (key) => Object.prototype.hasOwnProperty.call(data, key),
    child: (key) => ({ val: () => data[key] ?? null }),
  }
}

const {
  shouldDeleteFocusGroupRoom,
  hasConnectedCallMember,
  cleanupGhostSessions,
} = await import('../src/scheduled/cleanupGhostSessions.js')

const STALE = Date.now() - 24 * 60 * 60 * 1000

/** Runs the scheduled handler over the given RTDB contents. */
const runJob = async ({
  rooms = {},
  calls = {},
  focusGroupSessions = {},
  callsOnRecheck,
}) => {
  refs.rooms = snapshot(rooms)
  refs.calls = callsOnRecheck
    ? [snapshot(calls), snapshot(callsOnRecheck)]
    : snapshot(calls)
  refs.focusGroupSessions = snapshot(focusGroupSessions)
  await cleanupGhostSessions({})
  return mockUpdate.mock.calls[0]?.[0] ?? {}
}

beforeEach(() => jest.clearAllMocks())

describe('shouldDeleteFocusGroupRoom', () => {
  const cutoff = 1_000_000

  it('never sweeps a live room, no matter how stale lastUpdate looks', () => {
    expect(
      shouldDeleteFocusGroupRoom({ status: 'live', lastUpdate: 1 }, cutoff),
    ).toBe(false)
  })

  it('sweeps an ended room once past the cutoff', () => {
    expect(
      shouldDeleteFocusGroupRoom(
        { status: 'ended', lastUpdate: cutoff - 1 },
        cutoff,
      ),
    ).toBe(true)
  })

  it('keeps an ended room that is still within the cutoff window', () => {
    expect(
      shouldDeleteFocusGroupRoom(
        { status: 'ended', lastUpdate: cutoff + 1 },
        cutoff,
      ),
    ).toBe(false)
  })

  it('sweeps a room that was created but never started (no lastUpdate)', () => {
    expect(shouldDeleteFocusGroupRoom({}, cutoff)).toBe(true)
  })

  it('never sweeps a stale-looking idle room someone is actually connected to', () => {
    expect(
      shouldDeleteFocusGroupRoom(
        {
          status: 'idle',
          lastUpdate: 0,
          participants: { uid1: { connected: true } },
        },
        cutoff,
      ),
    ).toBe(false)
  })

  it('sweeps an idle room once everyone has disconnected', () => {
    expect(
      shouldDeleteFocusGroupRoom(
        {
          status: 'idle',
          lastUpdate: 0,
          participants: { uid1: { connected: false } },
        },
        cutoff,
      ),
    ).toBe(true)
  })
})

describe('hasConnectedCallMember', () => {
  it('sees a connected participant', () => {
    expect(
      hasConnectedCallMember({ participants: { u1: { connected: true } } }),
    ).toBe(true)
  })

  it('sees a connected moderator or observer in the staff branch', () => {
    // Moderators and observers join under `staff`, never `participants`.
    expect(
      hasConnectedCallMember({ staff: { mod: { connected: true } } }),
    ).toBe(true)
  })

  it('is false once everyone has disconnected', () => {
    expect(
      hasConnectedCallMember({
        participants: { u1: { connected: false } },
        staff: { mod: { connected: false } },
      }),
    ).toBe(false)
  })

  it('is false for a missing or empty call node', () => {
    expect(hasConnectedCallMember(null)).toBe(false)
    expect(hasConnectedCallMember({})).toBe(false)
  })
})

describe('cleanupGhostSessions handler -> rooms/calls sweep', () => {
  it('sweeps a stale room nobody is connected to', async () => {
    const changes = await runJob({
      rooms: { r1: { createdAt: STALE } },
      calls: { r1: { participants: { u1: { connected: false } } } },
    })

    expect(changes).toEqual({ 'rooms/r1': null, 'calls/r1': null })
  })

  it('never sweeps a stale room with a connected participant', async () => {
    const changes = await runJob({
      rooms: { r1: { createdAt: STALE } },
      calls: { r1: { participants: { u1: { connected: true } } } },
    })

    expect(changes).toEqual({})
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('never sweeps a stale room a moderator alone is connected to', async () => {
    // The regression this guards: `participants` is empty for a
    // moderator-hosted call, so a participants-only check would delete it.
    const changes = await runJob({
      rooms: { r1: { createdAt: STALE } },
      calls: { r1: { staff: { mod: { connected: true } } } },
    })

    expect(changes).toEqual({})
  })

  it('still sweeps other stale rooms while sparing the live one', async () => {
    const changes = await runJob({
      rooms: { live: { createdAt: STALE }, ghost: { createdAt: STALE } },
      calls: {
        live: { staff: { mod: { connected: true } } },
        ghost: { participants: {} },
      },
    })

    expect(changes).toEqual({ 'rooms/ghost': null, 'calls/ghost': null })
  })

  it('never sweeps an orphaned call that someone is still connected to', async () => {
    const changes = await runJob({
      rooms: {},
      calls: { orphan: { participants: { u1: { connected: true } } } },
    })

    expect(changes).toEqual({})
  })

  it('sweeps an orphaned call once it is empty', async () => {
    const changes = await runJob({
      rooms: {},
      calls: { orphan: { participants: { u1: { connected: false } } } },
    })

    expect(changes).toEqual({ 'calls/orphan': null })
  })
})

describe('cleanupGhostSessions handler -> join during the sweep', () => {
  // Joining writes under `calls/{roomId}` and never touches
  // `rooms/{roomId}`, so a room stays stale-looking across a join: without
  // the re-check, whoever joins between the sweep's read and its write has
  // the call deleted underneath them.
  it('spares a stale room somebody joins after it was read', async () => {
    const changes = await runJob({
      rooms: { r1: { createdAt: STALE } },
      calls: { r1: { participants: {} } },
      callsOnRecheck: { r1: { participants: { u1: { connected: true } } } },
    })

    expect(changes).toEqual({})
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('spares a moderator-only join during the sweep', async () => {
    const changes = await runJob({
      rooms: { r1: { createdAt: STALE } },
      calls: {},
      callsOnRecheck: { r1: { staff: { mod: { connected: true } } } },
    })

    expect(changes).toEqual({})
  })

  it('still sweeps the rooms nobody joined', async () => {
    const changes = await runJob({
      rooms: { live: { createdAt: STALE }, ghost: { createdAt: STALE } },
      calls: { live: { participants: {} }, ghost: { participants: {} } },
      callsOnRecheck: {
        live: { participants: { u1: { connected: true } } },
        ghost: { participants: {} },
      },
    })

    expect(changes).toEqual({ 'rooms/ghost': null, 'calls/ghost': null })
  })

  it('spares an orphaned call somebody joins after it was read', async () => {
    const changes = await runJob({
      rooms: {},
      calls: { orphan: { participants: { u1: { connected: false } } } },
      callsOnRecheck: { orphan: { participants: { u1: { connected: true } } } },
    })

    expect(changes).toEqual({})
  })

  it('leaves the focus group sweep to run on its own', async () => {
    // The re-check only drops `rooms`/`calls` entries; a focus group room
    // marked for deletion must survive it.
    const changes = await runJob({
      rooms: { r1: { createdAt: STALE } },
      calls: { r1: { participants: {} } },
      callsOnRecheck: { r1: { participants: { u1: { connected: true } } } },
      focusGroupSessions: { fg1: { status: 'ended', lastUpdate: STALE } },
    })

    expect(changes).toEqual({
      'focusGroupSessions/fg1': null,
      'focusGroupBackroom/fg1': null,
    })
  })
})
