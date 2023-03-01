import Test from "./Test";
/**
 * Create a Heuristic.
 * @param {Object[]} heuristics  - An array of HeuristicQuestion value.
 */

export default class Heuristic extends Test {
    constructor({ heuristics, testTitle, testDescription, testAdmin } = {}) {
        super({ testTitle, testDescription, testAdmin });
        this.heuristics = heuristics ?? null;
        this.testStructure = [];
        this.testOptions = [];
        this.testType = "HEURISTICS";
    }

    toFirestore() {
        return Object.assign(super.toFirestore(), {
            heuristics: this.heuristics,
            testType: this.testType,
            testStructure: [],
            testOptions: [],
            testAdmin: this.testAdmin,
            updateDate: Date.now(),
        });
    }
    static toHeuristicTest(data) {
        return new Heuristic(data);
    }
}
