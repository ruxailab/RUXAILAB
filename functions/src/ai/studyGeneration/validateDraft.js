const AI_STUDY_TYPES = ['CARD_SORTING', 'USER', 'HEURISTIC', 'FOCUS_GROUP']
const AI_USER_SUBTYPES = ['USER_MODERATED', 'USER_UNMODERATED']

const DEFAULT_CARD_SORTING_OPTIONS = {
  card_description: false,
  card_image: false,
  category_description: false,
  category_image: false,
  allow_create_categories: false,
  hasScreenRecord: false,
  hasCamRecord: false,
  hasAudioRecord: false,
}

/**
 * Parses a value that may be a JSON string.
 * @param {unknown} value
 * @returns {unknown}
 */
function maybeParseJson(value) {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return value
  try {
    return JSON.parse(trimmed)
  } catch {
    return value
  }
}

/**
 * Builds a Card Sorting testStructure from incomplete / alternate LLM shapes.
 * @param {object} draft
 * @returns {object}
 */
function normalizeCardSortingStructure(draft) {
  let structure = maybeParseJson(draft.testStructure)

  if (Array.isArray(structure)) {
    structure = null
  }

  const rootCardSorting = maybeParseJson(draft.cardSorting)
  const cardsFromRoot = Array.isArray(draft.cards) ? draft.cards : null
  const categoriesFromRoot = Array.isArray(draft.categories)
    ? draft.categories
    : null

  if (!structure || typeof structure !== 'object') {
    structure = {}
  }

  let cardSorting = maybeParseJson(structure.cardSorting) || rootCardSorting

  if (!cardSorting || typeof cardSorting !== 'object') {
    cardSorting = {}
  }

  if (!Array.isArray(cardSorting.cards) && cardsFromRoot) {
    cardSorting.cards = cardsFromRoot
  }
  if (!Array.isArray(cardSorting.categories) && categoriesFromRoot) {
    cardSorting.categories = categoriesFromRoot
  }

  // Flat shape: cards/categories directly under testStructure
  if (!Array.isArray(cardSorting.cards) && Array.isArray(structure.cards)) {
    cardSorting.cards = structure.cards
  }
  if (
    !Array.isArray(cardSorting.categories) &&
    Array.isArray(structure.categories)
  ) {
    cardSorting.categories = structure.categories
  }

  cardSorting.cards = Array.isArray(cardSorting.cards) ? cardSorting.cards : []
  cardSorting.categories = Array.isArray(cardSorting.categories)
    ? cardSorting.categories
    : []
  cardSorting.options = {
    ...DEFAULT_CARD_SORTING_OPTIONS,
    ...(cardSorting.options && typeof cardSorting.options === 'object'
      ? cardSorting.options
      : {}),
    ...(structure.options && typeof structure.options === 'object'
      ? structure.options
      : {}),
  }

  return {
    welcomeMessage:
      typeof structure.welcomeMessage === 'string'
        ? structure.welcomeMessage
        : '',
    finalMessage:
      typeof structure.finalMessage === 'string' ? structure.finalMessage : '',
    consent: typeof structure.consent === 'string' ? structure.consent : '',
    preTest: Array.isArray(structure.preTest) ? structure.preTest : [],
    postTest: Array.isArray(structure.postTest) ? structure.postTest : [],
    cardSorting,
  }
}

/**
 * Normalizes LLM structured output into the shapes expected by validators.
 * @param {object} draft
 * @returns {object}
 */
