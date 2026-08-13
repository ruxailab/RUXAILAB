import { FirebaseFunctionsController } from '@/app/plugins/firebase/FirebaseFunctionsService'

export default class FirebaseHeuristicAgentProvider {
  constructor({ testId, agentId }) {
    this.testId = testId
    this.agentId = agentId
  }

  static async listModels() {
    const response =
      await FirebaseFunctionsController.callHttpsCallableFunction(
        'listAgentModels',
      )
    return response.data.models || []
  }

  async evaluate({ page, questions, options, answerMode }) {
    const response =
      await FirebaseFunctionsController.callHttpsCallableFunction(
        'evaluateHeuristicPage',
        {
          testId: this.testId,
          agentId: this.agentId,
          page,
          questions,
          options,
          answerMode,
        },
        { timeout: 300_000 },
      )
    return response.data.decisions
  }
}
