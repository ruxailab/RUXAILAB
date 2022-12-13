import Test from "./Test";
/**
 * Create a Heuristic.
 * @param {Object[]} heuristics  - An array of HeuristicQuestion value.
 */

export default class Heuristic extends Test {
  constructor(heuristics) {
    super();
    this.heuristics = heuristics;
  }
  static toHeuristicTest(){
    return new Heuristic()
  }
}
