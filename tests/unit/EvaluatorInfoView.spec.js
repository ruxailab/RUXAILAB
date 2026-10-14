import { shallowMount, flushPromises } from '@vue/test-utils'

const mockStore = {
  getters: {},
  state: {},
  dispatch: jest.fn(),
}

jest.mock('vuex', () => ({ useStore: () => mockStore }))
jest.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: 'study-1' } }),
}))
jest.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key) => key }) }))
jest.mock('@/shared/views/template/PageWrapper.vue', () => ({
  template: '<div><slot /><slot name="subtitle" /></div>',
}))
jest.mock('@/ux/Heuristic/components/EvaluatorInfoEditor.vue', () => ({
  name: 'EvaluatorInfoEditor',
  template: '<button class="autosave" @click="$emit(\'autosave\')" />',
}))

const EvaluatorInfoView =
  require('@/ux/Heuristic/views/EvaluatorInfoView.vue').default

const heuristics = [{ id: 1, title: 'Visibility of system status', questions: [] }]

beforeEach(() => {
  mockStore.dispatch.mockReset()
  mockStore.dispatch.mockResolvedValue(undefined)
  mockStore.getters = {
    test: {
      id: 'study-1',
      testType: 'HEURISTIC',
      testTitle: 'Checkout review',
      testStructure: heuristics,
      testOptions: [{ id: 'severity' }],
      testWeights: { 0: [2] },
      evaluatorInfo: { sections: [] },
    },
    heuristics: [],
    testWeights: {},
  }
  mockStore.state = {
    Tests: {
      Test: {
        testOptions: [{ id: 'severity' }],
      },
    },
  }
})

it('keeps persisted heuristics when evaluator info autosaves with an empty heuristic session', async () => {
  const wrapper = shallowMount(EvaluatorInfoView, {
    global: {
      mocks: { $t: (key) => key },
      stubs: {
        PageWrapper: {
          template: '<div><slot name="subtitle" /><slot /></div>',
        },
        'v-container': { template: '<div><slot /></div>' },
        EvaluatorInfoEditor: {
          name: 'EvaluatorInfoEditor',
          template: '<div class="editor" />',
        },
      },
    },
  })

  await wrapper
    .findComponent({ name: 'EvaluatorInfoEditor' })
    .vm.$emit('autosave')
  await flushPromises()

  const study = mockStore.dispatch.mock.calls.find(
    ([action]) => action === 'updateStudy',
  )[1]

  expect(study.testStructure).toEqual(heuristics)
  expect(study.testWeights).toEqual({ 0: [2] })
  expect(mockStore.dispatch).toHaveBeenCalledWith('getStudy', { id: 'study-1' })

  wrapper.unmount()
})
