     /**
     * Create a TestStructure.
     * @param {Object[]} heuristicList - An array of Heuristic value.
     * @param {Object[]} options  - An array of TestStructureOptions value.
     * @param {Object[]} userTasks - An array of UserTask value.
     */

export default class TestStructure{
    constructor({
        heuristicList, options, userTasks
    } = {}
    ) {
        this.heuristicList = heuristicList;
        this.options = options;
        this.userTasks = userTasks;
    }
    static toTestStructure(data) {
        return new TestStructure(data)
    }
}