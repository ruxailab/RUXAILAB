/**
 * Supported study types for AI draft generation (mirrors Gemini responseSchema).
 */
export const AI_STUDY_TYPES = Object.freeze([
  'CARD_SORTING',
  'USER',
  'HEURISTIC',
  'FOCUS_GROUP',
])

export const AI_USER_SUBTYPES = Object.freeze([
  'USER_MODERATED',
  'USER_UNMODERATED',
])

/**
 * Default cardSorting.options when the model omits fields.
 */
export const DEFAULT_CARD_SORTING_OPTIONS = Object.freeze({
  card_description: false,
  card_image: false,
  category_description: false,
  category_image: false,
  allow_create_categories: false,
  hasScreenRecord: false,
  hasCamRecord: false,
  hasAudioRecord: false,
})

/**
 * Default Focus Group config.
 */
export const DEFAULT_FOCUS_GROUP_CONFIG = Object.freeze({
  enableWaitingRoom: true,
  requireConsent: true,
  hideObservers: true,
  maxParticipants: 8,
})

/**
 * Root fields required on every draft response from the agent.
 */
export const STUDY_DRAFT_REQUIRED_ROOT = Object.freeze([
  'testType',
  'testTitle',
  'testDescription',
  'clarificationNeeded',
  'clarificationQuestions',
])
