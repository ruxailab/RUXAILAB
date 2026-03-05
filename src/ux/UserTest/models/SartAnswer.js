/**
 * Professional SART (Situation Awareness Rating Technique) Answer Model
 * Implements the full 10-dimension SART with proper validation and calculations
 * Based on: Endsley, M. R. (1995). Measurement of situation awareness in dynamic systems.
 * SART 10D model with 3 categories: Demand, Supply, Understanding
 */

// Constants for SART dimensions and scoring
export const SART_CONSTANTS = {
  // Dimension metadata with professional descriptions
  DIMENSIONS: {
    // DEMAND DIMENSIONS (3) - External task factors
    INSTABILITY: {
      key: 'instability',
      label: 'Instability of Situation',
      minLabel: 'Very Stable',
      maxLabel: 'Very Unstable',
      description: 'Rate how stable or unstable the operational situation was',
      category: 'demand',
    },
    COMPLEXITY: {
      key: 'complexity',
      label: 'Complexity of Situation',
      minLabel: 'Very Simple',
      maxLabel: 'Very Complex',
      description:
        'Rate how simple or complex the operational elements and their relationships were',
      category: 'demand',
    },
    VARIABILITY: {
      key: 'variability',
      label: 'Variability of Situation',
      minLabel: 'Very Constant',
      maxLabel: 'Very Variable',
      description:
        'Rate how constant or variable the situation parameters were over time',
      category: 'demand',
    },

    // SUPPLY DIMENSIONS (4) - Internal operator factors
    AROUSAL: {
      key: 'arousal',
      label: 'Arousal',
      minLabel: 'Very Low',
      maxLabel: 'Very High',
      description:
        'Rate your level of mental alertness and readiness during the task',
      category: 'supply',
    },
    CONCENTRATION: {
      key: 'concentration',
      label: 'Concentration of Attention',
      minLabel: 'Very Difficult',
      maxLabel: 'Very Easy',
      description:
        'Rate how difficult or easy it was to maintain concentration on the task',
      category: 'supply',
    },
    DIVISION: {
      key: 'division',
      label: 'Division of Attention',
      minLabel: 'Very Focused',
      maxLabel: 'Very Divided',
      description:
        'Rate how focused or divided your attention was across multiple task elements',
      category: 'supply',
    },
    SPARE_CAPACITY: {
      key: 'spareCapacity',
      label: 'Spare Mental Capacity',
      minLabel: 'Very Little',
      maxLabel: 'Very Much',
      description:
        'Rate how much spare mental capacity you had available beyond task requirements',
      category: 'supply',
    },

    // UNDERSTANDING DIMENSIONS (3)
    INFORMATION_QUANTITY: {
      key: 'informationQuantity',
      label: 'Information Quantity',
      minLabel: 'Very Little',
      maxLabel: 'Very Much',
      description:
        'Rate the amount of information available for making decisions',
      category: 'understanding',
    },
    INFORMATION_QUALITY: {
      key: 'informationQuality',
      label: 'Information Quality',
      minLabel: 'Very Poor',
      maxLabel: 'Very Good',
      description:
        'Rate the quality, relevance, and usefulness of available information',
      category: 'understanding',
    },
    FAMILIARITY: {
      key: 'familiarity',
      label: 'Familiarity with Situation',
      minLabel: 'Very Unfamiliar',
      maxLabel: 'Very Familiar',
      description:
        'Rate how familiar you were with the operational situation and procedures',
      category: 'understanding',
    },
  },

  // Scoring ranges
  SCORE_RANGE: {
    MIN: 1,
    MAX: 7,
    DEFAULT: 4,
    STEP: 1,
  },

  // SA Score interpretation levels (based on SART 10D formula)
  SA_LEVELS: [
    {
      min: 25,
      max: 49,
      level: 'Excellent',
      color: 'success',
      description: 'Superior situation awareness',
    },
    {
      min: 15,
      max: 24,
      level: 'Good',
      color: 'info',
      description: 'Adequate situation awareness',
    },
    {
      min: 5,
      max: 14,
      level: 'Moderate',
      color: 'warning',
      description: 'Marginal situation awareness',
    },
    {
      min: -10,
      max: 4,
      level: 'Poor',
      color: 'error',
      description: 'Inadequate situation awareness',
    },
    {
      min: -30,
      max: -11,
      level: 'Critical',
      color: 'error-dark',
      description: 'Critical situation awareness failure',
    },
  ],

  // Dimension score interpretation
  DIMENSION_LEVELS: [
    { min: 6, max: 7, level: 'High', color: 'success' },
    { min: 4, max: 5.9, level: 'Moderate', color: 'info' },
    { min: 2, max: 3.9, level: 'Low', color: 'warning' },
    { min: 1, max: 1.9, level: 'Very Low', color: 'error' },
  ],

  // Category ranges
  CATEGORY_RANGES: {
    demand: { min: 3, max: 21 }, // 3 dimensions × 1-7
    supply: { min: 4, max: 28 }, // 4 dimensions × 1-7
    understanding: { min: 3, max: 21 }, // 3 dimensions × 1-7
  },
}

