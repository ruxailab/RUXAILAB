import { AI_STUDY_TYPES } from '../schemas/studyDraft.schema'
import { validateCardSortingDraft } from './cardSorting'
import { validateUserTestDraft } from './userTest'
import { validateHeuristicDraft } from './heuristic'
import { validateFocusGroupDraft } from './focusGroup'

/**
 * Validates a study draft returned by the AI agent.
 * When clarificationNeeded is true, method-specific content rules are skipped.
 *
 * @param {object} draft
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateStudyDraft(draft) {
  const errors = []

  if (!draft || typeof draft !== 'object') {
    return { valid: false, errors: ['Draft must be an object'] }
  }

  if (!AI_STUDY_TYPES.includes(draft.testType)) {
    errors.push(
      `testType must be one of: ${AI_STUDY_TYPES.join(', ')}`,
    )
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

  if (!draft.testTitle || String(draft.testTitle).trim() === '') {
    errors.push('testTitle is required')
  }

  if (typeof draft.testDescription !== 'string') {
    errors.push('testDescription must be a string')
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  switch (draft.testType) {
    case 'CARD_SORTING':
      return validateCardSortingDraft(draft)
    case 'USER':
      return validateUserTestDraft(draft)
    case 'HEURISTIC':
      return validateHeuristicDraft(draft)
    case 'FOCUS_GROUP':
      return validateFocusGroupDraft(draft)
    default:
      return { valid: false, errors: [`Unsupported testType: ${draft.testType}`] }
  }
}

export {
  validateCardSortingDraft,
  validateUserTestDraft,
  validateHeuristicDraft,
  validateFocusGroupDraft,
}
