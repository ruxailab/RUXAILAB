/**
 * Fixture from SDD §9.6 — closed Card Sorting (Sala/Cozinha, TV/Pia).
 */
export const closedCardSortingDraft = {
  testType: 'CARD_SORTING',
  subType: 'CARD_SORTING',
  testTitle: 'Organização da casa',
  testDescription: 'Classifique os itens nas categorias da casa.',
  isPublic: false,
  status: 'active',
  testOptions: [],
  testStructure: {
    welcomeMessage:
      'Bem-vindo! Classifique cada card na categoria que fizer mais sentido.',
    finalMessage: 'Obrigado por participar!',
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
      options: {
        card_description: false,
        card_image: false,
        category_description: false,
        category_image: false,
        allow_create_categories: false,
        hasScreenRecord: false,
        hasCamRecord: false,
        hasAudioRecord: false,
      },
    },
  },
  clarificationNeeded: false,
  clarificationQuestions: [],
}

export const openCardSortingDraft = {
  ...closedCardSortingDraft,
  testTitle: 'Open card sort',
  testStructure: {
    ...closedCardSortingDraft.testStructure,
    cardSorting: {
      cards: [{ title: 'Item A', description: '' }],
      categories: [],
      options: {
        ...closedCardSortingDraft.testStructure.cardSorting.options,
        allow_create_categories: true,
      },
    },
  },
}

export const hybridCardSortingDraft = {
  ...closedCardSortingDraft,
  testTitle: 'Hybrid card sort',
  testStructure: {
    ...closedCardSortingDraft.testStructure,
    cardSorting: {
      cards: [{ title: 'Item A', description: '' }],
      categories: [{ title: 'Suggested', description: '' }],
      options: {
        ...closedCardSortingDraft.testStructure.cardSorting.options,
        allow_create_categories: true,
      },
    },
  },
}

export const userTestDraft = {
  testType: 'USER',
  subType: 'USER_UNMODERATED',
  testTitle: 'Checkout flow',
  testDescription: 'Evaluate the checkout experience.',
  isPublic: false,
  status: 'active',
  testOptions: [],
  testStructure: {
    welcomeMessage: 'Welcome',
    finalMessage: 'Thanks',
    consent: '',
    preTest: [],
    postTest: [],
    userTasks: [
      {
        taskName: 'Add to cart',
        taskDescription: 'Add a product to the cart',
        taskTip: '',
        taskLink: '',
        postQuestion: null,
        postForm: null,
        taskType: null,
        hasAudioRecord: false,
        hasScreenRecord: false,
        hasCamRecord: false,
        hasEye: false,
        estimatedTime: null,
      },
    ],
  },
  clarificationNeeded: false,
  clarificationQuestions: [],
}

export const heuristicDraft = {
  testType: 'HEURISTIC',
  subType: null,
  testTitle: 'Heuristic evaluation',
  testDescription: 'Nielsen heuristics sample',
  isPublic: false,
  status: 'active',
  testOptions: [],
  useWeights: false,
  useSeverity: true,
  useFrequency: false,
  trackTime: false,
  testWeights: {},
  testStructure: [
    {
      id: 0,
      title: 'Visibilidade do status do sistema',
      questions: [
        {
          id: 0,
          title: 'O sistema informa o que está acontecendo?',
          descriptions: [],
          comparison: [],
        },
      ],
    },
  ],
  clarificationNeeded: false,
  clarificationQuestions: [],
}

export const focusGroupDraft = {
  testType: 'FOCUS_GROUP',
  subType: null,
  testTitle: 'Onboarding focus group',
  testDescription: 'Discuss first-use experience',
  isPublic: false,
  status: 'active',
  testOptions: [],
  testStructure: [],
  discussionGuide: [
    {
      id: 'topic-1',
      title: 'Onboarding',
      prompts: ['Como foi o primeiro uso?'],
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
}

export const clarificationDraft = {
  testType: 'USER',
  subType: null,
  testTitle: '',
  testDescription: '',
  clarificationNeeded: true,
  clarificationQuestions: [
    'Você quer um User Test moderado ou não moderado?',
    'Qual é o objetivo principal do estudo?',
  ],
}
