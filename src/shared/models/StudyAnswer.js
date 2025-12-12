/**
* Create a Answer.
* @param {string} type - Same as testType 
*/

export default class StudyAnswer {
    constructor({
        type,
        welcomeMessage,
    } = {},
    ) {
        this.type = type
        this.welcomeMessage = welcomeMessage ?? ''
    }

    toFirestore() {
        return {
            type: this.type ?? '',
            welcomeMessage: this.welcomeMessage ?? '',
        }
    }
}