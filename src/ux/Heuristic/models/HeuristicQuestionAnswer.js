/**
 * Create a HeuristicQuestionAnswer.
 * @param {number} heuristicId - The heuristicId value.
 * @param {number} heuristicAnswer - The heuristicAnswer value.
 * @param {string} heuristicComment - The heuristicComment value.
 * @param {string} answerImageUrl - The image comment url.
 * @param {number} timeSpent - Time spent on this question in seconds.
 * @param {number} startTime - Timestamp when question was first viewed.
 */

export default class HeuristicQuestionAnswer {
  constructor({
    heuristicId,
    heuristicAnswer,
    heuristicComment,
    answerImageUrl,
    timeSpent,
    startTime,
  } = {}) {
    this.heuristicId = heuristicId
    this.heuristicAnswer = heuristicAnswer ?? {}
    this.heuristicComment = heuristicComment
    this.answerImageUrl = answerImageUrl
    this.timeSpent = timeSpent ?? 0
    this.startTime = startTime ?? null
  }
  static toHeuristicQuestionAnswer(data, testOptions) {
    return new HeuristicQuestionAnswer({
      // TODO: This needs to be changed urgently, just a hotfix for now
      ...data,
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
      timeSpent: this.timeSpent ?? 0,
      startTime: this.startTime ?? null,
    }
  }
}
