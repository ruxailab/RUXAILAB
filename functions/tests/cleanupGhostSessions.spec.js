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
})
