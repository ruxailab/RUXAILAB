import StudyAnswer from "@/shared/models/StudyAnswer";

export default class UserStudyAnswer extends StudyAnswer {
    constructor(params = {}) {
        super(params)
        this.taskAnswers = params.taskAnswers || null
    }

    toFirestore() {
        // serialize taskAnswers flexibly (array or object)
        const taskAnswersSerialized = this.taskAnswers
            ? (Array.isArray(this.taskAnswers)
                ? this.taskAnswers.map(answer => (answer && answer.toFirestore ? answer.toFirestore() : answer))
                : Object.fromEntries(
                    Object.entries(this.taskAnswers).map(([k, v]) => [
                      k,
                      v && typeof v.toFirestore === 'function' ? v.toFirestore() : v
                    ])
                  ))
            : null
            
        return Object.assign(super.toFirestore(), {
            taskAnswers: taskAnswersSerialized
        })
    }
}