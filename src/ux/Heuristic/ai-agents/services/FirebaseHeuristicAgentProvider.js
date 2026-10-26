import i18n from '@/app/plugins/i18n'
import { FirebaseFunctionsController } from '@/app/plugins/firebase/FirebaseFunctionsService'

export default class FirebaseHeuristicAgentProvider {
  constructor({ testId, agentId }) {
    this.testId = testId
    this.agentId = agentId
    this.responseLocale = i18n.global.locale.value
  }

  static async listModels() {
    const response =
      await FirebaseFunctionsController.callHttpsCallableFunction(
        'listAgentModels',
      )
    return response.data.models || []
  }

  async evaluate({
    page,
    questions,
    options,
    answerMode,
    studyMode,
    heuristics,
  }) {
    const response =
      await FirebaseFunctionsController.callHttpsCallableFunction(
        'evaluateHeuristicPage',
        {
          testId: this.testId,
          agentId: this.agentId,
          responseLocale: this.responseLocale,
          page,
          questions,
          options,
          answerMode,
          studyMode,
          heuristics,
        },
        { timeout: 300_000 },
      )
    return response.data.decisions
  }
}
