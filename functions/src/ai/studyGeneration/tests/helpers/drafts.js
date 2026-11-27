const cards = (...titles) => titles.map((title) => ({ title, description: '' }))

export const cardSortingDraft = (overrides = {}) => ({
  testType: 'CARD_SORTING',
  subType: 'CARD_SORTING',
  testTitle: 'Home organization',
  testDescription: 'Sort household items.',
  isPublic: false,
  status: 'active',
  testOptions: [],
  testStructure: {
    welcomeMessage: 'Welcome',
    finalMessage: 'Thanks',
    consent: '',
    preTest: [],
    postTest: [],
    cardSorting: {
      cards: cards('TV', 'Sink', 'Stove'),
      categories: cards('Living room', 'Kitchen'),
      options: {
        card_description: false,
        card_image: false,
        category_description: false,
        category_image: false,
        allow_create_categories: false,
      },
    },
  },
  clarificationNeeded: false,
  clarificationQuestions: [],
  ...overrides,
})

/**
 * Returns a copy of the draft with the given card titles.
 * @param {object} draft
 * @param {string[]} titles
 */
export const withCards = (draft, titles) => ({
  ...draft,
  testStructure: {
    ...draft.testStructure,
    cardSorting: {
      ...draft.testStructure.cardSorting,
      cards: cards(...titles),
    },
  },
})

export const cardTitles = (draft) =>
  draft.testStructure.cardSorting.cards.map((card) => card.title)

export const focusGroupDraft = (overrides = {}) => ({
  testType: 'FOCUS_GROUP',
  subType: null,
  testTitle: 'Onboarding focus group',
  testDescription: 'Discuss first use',
  isPublic: false,
  status: 'active',
  testOptions: [],
  testStructure: [],
  discussionGuide: [
    {
      id: 'topic-1',
      title: 'First impressions',
      prompts: ['What stood out?'],
      durationMinutes: 10,
    },
  ],
  config: {
    enableWaitingRoom: true,
    requireConsent: true,
    hideObservers: true,
    maxParticipants: 8,
  },
  clarificationNeeded: false,
  clarificationQuestions: [],
  ...overrides,
})

export const clarificationDraft = (overrides = {}) => ({
  testType: 'CARD_SORTING',
  subType: 'CARD_SORTING',
  testTitle: '',
  testDescription: '',
  testStructure: null,
  clarificationNeeded: true,
  clarificationQuestions: ['Which card do you mean?'],
  ...overrides,
})
