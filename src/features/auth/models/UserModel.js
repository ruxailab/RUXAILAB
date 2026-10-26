/**
 * Create a User.
 * @param {number} accessLevel - The accessLevel value.
 * @param {string} email - The email value.
 * @param {Object[]} notifications - An array of Notification value.
 * @param {Object[]} myTests - An array of UserTest value.
 * @param {string} username - The username of the user.
 * @param {string} contactNo - The contact number of the user.
 * @param {string} country - The country of the user.
 * @param {string} profileImage - The profile image URL of the user.
 */

export default class User {
  constructor({
    id,
    accessLevel,
    email,
    myAnswers = [],
    myTests = [],
    username = null,
    contactNo = null,
    country = null,
    profileImage = '',
    lastCalibrationId = null,
    storageUsageMB = 0,
  } = {}) {
    this.id = id
    this.accessLevel = accessLevel
    this.email = email
    this.myAnswers = myAnswers
    this.myTests = myTests
    this.username = username
    this.contactNo = contactNo
    this.country = country
    this.profileImage = profileImage
    this.lastCalibrationId = lastCalibrationId
    this.storageUsageMB = storageUsageMB
  }

  static toUser(data) {
    return new User({
      ...data,
    })
  }

  toFirestore() {
    return {
      accessLevel: this.accessLevel,
      email: this.email,
      myAnswers: this.myAnswers,
      myTests: this.myTests,
      username: this.username, // Include username in Firestore representation
      contactNo: this.contactNo, // Include contactNo in Firestore representation
      country: this.country, // Include country in Firestore representation
      profileImage: this.profileImage, // Include profileImage in Firestore representation
      lastCalibrationId: this.lastCalibrationId,
      storageUsageMB: this.storageUsageMB,
    }
  }
}
