import { jest } from '@jest/globals'

const mockStudies = new Map()
const mockAnswers = new Map()
const mockUsers = new Map()
const updates = []

const snap = (id, data) => ({
  id,
  exists: data !== undefined,
  data: () => data,
})

const mockDb = {
  collection: jest.fn((collectionName) => ({
    doc: jest.fn((id) => ({
      get: jest.fn(() => {
        if (collectionName === 'tests') return Promise.resolve(snap(id, mockStudies.get(id)))
        if (collectionName === 'answers') return Promise.resolve(snap(id, mockAnswers.get(id)))
        if (collectionName === 'users') return Promise.resolve(snap(id, mockUsers.get(id)))
        throw new Error(`Unexpected collection: ${collectionName}`)
      }),
      update: jest.fn((data) => {
        updates.push({ collectionName, id, data })
        return Promise.resolve()
      }),
    })),
  })),
}

jest.unstable_mockModule('../src/core/firebase/f.firebase.js', () => ({
  admin: {
    firestore: Object.assign(jest.fn(() => mockDb), {
      FieldValue: { serverTimestamp: jest.fn(() => 'SERVER_TIMESTAMP') },
    }),
  },
  functions: {
    onCall: jest.fn((options) => options.handler),
    https: {
      HttpsError: class HttpsError extends Error {
        constructor(code, message) {
          super(message)
          this.code = code
        }
      },
    },
  },
}))

const { runFocusGroupAnalysis, mergeThemes } = await import(
  '../src/https/focusGroupAnalysis.js'
)

const request = (uid, data) => ({ auth: uid ? { uid } : null, data })

const study = (overrides = {}) => ({
  testAdmin: { userDocId: 'facilitator' },
  answersDocId: 'a1',
  studyRoleMap: {},
  ...overrides,
})

const session = (overrides = {}) => ({
  participants: {
    p1: { accessLevel: 1, role: 'Participant' },
    p2: { accessLevel: 1, role: 'Participant' },
  },
  messages: {
    'topic-1': {
      'msg-1': { userId: 'p1', text: 'The navigation menu is confusing.', timestamp: 1 },
      'msg-2': { userId: 'p2', text: 'Navigation menu confused me too.', timestamp: 2 },
    },
  },
  ...overrides,
})

