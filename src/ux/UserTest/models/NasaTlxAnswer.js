export class NasaTlxAnswer {
    constructor({
        mentalDemand = 50,
        physicalDemand = 50,
        temporalDemand = 50,
        performance = 50,
        effort = 50,
        frustration = 50,
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