export function normalizeStudyDraft(draft) {
  if (!draft || typeof draft !== 'object') return draft

  const next = { ...maybeParseJson(draft) }
  if (!next || typeof next !== 'object') return draft

  if (typeof next.clarificationNeeded !== 'boolean') {
    next.clarificationNeeded = false
  }
  if (!Array.isArray(next.clarificationQuestions)) {
    next.clarificationQuestions = []
  }

  if (next.testType === 'HEURISTIC') {
    if (Array.isArray(next.testStructure)) {
      // already correct
    } else if (Array.isArray(next.testStructure?.heuristics)) {
      next.testStructure = next.testStructure.heuristics
    } else if (Array.isArray(next.heuristics)) {
      next.testStructure = next.heuristics
      delete next.heuristics
    }
  }

  if (next.testType === 'CARD_SORTING') {
    next.subType = next.subType || 'CARD_SORTING'
    next.testStructure = normalizeCardSortingStructure(next)
    delete next.cardSorting
    delete next.cards
    delete next.categories
  }

  if (next.testType === 'USER') {
    let structure = maybeParseJson(next.testStructure)
    if (!structure || typeof structure !== 'object' || Array.isArray(structure)) {
      structure = {}
    }
    if (!Array.isArray(structure.userTasks) && Array.isArray(next.userTasks)) {
      structure.userTasks = next.userTasks
      delete next.userTasks
    }
    next.testStructure = {
      welcomeMessage:
        typeof structure.welcomeMessage === 'string'
          ? structure.welcomeMessage
          : '',
      finalMessage:
        typeof structure.finalMessage === 'string' ? structure.finalMessage : '',
      consent: typeof structure.consent === 'string' ? structure.consent : '',
      preTest: Array.isArray(structure.preTest) ? structure.preTest : [],
      postTest: Array.isArray(structure.postTest) ? structure.postTest : [],
      userTasks: Array.isArray(structure.userTasks) ? structure.userTasks : [],
    }
  }

  if (next.testType === 'FOCUS_GROUP') {
    if (!Array.isArray(next.testStructure)) {
      next.testStructure = []
    }
    if (!Array.isArray(next.discussionGuide)) {
      next.discussionGuide = []
    }
    if (!next.config || typeof next.config !== 'object') {
      next.config = {
        enableWaitingRoom: true,
        requireConsent: true,
        hideObservers: true,
        maxParticipants: 8,
      }
    }
  }

  return next
}

