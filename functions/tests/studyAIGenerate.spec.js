import { jest } from '@jest/globals'

jest.unstable_mockModule('../src/f.firebase.js', () => ({
  admin: {},
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

const {
  normalizeStudyDraft,
  validateStudyDraft,
} = await import('../src/ai/studyGeneration/validateDraft.js')

const closedCardSorting = {
  testType: 'CARD_SORTING',
  subType: 'CARD_SORTING',
  testTitle: 'Organização da casa',
  testDescription: 'Classifique os itens nas categorias da casa.',
  isPublic: false,
  status: 'active',
  testOptions: [],
  testStructure: {
    welcomeMessage: 'Bem-vindo!',
    finalMessage: 'Obrigado!',
    consent: '',
    preTest: [],
    postTest: [],
    cardSorting: {
      cards: [
        { title: 'TV', description: '' },
        { title: 'Pia', description: '' },
      ],
      categories: [
        { title: 'Sala', description: '' },
        { title: 'Cozinha', description: '' },
      ],
      options: { allow_create_categories: false },
    },
  },
  clarificationNeeded: false,
  clarificationQuestions: [],
}

describe('study AI validateDraft', () => {
  it('accepts the closed Card Sorting fixture from the SDD', () => {
    expect(validateStudyDraft(closedCardSorting)).toEqual({
      valid: true,
      errors: [],
    })
  })

  it('normalizes HEURISTIC heuristics array into testStructure', () => {
    const draft = normalizeStudyDraft({
      testType: 'HEURISTIC',
      testTitle: 'Heuristics',
      testDescription: 'desc',
      clarificationNeeded: false,
      clarificationQuestions: [],
      testStructure: {
        heuristics: [
          {
            id: 0,
            title: 'Visibility',
            questions: [{ id: 0, title: 'Is status clear?', descriptions: [], comparison: [] }],
          },
        ],
      },
    })

    expect(Array.isArray(draft.testStructure)).toBe(true)
    expect(validateStudyDraft(draft).valid).toBe(true)
  })

  it('requires clarification questions when clarificationNeeded', () => {
    const result = validateStudyDraft({
      testType: 'USER',
      testTitle: '',
      testDescription: '',
      clarificationNeeded: true,
      clarificationQuestions: [],
    })
    expect(result.valid).toBe(false)
  })
})
