     /**
     * Create a HeuristicAnswer.
     * @param {number} heuristicId - The heuristicId value.
     * @param {Object[]} heuristicQuestions  - An array of HeuristicQuestionAnswer value.
     * @param {number} progress - The progress value.
     * @param {number} total - The total value.
     * @param {boolean} submitted - The submitted value.
     * @param {string} userDocId - The userDocId value.
     */

export default class HeuristicAnswer {
    constructor({
        heuristicId,
        heuristicQuestions,
        progress,
        total,
        submitted,
        userDocId
    } = {}
    ) {
        this.heuristicId = heuristicId ?? null;
        this.heuristicQuestions = heuristicQuestions ?? [];
        this.progress = progress ?? 0;
        this.total = total ?? 0;
        this.submitted = submitted ?? false;
        this.userDocId = userDocId ?? null;
    }
    static toHeuristicAnswer(data) {
        return new HeuristicAnswer(data)
    }
}