// Validator class for SART data
class SartValidator {
  static validateDimensionScore(score, dimension) {
    if (typeof score !== 'number' || Number.isNaN(score)) {
      throw new TypeError(`Invalid score for ${dimension}: must be a number`)
    }

    if (
      score < SART_CONSTANTS.SCORE_RANGE.MIN ||
      score > SART_CONSTANTS.SCORE_RANGE.MAX
    ) {
      throw new Error(
        `Score ${score} for ${dimension} out of range. Must be between ` +
          `${SART_CONSTANTS.SCORE_RANGE.MIN} and ${SART_CONSTANTS.SCORE_RANGE.MAX}`,
      )
    }

    return Math.round(score) // Ensure integer values for 7-point scale
  }

  static validateAllDimensions(dimensions) {
    const validated = {}
    const dimensionKeys = Object.keys(SART_CONSTANTS.DIMENSIONS).map(
      (k) => SART_CONSTANTS.DIMENSIONS[k].key,
    )

    for (const [key, value] of Object.entries(dimensions)) {
      if (dimensionKeys.includes(key)) {
        validated[key] = this.validateDimensionScore(value, key)
      }
    }
    return validated
  }
}

// Main SART Answer Class
export default class SartAnswer {
  /**
   * Creates a new SART answer instance
   * @param {Object} data - Initial SART data
   * @param {boolean} autoCalculate - Whether to automatically calculate derived scores
   */
  constructor(
    {
      instability = SART_CONSTANTS.SCORE_RANGE.DEFAULT,
      complexity = SART_CONSTANTS.SCORE_RANGE.DEFAULT,
      variability = SART_CONSTANTS.SCORE_RANGE.DEFAULT,
      arousal = SART_CONSTANTS.SCORE_RANGE.DEFAULT,
      concentration = SART_CONSTANTS.SCORE_RANGE.DEFAULT,
      division = SART_CONSTANTS.SCORE_RANGE.DEFAULT,
      spareCapacity = SART_CONSTANTS.SCORE_RANGE.DEFAULT,
      informationQuantity = SART_CONSTANTS.SCORE_RANGE.DEFAULT,
      informationQuality = SART_CONSTANTS.SCORE_RANGE.DEFAULT,
      familiarity = SART_CONSTANTS.SCORE_RANGE.DEFAULT,
      demand = null,
      supply = null,
      understanding = null,
      saScore = null,
      timestamp = null,
      metadata = {},
    } = {},
    autoCalculate = true,
  ) {
    // Core dimension scores (validated)
    this._rawScores = {
      instability: SartValidator.validateDimensionScore(
        instability,
        'instability',
      ),
      complexity: SartValidator.validateDimensionScore(
        complexity,
        'complexity',
      ),
      variability: SartValidator.validateDimensionScore(
        variability,
        'variability',
      ),
      arousal: SartValidator.validateDimensionScore(arousal, 'arousal'),
      concentration: SartValidator.validateDimensionScore(
        concentration,
        'concentration',
      ),
      division: SartValidator.validateDimensionScore(division, 'division'),
      spareCapacity: SartValidator.validateDimensionScore(
        spareCapacity,
        'spareCapacity',
      ),
      informationQuantity: SartValidator.validateDimensionScore(
        informationQuantity,
        'informationQuantity',
      ),
      informationQuality: SartValidator.validateDimensionScore(
        informationQuality,
        'informationQuality',
      ),
      familiarity: SartValidator.validateDimensionScore(
        familiarity,
        'familiarity',
      ),
    }

    // Derived scores (calculated unless explicitly provided)
    this._derivedScores = {
      demand: demand,
      supply: supply,
      understanding: understanding,
      saScore: saScore,
    }

    // Metadata
    this.timestamp = timestamp || new Date().toISOString()
    this.metadata = {
      version: '2.0',
      calculationMethod: 'sart-10d',
      ...metadata,
    }

    // Calculate derived scores if not provided or auto-calc is enabled
    if (
      autoCalculate ||
      demand === null ||
      supply === null ||
      understanding === null ||
      saScore === null
    ) {
      this.calculateDerivedScores()
    }

    // Freeze the raw scores to prevent accidental modification
    Object.freeze(this._rawScores)
  }

