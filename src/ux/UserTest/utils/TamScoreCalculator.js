/**
 * TAM Score Calculator
 * Computes TAM scores and dimension averages
 */

export class TamScoreCalculator {
  /**
   * Calculate average for an array of values
   */
  static calculateAverage(values) {
    if (!values || values.length === 0) return Number.NaN;
    const validValues = values.filter(v => typeof v === 'number');
    if (validValues.length === 0) return Number.NaN;
    return validValues.reduce((sum, v) => sum + v, 0) / validValues.length;
  }

  /**
   * Calculate dimension averages
   */
  static calculateDimensionAverages(tamAnswers, tamVersion = 1) {
    const averages = {};

    // Core dimensions (TAM-1)
    averages.perceivedUsefulness = this.calculateAverage(tamAnswers.perceivedUsefulness);
    averages.perceivedEaseOfUse = this.calculateAverage(tamAnswers.perceivedEaseOfUse);

    // TAM-2 dimensions
    if (tamVersion >= 2) {
      averages.subjectiveNorm = this.calculateAverage(tamAnswers.subjectiveNorm);
      averages.image = this.calculateAverage(tamAnswers.image);
      averages.jobRelevance = this.calculateAverage(tamAnswers.jobRelevance);
      averages.outputQuality = this.calculateAverage(tamAnswers.outputQuality);
      averages.resultDemonstrability = this.calculateAverage(tamAnswers.resultDemonstrability);
    }

    // TAM-3 dimensions
    if (tamVersion >= 3) {
      averages.computerSelfEfficacy = this.calculateAverage(tamAnswers.computerSelfEfficacy);
      averages.perceptionsOfExternalControl = this.calculateAverage(tamAnswers.perceptionsOfExternalControl);
      averages.computerAnxiety = this.calculateAverage(tamAnswers.computerAnxiety);
      averages.computerPlayfulness = this.calculateAverage(tamAnswers.computerPlayfulness);
      averages.perceivedEnjoyment = this.calculateAverage(tamAnswers.perceivedEnjoyment);
      averages.objectiveUsability = this.calculateAverage(tamAnswers.objectiveUsability);
    }

    return averages;
  }

  /**
   * Calculate overall TAM score (normalized to 0-100)
   * Higher score = higher technology acceptance
   */
  static calculateOverallScore(tamAnswers, tamVersion = 1) {
    const dimensionAverages = this.calculateDimensionAverages(tamAnswers, tamVersion);
    
    // Get all valid averages
    const validAverages = Object.values(dimensionAverages)
      .filter(v => typeof v === 'number' && !Number.isNaN(v));

    if (validAverages.length === 0) return Number.NaN;

    // Calculate mean of all dimension averages
    const meanScore = validAverages.reduce((sum, v) => sum + v, 0) / validAverages.length;

    // Normalize to 0-100 scale (Likert scale is 1-5)
    return Math.round(((meanScore - 1) / 4) * 100);
  }

  /**
   * Get comprehensive TAM analysis
   */
  static analyzeTAM(tamAnswers, tamVersion = 1) {
    if (!tamAnswers) {
      return {
        tamVersion,
        overallScore: Number.NaN,
        dimensionAverages: {},
        completionPercentage: 0,
        isComplete: false,
        totalItems: 0,
        completedItems: 0
      };
    }

    const dimensionAverages = this.calculateDimensionAverages(tamAnswers, tamVersion);
    const overallScore = this.calculateOverallScore(tamAnswers, tamVersion);
    
    // Count total and completed items
    let totalItems = 0;
    let completedItems = 0;

    const dimensions = [
      'perceivedUsefulness', 'perceivedEaseOfUse',
      ...(tamVersion >= 2 ? ['subjectiveNorm', 'image', 'jobRelevance', 'outputQuality', 'resultDemonstrability'] : []),
      ...(tamVersion >= 3 ? ['computerSelfEfficacy', 'perceptionsOfExternalControl', 'computerAnxiety', 'computerPlayfulness', 'perceivedEnjoyment', 'objectiveUsability'] : [])
    ];

    dimensions.forEach(dim => {
      if (tamAnswers[dim] && Array.isArray(tamAnswers[dim])) {
        totalItems += tamAnswers[dim].length;
        completedItems += tamAnswers[dim].filter(v => typeof v === 'number').length;
      }
    });

    const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return {
      tamVersion,
      overallScore,
      dimensionAverages,
      completionPercentage,
      isComplete: completionPercentage === 100,
      totalItems,
      completedItems,
      respondents: 1
    };
  }

