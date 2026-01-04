/**
 * TAM Answer Model
 * Stores responses for Technology Acceptance Model (TAM-1, TAM-2, TAM-3)
 */

export class TamAnswer {
  constructor({
    tamVersion = 1,
    perceivedUsefulness = [],
    perceivedEaseOfUse = [],
    subjectiveNorm = [],
    image = [],
    jobRelevance = [],
    outputQuality = [],
    resultDemonstrability = [],
    computerSelfEfficacy = [],
    perceptionsOfExternalControl = [],
    computerAnxiety = [],
    computerPlayfulness = [],
    perceivedEnjoyment = [],
    objectiveUsability = []
  } = {}) {
    this.tamVersion = tamVersion;
    
    // TAM-1 dimensions
    this.perceivedUsefulness = perceivedUsefulness || [];
    this.perceivedEaseOfUse = perceivedEaseOfUse || [];
    
    // TAM-2 additional dimensions
    this.subjectiveNorm = subjectiveNorm || [];
    this.image = image || [];
    this.jobRelevance = jobRelevance || [];
    this.outputQuality = outputQuality || [];
    this.resultDemonstrability = resultDemonstrability || [];
    
    // TAM-3 additional dimensions
    this.computerSelfEfficacy = computerSelfEfficacy || [];
    this.perceptionsOfExternalControl = perceptionsOfExternalControl || [];
    this.computerAnxiety = computerAnxiety || [];
    this.computerPlayfulness = computerPlayfulness || [];
    this.perceivedEnjoyment = perceivedEnjoyment || [];
    this.objectiveUsability = objectiveUsability || [];
  }

  toFirestore() {
    // Helper function to filter out undefined values from arrays
    const filterUndefined = (arr) => {
      if (!arr || !Array.isArray(arr)) return [];
      return arr.filter(val => val !== undefined && val !== null);
    };

    return {
      tamVersion: this.tamVersion,
      perceivedUsefulness: filterUndefined(this.perceivedUsefulness),
      perceivedEaseOfUse: filterUndefined(this.perceivedEaseOfUse),
      subjectiveNorm: filterUndefined(this.subjectiveNorm),
      image: filterUndefined(this.image),
      jobRelevance: filterUndefined(this.jobRelevance),
      outputQuality: filterUndefined(this.outputQuality),
      resultDemonstrability: filterUndefined(this.resultDemonstrability),
      computerSelfEfficacy: filterUndefined(this.computerSelfEfficacy),
      perceptionsOfExternalControl: filterUndefined(this.perceptionsOfExternalControl),
      computerAnxiety: filterUndefined(this.computerAnxiety),
      computerPlayfulness: filterUndefined(this.computerPlayfulness),
      perceivedEnjoyment: filterUndefined(this.perceivedEnjoyment),
      objectiveUsability: filterUndefined(this.objectiveUsability)
    };
  }

  static fromFirestore(data) {
    return new TamAnswer(data);
  }
}

export default TamAnswer;