  // Getters for dimension scores (immutable)
  get instability() {
    return this._rawScores.instability
  }
  get complexity() {
    return this._rawScores.complexity
  }
  get variability() {
    return this._rawScores.variability
  }
  get arousal() {
    return this._rawScores.arousal
  }
  get concentration() {
    return this._rawScores.concentration
  }
  get division() {
    return this._rawScores.division
  }
  get spareCapacity() {
    return this._rawScores.spareCapacity
  }
  get informationQuantity() {
    return this._rawScores.informationQuantity
  }
  get informationQuality() {
    return this._rawScores.informationQuality
  }
  get familiarity() {
    return this._rawScores.familiarity
  }

  // Getters for derived scores
  get demand() {
    return this._derivedScores.demand
  }
  get supply() {
    return this._derivedScores.supply
  }
  get understanding() {
    return this._derivedScores.understanding
  }
  get saScore() {
    return this._derivedScores.saScore
  }

  /**
   * Calculate all derived scores based on SART 10D formula
   * Formula: SA = Understanding - Demand + Supply
   * Where:
   *   Demand = Instability + Complexity + Variability (3 dimensions)
   *   Supply = Arousal + Concentration + Division + SpareCapacity (4 dimensions)
   *   Understanding = InformationQuantity + InformationQuality + Familiarity (3 dimensions)
   * @returns {SartAnswer} This instance for chaining
   */
  calculateDerivedScores() {
    // Calculate Demand (sum of 3 demand dimensions)
    this._derivedScores.demand =
      this.instability + this.complexity + this.variability

    // Calculate Supply (sum of 4 supply dimensions)
    this._derivedScores.supply =
      this.arousal + this.concentration + this.division + this.spareCapacity

    // Calculate Understanding (sum of 3 understanding dimensions)
    this._derivedScores.understanding =
      this.informationQuantity + this.informationQuality + this.familiarity

    // Calculate Situation Awareness Score using SART 10D formula
    this._derivedScores.saScore =
      this._derivedScores.understanding -
      this._derivedScores.demand +
      this._derivedScores.supply

    return this
  }

  /**
   * Get all dimension scores as an object
   * @returns {Object} All dimension scores
   */
  getAllDimensions() {
    return { ...this._rawScores }
  }

  /**
   * Get scores by category
   * @param {string} category - 'demand', 'supply', or 'understanding'
   * @returns {Object} Scores in the specified category
   */
  getScoresByCategory(category) {
    const scores = {}
    Object.values(SART_CONSTANTS.DIMENSIONS)
      .filter((dim) => dim.category === category)
      .forEach((dim) => {
        scores[dim.key] = this._rawScores[dim.key]
      })
    return scores
  }

  /**
   * Get the average score for a specific category
   * @param {string} category - 'demand', 'supply', or 'understanding'
   * @returns {number} Average score
   */
  getCategoryAverage(category) {
    const categoryScores = this.getScoresByCategory(category)
    const values = Object.values(categoryScores)
    if (values.length === 0) return 0
    const sum = values.reduce((total, score) => total + score, 0)
    return Math.round((sum / values.length) * 10) / 10 // Round to 1 decimal
  }

