import Study from '../../../shared/models/Study'

export default class UserStudy extends Study {
    constructor(params = {}) {
        super(params)
        this.testType = 'User'
    }

    toFirestore() {
        return Object.assign(super.toFirestore(), {})
    }

    static toStudy(data) {
        return new UserStudy(data)
    }
}