import StudyAnswer from "@/shared/models/StudyAnswer";

export default class UserStudyAnswer extends StudyAnswer {
    constructor(params = {}) {
        super(params)
        this.taskAnswers = params.taskAnswers || null
    }

    toFirestore() {
        return Object.assign(super.toFirestore(), {
            taskAnswers: this.taskAnswers.map(answer => answer.toFirestore())
        })
    }
}