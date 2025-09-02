import { STUDY_TYPES } from "@/shared/constants/methodDefinitions"
import Study from "@/shared/models/Study"

export default class CardSortingStudy extends Study {
    constructor(params = {}) {
        super(params)
        this.testType = STUDY_TYPES.CARD_SORTING
    }

    toFirestore() {
        return Object.assign(super.toFirestore(), {})
    }
}