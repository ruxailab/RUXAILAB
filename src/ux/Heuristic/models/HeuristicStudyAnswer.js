import StudyAnswer from '@/shared/models/StudyAnswer'

export default class HeuristicStudyAnswer extends StudyAnswer {
  constructor(params = {}) {
    super(params)
    this.heuristicAnswers = params.heuristicAnswers || null
  }

  toFirestore() {
    return Object.assign(super.toFirestore(), {
      heuristicAnswers: this.heuristicAnswers.map((answer) =>
        answer.toFirestore(),
      ),
    })
  }
}
