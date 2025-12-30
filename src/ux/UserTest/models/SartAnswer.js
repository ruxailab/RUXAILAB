/**
 * Professional SART (Situation Awareness Rating Technique) Answer Model
 * Implements the full 10-dimension SART with proper validation and calculations
 * Based on: Endsley, M. R. (1995). Measurement of situation awareness in dynamic systems.
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
      category: 'demand'
    },
    COMPLEXITY: {
      key: 'complexity',
      label: 'Complexity of Situation',
      minLabel: 'Very Simple',
      maxLabel: 'Very Complex',
      description: 'Rate how simple or complex the operational elements and their relationships were',
      category: 'demand'
    },
    VARIABILITY: {
      key: 'variability',
      label: 'Variability of Situation',
      minLabel: 'Very Constant',
      maxLabel: 'Very Variable',
      description: 'Rate how constant or variable the situation parameters were over time',
      category: 'demand'
    },
    
    // SUPPLY DIMENSIONS (7) - Internal operator factors
    AROUSAL: {
      key: 'arousal',
      label: 'Arousal',
      minLabel: 'Very Low',
      maxLabel: 'Very High',
      description: 'Rate your level of mental alertness and readiness during the task',
      category: 'supply'
    },
    SPARE_CAPACITY: {
      key: 'spareCapacity',
      label: 'Spare Mental Capacity',
      minLabel: 'Very Little',
      maxLabel: 'Very Much',
      description: 'Rate how much spare mental capacity you had available beyond task requirements',
      category: 'supply'
    },
    CONCENTRATION: {
      key: 'concentration',
      label: 'Concentration',
      minLabel: 'Very Difficult',
      maxLabel: 'Very Easy',
      description: 'Rate how difficult or easy it was to maintain concentration on the task',
      category: 'supply'
    },
    DIVISION: {
      key: 'division',
      label: 'Division of Attention',
      minLabel: 'Very Focused',
      maxLabel: 'Very Divided',
      description: 'Rate how focused or divided your attention was across multiple task elements',
      category: 'supply'
    },
    INFORMATION_QUANTITY: {
      key: 'informationQuantity',
      label: 'Information Quantity',
      minLabel: 'Very Little',
      maxLabel: 'Very Much',
      description: 'Rate the amount of information available for making decisions',
      category: 'supply'
    },
    INFORMATION_QUALITY: {
      key: 'informationQuality',
      label: 'Information Quality',
      minLabel: 'Very Poor',
      maxLabel: 'Very Good',
      description: 'Rate the quality, relevance, and usefulness of available information',
      category: 'supply'
    },
    FAMILIARITY: {
      key: 'familiarity',
      label: 'Familiarity with Situation',
      minLabel: 'Very Unfamiliar',
      maxLabel: 'Very Familiar',
      description: 'Rate how familiar you were with the operational situation and procedures',
      category: 'supply'
    },
    
    // SITUATION AWARENESS COMPONENT
    UNDERSTANDING: {
      key: 'understanding',
      label: 'Understanding of Situation',
      minLabel: 'Very Poor',
      maxLabel: 'Very Good',
      description: 'Rate your overall understanding and comprehension of the operational situation',
      category: 'sa'
    }
  },
  
  // Scoring ranges
  SCORE_RANGE: {
    MIN: 1,
    MAX: 7,
    DEFAULT: 4,
    STEP: 1
  },
  
  // SA Score interpretation levels
  SA_LEVELS: [
    { min: 30, max: 49, level: 'Exceptional', color: 'success', description: 'Superior situation awareness' },
    { min: 20, max: 29, level: 'Good', color: 'info', description: 'Adequate situation awareness' },
    { min: 10, max: 19, level: 'Moderate', color: 'warning', description: 'Marginal situation awareness' },
    { min: -10, max: 9, level: 'Poor', color: 'error', description: 'Inadequate situation awareness' },
    { min: -30, max: -11, level: 'Critical', color: 'error-dark', description: 'Critical situation awareness failure' }
  ],
  
  // Dimension score interpretation
  DIMENSION_LEVELS: [
    { min: 6, max: 7, level: 'High', color: 'success' },
    { min: 4, max: 5.9, level: 'Moderate', color: 'info' },
    { min: 2, max: 3.9, level: 'Low', color: 'warning' },
    { min: 1, max: 1.9, level: 'Very Low', color: 'error' }
  ]
};

// Validator class for SART data
class SartValidator {
  static validateDimensionScore(score, dimension) {
    if (typeof score !== 'number' || Number.isNaN(score)) {
      throw new TypeError(`Invalid score for ${dimension}: must be a number`);
    }
    
    if (score < SART_CONSTANTS.SCORE_RANGE.MIN || score > SART_CONSTANTS.SCORE_RANGE.MAX) {
      throw new Error(
        `Score ${score} for ${dimension} out of range. Must be between ` +
        `${SART_CONSTANTS.SCORE_RANGE.MIN} and ${SART_CONSTANTS.SCORE_RANGE.MAX}`
      );
    }
    
    return Math.round(score); // Ensure integer values for 7-point scale
  }

  static validateAllDimensions(dimensions) {
    const validated = {};
    for (const [key, value] of Object.entries(dimensions)) {
      if (SART_CONSTANTS.DIMENSIONS[key.toUpperCase()]) {
        validated[key] = this.validateDimensionScore(value, key);
      }
    }
    return validated;
  }
}

// Main SART Answer Class
export default class SartAnswer {
  /**
   * Creates a new SART answer instance
   * @param {Object} data - Initial SART data
   * @param {boolean} autoCalculate - Whether to automatically calculate derived scores
   */
  constructor({
    instability = SART_CONSTANTS.SCORE_RANGE.DEFAULT,
    complexity = SART_CONSTANTS.SCORE_RANGE.DEFAULT,
    variability = SART_CONSTANTS.SCORE_RANGE.DEFAULT,
    arousal = SART_CONSTANTS.SCORE_RANGE.DEFAULT,
    spareCapacity = SART_CONSTANTS.SCORE_RANGE.DEFAULT,
    concentration = SART_CONSTANTS.SCORE_RANGE.DEFAULT,
    division = SART_CONSTANTS.SCORE_RANGE.DEFAULT,
    informationQuantity = SART_CONSTANTS.SCORE_RANGE.DEFAULT,
    informationQuality = SART_CONSTANTS.SCORE_RANGE.DEFAULT,
    familiarity = SART_CONSTANTS.SCORE_RANGE.DEFAULT,
    understanding = SART_CONSTANTS.SCORE_RANGE.DEFAULT,
    demand = null,
    supply = null,
    saScore = null,
    timestamp = null,
    metadata = {}
  } = {}, autoCalculate = true) {
    // Core dimension scores (validated)
    this._rawScores = {
      instability: SartValidator.validateDimensionScore(instability, 'instability'),
      complexity: SartValidator.validateDimensionScore(complexity, 'complexity'),
      variability: SartValidator.validateDimensionScore(variability, 'variability'),
      arousal: SartValidator.validateDimensionScore(arousal, 'arousal'),
      spareCapacity: SartValidator.validateDimensionScore(spareCapacity, 'spareCapacity'),
      concentration: SartValidator.validateDimensionScore(concentration, 'concentration'),
      division: SartValidator.validateDimensionScore(division, 'division'),
      informationQuantity: SartValidator.validateDimensionScore(informationQuantity, 'informationQuantity'),
      informationQuality: SartValidator.validateDimensionScore(informationQuality, 'informationQuality'),
      familiarity: SartValidator.validateDimensionScore(familiarity, 'familiarity'),
      understanding: SartValidator.validateDimensionScore(understanding, 'understanding')
    };

    // Derived scores (calculated unless explicitly provided)
    this._derivedScores = {
      demand: demand,
      supply: supply,
      saScore: saScore
    };

    // Metadata
    this.timestamp = timestamp || new Date().toISOString();
    this.metadata = {
      version: '2.0',
      calculationMethod: 'professional-sart',
      ...metadata
    };

    // Calculate derived scores if not provided or auto-calc is enabled
    if (autoCalculate || demand === null || supply === null || saScore === null) {
      this.calculateDerivedScores();
    }

    // Freeze the raw scores to prevent accidental modification
    Object.freeze(this._rawScores);
  }

  // Getters for dimension scores (immutable)
  get instability() { return this._rawScores.instability; }
  get complexity() { return this._rawScores.complexity; }
  get variability() { return this._rawScores.variability; }
  get arousal() { return this._rawScores.arousal; }
  get spareCapacity() { return this._rawScores.spareCapacity; }
  get concentration() { return this._rawScores.concentration; }
  get division() { return this._rawScores.division; }
  get informationQuantity() { return this._rawScores.informationQuantity; }
  get informationQuality() { return this._rawScores.informationQuality; }
  get familiarity() { return this._rawScores.familiarity; }
  get understanding() { return this._rawScores.understanding; }

  // Getters for derived scores
  get demand() { return this._derivedScores.demand; }
  get supply() { return this._derivedScores.supply; }
  get saScore() { return this._derivedScores.saScore; }

  /**
   * Calculate all derived scores based on SART formula
   * Formula: SA = Understanding - (Instability + Complexity + Variability) + 
   *                (Arousal + SpareCapacity + Concentration + Division + 
   *                 InformationQuantity + InformationQuality + Familiarity)
   * @returns {SartAnswer} This instance for chaining
   */
  calculateDerivedScores() {
    // Calculate Demand (sum of 3 demand dimensions)
    this._derivedScores.demand = 
      this.instability + this.complexity + this.variability;

    // Calculate Supply (sum of 7 supply dimensions)
    this._derivedScores.supply = 
      this.arousal + this.spareCapacity + this.concentration + this.division +
      this.informationQuantity + this.informationQuality + this.familiarity;

    // Calculate Situation Awareness Score
    // Professional formula: SA = Understanding - Demand + Supply
    this._derivedScores.saScore = 
      this.understanding - this._derivedScores.demand + this._derivedScores.supply;

    return this;
  }

  /**
   * Get all dimension scores as an object
   * @returns {Object} All dimension scores
   */
  getAllDimensions() {
    return { ...this._rawScores };
  }

  /**
   * Get scores by category (demand, supply, sa)
   * @param {string} category - 'demand', 'supply', or 'sa'
   * @returns {Object} Scores in the specified category
   */
  getScoresByCategory(category) {
    const scores = {};
    Object.values(SART_CONSTANTS.DIMENSIONS)
      .filter(dim => dim.category === category)
      .forEach(dim => {
        scores[dim.key] = this._rawScores[dim.key];
      });
    return scores;
  }

  /**
   * Get the average score for a specific category
   * @param {string} category - 'demand', 'supply', or 'sa'
   * @returns {number} Average score
   */
  getCategoryAverage(category) {
    const categoryScores = this.getScoresByCategory(category);
    const values = Object.values(categoryScores);
    if (values.length === 0) return 0;
    return values.reduce((sum, score) => sum + score, 0) / values.length;
  }

  /**
   * Get interpretation of SA score
   * @returns {Object} Interpretation object with level, color, and description
   */
  getSAInterpretation() {
    const score = this.saScore;
    const interpretation = SART_CONSTANTS.SA_LEVELS.find(
      level => score >= level.min && score <= level.max
    ) || SART_CONSTANTS.SA_LEVELS.at(-1);
    
    return {
      score,
      ...interpretation,
      demandScore: this.demand,
      supplyScore: this.supply,
      demandDimensions: this.getScoresByCategory('demand'),
      supplyDimensions: this.getScoresByCategory('supply')
    };
  }

  /**
   * Get interpretation for a specific dimension
   * @param {string} dimensionKey - The dimension key
   * @returns {Object} Dimension interpretation
   */
  getDimensionInterpretation(dimensionKey) {
    const score = this._rawScores[dimensionKey];
    const dimension = SART_CONSTANTS.DIMENSIONS[dimensionKey.toUpperCase()];
    
    if (!dimension) {
      throw new Error(`Unknown dimension: ${dimensionKey}`);
    }

    const level = SART_CONSTANTS.DIMENSION_LEVELS.find(
      l => score >= l.min && score <= l.max
    ) || SART_CONSTANTS.DIMENSION_LEVELS.at(-1);

    return {
      dimension: dimension.label,
      score,
      ...level,
      minLabel: dimension.minLabel,
      maxLabel: dimension.maxLabel,
      description: dimension.description
    };
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
        saInterpretation: this.getSAInterpretation()
      },
      dimensions: Object.keys(this._rawScores).map(key => 
        this.getDimensionInterpretation(key)
      ),
      categories: {
        demand: {
          scores: this.getScoresByCategory('demand'),
          average: this.getCategoryAverage('demand')
        },
        supply: {
          scores: this.getScoresByCategory('supply'),
          average: this.getCategoryAverage('supply')
        }
      },
      metadata: {
        timestamp: this.timestamp,
        ...this.metadata
      }
    };
  }

  /**
   * Factory method to create instance from raw data
   * @param {Object} data - Raw SART data
   * @returns {SartAnswer} New SART answer instance
   */
  static fromData(data) {
    return new SartAnswer(data);
  }

  /**
   * Create instance from Firestore document
   * @param {Object} firestoreData - Data from Firestore
   * @returns {SartAnswer} New SART answer instance
   */
  static fromFirestore(firestoreData) {
    // Handle legacy field names (backward compatibility)
    const normalizedData = { ...firestoreData };
    
    // Legacy field mapping
    if (normalizedData.information && !normalizedData.informationQuantity) {
      normalizedData.informationQuantity = normalizedData.information;
      normalizedData.informationQuality = normalizedData.information;
    }
    
    return new SartAnswer(normalizedData, false); // Don't auto-calc if scores already exist
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
      saScore: this.saScore,
      
      // Metadata
      timestamp: this.timestamp,
      metadata: this.metadata
    };
  }

  /**
   * Convert to simple object (for JSON serialization)
   * @returns {Object} Simple object representation
   */
  toJSON() {
    return this.toFirestore();
  }

  /**
   * Create a copy with updated scores
   * @param {Object} updates - Updated dimension scores
   * @returns {SartAnswer} New instance with updated scores
   */
  update(updates) {
    const validatedUpdates = SartValidator.validateAllDimensions(updates);
    const newScores = { ...this._rawScores, ...validatedUpdates };
    return new SartAnswer(newScores);
  }

  /**
   * Check if the SART answer is complete (all dimensions scored)
   * @returns {boolean} True if complete
   */
  isComplete() {
    const expectedKeys = Object.keys(SART_CONSTANTS.DIMENSIONS).map(k => 
      SART_CONSTANTS.DIMENSIONS[k].key
    );
    return expectedKeys.every(key => 
      this._rawScores[key] !== undefined && this._rawScores[key] !== null
    );
  }

  /**
   * Get the overall quality rating (based on completeness and consistency)
   * @returns {string} Quality rating
   */
  getQualityRating() {
    if (!this.isComplete()) {
      return 'incomplete';
    }
    
    // Check for response bias (all same score)
    const scores = Object.values(this._rawScores);
    const allSame = scores.every(score => score === scores[0]);
    
    // Check for extreme response bias (all 1s or all 7s)
    const allExtreme = scores.every(score => score === 1) || scores.every(score => score === 7);
    
    if (allExtreme) return 'suspicious_extreme';
    if (allSame) return 'suspicious_uniform';
    
    // Calculate variance
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    
    if (variance < 1) return 'low_variance';
    if (variance > 6) return 'high_variance';
    
    return 'good';
  }

  /**
   * Get recommendations based on scores
   * @returns {Array} Array of recommendations
   */
  getRecommendations() {
    const report = this.getAnalysisReport();
    const recommendations = [];
    
    // SA Score recommendations
    const saLevel = report.summary.saInterpretation.level;
    if (saLevel === 'Critical' || saLevel === 'Poor') {
      recommendations.push({
        priority: 'high',
        area: 'situation_awareness',
        message: `Low SA score detected (${this.saScore}). Consider additional training on situation monitoring and information processing.`,
        action: 'review_training'
      });
    }
    
    // Demand vs Supply imbalance
    const demandAvg = report.categories.demand.average;
    const supplyAvg = report.categories.supply.average;
    const imbalance = Math.abs(demandAvg - supplyAvg);
    
    if (imbalance > 2) {
      recommendations.push({
        priority: 'medium',
        area: 'workload_balance',
        message: `Significant imbalance between task demand (${demandAvg}) and operator supply (${supplyAvg}).`,
        action: demandAvg > supplyAvg ? 'reduce_workload' : 'enhance_capabilities'
      });
    }
    
    // Individual dimension recommendations
    report.dimensions.forEach(dim => {
      if (dim.level === 'Very Low' || dim.level === 'Low') {
        recommendations.push({
          priority: 'low',
          area: dim.dimension.toLowerCase().replaceAll(/\s+/g, '_'),
          message: `Low score in ${dim.dimension} (${dim.score}). Consider improvements in this area.`,
          action: 'targeted_training'
        });
      }
    });
    
    return recommendations;
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
      throw new Error('Invalid responses array');
    }
    
    const dimensionSums = {};
    const dimensionKeys = Object.keys(SART_CONSTANTS.DIMENSIONS).map(k => 
      SART_CONSTANTS.DIMENSIONS[k].key
    );
    
    // Initialize sums
    dimensionKeys.forEach(key => {
      dimensionSums[key] = 0;
    });
    
    // Sum all responses
    responses.forEach(response => {
      dimensionKeys.forEach(key => {
        dimensionSums[key] += response._rawScores[key] || SART_CONSTANTS.SCORE_RANGE.DEFAULT;
      });
    });
    
    // Calculate averages
    const averageData = {};
    dimensionKeys.forEach(key => {
      averageData[key] = Math.round(
        dimensionSums[key] / responses.length * 10
      ) / 10; // Round to 1 decimal
    });
    
    return new SartAnswer(averageData);
  },

  /**
   * Calculate standard deviation for each dimension
   * @param {Array<SartAnswer>} responses - Array of SART answers
   * @returns {Object} Standard deviations for each dimension
   */
  calculateStandardDeviations(responses) {
    if (!Array.isArray(responses) || responses.length < 2) {
      return {};
    }
    
    const deviations = {};
    const dimensionKeys = Object.keys(SART_CONSTANTS.DIMENSIONS).map(k => 
      SART_CONSTANTS.DIMENSIONS[k].key
    );
    
    dimensionKeys.forEach(key => {
      const scores = responses.map(r => r._rawScores[key] || SART_CONSTANTS.SCORE_RANGE.DEFAULT);
      const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
      const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
      deviations[key] = Math.sqrt(variance);
    });
    
    return deviations;
  },

  /**
   * Generate a radar chart data structure
   * @param {SartAnswer} sartAnswer - SART answer instance
   * @returns {Object} Chart.js compatible data
   */
  generateRadarChartData(sartAnswer) {
    const dimensions = Object.values(SART_CONSTANTS.DIMENSIONS);
    
    return {
      labels: dimensions.map(d => d.label),
      datasets: [{
        label: 'SART Dimensions',
        data: dimensions.map(d => sartAnswer._rawScores[d.key]),
        backgroundColor: 'rgba(33, 150, 243, 0.2)',
        borderColor: 'rgba(33, 150, 243, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(33, 150, 243, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(33, 150, 243, 1)'
      }]
    };
  }
};
