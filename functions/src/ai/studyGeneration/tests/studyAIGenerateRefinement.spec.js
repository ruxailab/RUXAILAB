import { jest } from '@jest/globals'
import {
  cardSortingDraft,
  cardTitles,
  clarificationDraft,
  withCards,
} from './helpers/drafts.js'

const mockCreate = jest.fn()

jest.unstable_mockModule('openai', () => ({
  default: jest.fn(() => ({ chat: { completions: { create: mockCreate } } })),
}))

jest.unstable_mockModule('../../../core/firebase/f.firebase.js', () => ({
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

process.env.CHAT_BUILDER_OPENROUTER_API_KEY = 'test-key'

const { generateStudyDraft } = await import('../../../https/studyAIGenerate.js')

let requestCount = 0

const respondWith = (payload) =>
  mockCreate.mockResolvedValueOnce({
    choices: [{ message: { content: JSON.stringify(payload) } }],
  })

const callGenerate = (data) => {
  requestCount += 1
  return generateStudyDraft({
    auth: { uid: `user-${requestCount}` },
    data: {
      locale: 'en-US',
      messages: [{ role: 'user', text: 'Add a Sofa card' }],
      ...data,
    },
  })
}

const sentSystemPrompt = () => mockCreate.mock.calls[0][0].messages[0].content

describe('generateStudyDraft refinement', () => {
  beforeEach(() => {
    mockCreate.mockReset()
  })

  it('generates a new draft without refinement data when no currentDraft is sent', async () => {
    respondWith({ ...cardSortingDraft(), changedSections: ['cards'] })

    const result = await callGenerate({})

    expect(sentSystemPrompt()).not.toContain('REFINEMENT MODE')
    expect(result).not.toHaveProperty('changes')
    expect(result.draft).not.toHaveProperty('changedSections')
    expect(result.draft.testTitle).toBe('Home organization')
  })

  it('sends the current draft with hand edits and keeps them in the result', async () => {
    const currentDraft = cardSortingDraft({ testTitle: 'Edited by hand' })
    respondWith({
      ...withCards(cardSortingDraft(), ['TV', 'Stove', 'Sofa']),
      changedSections: [{ section: 'cards' }],
    })

    const result = await callGenerate({ currentDraft })

    expect(sentSystemPrompt()).toContain('REFINEMENT MODE')
    expect(sentSystemPrompt()).toContain('"testTitle": "Edited by hand"')
    expect(result.draft.testTitle).toBe('Edited by hand')
    expect(cardTitles(result.draft)).toEqual(['TV', 'Sink', 'Stove', 'Sofa'])
    expect(result.changes).toEqual([
      {
        section: 'cards',
        kind: 'list',
        added: ['Sofa'],
        removed: [],
        updated: [],
        reordered: false,
      },
    ])
  })

  it('returns a clarification unchanged during refinement', async () => {
    respondWith(clarificationDraft())

    const result = await callGenerate({ currentDraft: cardSortingDraft() })

    expect(result.draft.clarificationNeeded).toBe(true)
    expect(result.draft.clarificationQuestions).toEqual([
      'Which card do you mean?',
    ])
    expect(result.changes).toEqual([])
  })

  it('rejects an invalid currentDraft before calling the model', async () => {
    await expect(
      callGenerate({ currentDraft: cardSortingDraft({ testType: 'SURVEY' }) }),
    ).rejects.toMatchObject({ code: 'invalid-argument' })
    expect(mockCreate).not.toHaveBeenCalled()
  })
})
