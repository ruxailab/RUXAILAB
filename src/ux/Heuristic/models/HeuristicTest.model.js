import Test from '../../../shared/models/Study'
/**
 * Create a Heuristic.
 * @param {Object[]} heuristics  - An array of HeuristicQuestion value.
 */

export default class Heuristic extends Test {
    constructor({ heuristics, testTitle, testDescription, testWeights } = {}) {
        super({ testTitle, testDescription })
        this.heuristics = heuristics ?? null
        this.testType = 'heuristic'
        this.testWeights = testWeights ?? {}
        const date = new Date()
        const current_date =
            date.getFullYear() +
            '-' +
            (date.getMonth() + 1) +
            '-' +
            date.getDate()
        const current_time =
            date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()
        this.creationDate = current_date + ' - ' + current_time
    }

    toFirestore() {
        return Object.assign(super.toFirestore(), {
            heuristics: this.heuristics,
            testType: this.testType,
            testStructure: [],
            testOptions: [],
            testAdmin: this.testAdmin,
            updateDate: Date.now(),
            testWeights: this.testWeights,
        })
    }
    static toHeuristicTest(data) {
        return new Heuristic(data)
    }
}
