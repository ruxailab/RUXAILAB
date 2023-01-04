/**
 * Create a Heuristic.
 * @param {number} id - The heuristicId value.
 * @param {string} title - The heuristicTitle value.
 * @param {Object[]} questions  - An array of HeuristicQuestion value.
 * @param {number} total -Total number of heuristics
 */

export default class Heuristic {
  constructor(id, title, questions, total) {
    this.id = id;
    this.title = title;
    this.questions = questions;
    this.total = total;
  }
  static toHeuristic(data) {
      return new Heuristic(data)
  }
}