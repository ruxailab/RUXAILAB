/**
 * Create a User.
 * @param {number} accessLevel - The accessLevel value.
 * @param {string} email - The email value.
 * @param {Object[]} notifications - An array of Notification value.
 * @param {UserAnswer[]} myAnswers - An array of UserAnswer value.
 * @param {Object[]} myTests - An array of UserTest value.
 * @param {string} username - The username of the user.
 * @param {string} contactNo - The contact number of the user.
 * @param {string} country - The country of the user.
 * @param {string} profileImage - The profile image URL of the user.
 */

import UserAnswer from "./UserAnswer";

export default class User {
    constructor({
        id, accessLevel, email, notifications = [], myAnswers = [], myTests = [],
        username = null, contactNo = null, country = null, profileImage = '', calibrationId = null, storageUsageMB = 0
    } = {}) {
        this.id = id;
        this.accessLevel = accessLevel;
        this.email = email;
        this.notifications = notifications;
        this.myAnswers = myAnswers;
        this.myTests = myTests;
        this.username = username;
        this.contactNo = contactNo;
        this.country = country;
        this.profileImage = profileImage;
        this.calibrationId = calibrationId;
        this.storageUsageMB = storageUsageMB;
    }

    static toUser(data) {
        return new User({
            ...data,
        });
    }

    toFirestore() {
        return {
            accessLevel: this.accessLevel,
            email: this.email,
            notifications: this.notifications,
            myAnswers: this.myAnswers,
            myTests: this.myTests,
            username: this.username, // Include username in Firestore representation
            contactNo: this.contactNo, // Include contactNo in Firestore representation
            country: this.country, // Include country in Firestore representation
            profileImage: this.profileImage, // Include profileImage in Firestore representation
            calibrationId: this.calibrationId,
            storageUsageMB: this.storageUsageMB
        };
    }

    /**
     * Move all current notifications to the inbox.
     */
    archiveNotifications() {
        this.inbox = [...this.inbox, ...this.notifications]; // Add notifications to inbox
        this.notifications = []; // Clear current notifications
    }
}