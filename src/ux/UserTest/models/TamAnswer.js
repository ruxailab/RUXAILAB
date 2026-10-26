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
    // Firestore cannot store undefined; retain every response position.
    const preservePositions = (arr) => {
      if (!arr || !Array.isArray(arr)) return [];
      return Array.from(arr, (value) => value ?? null);
    };

    return {
      tamVersion: this.tamVersion,
      perceivedUsefulness: preservePositions(this.perceivedUsefulness),
      perceivedEaseOfUse: preservePositions(this.perceivedEaseOfUse),
      attitudeTowardUsing: preservePositions(this.attitudeTowardUsing),
      actualSystemUse: preservePositions(this.actualSystemUse),
      intentionToUse: preservePositions(this.intentionToUse),
      behavioralIntention: preservePositions(this.behavioralIntention),
      usePatterns: preservePositions(this.usePatterns),
      subjectiveNorm: preservePositions(this.subjectiveNorm),
      voluntariness: preservePositions(this.voluntariness),
      image: preservePositions(this.image),
      jobRelevance: preservePositions(this.jobRelevance),
      outputQuality: preservePositions(this.outputQuality),
      resultDemonstrability: preservePositions(this.resultDemonstrability),
      computerSelfEfficacy: preservePositions(this.computerSelfEfficacy),
      perceptionsOfExternalControl: preservePositions(this.perceptionsOfExternalControl),
      computerAnxiety: preservePositions(this.computerAnxiety),
      computerPlayfulness: preservePositions(this.computerPlayfulness),
      perceivedEnjoyment: preservePositions(this.perceivedEnjoyment),
      objectiveUsability: preservePositions(this.objectiveUsability),
      experience: preservePositions(this.experience)
    };
  }

  static fromFirestore(data) {
    return new TamAnswer(data);
  }
}

export default TamAnswer;
