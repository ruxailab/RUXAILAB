import { STUDY_TYPES } from '@/shared/constants/methodDefinitions'
import Study from '../../../shared/models/Study'
/**
 * Create a Heuristic.
 * @param {Object[]} heuristics  - An array of HeuristicQuestion value.
 */

export default class HeuristicStudy extends Study {
  constructor(params = {}) {
    super(params)

    this.testType = STUDY_TYPES.HEURISTIC
    this.testWeights = params.testWeights ?? {}
  }

  toFirestore() {
    return Object.assign(super.toFirestore(), {
      testWeights: this.testWeights,
    })
  }
}
