     /**
     * Create a Cooperators.
     * @param {string} userDocId - The userDocId value.
     * @param {string} userName - The userName value.
     * @param {string} userEmail - The userEmail value.
     * @param {number} accessLevel - The accessLevel value.
     * @param {boolean} invited - The invited value.
     * @param {boolean} accepted - The accepted value.
     * @param {number} progress - The progress value.
     * @param {string} answerStatus - The answerStatus value.
     * @param {string} updateDate - The updateDate value.
     */

export default class Cooperators{
    constructor(userDocId, userName, userEmail, accessLevel, invited, accepted, progress, answerStatus, updateDate){
        this.userDocId = userDocId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.accessLevel = accessLevel;
        this.invited = invited;
        this.accepted = accepted;
        this.progress = progress;
        this.answerStatus = answerStatus;
        this.updateDate = updateDate;
    }
}