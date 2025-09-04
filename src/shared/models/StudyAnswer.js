/**
* Create a Answer.
* @param {string} type - Same as testType 
*/

export default class StudyAnswer {
    constructor({
        type,
    } = {},
    ) {
        this.type = type
    }

    toFirestore() {
        return {
            type: this.type ?? '',
        }
    }
}