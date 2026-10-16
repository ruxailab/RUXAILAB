import i18n from '@/app/plugins/i18n'
import { FirebaseFunctionsController } from '@/app/plugins/firebase/FirebaseFunctionsService'
import FirebaseHeuristicAgentProvider from '@/ux/Heuristic/ai-agents/services/FirebaseHeuristicAgentProvider'

jest.mock('@/app/plugins/i18n', () => ({
  __esModule: true,
  default: { global: { locale: { value: 'es' } } },
}))
jest.mock('@/app/plugins/firebase/FirebaseFunctionsService', () => ({
  FirebaseFunctionsController: { callHttpsCallableFunction: jest.fn() },
}))

describe('Firebase heuristic agent language', () => {
  it('keeps the selected UI language for every batch in an evaluation', async () => {
    i18n.global.locale.value = 'ca'
    const provider = new FirebaseHeuristicAgentProvider({ testId: 't', agentId: 'a' })
    i18n.global.locale.value = 'en'
    FirebaseFunctionsController.callHttpsCallableFunction.mockResolvedValue({ data: { decisions: [] } })
    await provider.evaluate({ page: {}, questions: [], answerMode: 'severity' })
    expect(FirebaseFunctionsController.callHttpsCallableFunction).toHaveBeenCalledWith(
      'evaluateHeuristicPage',
      expect.objectContaining({ responseLocale: 'ca' }),
      { timeout: 300_000 },
    )
  })
})