describe('runFocusGroupAnalysis', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockStudies.clear()
    mockAnswers.clear()
    mockUsers.clear()
    updates.length = 0
  })

  it('requires authentication', async () => {
    await expect(
      runFocusGroupAnalysis(request(null, { studyId: 's1', answersDocId: 'a1', sessionId: 'session-1' })),
    ).rejects.toThrow(expect.objectContaining({ code: 'unauthenticated' }))
  })

  it('requires studyId, answersDocId, and sessionId', async () => {
    await expect(runFocusGroupAnalysis(request('facilitator', {}))).rejects.toThrow(
      expect.objectContaining({ code: 'invalid-argument' }),
    )
  })

  it('denies a participant', async () => {
    mockStudies.set('s1', study({ studyRoleMap: { participant: 1 } }))
    mockAnswers.set('a1', { sessions: { 'session-1': session() } })

    await expect(
      runFocusGroupAnalysis(
        request('participant', { studyId: 's1', answersDocId: 'a1', sessionId: 'session-1' }),
      ),
    ).rejects.toThrow(expect.objectContaining({ code: 'permission-denied' }))
  })

  it('allows the study owner (testAdmin) and writes the analysis back to the answer doc', async () => {
    mockStudies.set('s1', study())
    mockAnswers.set('a1', { sessions: { 'session-1': session() } })

    const result = await runFocusGroupAnalysis(
      request('facilitator', { studyId: 's1', answersDocId: 'a1', sessionId: 'session-1' }),
    )

    expect(result.perTopic['topic-1'].keywords.length).toBeGreaterThan(0)
    expect(updates).toHaveLength(1)
    expect(updates[0].data['sessions.session-1.analysis'].perTopic).toEqual(result.perTopic)
    expect(updates[0].data.themes).toEqual(result.themes)
  })

  it('rejects an answers document owned by another study before reading or writing it', async () => {
    mockStudies.set('s1', study({ answersDocId: 'owned-by-another-study' }))
    mockAnswers.set('a1', { sessions: { 'session-1': session() } })

    await expect(
      runFocusGroupAnalysis(
        request('facilitator', {
          studyId: 's1',
          answersDocId: 'a1',
          sessionId: 'session-1',
        }),
      ),
    ).rejects.toThrow(expect.objectContaining({ code: 'permission-denied' }))
    expect(updates).toHaveLength(0)
  })

  it('analyzes participant messages only, excluding facilitator and observer chat', async () => {
    mockStudies.set('s1', study())
    mockAnswers.set('a1', {
      sessions: {
        'session-1': session({
          facilitatorId: 'facilitator',
          participants: {
            facilitator: { accessLevel: 0, role: 'Facilitator' },
            p1: { accessLevel: 1, role: 'Participant' },
            p2: { accessLevel: 1, role: 'Participant' },
            observer: { accessLevel: 3, role: 'Observer' },
          },
          messages: {
            'topic-1': {
              'msg-1': { userId: 'p1', text: 'Navigation menu is confusing.', timestamp: 1 },
              'msg-2': { userId: 'p2', text: 'Navigation menu confused me too.', timestamp: 2 },
              'msg-3': { userId: 'facilitator', text: 'Please discuss the navigation.', timestamp: 3 },
              'msg-4': { userId: 'observer', text: 'I agree with the prompt.', timestamp: 4 },
              'msg-5': { userId: 'unknown', text: 'Unrostered message.', timestamp: 5 },
            },
          },
        }),
      },
    })

    const result = await runFocusGroupAnalysis(
      request('facilitator', { studyId: 's1', answersDocId: 'a1', sessionId: 'session-1' }),
    )

    const refs = result.suggestedThemes.flatMap((theme) => theme.responseRefs)
    expect(refs.map((ref) => ref.participantId).sort()).toEqual(['p1', 'p2'])
    expect(result.perTopic['topic-1'].summary).not.toContain('Please discuss')
    expect(result.perTopic['topic-1'].summary).not.toContain('I agree with the prompt')
  })

  it('allows a cooperator with accessLevel 0', async () => {
    mockStudies.set('s1', study({ testAdmin: { userDocId: 'someone-else' }, studyRoleMap: { caller: 0 } }))
    mockAnswers.set('a1', { sessions: { 'session-1': session() } })

    await expect(
      runFocusGroupAnalysis(request('caller', { studyId: 's1', answersDocId: 'a1', sessionId: 'session-1' })),
    ).resolves.toBeDefined()
  })
})

describe('mergeThemes', () => {
  it('replaces prior NLP themes from the same session, keeps manual themes untouched', () => {
    const existingThemes = [
      { id: 'manual-1', source: 'manual', responseRefs: [{ sessionId: 'session-1' }] },
      { id: 'nlp-theme-0', source: 'nlp', responseRefs: [{ sessionId: 'session-1' }] },
      { id: 'nlp-theme-1', source: 'nlp', responseRefs: [{ sessionId: 'session-2' }] },
    ]
    const suggestedThemes = [{ id: 'nlp-theme-0', source: 'nlp', responseRefs: [{ sessionId: 'session-1' }] }]

    const merged = mergeThemes({ existingThemes, suggestedThemes, sessionId: 'session-1' })

    expect(merged).toContainEqual(existingThemes[0]) // manual, untouched
    expect(merged).toContainEqual(existingThemes[2]) // nlp from a different session, untouched
    expect(merged.filter((t) => t.id === 'nlp-theme-0')).toHaveLength(1) // replaced, not duplicated
  })
})
