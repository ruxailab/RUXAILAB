import StudyAnswer from '@/shared/models/StudyAnswer'

/**
 * Document-level answer container for a Card Sorting study.
 *
 * Each participant answer is stored under `cardSortingAnswers` keyed by the
 * participant `userDocId`, mirroring how `taskAnswers`/`heuristicAnswers` work
 * for the other study types.
 */
export default class CardSortingStudyAnswer extends StudyAnswer {
  constructor(params = {}) {
    super(params)
    this.cardSortingAnswers = params.cardSortingAnswers || {}
  }

  toFirestore() {
    return Object.assign(super.toFirestore(), {
      cardSortingAnswers: this.cardSortingAnswers,
    })
  }
}
