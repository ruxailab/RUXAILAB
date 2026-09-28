import { ACCESS_LEVEL } from '@/shared/utils/accessLevel'
import {
  canEnterFocusGroupSession,
  formatElapsedSessionTime,
  isFocusGroupParticipant,
  normalizeSessionNickname,
} from '@/ux/FocusGroup/utils/sessionRoles'
import {
  getObserverNoteEntries,
  mergeFinalObserverNotes,
  normalizeObserverNotes,
} from '@/ux/FocusGroup/utils/observerNotes'
import { dedupeSessionsByPath } from '@/shared/utils/sessionList'

describe('Focus Group session role resolution', () => {
  it('recognizes a study-level participant invite in the legacy room', () => {
    expect(
      isFocusGroupParticipant({
        isAcceptedStudyParticipant: true,
        accessLevel: ACCESS_LEVEL.GUEST,
      }),
    ).toBe(true)
  })

  it('uses the scheduled session roster as the source of truth', () => {
    expect(
      isFocusGroupParticipant({
        hasScheduledSession: true,
        isAcceptedStudyParticipant: true,
        accessLevel: ACCESS_LEVEL.EVALUATOR,
      }),
    ).toBe(false)

    expect(
      isFocusGroupParticipant({
        hasScheduledSession: true,
        isSessionParticipant: true,
      }),
    ).toBe(true)
  })

  it('does not let a staff observer label override a participant roster entry', () => {
    expect(
      isFocusGroupParticipant({
        hasScheduledSession: true,
        isSessionParticipant: true,
      }),
    ).toBe(true)
  })

  it('never classifies a facilitator as a participant', () => {
    expect(
      isFocusGroupParticipant({
        isFacilitator: true,
        isAcceptedStudyParticipant: true,
        accessLevel: ACCESS_LEVEL.EVALUATOR,
      }),
    ).toBe(false)
  })
})

describe('observer note normalization', () => {
  it('preserves stored note arrays', () => {
    const notes = [{ text: 'Observed hesitation', timestamp: 123 }]
    expect(normalizeObserverNotes(notes)).toEqual(notes)
  })

  it('converts RTDB numeric-keyed note objects into ordered arrays', () => {
    expect(
      normalizeObserverNotes({
        0: { text: 'First', timestamp: 1 },
        1: { text: 'Second', timestamp: 2 },
      }),
    ).toEqual([
      { text: 'First', timestamp: 1 },
      { text: 'Second', timestamp: 2 },
    ])
  })

  it('returns an empty array for absent or malformed note data', () => {
    expect(normalizeObserverNotes(null)).toEqual([])
    expect(normalizeObserverNotes('not notes')).toEqual([])
  })

  it('merges persisted RTDB notes into the final record and keeps the observer draft', () => {
    expect(
      mergeFinalObserverNotes(
        { facilitator: [{ text: 'old snapshot' }] },
        { observerA: { 0: { text: 'latest saved note', timestamp: 10 } } },
        {
          userId: 'observerB',
          isObserver: true,
          observerNotes: [{ text: 'latest local note', observerName: 'K' }],
        },
      ),
    ).toEqual({
      facilitator: [{ text: 'old snapshot' }],
      observerA: [{ text: 'latest saved note', timestamp: 10 }],
      observerB: [{ text: 'latest local note', observerName: 'K' }],
    })
  })

  it('creates answer-view sections with observer nickname and note metadata', () => {
    expect(
      getObserverNoteEntries({
        observerA: [
          {
            text: 'Looked confused',
            observerName: 'Karine',
            taskName: 'Topic 2',
            timestamp: 12,
          },
        ],
      }),
    ).toEqual([
      {
        userId: 'observerA',
        displayName: 'Karine',
        notes: [
          {
            text: 'Looked confused',
            observerName: 'Karine',
            taskName: 'Topic 2',
            timestamp: 12,
          },
        ],
      },
    ])
  })
})

describe('Focus Group session admission and elapsed timer', () => {
  it('requires an authenticated attendee to choose a non-empty nickname', () => {
    expect(canEnterFocusGroupSession({ userId: 'user-1', nickname: '' })).toBe(
      false,
    )
    expect(canEnterFocusGroupSession({ userId: '', nickname: 'Karine' })).toBe(
      false,
    )
    expect(
      canEnterFocusGroupSession({ userId: 'user-1', nickname: '  Karine  ' }),
    ).toBe(true)
    expect(normalizeSessionNickname(` ${'x'.repeat(42)} `)).toHaveLength(40)
  })

  it('formats session elapsed time consistently, including hours', () => {
    expect(formatElapsedSessionTime(1000, 61000)).toBe('1:00')
    expect(formatElapsedSessionTime(1000, 3661000)).toBe('1:01:00')
    expect(formatElapsedSessionTime(null, 3661000)).toBe('0:00')
  })
})

describe('people session-list updates', () => {
  it('merges email and uid query results without duplicate sessions', () => {
    const session = { path: 'tests/study/sessions/one', title: 'One' }
    const second = { path: 'tests/study/sessions/two', title: 'Two' }
    expect(dedupeSessionsByPath([session], [session, second])).toEqual([
      session,
      second,
    ])
  })
})
