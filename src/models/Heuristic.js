     /**
     * Create a Heuristic.
     * @param {number} heuristicId - The heuristicId value.
     * @param {string} heuristicTitle - The heuristicTitle value.
     * @param {Object[]} heuristicQuestions  - An array of HeuristicQuestion value.
     */

export default class Heuristic{
    constructor(heuristicId, heuristicTitle, heuristicQuestions){
        this.heuristicId = heuristicId;
        this.heuristicTitle = heuristicTitle;
        this.heuristicQuestions = heuristicQuestions;
    }
}