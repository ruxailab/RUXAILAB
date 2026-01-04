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
    return {
      tamVersion: this.tamVersion,
      perceivedUsefulness: this.perceivedUsefulness,
      perceivedEaseOfUse: this.perceivedEaseOfUse,
      subjectiveNorm: this.subjectiveNorm,
      image: this.image,
      jobRelevance: this.jobRelevance,
      outputQuality: this.outputQuality,
      resultDemonstrability: this.resultDemonstrability,
      computerSelfEfficacy: this.computerSelfEfficacy,
      perceptionsOfExternalControl: this.perceptionsOfExternalControl,
      computerAnxiety: this.computerAnxiety,
      computerPlayfulness: this.computerPlayfulness,
      perceivedEnjoyment: this.perceivedEnjoyment,
      objectiveUsability: this.objectiveUsability
    };
  }

  static fromFirestore(data) {
    return new TamAnswer(data);
  }
}

export default TamAnswer;
