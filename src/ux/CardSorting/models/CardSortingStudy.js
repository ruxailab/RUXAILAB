import { STUDY_TYPES } from '@/shared/constants/methodDefinitions'
import Study from '@/shared/models/Study'

/**
 * Builds the default (empty) test structure for a Card Sorting study so the
 * editor and the participant flow always have the expected shape available.
 */
const buildDefaultStructure = () => ({
  welcomeMessage: '',
  finalMessage: '',
  consent: '',
  preTest: [],
  postTest: [],
  cardSorting: {
    cards: [],
    categories: [],
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
})

export default class CardSortingStudy extends Study {
  constructor(params = {}) {
    super(params)
    this.testType = STUDY_TYPES.CARD_SORTING

    const hasStructure =
      params.testStructure &&
      !Array.isArray(params.testStructure) &&
      typeof params.testStructure === 'object'

    this.testStructure = hasStructure
      ? params.testStructure
      : buildDefaultStructure()
  }

  toFirestore() {
    return Object.assign(super.toFirestore(), {})
  }
}
