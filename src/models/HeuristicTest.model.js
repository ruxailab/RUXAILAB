import Test from "./Test";
/**
 * Create a Heuristic.
 * @param {Object[]} heuristics  - An array of HeuristicQuestion value.
 */

export default class Heuristic extends Test{
  constructor({
    heuristics,
    testTitle,
    testDescription
  } = {}
  ) {
    super({testTitle, testDescription})
    this.heuristics = heuristics ?? null;
    this.testType='heuristic' 
  }
 
  toFirestore(){
    return  Object.assign(super.toFirestore(), {heuristics: this.heuristics, testType: this.testType})
  }
  static toHeuristicTest(data) {
      return new Heuristic(data)
  }
}