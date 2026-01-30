/**
 * Represents a manual accessibility test model.
 */
export default class ManualAccessibilityTest {
  /**
   * @param {Object} data - The data to initialize the test with
   */
  constructor(data = {}) {
    // Basic test information
    this.id = data.id || null
    this.title = data.title || ''
    this.description = data.description || ''
    this.websiteUrl = data.websiteUrl || ''
    this.testAdmin = data.testAdmin || null
    this.status = data.status || 'draft' // draft, in-progress, completed, archived
    this.version = data.version || '2.1'
    this.collaborators = data.collaborators || {}

    // Add cooperators field for compatibility with other test types
    this.cooperators = data.cooperators || []

    // Test progress tracking
    this.progress = data.progress || {
      total: 0,
      completed: 0,
      byPrinciple: {
        perceivable: { completed: 0, total: 0 },
        operable: { completed: 0, total: 0 },
        understandable: { completed: 0, total: 0 },
        robust: { completed: 0, total: 0 },
      },
      byStatus: {
        pass: 0,
        fail: 0,
        na: 0,
        untested: 0,
      },
    }

    // Timestamps
    this.createdAt = data.createdAt || new Date().toISOString()
    this.updatedAt = data.updatedAt || new Date().toISOString()

    // Test-specific data
    this.testType = data.testType || data.type || 'MANUAL'
    this.subType = data.subType || 'MANUAL' // Add subType for compatibility
    this.isPublic = data.isPublic !== undefined ? data.isPublic : false

    /**
     * Configuration data for the test
     */
    this.configData = data.configData || {
      complianceLevel: 'AA',
      includeNonInterference: true,
      showExperimentalRules: false,
      enableAutomaticSave: true,
      selectedGuidelines: [],
      selectedRulesByGuideline: {},
    }
  }

  /**
   * Converts the model to a plain object for Firestore
   * @returns {Object} Plain object representation of the model
   */
  toFirestore() {
    // Helper function to convert nested objects to plain objects
    const toPlainObject = (obj) => {
      if (!obj || typeof obj !== 'object') return obj
      if (typeof obj.toFirestore === 'function') return obj.toFirestore()
      if (Array.isArray(obj)) return obj.map((item) => toPlainObject(item))

      const plainObj = {}
      for (const key in obj) {
        if (Object.hasOwn(obj, key)) {
          plainObj[key] = toPlainObject(obj[key])
        }
      }
      return plainObj
    }

    // Create a plain object with all the data
    const plainData = {
      title: this.title,
      testTitle: this.title, // Add testTitle for compatibility with Firebase functions
      description: this.description,
      websiteUrl: this.websiteUrl,
      testAdmin: toPlainObject(this.testAdmin),
      status: this.status,
      version: this.version,
      collaborators: toPlainObject(this.collaborators),
      cooperators: toPlainObject(this.cooperators),
      progress: toPlainObject(this.progress),
      testType: this.testType,
      subType: this.subType, // Add subType for compatibility
      creationDate: this.createdAt, // Add creationDate for compatibility with Firebase functions
      isPublic: this.isPublic,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      configData: toPlainObject(this.configData),
    }

    // Remove undefined values
    Object.keys(plainData).forEach((key) => {
      if (plainData[key] === undefined) {
        delete plainData[key]
      }
    })

    return plainData
  }

  /**
   * Creates a new ManualAccessibilityTest from Firestore data
   * @param {string} id - Document ID from Firestore
   * @param {Object} data - Document data from Firestore
   * @returns {ManualAccessibilityTest} New instance of ManualAccessibilityTest
   */
  static fromFirestore(id, data) {
    return new ManualAccessibilityTest({
      id,
      ...data,
    })
  }

  /**
   * Updates the progress based on test results
   * @param {string} principle - The WCAG principle (perceivable, operable, etc.)
   * @param {string} status - The test status (pass, fail, na)
   */
  updateProgress(principle, status) {
    if (this.progress.byPrinciple[principle]) {
      this.progress.byPrinciple[principle].completed++
      this.progress.completed++
      this.progress.byStatus[status]++
      this.updatedAt = new Date().toISOString()
    }
  }

  /**
   * Adds a collaborator to the test
   * @param {string} userId - The ID of the user to add as collaborator
   * @param {string} role - The role of the collaborator (e.g., 'tester', 'reviewer')
   */
  addCollaborator(userId, role = 'tester') {
    this.collaborators[userId] = role
    this.updatedAt = new Date().toISOString()
  }

  /**
   * Updates the test status
   * @param {string} newStatus - The new status (draft, in-progress, completed, archived)
   */
  updateStatus(newStatus) {
    const validStatuses = ['draft', 'in-progress', 'completed', 'archived']
    if (validStatuses.includes(newStatus)) {
      this.status = newStatus
      this.updatedAt = new Date().toISOString()
    }
  }
}
