import { jest } from '@jest/globals'

const studies = new Map()
const answers = new Map()
const users = new Map()
const completionCreate = jest.fn()

const snapshot = (data) => ({ exists: data !== undefined, data: () => data })
const db = {
  collection: jest.fn((name) => ({
    doc: jest.fn((id) => ({
      get: jest.fn(async () => {
        const collection = name === 'tests' ? studies : name === 'answers' ? answers : users
        return snapshot(collection.get(id))
      }),
    })),
  })),
}

jest.unstable_mockModule('../src/core/firebase/f.firebase.js', () => ({
  admin: { firestore: jest.fn(() => db) },
  functions: {
    onCall: jest.fn(({ handler }) => handler),
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

jest.unstable_mockModule('openai', () => ({
  default: class OpenAI {
    constructor(config) {
      this.config = config
      this.chat = { completions: { create: completionCreate } }
    }
  },
}))

const { synthesizeFocusGroupAnalysis } = await import('../src/https/focusGroupSynthesis.js')

describe('synthesizeFocusGroupAnalysis', () => {
  const env = { ...process.env }
  beforeEach(() => {
    jest.clearAllMocks()
    studies.clear()
    answers.clear()
    users.clear()
    process.env.CHAT_BUILDER_OPENROUTER_API_KEY = 'server-key'
    process.env.CHAT_BUILDER_OPENROUTER_BASE_URL = 'https://openrouter.example/v1'
    process.env.CHAT_BUILDER_OPENROUTER_STUDY_MODEL = 'anthropic/claude-haiku-test'
    completionCreate.mockResolvedValue({
      choices: [{ message: { content: 'Patterns and disagreements are limited by the available data.' } }],
    })
  })
  afterAll(() => {
    process.env = env
  })

  const invoke = (uid = 'owner', data = {}) =>
    synthesizeFocusGroupAnalysis({ auth: uid ? { uid } : null, data })

  it('requires authentication and verifies answer-document ownership', async () => {
    await expect(invoke(null, {})).rejects.toMatchObject({ code: 'unauthenticated' })

    studies.set('study-1', {
      testAdmin: { userDocId: 'owner' },
      answersDocId: 'another-answer-doc',
    })
    await expect(
      invoke('owner', {
        studyId: 'study-1',
        answersDocId: 'answer-1',
        sessionId: 'session-1',
      }),
    ).rejects.toMatchObject({ code: 'permission-denied' })
    expect(completionCreate).not.toHaveBeenCalled()
  })

  it('synthesizes only from saved analysis using server-side OpenRouter config', async () => {
    studies.set('study-1', {
      testAdmin: { userDocId: 'owner' },
      answersDocId: 'answer-1',
      discussionGuide: [{ id: 'topic-1', title: 'Navigation' }],
    })
    answers.set('answer-1', {
      sessions: {
        'session-1': {
          analysis: {
            perTopic: {
              'topic-1': {
                keywords: ['navigation', 'menu'],
                summary: 'Participants found the menu difficult to use.',
                consensus: { score: 0.8 },
              },
            },
          },
        },
      },
    })

    const result = await invoke('owner', {
      studyId: 'study-1',
      answersDocId: 'answer-1',
      sessionId: 'session-1',
    })

    expect(result.text).toContain('Patterns and disagreements')
    expect(result.model).toBe('anthropic/claude-haiku-test')
    expect(completionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'anthropic/claude-haiku-test',
        max_tokens: 700,
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'user', content: expect.stringContaining('Navigation') }),
        ]),
      }),
    )
  })
})
