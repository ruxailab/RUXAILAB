/**
 * Create a HeuristicQuestionAnswer.
 * @param {number} heuristicId - The heuristicId value.
 * @param {number} heuristicAnswer - The heuristicAnswer value.
 * @param {string} heuristicComment - The heuristicComment value (legacy, single comment).
 * @param {string} answerImageUrl - The image comment url (legacy, single image).
 * @param {Array<{id: string, text: string, createdAt: number}>} comments - Array of comment objects.
 * @param {Array<{id: string, url: string, createdAt: number}>} images - Array of image objects.
 */

export default class HeuristicQuestionAnswer {
  constructor({
    heuristicId,
    heuristicAnswer,
    heuristicComment,
    answerImageUrl,
    comments,
    images,
  } = {}) {
    this.heuristicId = heuristicId
    this.heuristicAnswer = heuristicAnswer ?? {}
    // Support both legacy single comment/image and new array format
    this.heuristicComment = heuristicComment ?? ''
    this.answerImageUrl = answerImageUrl ?? ''
    this.comments = comments ?? []
    this.images = images ?? []
  }

  /**
   * Migrates legacy single comment/image to array format if needed.
   * Call this method to ensure backward compatibility.
   */
  migrateToArrayFormat() {
    // Migrate legacy comment to comments array if present and comments array is empty
    if (this.heuristicComment && this.comments.length === 0) {
      this.comments.push({
        id: this.generateId(),
        text: this.heuristicComment,
        createdAt: Date.now(),
      })
    }
    // Migrate legacy image to images array if present and images array is empty
    if (this.answerImageUrl && this.images.length === 0) {
      this.images.push({
        id: this.generateId(),
        url: this.answerImageUrl,
        createdAt: Date.now(),
      })
    }
  }

  generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }
    const array = new Uint32Array(2)
    crypto.getRandomValues(array)
    return `${Date.now()}-${array[0].toString(36)}${array[1].toString(36)}`
  }

  /**
   * Add a new comment
   * @param {string} text - The comment text
   * @returns {Object} The created comment object
   */
  addComment(text) {
    const comment = {
      id: this.generateId(),
      text: text.trim(),
      createdAt: Date.now(),
    }
    this.comments.push(comment)
    // Keep legacy field in sync with first comment
    if (this.comments.length === 1) {
      this.heuristicComment = text.trim()
    }
    return comment
  }

  /**
   * Update an existing comment
   * @param {string} commentId - The comment ID
   * @param {string} newText - The new comment text
   */
  updateComment(commentId, newText) {
    const comment = this.comments.find((c) => c.id === commentId)
    if (comment) {
      comment.text = newText.trim()
      comment.updatedAt = Date.now()
      // Keep legacy field in sync with first comment
      if (this.comments[0]?.id === commentId) {
        this.heuristicComment = newText.trim()
      }
    }
  }

  /**
   * Remove a comment
   * @param {string} commentId - The comment ID to remove
   */
  removeComment(commentId) {
    const index = this.comments.findIndex((c) => c.id === commentId)
    if (index !== -1) {
      this.comments.splice(index, 1)
      // Update legacy field
      this.heuristicComment = this.comments[0]?.text ?? ''
    }
  }

  /**
   * Add a new image
   * @param {string} url - The image URL
   * @returns {Object} The created image object
   */
  addImage(url) {
    const image = {
      id: this.generateId(),
      url: url,
      createdAt: Date.now(),
    }
    this.images.push(image)
    // Keep legacy field in sync with first image
    if (this.images.length === 1) {
      this.answerImageUrl = url
    }
    return image
  }

  /**
   * Remove an image
   * @param {string} imageId - The image ID to remove
   */
  removeImage(imageId) {
    const index = this.images.findIndex((i) => i.id === imageId)
    if (index !== -1) {
      this.images.splice(index, 1)
      // Update legacy field
      this.answerImageUrl = this.images[0]?.url ?? ''
    }
  }

  hasComments() {
    return (
      this.comments.length > 0 ||
      (this.heuristicComment && this.heuristicComment.trim() !== '')
    )
  }

  hasImages() {
    return (
      this.images.length > 0 ||
      (this.answerImageUrl && this.answerImageUrl.trim() !== '')
    )
  }

  /**
   * Get all comments (combining legacy and new format)
   * @returns {Array} Array of comment objects
   */
  getAllComments() {
    if (this.comments.length > 0) {
      return this.comments
    }
    // Return legacy comment as array format
    if (this.heuristicComment && this.heuristicComment.trim() !== '') {
      return [
        {
          id: 'legacy',
          text: this.heuristicComment,
          createdAt: 0,
        },
      ]
    }
    return []
  }

  /**
   * Get all images (combining legacy and new format)
   * @returns {Array} Array of image objects
   */
  getAllImages() {
    if (this.images.length > 0) {
      return this.images
    }
    // Return legacy image as array format
    if (this.answerImageUrl && this.answerImageUrl.trim() !== '') {
      return [
        {
          id: 'legacy',
          url: this.answerImageUrl,
          createdAt: 0,
        },
      ]
    }
    return []
  }
  static toHeuristicQuestionAnswer(data, testOptions) {
    const instance = new HeuristicQuestionAnswer({
      // TODO: This needs to be changed urgently, just a hotfix for now
      ...data,
      heuristicAnswer: data.heuristicAnswer?.text
        ? data.heuristicAnswer
        : {
            text:
              testOptions.find((op) => op.value === data.heuristicAnswer)
                ?.text ?? '',
            value: data.heuristicAnswer,
          },
      comments: Array.isArray(data.comments) ? data.comments : [],
      images: Array.isArray(data.images) ? data.images : [],
    })
    instance.migrateToArrayFormat()
    return instance
  }

  toFirestore() {
    return {
      heuristicId: this.heuristicId,
      heuristicAnswer: this.heuristicAnswer,
      // Keep legacy fields for backward compatibility
      heuristicComment: this.heuristicComment || '',
      answerImageUrl: this.answerImageUrl || '',
      comments: this.comments.map((c) => ({
        id: c.id,
        text: c.text,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt || null,
      })),
      images: this.images.map((i) => ({
        id: i.id,
        url: i.url,
        createdAt: i.createdAt,
      })),
    }
  }
}
