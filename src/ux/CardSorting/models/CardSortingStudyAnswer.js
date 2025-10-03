import StudyAnswer from "@/shared/models/StudyAnswer";

export default class CardSortingStudyAnswer extends StudyAnswer {
    constructor(params = {}) {
        super(params)
        this.categories = params.categories || null
    }

    toFirestore() {
        return Object.assign(super.toFirestore(), {
            categories: this.categories
        })
    }
}