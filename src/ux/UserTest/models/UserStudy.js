class UserStudy extends Test {
    constructor({
        userTestType,
    } = {}) {
        /**
         * Allow to say if tests is moderated or not.
         *
         * @type {string}
         */
        this.userTestType = userTestType // moderated ou unmoderated
    }
}