  /**
   * Get interpretation of SA score
   * @returns {Object} Interpretation object with level, color, and description
   */
  getSAInterpretation() {
    const score = this.saScore
    const interpretation =
      SART_CONSTANTS.SA_LEVELS.find(
        (level) => score >= level.min && score <= level.max,
      ) || SART_CONSTANTS.SA_LEVELS.at(-1)

    return {
      score,
      level: interpretation.level,
      color: interpretation.color,
      description: interpretation.description,
      demandScore: this.demand,
      supplyScore: this.supply,
      understandingScore: this.understanding,
      demandDimensions: this.getScoresByCategory('demand'),
      supplyDimensions: this.getScoresByCategory('supply'),
      understandingDimensions: this.getScoresByCategory('understanding'),
    }
  }

  /**
   * Get interpretation for a specific dimension
   * @param {string} dimensionKey - The dimension key
   * @returns {Object} Dimension interpretation
   */
  getDimensionInterpretation(dimensionKey) {
    const score = this._rawScores[dimensionKey]
    const dimension = Object.values(SART_CONSTANTS.DIMENSIONS).find(
      (d) => d.key === dimensionKey,
    )

    if (!dimension) {
      throw new Error(`Unknown dimension: ${dimensionKey}`)
    }

    const level =
      SART_CONSTANTS.DIMENSION_LEVELS.find(
        (l) => score >= l.min && score <= l.max,
      ) || SART_CONSTANTS.DIMENSION_LEVELS.at(-1)

    return {
      dimension: dimension.label,
      category: dimension.category,
      score,
      level: level.level,
      color: level.color,
      minLabel: dimension.minLabel,
      maxLabel: dimension.maxLabel,
      description: dimension.description,
    }
  }

  /**
   * Get a comprehensive analysis report
   * @returns {Object} Full analysis report
   */
  getAnalysisReport() {
    return {
      summary: {
        saScore: this.saScore,
        demandScore: this.demand,
        supplyScore: this.supply,
        understandingScore: this.understanding,
        saInterpretation: this.getSAInterpretation(),
      },
      dimensions: Object.keys(this._rawScores).map((key) =>
        this.getDimensionInterpretation(key),
      ),
      categories: {
        demand: {
          scores: this.getScoresByCategory('demand'),
          average: this.getCategoryAverage('demand'),
          range: SART_CONSTANTS.CATEGORY_RANGES.demand,
        },
        supply: {
          scores: this.getScoresByCategory('supply'),
          average: this.getCategoryAverage('supply'),
          range: SART_CONSTANTS.CATEGORY_RANGES.supply,
        },
        understanding: {
          scores: this.getScoresByCategory('understanding'),
          average: this.getCategoryAverage('understanding'),
          range: SART_CONSTANTS.CATEGORY_RANGES.understanding,
        },
      },
      metadata: {
        timestamp: this.timestamp,
        ...this.metadata,
      },
    }
  }

  /**
   * Factory method to create instance from raw data
   * @param {Object} data - Raw SART data
   * @returns {SartAnswer} New SART answer instance
   */
  static fromData(data) {
    return new SartAnswer(data)
  }

  /**
   * Create instance from Firestore document with legacy field handling
   * @param {Object} firestoreData - Data from Firestore
   * @returns {SartAnswer} New SART answer instance
   */
  static fromFirestore(firestoreData) {
    if (!firestoreData) {
      return new SartAnswer({})
    }

    // Start with normalized data
    const normalizedData = { ...firestoreData }

    // Handle legacy field mapping for backward compatibility
    // Map 'information' to both informationQuantity and informationQuality
    if (
      normalizedData.information !== undefined &&
      (normalizedData.informationQuantity === undefined ||
        normalizedData.informationQuality === undefined)
    ) {
      if (normalizedData.informationQuantity === undefined) {
        normalizedData.informationQuantity = normalizedData.information
      }
      if (normalizedData.informationQuality === undefined) {
        normalizedData.informationQuality = normalizedData.information
      }
      // Remove legacy field after mapping
      delete normalizedData.information
    }

    // Map 'understanding' to 'familiarity' if needed
    if (
      normalizedData.understanding !== undefined &&
      normalizedData.familiarity === undefined
    ) {
      normalizedData.familiarity = normalizedData.understanding
      // Remove legacy field after mapping
      delete normalizedData.understanding
    }

    // Ensure all required fields have default values
    const requiredFields = Object.values(SART_CONSTANTS.DIMENSIONS).map(
      (d) => d.key,
    )
    requiredFields.forEach((field) => {
      if (normalizedData[field] === undefined) {
        normalizedData[field] = SART_CONSTANTS.SCORE_RANGE.DEFAULT
      }
    })

    return new SartAnswer(normalizedData, false)
  }

