import { STUDY_TYPES } from '@/shared/constants/methodDefinitions'
import Study from '../../../shared/models/Study'

export default class UserStudy extends Study {
    constructor(params = {}) {
        super(params)
        this.testType = STUDY_TYPES.USER
    }

    toFirestore() {
        return Object.assign(super.toFirestore(), {})
    }
}