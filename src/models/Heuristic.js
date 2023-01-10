/**
 * Create a Heuristic.
 * @param {number} id - The heuristicId value.
 * @param {string} title - The heuristicTitle value.
 * @param {Object[]} questions  - An array of HeuristicQuestion value.
 * @param {number} total -Total number of heuristics
 */

export default class Heuristic {
    constructor({
        heuristicId,
        heuristicTitle,
        heuristicQuestions,
        heuristicTotal,
    } = {}) {
        this.heuristicId = heuristicId;
        this.heuristicTitle = heuristicTitle;
        this.heuristicQuestions = heuristicQuestions;
        this.heuristicTotal = heuristicTotal;
    }
    static toHeuristic(data) {
        return new Heuristic(data);
    }
}
