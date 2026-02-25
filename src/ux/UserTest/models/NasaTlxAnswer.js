export class NasaTlxAnswer {
  constructor({
    mentalDemand = null,
    physicalDemand = null,
    temporalDemand = null,
    performance = null,
    effort = null,
    frustration = null,
  } = {}) {
    this.mentalDemand = mentalDemand
    this.physicalDemand = physicalDemand
    this.temporalDemand = temporalDemand
    this.performance = performance
    this.effort = effort
    this.frustration = frustration
  }

  toFirestore() {
    return {
      mentalDemand: this.mentalDemand,
      physicalDemand: this.physicalDemand,
      temporalDemand: this.temporalDemand,
      performance: this.performance,
      effort: this.effort,
      frustration: this.frustration,
    }
  }

  static fromObject(data = {}) {
    return new NasaTlxAnswer(data)
  }
}
