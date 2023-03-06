/**
* Create a HeuristicAnswer.
* @param {Object[]} heuristicQuestions  - An array of HeuristicQuestionAnswer value.
* @param {number} progress - The progress value.
* @param {number} total - The total value.
* @param {boolean} submitted - The submitted value.
* @param {Object} userDoc - An object with the user doc id and email.
* @param {string} lastUpdate - The date of the last update.
* @param {boolean} visibility - If the heuristicAnswer is visible or not.
*/

import Heuristic from "@/models/Heuristic";

export default class HeuristicAnswer {
    constructor({
        heuristicQuestions,
        progress,
        total,
        submitted,
        userDoc,
        lastUpdate,
        visibility
    } = {}
    ) {
        this.heuristicQuestions = heuristicQuestions ?? [];
        this.progress = progress ?? 0;
        this.total = total ?? 0;
        this.submitted = submitted ?? false;
        this.userDoc = userDoc ?? null;
        this.lastUpdate = lastUpdate ?? null;
        this.visibility = visibility ?? true;
    }
    static toHeuristicAnswer(data) {
        return new HeuristicAnswer({
            ...data,
            heuristicQuestions: data.heuristicQuestions.map((h) => Heuristic.toHeuristic(h))
        })
    }

    toFirestore() {
        return {
            heuristicQuestions: this.heuristicQuestions.map((h) => h.toFirestore()),
            progress: this.progress,
            total: this.total,
            submitted: this.submitted,
            userDoc: this.userDoc,
            lastUpdate: (new Date).toISOString(),
            visibility: this.visibility,
        }
    }
}