  /**
   * Get interpretation of TAM score
   */
  static interpretScore(score) {
    if (Number.isNaN(score)) return "No score calculated";
    if (score >= 80) return "Very High Acceptance";
    if (score >= 60) return "High Acceptance";
    if (score >= 40) return "Moderate Acceptance";
    if (score >= 20) return "Low Acceptance";
    return "Very Low Acceptance";
  }

  /**
   * Get color for score visualization
   */
  static getScoreColor(score) {
    if (Number.isNaN(score)) return "grey";
    if (score >= 80) return "success";
    if (score >= 60) return "info";
    if (score >= 40) return "warning";
    if (score >= 20) return "error";
    return "error";
  }

  /**
   * Aggregate multiple TAM responses
   */
  static aggregateResponses(tamResponsesArray, tamVersion = 1) {
    if (!tamResponsesArray || tamResponsesArray.length === 0) {
      return {
        tamVersion,
        averageOverallScore: Number.NaN,
        dimensionAverages: {},
        respondents: 0
      };
    }

    const allAverages = {};
    const dimensions = [
      'perceivedUsefulness', 'perceivedEaseOfUse',
      ...(tamVersion >= 2 ? ['subjectiveNorm', 'image', 'jobRelevance', 'outputQuality', 'resultDemonstrability'] : []),
      ...(tamVersion >= 3 ? ['computerSelfEfficacy', 'perceptionsOfExternalControl', 'computerAnxiety', 'computerPlayfulness', 'perceivedEnjoyment', 'objectiveUsability'] : [])
    ];

    // Initialize dimension totals
    dimensions.forEach(dim => {
      allAverages[dim] = [];
    });

    // Collect all dimension averages
    tamResponsesArray.forEach(response => {
      const analysis = this.analyzeTAM(response, tamVersion);
      dimensions.forEach(dim => {
        if (typeof analysis.dimensionAverages[dim] === 'number') {
          allAverages[dim].push(analysis.dimensionAverages[dim]);
        }
      });
    });

    // Calculate overall averages
    const dimensionAverages = {};
    dimensions.forEach(dim => {
      dimensionAverages[dim] = this.calculateAverage(allAverages[dim]);
    });

    // Calculate average overall score
    const overallScores = tamResponsesArray.map(r => this.calculateOverallScore(r, tamVersion));
    const validScores = overallScores.filter(s => typeof s === 'number' && !Number.isNaN(s));
    const averageOverallScore = validScores.length > 0 
      ? Math.round(validScores.reduce((sum, s) => sum + s, 0) / validScores.length)
      : Number.NaN;

    return {
      tamVersion,
      averageOverallScore,
      dimensionAverages,
      respondents: tamResponsesArray.length,
      minScore: Math.min(...validScores),
      maxScore: Math.max(...validScores),
      standardDeviation: this.calculateStandardDeviation(validScores)
    };
  }

  /**
   * Calculate standard deviation
   */
  static calculateStandardDeviation(values) {
    if (!values || values.length < 2) return Number.NaN;
    
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squareDiffs = values.map(v => Math.pow(v - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((sum, v) => sum + v, 0) / values.length;
    
    return Math.round(Math.sqrt(avgSquareDiff) * 100) / 100;
  }
}

export default TamScoreCalculator;
