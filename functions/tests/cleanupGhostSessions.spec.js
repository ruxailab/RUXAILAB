import { shouldDeleteFocusGroupRoom } from '../src/scheduled/cleanupGhostSessions.js'

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
