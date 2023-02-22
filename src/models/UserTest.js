import Test from "./Test";

/**
 * Create a UserTest.
 * @param {string} testDocId - The testDocId value.
 * @param {string} testTitle - The testTitle value.
 * @param {string} testType - The testType value.
 * @param {string} creationDate - The creationDate value.
 * @param {string} updateDate - The updateDate value.
 * @param {number} numberColaborators - The numberColaborators value.
 * @param {boolean} existReport - The existReport value.
 * @param {boolean} isComplete - The isComplete value.
 * @param {number} testProgress - The testProgress value.
 */

export default class UserTest extends Test {
    constructor({ userTest, testTitle, testDescription } = {}) {
        super({ userTest, testTitle, testDescription });

        this.heuristics = userTest ?? null;
        this.testType = "USERS";
        let date = new Date();
        let current_date =
            date.getFullYear() +
            "-" +
            (date.getMonth() + 1) +
            "-" +
            date.getDate();
        let current_time =
            date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        this.creationDate = current_date + " - " + current_time;
    }
    toFirestore() {
        return Object.assign(super.toFirestore(), {
            heuristics: this.heuristics,
            testType: this.testType,
        });
    }
    static toUserTest(data) {
        return new UserTest(data);
    }
}
