import Cooperators from './Cooperators'

/** Class representing a Study. */

export default class Study {
  /**
   * @param {Partial<Test>} partial
   */
  constructor({
    id,
    testAdmin,
    testDescription,
    testTitle,
    testType,
    subType,
    testStructure,
    testOptions,
    answersDocId,
    cooperators,
    updateDate,
    templateDoc,
    isPublic,
    studyConclusion,
    status, // transformar em um ENUM
    endDate,
    creationDate,
  } = {}) {
    /**
     * Defines the test id.
     *
     * @type {string}
     */
    this.id = id ?? null

    /**
     * Defines the study admin.
     *
     * @type {StudyAdmin}
     */
    this.testAdmin = testAdmin ?? null

    /**
     * Defines the test description.
     *
     * @type {string}
     */
    this.testDescription = testDescription ?? null

    /**
     * Defines the test title.
     *
     * @type {string}
     */
    this.testTitle = testTitle ?? null

    /**
     * Defines the test type.
     *
     * @type {string}
     */
    this.testType = testType ?? null

    /**
    * Defines the test subtype.
    *
    * @type {string}
    */
    this.subType = subType ?? null

    /**
     * Defines the test structure.
     *
     * @type {TestStructure[]}
     */
    this.testStructure = testStructure ?? []

    /**
     * Defines the test options.
     *
     * @type {Array}
     */
    this.testOptions = testOptions ?? []

    /**
     * Defines the answers document id.
     *
     * @type {string}
     */
    this.answersDocId = answersDocId ?? null

    /**
     * Defines the test cooperators.
     *
     * @type {List<Cooperators>}
     */
    this.cooperators = cooperators ?? null

    /**
     * Defines a timestamp of the test creation date.
     *
     * @type {number}
     */
    this.creationDate = creationDate

    /**
     * Defines a timestamp of the test last updated date.
     *
     * @type {number}
     */
    this.updateDate = updateDate ?? null

    /**
     * Defines the test template document id.
     *
     * @type {String}
     */
    this.templateDoc = templateDoc ?? null

    /**
     * Defines whether the test is public.
     *
     * @type {boolean}
     */
    this.isPublic = isPublic ?? false

    /**
     * Test conclusion that can be added on Final Report
     *
     * @type {string}
     */
    this.studyConclusion = studyConclusion ?? null

    /**
     * Defines the test status.
     * 
     * @type {string}
     */

    this.status = status ?? null
    /**
     * Defines a timestamp of the test end date.
     *
     * @type {number}
     */
    this.endDate = endDate ?? null

  }

  /**
   * Converts the current model into a map.
   *
   * @returns a map that represents the current model.
   */
  toFirestore() {
    return {
      testTitle: this.testTitle,
      testDescription: this.testDescription,
      testAdmin: this.testAdmin.toFirestore(),
      testType: this.testType,
      testStructure: this.testStructure,
      testOptions: this.testOptions,
      answersDocId: this.answersDocId,
      cooperators: this.cooperators.map((c) => c.toFirestore()),
      creationDate: this.creationDate,
      updateDate: this.updateDate,
      templateDoc: this.templateDoc,
      isPublic: this.isPublic,
      studyConclusion: this.studyConclusion,
      status: this.status,
      endDate: this.endDate,
      subType: this.subType,
    }
  }
}