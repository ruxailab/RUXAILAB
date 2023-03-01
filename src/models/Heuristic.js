/**
 * Create a Heuristic.
 * @param {number} id - The heuristicId value.
 * @param {string} title - The heuristicTitle value.
 * @param {Object[]} questions  - An array of HeuristicQuestion value.
 * @param {number} total -Total number of heuristics
 */

import HeuristicQuestionAnswer from "./HeuristicQuestionAnswer";

export default class Heuristic {
    constructor({
        heuristicId,
        heuristicTitle,
        heuristicQuestions,
        heuristicTotal,
    } = {}) {
        this.id = heuristicId;
        this.title = heuristicTitle;
        this.questions = heuristicQuestions;
        this.total = heuristicTotal;
    }
    static toHeuristic(data) {
        return new Heuristic({
            ...data,
            heuristicQuestions: data.heuristicQuestions.map((h) => HeuristicQuestionAnswer.toHeuristicQuestionAnswer(h))
        });
    }

    toFirestore() {
        return {
            heuristicId: this.heuristicId,
            heuristicTitle: this.heuristicTitle,
            heuristicQuestions: this.heuristicQuestions.map((h) => h.toFirestore()),
            heuristicTotal: this.heuristicTotal
        }
    }
}
