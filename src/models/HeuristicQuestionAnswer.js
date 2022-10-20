     /**
     * Create a HeuristicQuestionAnswer.
     * @param {number} heuristicId - The heuristicId value.
     * @param {number} heuristicAnswer - The heuristicAnswer value.
     * @param {string} heuristicComment - The heuristicComment value.
     */

export default class HeuristicQuestionAnswer{
    constructor(heuristicId, heuristicAnswer, heuristicComment){
        this.heuristicId = heuristicId;
        this.heuristicAnswer = heuristicAnswer;
        this.heuristicComment = heuristicComment;
    }
}