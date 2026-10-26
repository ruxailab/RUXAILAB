import { FirebaseFunctionsController } from '@/app/plugins/firebase/FirebaseFunctionsService'

export default class AgentModelProvider {
  static async listModels() {
    const response =
      await FirebaseFunctionsController.callHttpsCallableFunction(
        'listAgentModels',
      )
    return response.data.models || []
  }
}
