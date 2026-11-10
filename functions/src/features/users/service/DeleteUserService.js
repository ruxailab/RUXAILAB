import { fail } from '../../../core/errors.js'
import { UserAuthRepository } from '../repositories/UserAuthRepository.js'
import { UserStorageRepository } from '../repositories/UserStorageRepository.js'

/**
 * Service orchestrating user account deletion and cleanup of associated
 * studies, answers, and Cloud Storage files.
 */
export class DeleteUserService {
  /**
   * @param {object} deps
   * @param {import('../../../shared/repositories/FirestoreUserRepository.js').FirestoreUserRepository} deps.userRepository
   * @param {import('../../../shared/repositories/FirestoreStudyRepository.js').FirestoreStudyRepository} deps.studyRepository
   * @param {import('../../../shared/repositories/FirestoreAnswerRepository.js').FirestoreAnswerRepository} deps.answerRepository
   * @param {UserStorageRepository} [deps.storageRepository]
   * @param {UserAuthRepository} [deps.authRepository]
   * @param {object} [deps.storage]
   * @param {object} [deps.auth]
   */
  constructor({
    userRepository,
    studyRepository,
    answerRepository,
    storageRepository,
    authRepository,
    storage,
    auth,
  }) {
    this.userRepository = userRepository
    this.studyRepository = studyRepository
    this.answerRepository = answerRepository
    this.storageRepository =
      storageRepository || (storage ? new UserStorageRepository(storage) : null)
    this.authRepository =
      authRepository || (auth ? new UserAuthRepository(auth) : null)
  }

  /**
   * Orchestrates the deletion process.
   *
   * @param {object} params
   * @param {string} params.uid Caller's user ID
   * @param {{ userId: string }} params.input Request payload containing target userId
   * @returns {Promise<string>}
   */
  async execute({ uid, input }) {
    const targetUserId = input?.userId

    await this.authorize(uid, targetUserId)
    await this.deleteUserStudies(targetUserId)
    await this.deleteUserDocument(targetUserId)
    await this.deleteAuthUser(targetUserId)

    return 'User deleted successfully.'
  }

  /**
   * Verifies that the caller is authorized to delete the target user account.
   *
   * @param {string} callerUid
   * @param {string} targetUserId
   */
  async authorize(callerUid, targetUserId) {
    if (callerUid === targetUserId) {
      return
    }

    const isSuperAdmin = await this.userRepository.isSuperAdmin(callerUid)
    if (!isSuperAdmin) {
      fail('permission-denied', 'Permission denied')
    }
  }

  /**
   * Deletes all studies administered by the target user.
   *
   * @param {string} userId
   */
  async deleteUserStudies(userId) {
    const studies = await this.studyRepository.listByAdmin(userId)
    for (const study of studies) {
      await this.deleteStudyResources(study)
    }
  }

  /**
   * Cleans up answers, Cloud Storage files, and study document for a single study.
   *
   * @param {{ id: string, answersDocId?: string }} study
   */
  async deleteStudyResources(study) {
    if (study.answersDocId) {
      await this.deleteAnswersDoc(study.answersDocId)
    }
    await this.deleteStudyStorageFiles(study.id)
    await this.studyRepository.delete(study.id)
  }

  /**
   * Deletes the answers document associated with a study.
   *
   * @param {string} answersDocId
   */
  async deleteAnswersDoc(answersDocId) {
    if (this.answerRepository) {
      await this.answerRepository.delete(answersDocId)
    }
  }

  /**
   * Deletes storage files in the study folder.
   *
   * @param {string} studyId
   */
  async deleteStudyStorageFiles(studyId) {
    if (this.storageRepository) {
      await this.storageRepository.deleteFolderFiles(`tests/${studyId}/`)
    }
  }

  /**
   * Deletes the user profile document from Firestore.
   *
   * @param {string} userId
   */
  async deleteUserDocument(userId) {
    await this.userRepository.delete(userId)
  }

  /**
   * Deletes the user from Firebase Authentication.
   *
   * @param {string} userId
   */
  async deleteAuthUser(userId) {
    if (this.authRepository) {
      await this.authRepository.deleteUser(userId)
    }
  }
}