  /**
   * Convert to Firestore-compatible object
   * @returns {Object} Firestore data
   */
  toFirestore() {
    return {
      // Raw dimension scores
      ...this._rawScores,

      // Derived scores
      demand: this.demand,
      supply: this.supply,
      understanding: this.understanding,
      saScore: this.saScore,

      // Metadata
      timestamp: this.timestamp,
      metadata: this.metadata,
    }
  }

  /**
   * Convert to simple object (for JSON serialization)
   * @returns {Object} Simple object representation
   */
  toJSON() {
    return this.toFirestore()
  }

  /**
   * Create a copy with updated scores
   * @param {Object} updates - Updated dimension scores
   * @returns {SartAnswer} New instance with updated scores
   */
  update(updates) {
    const validatedUpdates = SartValidator.validateAllDimensions(updates)
    const newScores = { ...this._rawScores, ...validatedUpdates }
    return new SartAnswer(newScores)
  }

  /**
   * Check if the SART answer is complete (all dimensions scored)
   * @returns {boolean} True if complete
   */
  isComplete() {
    const expectedKeys = Object.values(SART_CONSTANTS.DIMENSIONS).map(
      (d) => d.key,
    )
    return expectedKeys.every(
      (key) =>
        this._rawScores[key] !== undefined &&
        this._rawScores[key] !== null &&
        this._rawScores[key] >= SART_CONSTANTS.SCORE_RANGE.MIN &&
        this._rawScores[key] <= SART_CONSTANTS.SCORE_RANGE.MAX,
    )
  }

  /**
   * Get the overall quality rating (based on completeness and consistency)
   * @returns {string} Quality rating
   */
  getQualityRating() {
    if (!this.isComplete()) {
      return 'incomplete'
    }

    const scores = Object.values(this._rawScores)

    // Check for extreme response bias (all 1s or all 7s)
    const allOnes = scores.every((score) => score === 1)
    const allSevens = scores.every((score) => score === 7)

    if (allOnes || allSevens) return 'suspicious_extreme'

    // Check for uniform responses (all same score)
    const allSame = scores.every((score) => score === scores[0])
    if (allSame) return 'suspicious_uniform'

    // Check for straight-lining (alternating pattern)
    const hasPattern = scores.every((score, index) =>
      index % 2 === 0 ? score === scores[0] : score === scores[1],
    )
    if (hasPattern && scores.length > 2) return 'suspicious_pattern'

    // Calculate variance
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length
    const variance =
      scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) /
      scores.length

    if (variance < 0.5) return 'low_variance'
    if (variance > 6) return 'high_variance'

    return 'good'
  }

  /**
   * Get recommendations based on scores
   * @returns {Array} Array of recommendations
   */
  getRecommendations() {
    const report = this.getAnalysisReport()
    const recommendations = []

    // SA Score recommendations
    const saInterpretation = report.summary.saInterpretation
    if (
      saInterpretation.level === 'Critical' ||
      saInterpretation.level === 'Poor'
    ) {
      recommendations.push({
        priority: 'high',
        area: 'situation_awareness',
        message: `Low SA score detected (${this.saScore}). Consider additional training on situation monitoring and information processing.`,
        action: 'review_training',
        details: `Demand: ${this.demand}, Supply: ${this.supply}, Understanding: ${this.understanding}`,
      })
    }

    // Check category imbalances
    const demandAvg = report.categories.demand.average
    const supplyAvg = report.categories.supply.average
    const understandingAvg = report.categories.understanding.average

    // Demand vs Supply imbalance
    if (demandAvg > supplyAvg + 1) {
      recommendations.push({
        priority: 'medium',
        area: 'workload_balance',
        message: `Task demand (${demandAvg}) exceeds operator supply (${supplyAvg}). Consider workload reduction or enhanced support.`,
        action: 'reduce_workload',
      })
    }

    // Low understanding
    if (understandingAvg < 4) {
      recommendations.push({
        priority: 'medium',
        area: 'information_processing',
        message: `Low understanding score (${understandingAvg}). Consider improving information availability and quality.`,
        action: 'enhance_information',
      })
    }

    // Individual low-scoring dimensions
    report.dimensions.forEach((dim) => {
      if (dim.score <= 2) {
        recommendations.push({
          priority: 'low',
          area: dim.dimension.toLowerCase().replace(/\s+/g, '_'),
          message: `Very low score in ${dim.dimension} (${dim.score}).`,
          action: 'targeted_improvement',
          category: dim.category,
        })
      }
    })

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return recommendations.sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
    )
  }
}

