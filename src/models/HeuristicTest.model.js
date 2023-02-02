import Test from "./Test";
/**
 * Create a Heuristic.
 * @param {Object[]} heuristics  - An array of HeuristicQuestion value.
 */

export default class Heuristic extends Test {
    constructor({ heuristics, testTitle, testDescription } = {}) {
        super({ testTitle, testDescription });
        this.heuristics = heuristics ?? null;
        this.testType = "HEURISTICS";
        let date = new Date();
        let current_date =
            date.getFullYear() +
            "-" +
            (date.getMonth() + 1) +
            "-" +
            date.getDate();
        let current_time =
            date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        this.creationDate = current_date + " - " + current_time;
    }

    toFirestore() {
        return Object.assign(super.toFirestore(), {
            heuristics: this.heuristics,
            testType: this.testType,
        });
    }
    static toHeuristicTest(data) {
        return new Heuristic(data);
    }
}
