import { flushPromises, shallowMount } from '@vue/test-utils'
import { reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import HeuristicTestView from '@/ux/Heuristic/views/HeuristicTestView.vue'
import HeuristicAnswer from '@/ux/Heuristic/models/HeuristicAnswer'

jest.mock('vue-router', () => ({
  useRouter: jest.fn(),
  useRoute: jest.fn(),
}))

jest.mock('vuex', () => ({
  useStore: jest.fn(),
}))

jest.mock('vue-i18n', () => ({
  useI18n: jest.fn(),
}))

jest.mock('@/shared/utils/toast', () => ({
  showSuccess: jest.fn(),
  showError: jest.fn(),
}))

jest.mock('@/app/plugins/firebase/FirebaseFunctionsService', () => ({
  FirebaseFunctionsController: {
    callHttpsCallableFunction: jest.fn(),
  },
}))

jest.mock('@/ux/Heuristic/components/HeuristicInstructionsStep.vue', () => ({
  name: 'HeuristicInstructionsStep',
  props: ['disabled'],
  emits: ['start'],
  template: '<div />',
}))

jest.mock('@/ux/Heuristic/components/AddCommentBtn.vue', () => ({
  name: 'AddCommentBtn',
  template: '<div><slot name="answer" /></div>',
}))

jest.mock('@/ux/Heuristic/components/QuestionHelpBtn.vue', () => ({
  name: 'QuestionHelpBtn',
  template: '<button />',
}))

jest.mock('@/ux/Heuristic/components/EvaluatorInfoDisplay.vue', () => ({
  name: 'EvaluatorInfoDisplay',
  template: '<div />',
}))

const deferred = () => {
  let resolve
  const promise = new Promise((resolvePromise) => {
    resolve = resolvePromise
  })
  return { promise, resolve }
}

const buttonStub = {
  inheritAttrs: false,
  emits: ['click'],
  template:
    '<button v-bind="$attrs" @click="$emit(\'click\', $event)"><slot /></button>',
}

const findButton = (wrapper, text) =>
  wrapper.findAll('button').find((button) => button.text().includes(text))

describe('HeuristicTestView', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    useRouter.mockReturnValue({ push: jest.fn() })
    useRoute.mockReturnValue({ params: {} })
    useI18n.mockReturnValue({ t: (key) => key })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('waits for answer initialization before starting and auto-saving', async () => {
    const answerRequest = deferred()
    const study = {
      id: 'study-1',
      answersDocId: 'answers-1',
      testType: 'HEURISTIC',
      testTitle: 'Heuristic study',
      testDescription: 'Study description',
      testAdmin: { userDocId: 'admin-1' },
      testOptions: [{ text: 'Yes', value: 1 }],
      testStructure: [
        {
          id: 0,
          title: 'Visibility of system status',
          total: 1,
          questions: [{ id: 0, title: 'Does the system show its status?' }],
        },
      ],
      cooperators: [],
      evaluatorInfo: { sections: [] },
      trackTime: false,
    }
    const getters = reactive({
      test: study,
      user: { id: 'user-1' },
      heuristics: [],
      currentUserTestAnswer: new HeuristicAnswer({ userDocId: 'user-1' }),
    })
    const store = {
      getters,
      state: { Tests: { Test: study } },
      commit: jest.fn(),
      dispatch: jest.fn((action) => {
        if (action === 'getStudy') {
          getters.test = { ...study }
          store.state.Tests.Test = getters.test
          return Promise.resolve(getters.test)
        }
        if (action === 'getCurrentTestAnswerDoc') {
          return answerRequest.promise
        }
        return Promise.resolve()
      }),
    }
    useStore.mockReturnValue(store)

    const wrapper = shallowMount(HeuristicTestView, {
      props: { id: 'study-1', token: '' },
      global: {
        mocks: {
          $t: (key) => key,
        },
        stubs: {
          Snackbar: true,
          ShowInfo: { template: '<div><slot name="content" /></div>' },
          TextClamp: true,
          'v-btn': buttonStub,
          'v-dialog': { template: '<div><slot /></div>' },
          'v-card': { template: '<div><slot /></div>' },
          'v-card-actions': { template: '<div><slot /></div>' },
          'v-card-text': { template: '<div><slot /></div>' },
          'v-card-title': { template: '<div><slot /></div>' },
          'v-container': { template: '<div><slot /></div>' },
          'v-row': { template: '<div><slot /></div>' },
          'v-col': { template: '<div><slot /></div>' },
          'v-list': { template: '<div><slot /></div>' },
          'v-list-item': { template: '<div><slot name="prepend" /><slot /></div>' },
          'v-list-item-title': { template: '<div><slot /></div>' },
          'v-navigation-drawer': { template: '<div><slot /><slot name="append" /></div>' },
          'v-layout': { template: '<div><slot /></div>' },
          'v-main': { template: '<main><slot /></main>' },
          'v-tooltip': { template: '<div><slot name="activator" :props="{}" /><slot /></div>' },
          'v-progress-circular': true,
          'v-progress-linear': true,
          'v-progress': true,
          'v-divider': true,
          'v-icon': true,
          'v-img': true,
          'v-select': true,
          'v-alert': true,
          'v-avatar': true,
          'v-spacer': true,
          'v-speed-dial': true,
          'v-stepper': true,
          'v-stepper-header': true,
          'v-stepper-item': true,
        },
      },
    })

    await flushPromises()

    const startButton = findButton(
      wrapper,
      'HeuristicsTestView.actions.startTest',
    )
    expect(startButton).toBeDefined()
    await expect(startButton.trigger('click')).resolves.toBeUndefined()
    expect(startButton.attributes('disabled')).toBeDefined()
    expect(
      store.dispatch.mock.calls.some(([action]) => action === 'saveTestAnswer'),
    ).toBe(false)

    answerRequest.resolve()
    await flushPromises()

    const readyStartButton = findButton(
      wrapper,
      'HeuristicsTestView.actions.startTest',
    )
    expect(readyStartButton.attributes('disabled')).toBeUndefined()
    await expect(readyStartButton.trigger('click')).resolves.toBeUndefined()

    jest.advanceTimersByTime(1000)
    await flushPromises()

    const instructionsStep = wrapper.findComponent({
      name: 'HeuristicInstructionsStep',
    })
    expect(instructionsStep.exists()).toBe(true)
    instructionsStep.vm.$emit('start')
    await flushPromises()

    jest.advanceTimersByTime(1500)
    await flushPromises()

    const saveCall = store.dispatch.mock.calls.find(
      ([action]) => action === 'saveTestAnswer',
    )
    expect(saveCall).toBeDefined()
    expect(saveCall[1].data).toBeInstanceOf(HeuristicAnswer)
    expect(typeof saveCall[1].data.toFirestore).toBe('function')

    wrapper.unmount()
  })
})
