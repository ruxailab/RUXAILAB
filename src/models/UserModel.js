/**
 * Create a User.
 * @param {number} accessLevel - The accessLevel value.
 * @param {string} email - The email value.
 * @param {Object[]} notifications - An array of Notification value.
 * @param {Object[]} myAnswers - An array of UserAnswer value.
 * @param {Object[]} myTemplates - An array of UserTemplate value.
 * @param {Object[]} myTests - An array of UserTest value.
 */

export default class User {
    constructor({
        id, accessLevel, email, notifications, myAnswers, myTemplates, myTests
    } = {}
    ) {
        this.id = id
        this.accessLevel = accessLevel;
        this.email = email;
        this.notifications = notifications;
        this.myAnswers = myAnswers;
        this.myTemplates = myTemplates;
        this.myTests = myTests;
    }
    static toUser(data) {
        const answers = []
        const tests = []

        const answersEntries = Object.entries(data.myAnswers);
        answersEntries.forEach((a) => {
            answers.push(a[1]);
        });

        const testsEntries = Object.entries(data.myTests);
        testsEntries.forEach((a) => {
            tests.push(a[1]);
        });

        return new User({
            ...data,
            myAnswers: answers,
            myTests: tests,
        })
    }

    toFirestore() {
        return {
            id: this.id,
            accessLevel: this.accessLevel,
            email: this.email,
            notifications: this.notifications,
            myAnswers: this.myAnswers,
            myTemplates: this.myTemplates,
            myTests: this.myTests,
        }
    }
}