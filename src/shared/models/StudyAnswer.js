/**
 * Create a Answer.
 * @param {string} type - Same as testType
 */

export default class StudyAnswer {
  constructor({ type, studyId = null, createdBy = null } = {}) {
    this.type = type
    this.studyId = studyId
    this.createdBy = createdBy
  }

  toFirestore() {
    const answer = {
      type: this.type ?? '',
      studyId: this.studyId,
      createdBy: this.createdBy,
    }
    if (this.type === 'USER') answer.taskAnswers = {}
    if (this.type === 'HEURISTIC' || this.type === 'HEURISTICS') {
      answer.heuristicAnswers = {}
    }
    return answer
  }
}
