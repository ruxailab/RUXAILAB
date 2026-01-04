export class TAMAnswer {
  constructor({
    version = 'tam-1',
    // TAM-1 Core Constructs (6 items each)
    perceivedUsefulness = Array(6).fill(null),
    perceivedEaseOfUse = Array(6).fill(null),

    // TAM-2 Additional Constructs
    subjectiveNorm = Array(4).fill(null),
    image = Array(3).fill(null),
    jobRelevance = Array(2).fill(null),
    outputQuality = Array(2).fill(null),
    resultDemonstrability = Array(4).fill(null),

    // TAM-3 Additional Constructs
    computerSelfEfficacy = Array(10).fill(null),
    perceptionOfExternalControl = Array(4).fill(null),
    computerAnxiety = Array(4).fill(null),
    computerPlayfulness = Array(7).fill(null),
    perceivedEnjoyment = Array(4).fill(null),
    objectiveUsability = Array(2).fill(null),
  } = {}) {
    this.version = version
    this.perceivedUsefulness = perceivedUsefulness
    this.perceivedEaseOfUse = perceivedEaseOfUse

    // TAM-2 constructs
    if (version === 'tam-2' || version === 'tam-3') {
      this.subjectiveNorm = subjectiveNorm
      this.image = image
      this.jobRelevance = jobRelevance
      this.outputQuality = outputQuality
      this.resultDemonstrability = resultDemonstrability
    }

    // TAM-3 constructs
    if (version === 'tam-3') {
      this.computerSelfEfficacy = computerSelfEfficacy
      this.perceptionOfExternalControl = perceptionOfExternalControl
      this.computerAnxiety = computerAnxiety
      this.computerPlayfulness = computerPlayfulness
      this.perceivedEnjoyment = perceivedEnjoyment
      this.objectiveUsability = objectiveUsability
    }
  }

  toFirestore() {
    const base = {
      version: this.version,
      perceivedUsefulness: this.perceivedUsefulness,
      perceivedEaseOfUse: this.perceivedEaseOfUse,
    }

    if (this.version === 'tam-2' || this.version === 'tam-3') {
      Object.assign(base, {
        subjectiveNorm: this.subjectiveNorm,
        image: this.image,
        jobRelevance: this.jobRelevance,
        outputQuality: this.outputQuality,
        resultDemonstrability: this.resultDemonstrability,
      })
    }

    if (this.version === 'tam-3') {
      Object.assign(base, {
        computerSelfEfficacy: this.computerSelfEfficacy,
        perceptionOfExternalControl: this.perceptionOfExternalControl,
        computerAnxiety: this.computerAnxiety,
        computerPlayfulness: this.computerPlayfulness,
        perceivedEnjoyment: this.perceivedEnjoyment,
        objectiveUsability: this.objectiveUsability,
      })
    }

    return base
  }

  static fromObject(data = {}) {
    return new TAMAnswer(data)
  }
}
