const AI_STUDY_TYPES = ['CARD_SORTING', 'USER', 'HEURISTIC', 'FOCUS_GROUP']
const AI_USER_SUBTYPES = ['USER_MODERATED', 'USER_UNMODERATED']

/**
 * Normalizes Gemini structured output so HEURISTIC uses array testStructure.
 * @param {object} draft
 * @returns {object}
 */
export function normalizeStudyDraft(draft) {
  if (!draft || typeof draft !== 'object') return draft

  const next = { ...draft }

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
