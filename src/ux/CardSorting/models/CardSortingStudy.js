import Study from "@/shared/models/Study"

export default class CardSortingStudy extends Study {
    constructor(params = {}) {
        super(params)
        this.testType = 'CardSorting'
    }

    toFirestore() {
        return Object.assign(super.toFirestore(), {})
    }
}