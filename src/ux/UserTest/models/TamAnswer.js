/**
 * TAM Answer Model
 * Stores responses for Technology Acceptance Model (TAM-1, TAM-2, TAM-3)
 */

export class TamAnswer {
  constructor({
    tamVersion = 1,
    perceivedUsefulness = [],
    perceivedEaseOfUse = [],
    attitudeTowardUsing = [],
    actualSystemUse = [],
    intentionToUse = [],
    behavioralIntention = [],
    usePatterns = [],
    subjectiveNorm = [],
    voluntariness = [],
    image = [],
    jobRelevance = [],
    outputQuality = [],
    resultDemonstrability = [],
    computerSelfEfficacy = [],
    perceptionsOfExternalControl = [],
    computerAnxiety = [],
    computerPlayfulness = [],
    perceivedEnjoyment = [],
    objectiveUsability = [],
    experience = []
  } = {}) {
    this.tamVersion = tamVersion;
    
    // TAM-1 dimensions
    this.perceivedUsefulness = perceivedUsefulness || [];
    this.perceivedEaseOfUse = perceivedEaseOfUse || [];
    this.attitudeTowardUsing = attitudeTowardUsing || [];
    this.actualSystemUse = actualSystemUse || [];
    
    // TAM-2 dimensions
    this.intentionToUse = intentionToUse || [];
    this.subjectiveNorm = subjectiveNorm || [];
    this.voluntariness = voluntariness || [];
    this.image = image || [];
    this.jobRelevance = jobRelevance || [];
    this.outputQuality = outputQuality || [];
    this.resultDemonstrability = resultDemonstrability || [];
    
    // TAM-3 core and new dimensions
    this.behavioralIntention = behavioralIntention || [];
    this.usePatterns = usePatterns || [];
    this.experience = experience || [];
    
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
      attitudeTowardUsing: filterUndefined(this.attitudeTowardUsing),
      actualSystemUse: filterUndefined(this.actualSystemUse),
      intentionToUse: filterUndefined(this.intentionToUse),
      behavioralIntention: filterUndefined(this.behavioralIntention),
      usePatterns: filterUndefined(this.usePatterns),
      subjectiveNorm: filterUndefined(this.subjectiveNorm),
      voluntariness: filterUndefined(this.voluntariness),
      image: filterUndefined(this.image),
      jobRelevance: filterUndefined(this.jobRelevance),
      outputQuality: filterUndefined(this.outputQuality),
      resultDemonstrability: filterUndefined(this.resultDemonstrability),
      computerSelfEfficacy: filterUndefined(this.computerSelfEfficacy),
      perceptionsOfExternalControl: filterUndefined(this.perceptionsOfExternalControl),
      computerAnxiety: filterUndefined(this.computerAnxiety),
      computerPlayfulness: filterUndefined(this.computerPlayfulness),
      perceivedEnjoyment: filterUndefined(this.perceivedEnjoyment),
      objectiveUsability: filterUndefined(this.objectiveUsability),
      experience: filterUndefined(this.experience)
    };
  }

  static fromFirestore(data) {
    return new TamAnswer(data);
  }
}

export default TamAnswer;