export function validateStudyDraft(draft) {
  const errors = []

  if (!draft || typeof draft !== 'object') {
    return { valid: false, errors: ['Draft must be an object'] }
  }

  if (!AI_STUDY_TYPES.includes(draft.testType)) {
    errors.push(`testType must be one of: ${AI_STUDY_TYPES.join(', ')}`)
  }

  if (!draft.testTitle || String(draft.testTitle).trim() === '') {
    if (!draft.clarificationNeeded) {
      errors.push('testTitle is required')
    }
  }

  if (typeof draft.clarificationNeeded !== 'boolean') {
    errors.push('clarificationNeeded must be a boolean')
  }

  if (!Array.isArray(draft.clarificationQuestions)) {
    errors.push('clarificationQuestions must be an array')
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  if (draft.clarificationNeeded) {
    if (draft.clarificationQuestions.length < 1) {
      return {
        valid: false,
        errors: [
          'clarificationQuestions must have at least 1 question when clarificationNeeded is true',
        ],
      }
    }
    return { valid: true, errors: [] }
  }

  switch (draft.testType) {
    case 'CARD_SORTING':
      return validateCardSorting(draft)
    case 'USER':
      return validateUser(draft)
    case 'HEURISTIC':
      return validateHeuristic(draft)
    case 'FOCUS_GROUP':
      return validateFocusGroup(draft)
    default:
      return { valid: false, errors: [`Unsupported testType: ${draft.testType}`] }
  }
}

function validateCardSorting(draft) {
  const errors = []
  const structure = draft.testStructure
  if (!structure || typeof structure !== 'object' || Array.isArray(structure)) {
    return { valid: false, errors: ['testStructure must be an object for CARD_SORTING'] }
  }

  const cardSorting = structure.cardSorting
  if (!cardSorting) {
    return { valid: false, errors: ['testStructure.cardSorting is required'] }
  }

  const cards = cardSorting.cards
  if (!Array.isArray(cards) || cards.length < 1) {
    errors.push('cardSorting.cards must have at least 1 card')
  } else {
    cards.forEach((card, index) => {
      if (!card?.title || String(card.title).trim() === '') {
        errors.push(`cardSorting.cards[${index}] must have a non-empty title`)
      }
    })
  }

  const categories = Array.isArray(cardSorting.categories)
    ? cardSorting.categories
    : []
  const allowCreate = Boolean(cardSorting.options?.allow_create_categories)

  if (!allowCreate && categories.length < 1) {
    errors.push('closed Card Sorting requires at least 1 category')
  }

  return { valid: errors.length === 0, errors }
}

function validateUser(draft) {
  const errors = []
  if (!AI_USER_SUBTYPES.includes(draft.subType)) {
    errors.push(`subType must be one of: ${AI_USER_SUBTYPES.join(', ')}`)
  }

  const tasks = draft.testStructure?.userTasks
  if (!Array.isArray(tasks) || tasks.length < 1) {
    errors.push('testStructure.userTasks must have at least 1 task')
  } else {
    tasks.forEach((task, index) => {
      if (!task?.taskName?.trim()) {
        errors.push(`userTasks[${index}].taskName is required`)
      }
      if (!task?.taskDescription?.trim()) {
        errors.push(`userTasks[${index}].taskDescription is required`)
      }
    })
  }

  return { valid: errors.length === 0, errors }
}

function validateHeuristic(draft) {
  const errors = []
  const structure = draft.testStructure
  if (!Array.isArray(structure) || structure.length < 1) {
    return {
      valid: false,
      errors: ['testStructure must be a non-empty array for HEURISTIC'],
    }
  }

  structure.forEach((heuristic, hIndex) => {
    if (!heuristic?.title?.trim()) {
      errors.push(`testStructure[${hIndex}].title is required`)
    }
    const questions = heuristic?.questions
    if (!Array.isArray(questions) || questions.length < 1) {
      errors.push(`testStructure[${hIndex}].questions must have at least 1 item`)
      return
    }
    questions.forEach((question, qIndex) => {
      if (!question?.title?.trim()) {
        errors.push(
          `testStructure[${hIndex}].questions[${qIndex}].title is required`,
        )
      }
    })
  })

  return { valid: errors.length === 0, errors }
}

function validateFocusGroup(draft) {
  const errors = []
  const guide = draft.discussionGuide
  if (!Array.isArray(guide) || guide.length < 1) {
    return { valid: false, errors: ['discussionGuide must have at least 1 topic'] }
  }

  guide.forEach((topic, index) => {
    if (!topic?.title?.trim()) {
      errors.push(`discussionGuide[${index}].title is required`)
    }
  })

  return { valid: errors.length === 0, errors }
}

/**
 * Builds a clarification draft when the model returned incomplete content.
 * Generic for all study methods.
 *
 * @param {object} draft
 * @param {string[]} errors
 * @param {string} [locale]
 * @returns {object}
 */
export function buildClarificationFromErrors(draft, errors, locale = 'en-US') {
  const isPt = String(locale || '').startsWith('pt')
  const isEs = String(locale || '').startsWith('es')

  const questions = isPt
    ? [
        `Não consegui montar um draft válido: ${errors.join('; ')}.`,
        'Pode reformular o pedido com título e o conteúdo do método (cards/categorias, tasks, heurísticas ou tópicos do focus group)?',
      ]
    : isEs
      ? [
          `No pude completar un borrador válido: ${errors.join('; ')}.`,
          '¿Puedes reformular la solicitud con título y el contenido del método (cards/categorías, tasks, heurísticas o temas del focus group)?',
        ]
      : [
          `I could not finish a valid study draft: ${errors.join('; ')}.`,
          'Please restate the study with a title and the method content (cards/categories, tasks, heuristics, or focus group topics).',
        ]

  return {
    testType: draft?.testType || 'CARD_SORTING',
    subType: draft?.subType ?? null,
    testTitle: draft?.testTitle || '',
    testDescription: draft?.testDescription || '',
    isPublic: draft?.isPublic ?? false,
    status: draft?.status || 'draft',
    testOptions: [],
    testStructure: draft?.testStructure ?? null,
    discussionGuide: draft?.discussionGuide,
    config: draft?.config,
    clarificationNeeded: true,
    clarificationQuestions: questions,
  }
}
