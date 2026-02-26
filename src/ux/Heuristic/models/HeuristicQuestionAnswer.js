/**
 * Create a HeuristicQuestionAnswer.
 * @param {number} heuristicId - The heuristicId value.
 * @param {number} heuristicAnswer - The heuristicAnswer value.
 * @param {string} heuristicComment - The heuristicComment value.
 * @param {string} answerImageUrl - The image comment url.
 */

export default class HeuristicQuestionAnswer {
  constructor({
    heuristicId,
    heuristicAnswer,
    heuristicComment,
    answerImageUrl,
    timeSpent,
  } = {}) {
    this.heuristicId = heuristicId
    this.heuristicAnswer = heuristicAnswer ?? {}
    this.heuristicComment = heuristicComment
    this.answerImageUrl = answerImageUrl
    // initialize time spent, default to 0 so it can be incremented later
    this.timeSpent = timeSpent ?? 0
  }
  static toHeuristicQuestionAnswer(data, testOptions) {
    return new HeuristicQuestionAnswer({
      // TODO: This needs to be changed urgently, just a hotfix for now
      ...data,
      // preserve timeSpent if it exists in firestore document
      timeSpent: data.timeSpent || 0,
      heuristicAnswer: data.heuristicAnswer?.text
        ? data.heuristicAnswer
        : {
            text:
              testOptions.find((op) => op.value === data.heuristicAnswer)
                ?.text ?? '',
            value: data.heuristicAnswer,
          },
    })
  }

  toFirestore() {
    return {
      heuristicId: this.heuristicId,
      heuristicAnswer: this.heuristicAnswer,
      heuristicComment: this.heuristicComment,
      answerImageUrl: this.answerImageUrl || '',
      timeSpent: this.timeSpent || 0,
    }
  }
}
