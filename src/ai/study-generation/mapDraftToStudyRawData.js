import StudyAdmin from '@/shared/models/StudyAdmin'
import {
  DEFAULT_CARD_SORTING_OPTIONS,
  DEFAULT_FOCUS_GROUP_CONFIG,
} from './schemas/studyDraft.schema'

/**
 * Strips agent-only fields and fills system defaults before createStudy.
 *
 * @param {object} draft - Validated AI draft (may include clarification*).
 * @param {{ id: string, email: string }} user - Authenticated user.
 * @returns {object} rawData ready for instantiateStudyByType
 */
export function mapDraftToStudyRawData(draft, user) {
  if (!draft || typeof draft !== 'object') {
    throw new Error('Draft is required')
  }
  if (!user?.id) {
    throw new Error('User is required')
  }

  const content = { ...draft }
  delete content.clarificationNeeded
  delete content.clarificationQuestions

  const now = Date.now()
  const rawData = {
    ...content,
    id: null,
    testAdmin: new StudyAdmin({
      userDocId: user.id,
      email: user.email,
    }),
    creationDate: now,
    updateDate: now,
    status: content.status || 'active',
    isPublic: content.isPublic ?? false,
    cooperators: [],
    templateDoc: null,
  }

  if (rawData.testType === 'CARD_SORTING') {
    rawData.subType = rawData.subType || 'CARD_SORTING'
    rawData.testStructure = normalizeCardSortingStructure(rawData.testStructure)
  }

  if (rawData.testType === 'USER') {
    rawData.testStructure = normalizeUserTestStructure(rawData.testStructure)
  }

  if (rawData.testType === 'HEURISTIC') {
    rawData.useWeights = rawData.useWeights ?? false
    rawData.useSeverity = rawData.useSeverity ?? true
    rawData.useFrequency = rawData.useFrequency ?? false
    rawData.trackTime = rawData.trackTime ?? false
    rawData.testWeights = rawData.testWeights ?? {}
  }

  if (rawData.testType === 'FOCUS_GROUP') {
    rawData.testStructure = Array.isArray(rawData.testStructure)
      ? rawData.testStructure
      : []
    rawData.config = {
      ...DEFAULT_FOCUS_GROUP_CONFIG,
      ...(rawData.config || {}),
    }
    rawData.discussionGuide = Array.isArray(rawData.discussionGuide)
      ? rawData.discussionGuide
      : []
  }

  if (!Array.isArray(rawData.testOptions)) {
    rawData.testOptions = []
  }

  return rawData
}

function normalizeCardSortingStructure(structure = {}) {
  const cardSorting = structure?.cardSorting || {}
  return {
    welcomeMessage: structure.welcomeMessage ?? '',
    finalMessage: structure.finalMessage ?? '',
    consent: structure.consent ?? '',
    preTest: Array.isArray(structure.preTest) ? structure.preTest : [],
    postTest: Array.isArray(structure.postTest) ? structure.postTest : [],
    cardSorting: {
      cards: Array.isArray(cardSorting.cards) ? cardSorting.cards : [],
      categories: Array.isArray(cardSorting.categories)
        ? cardSorting.categories
        : [],
      options: {
        ...DEFAULT_CARD_SORTING_OPTIONS,
        ...(cardSorting.options || {}),
      },
    },
  }
}

function normalizeUserTestStructure(structure = {}) {
  return {
    welcomeMessage: structure.welcomeMessage ?? '',
    finalMessage: structure.finalMessage ?? '',
    consent: structure.consent ?? '',
    preTest: Array.isArray(structure.preTest) ? structure.preTest : [],
    postTest: Array.isArray(structure.postTest) ? structure.postTest : [],
    userTasks: Array.isArray(structure.userTasks) ? structure.userTasks : [],
  }
}
