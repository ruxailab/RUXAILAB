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
    this.trackTime = params.trackTime ?? true
    this.useWeights = params.useWeights ?? false
    this.useFrequency = params.useFrequency ?? true
    this.useSeverity = params.useSeverity ?? true
    this.evaluatorInfo = params.evaluatorInfo ?? {
      enabled: false,
      sections: [],
    }
    this.heuristicComments = params.heuristicComments ?? {}
    this.heuristicAgentIds = params.heuristicAgentIds ?? []
  }

  toFirestore() {
    return Object.assign(super.toFirestore(), {
      testWeights: this.testWeights,
      trackTime: this.trackTime,
      useWeights: this.useWeights,
      useFrequency: this.useFrequency,
      useSeverity: this.useSeverity,
      evaluatorInfo: this.evaluatorInfo,
      heuristicComments: this.heuristicComments,
      heuristicAgentIds: this.heuristicAgentIds,
    })
  }
}
