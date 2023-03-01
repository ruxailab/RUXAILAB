import TestAdmin from './TestAdmin'

/**
 * Represents the test model.
 */
export default class Test {
  /**
   * @param {Partial<Test>} partial
   */
  constructor({
    id,
    testAdmin,
    testDescription,
    testTitle,
    testType,
    testStructure,
    testOptions,
    answersDocId,
    cooperators,
    creationDate,
    updateDate,
    templateDoc,
    numberColaborators,
    isPublic,
  } = {}) {
    /**
     * Defines the test id.
     *
     * @type {string}
     */
    this.id = id ?? null

    /**
     * Defines the test admin.
     *
     * @type {TestAdmin}
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
     * Defines the test structure.
     *
     * @type {TestStructure[]}
     */
    this.testStructure = testStructure ?? []

    /**
     * Defines the test options.
     *
     * @type {TestStructureOptions[]}
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
     * @type {Cooperators}
     */
    this.cooperators = cooperators ?? null

    /**
     * Defines a timestamp of the test creation date.
     *
     * @type {number}
     */
    this.creationDate = creationDate ?? null

    /**
     * Defines a timestamp of the test last updated date.
     *
     * @type {number}
     */
    this.updateDate = updateDate ?? null

    /**
     * Defines the test template document.
     *
     * @type {TestTemplateDoc}
     */
    this.templateDoc = templateDoc ?? null

    /**
     * Defines the amount of collaborators.
     *
     * @type {number}
     */
    this.numberColaborators = numberColaborators ?? 0

    /**
     * Defines whether the test is public.
     *
     * @type {boolean}
     */
    this.isPublic = isPublic ?? false
  }

  /**
   * Creates a new test model from the given map.
   *
   * @param {Partial<Test>} map the map to be converted.
   * @returns a new test model.
   */
  static toTest(map) {
    return new Test({
      ...map,
      testAdmin: TestAdmin.toTestAdmin(map.testAdmin),
    })
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
      cooperators: this.cooperators,
      creationDate: this.creationDate,
      updateDate: this.updateDate,
      templateDoc: this.templateDoc,
      numberColaborators: this.numberColaborators,
      isPublic: this.isPublic,
    }
  }
}
