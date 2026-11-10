import logger from '../../../utils/logger.js'

/**
 * Persistence adapter for user and study files in Cloud Storage.
 */
export class UserStorageRepository {
  /**
   * @param {import('firebase-admin').storage.Storage} storage
   */
  constructor(storage) {
    this.storage = storage
  }

  /**
   * Delete all files in a folder prefix (e.g. tests/${testId}/).
   *
   * @param {string} folderPath
   * @returns {Promise<number>} Number of deleted files
   */
  async deleteFolderFiles(folderPath) {
    if (!this.storage) return 0
    const [files] = await this.storage.bucket().getFiles({ prefix: folderPath })

    if (files && files.length > 0) {
      logger.info(`Deletando ${files.length} arquivos da pasta ${folderPath}`)
      await Promise.all(files.map((file) => file.delete()))
      return files.length
    }
    return 0
  }
}