// Utility functions
export const SartUtils = {
  /**
   * Calculate average from multiple SART responses
   * @param {Array<SartAnswer>} responses - Array of SART answers
   * @returns {SartAnswer} Average SART answer
   */
  calculateAverage(responses) {
    if (!Array.isArray(responses) || responses.length === 0) {
      throw new Error('Invalid responses array')
    }

    const dimensionKeys = Object.values(SART_CONSTANTS.DIMENSIONS).map(
      (d) => d.key,
    )
    const dimensionSums = {}

    // Initialize sums
    dimensionKeys.forEach((key) => {
      dimensionSums[key] = 0
    })

    // Sum all responses
    responses.forEach((response) => {
      dimensionKeys.forEach((key) => {
        dimensionSums[key] +=
          response._rawScores[key] || SART_CONSTANTS.SCORE_RANGE.DEFAULT
      })
    })

    // Calculate averages (rounded to 1 decimal)
    const averageData = {}
    dimensionKeys.forEach((key) => {
      averageData[key] =
        Math.round((dimensionSums[key] / responses.length) * 10) / 10
    })

    return new SartAnswer(averageData)
  },

  /**
   * Calculate standard deviation for each dimension
   * @param {Array<SartAnswer>} responses - Array of SART answers
   * @returns {Object} Standard deviations for each dimension
   */
  calculateStandardDeviations(responses) {
    if (!Array.isArray(responses) || responses.length < 2) {
      return {}
    }

    const deviations = {}
    const dimensionKeys = Object.values(SART_CONSTANTS.DIMENSIONS).map(
      (d) => d.key,
    )

    dimensionKeys.forEach((key) => {
      const scores = responses.map(
        (r) => r._rawScores[key] || SART_CONSTANTS.SCORE_RANGE.DEFAULT,
      )
      const mean = scores.reduce((a, b) => a + b, 0) / scores.length
      const variance =
        scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) /
        scores.length
      deviations[key] = Math.round(Math.sqrt(variance) * 10) / 10 // Round to 1 decimal
    })

    return deviations
  },

  /**
   * Generate a radar chart data structure
   * @param {SartAnswer} sartAnswer - SART answer instance
   * @returns {Object} Chart.js compatible data
   */
  generateRadarChartData(sartAnswer) {
    const dimensions = Object.values(SART_CONSTANTS.DIMENSIONS)

    return {
      labels: dimensions.map((d) => d.label),
      datasets: [
        {
          label: 'SART Dimensions',
          data: dimensions.map((d) => sartAnswer._rawScores[d.key]),
          backgroundColor: 'rgba(33, 150, 243, 0.2)',
          borderColor: 'rgba(33, 150, 243, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(33, 150, 243, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(33, 150, 243, 1)',
        },
      ],
    }
  },

  /**
   * Generate category comparison data for bar chart
   * @param {SartAnswer} sartAnswer - SART answer instance
   * @returns {Object} Chart.js compatible data
   */
  generateCategoryChartData(sartAnswer) {
    const colors = {
      demand: 'rgba(255, 152, 0, 0.7)', // Orange
      supply: 'rgba(76, 175, 80, 0.7)', // Green
      understanding: 'rgba(156, 39, 176, 0.7)', // Purple
    }

    return {
      labels: ['Demand', 'Supply', 'Understanding'],
      datasets: [
        {
          label: 'Category Scores',
          data: [
            sartAnswer.demand,
            sartAnswer.supply,
            sartAnswer.understanding,
          ],
          backgroundColor: [colors.demand, colors.supply, colors.understanding],
          borderColor: [
            colors.demand.replace('0.7', '1'),
            colors.supply.replace('0.7', '1'),
            colors.understanding.replace('0.7', '1'),
          ],
          borderWidth: 1,
        },
      ],
    }
  },
}
