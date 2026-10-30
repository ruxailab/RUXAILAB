import { flushPromises, shallowMount } from '@vue/test-utils'
import { reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import HeuristicTestView from '@/ux/Heuristic/views/HeuristicTestView.vue'
import HeuristicAnswer from '@/ux/Heuristic/models/HeuristicAnswer'
import HeuristicAnswerStep from '@/ux/Heuristic/components/steps/HeuristicAnswerStep.vue'
import HeuristicsSettings from '@/ux/Heuristic/components/HeuristicsSettings.vue'
import { FirebaseFunctionsController } from '@/app/plugins/firebase/FirebaseFunctionsService'

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

jest.mock('@/shared/utils/animations', () => ({
  animateStepAnnouncement: jest.fn(() => Promise.resolve()),
}))

jest.mock('@/app/plugins/firebase/FirebaseFunctionsService', () => ({
  FirebaseFunctionsController: {
    callHttpsCallableFunction: jest.fn(),
  },
}))

jest.mock('@/shared/components/StudyWelcomeStep.vue', () => ({
  name: 'StudyWelcomeStep',
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

const stepperItemStub = {
  props: {
    title: String,
    editable: Boolean,
    disabled: Boolean,
  },
  emits: ['click'],
  template:
    '<button :disabled="disabled || !editable" @click="$emit(\'click\')">{{ title }}</button>',
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

  it.each([false, true])(
    'browses empty heuristics, questions and final submission without validation (preview: %s)',
    async (preview) => {
      const study = {
        id: 'study-1',
        testType: 'HEURISTIC',
        testTitle: 'Study',
        testAdmin: { userDocId: 'owner' },
        testOptions: [{ text: 'Yes', value: 1 }],
        studyMode: 'detailed',
        testStructure: [
          {
            id: 0,
            title: 'First',
            questions: [
              { id: 0, title: 'Question 1' },
              { id: 1, title: 'Question 2' },
            ],
          },
          {
            id: 1,
            title: 'Second',
            questions: [
              { id: 0, title: 'Question 3' },
              { id: 1, title: 'Question 4' },
            ],
          },
        ],
      }
      const store = {
        getters: {
          test: study,
          user: { id: 'owner' },
          currentUserTestAnswer: new HeuristicAnswer({ userDocId: 'owner' }),
        },
        dispatch: jest.fn().mockResolvedValue(study),
        commit: jest.fn(),
      }
      useStore.mockReturnValue(store)
      const wrapper = shallowMount(HeuristicTestView, {
        props: { id: study.id, preview },
        global: {
          mocks: { $t: (key) => key },
          stubs: { HeuristicAnswerStep: false },
        },
      })
      await flushPromises()
      const vm = wrapper.vm
      if (!preview) {
        vm.start = false
        await flushPromises()
        expect(wrapper.find('.speed-dial-container').exists()).toBe(true)
        vm.start = true
        expect(
          wrapper.findComponent({ name: 'StudyPreviewNavigation' }).exists(),
        ).toBe(false)
        await vm.navigatePreview(1)
        expect(vm.start).toBe(true)
        wrapper.unmount()
        return
      }
      const originalAnswers = JSON.stringify(
        vm.currentUserTestAnswer.heuristicQuestions,
      )
      expect(wrapper.classes()).toContain('study-preview-start')
      const nav = () =>
        wrapper.findComponent({ name: 'StudyPreviewNavigation' })
      const next = async () => {
        nav().vm.$emit('next')
        await flushPromises()
      }
      const previous = async () => {
        nav().vm.$emit('previous')
        await flushPromises()
      }
      expect(nav().props('canPrevious')).toBe(false)
      await previous()
      expect(vm.previewStepIndex).toBe(0)
      await next()
      expect(vm.previewStepIndex).toBe(1)
      expect(wrapper.classes()).not.toContain('study-preview-start')
      await next()
      expect(
        wrapper.findComponent({ name: 'HeuristicCardsStep' }).exists(),
      ).toBe(true)
      expect(wrapper.find('.speed-dial-container').exists()).toBe(false)
      await next()
      const answer = () =>
        wrapper.findComponent(HeuristicAnswerStep).vm.$.setupState
      expect(vm.heurisIndex).toBe(0)
      expect(answer().currentQuestionIndex).toBe(0)
      await next()
      expect(answer().currentQuestionIndex).toBe(1)
      await previous()
      expect(answer().currentQuestionIndex).toBe(0)
      await next()
      await next()
      expect(vm.heurisIndex).toBe(1)
      expect(answer().currentQuestionIndex).toBe(0)
      await next()
      expect(answer().currentQuestionIndex).toBe(1)
      await next()
      expect(wrapper.findComponent({ name: 'FinishStep' }).exists()).toBe(true)
      expect(vm.calculatedProgress).toBe(0)
      expect(nav().props('canNext')).toBe(false)
      await next()
      expect(vm.previewStepIndex).toBe(5)
      await previous()
      expect(vm.heurisIndex).toBe(1)
      expect(answer().currentQuestionIndex).toBe(1)
      await previous()
      await previous()
      expect(vm.heurisIndex).toBe(0)
      expect(answer().currentQuestionIndex).toBe(1)
      while (nav().props('canPrevious')) await previous()
      expect(vm.start).toBe(true)
      expect(vm.previewStepIndex).toBe(0)
      expect(JSON.stringify(vm.currentUserTestAnswer.heuristicQuestions)).toBe(
        originalAnswers,
      )
      jest.runOnlyPendingTimers()
      expect(store.dispatch.mock.calls.map(([action]) => action)).toEqual([
        'getStudy',
      ])
      expect(
        FirebaseFunctionsController.callHttpsCallableFunction,
      ).not.toHaveBeenCalled()
      wrapper.unmount()
    },
  )

  it('discards preview answers without reading, autosaving, submitting or logging real responses', async () => {
    const savedAnswer = new HeuristicAnswer({
      userDocId: 'owner',
      submitted: true,
      progress: 100,
      heuristicQuestions: [
        {
          heuristicId: 0,
          heuristicQuestions: [{ heuristicComment: 'Real response' }],
        },
      ],
    })
    const original = JSON.stringify(savedAnswer)
    const study = {
      id: 'study-1',
      testType: 'HEURISTIC',
      testTitle: 'Study',
      testAdmin: { userDocId: 'owner' },
      testOptions: [{ text: 'Yes', value: 1 }],
      studyMode: 'detailed',
      useFrequency: false,
      useSeverity: false,
      testStructure: [
        {
          id: 0,
          title: 'Heuristic',
          questions: [{ id: 0, title: 'Question' }],
        },
      ],
    }
    const store = {
      getters: {
        test: study,
        user: { id: 'owner' },
        currentUserTestAnswer: savedAnswer,
      },
      dispatch: jest.fn().mockResolvedValue(study),
      commit: jest.fn(),
    }
    useStore.mockReturnValue(store)
    const listener = jest.spyOn(window, 'addEventListener')
    const wrapper = shallowMount(HeuristicTestView, {
      props: { id: study.id, preview: true },
      global: { mocks: { $t: (key) => key } },
    })
    await flushPromises()
    expect(wrapper.vm.currentUserTestAnswer.submitted).toBe(false)
    expect(
      wrapper.vm.currentUserTestAnswer.heuristicQuestions[0]
        .heuristicQuestions[0].heuristicComment,
    ).toBe('')
    expect(
      listener.mock.calls.some(([event]) => event === 'beforeunload'),
    ).toBe(false)
    wrapper.vm.updateHeuristicAnswer(0, 0, {
      mode: 'customOptions',
      value: 1,
      text: 'Yes',
    })
    expect(wrapper.vm.calculatedProgress).toBe(100)
    jest.advanceTimersByTime(2000)
    await wrapper.vm.autoSaveAnswer()
    await wrapper.vm.manualSaveAnswer()
    await wrapper.vm.submitAnswer()
    expect(useRouter().push).toHaveBeenCalledWith('/heuristic/manager/study-1')
    window.dispatchEvent(new Event('beforeunload'))
    wrapper.unmount()
    jest.runOnlyPendingTimers()
    await flushPromises()
    expect(store.dispatch.mock.calls.map(([action]) => action)).toEqual([
      'getStudy',
    ])
    expect(
      FirebaseFunctionsController.callHttpsCallableFunction,
    ).not.toHaveBeenCalled()
    expect(JSON.stringify(savedAnswer)).toBe(original)
    listener.mockRestore()
  })

  it('keeps custom option value and timestamp when emitting answer payloads', async () => {
    const wrapper = shallowMount(HeuristicAnswerStep, {
      props: {
        heuristic: {
          id: 'h1',
          title: 'Heuristic 1',
          questions: [{ id: 0, title: 'Q1', descriptions: [{ text: 'Desc' }] }],
        },
        heuristics: [{ id: 'h1', title: 'Heuristic 1' }],
        heurisIndex: 0,
        currentUserTestAnswer: {
          heuristicQuestions: [{ heuristicQuestions: [{}] }],
          submitted: false,
        },
        test: {
          useFrequency: false,
          useSeverity: false,
          testOptions: [{ text: 'Moderate', value: 2 }],
        },
      },
      global: {
        mocks: {
          $t: (key) => key,
        },
        stubs: {
          ShowInfo: { template: '<div><slot name="content" /></div>' },
          HelpBtn: true,
          HeuristicOptionsAnalysisSection: true,
          HeuristicCommentEvidenceSection: true,
          HeuristicImageEvidenceSection: true,
          'v-icon': true,
          'v-btn': buttonStub,
          'v-divider': true,
        },
      },
    })

    wrapper.vm.updateCustomOptionAnswer(0, { text: 'Moderate', value: 2 })

    const emitted = wrapper.emitted('update-answer')?.slice(-1)?.[0]?.[1]
    expect(emitted).toMatchObject({
      custom: { text: 'Moderate', value: 2 },
      value: 2,
      text: 'Moderate',
    })
    expect(emitted.custom.timestamp).toBeDefined()
  })

  it('handles non-array question descriptions without crashing', () => {
    const wrapper = shallowMount(HeuristicAnswerStep, {
      props: {
        heuristic: {
          id: 'h1',
          title: 'Heuristic 1',
          questions: [{ id: 0, title: 'Q1', descriptions: { text: 'Desc' } }],
        },
        heuristics: [{ id: 'h1', title: 'Heuristic 1' }],
        heurisIndex: 0,
        currentUserTestAnswer: {
          heuristicQuestions: [{ heuristicQuestions: [{}] }],
          submitted: false,
        },
        test: {
          useFrequency: false,
          useSeverity: false,
          testOptions: [{ text: 'Moderate', value: 2 }],
        },
      },
      global: {
        mocks: {
          $t: (key) => key,
        },
        stubs: {
          ShowInfo: { template: '<div><slot name="content" /></div>' },
          HelpBtn: true,
          HeuristicOptionsAnalysisSection: true,
          HeuristicCommentEvidenceSection: true,
          HeuristicImageEvidenceSection: true,
          'v-icon': true,
          'v-btn': buttonStub,
          'v-divider': true,
        },
      },
    })

    expect(() =>
      wrapper.vm.questionDescription({ descriptions: { text: 'Desc' } }),
    ).not.toThrow()
    expect(
      wrapper.vm.questionDescription({ descriptions: { text: 'Desc' } }),
    ).toBe('Desc')
  })

  it('infers legacy study mode from options and weights', async () => {
    const store = {
      getters: reactive({
        test: {
          useWeights: false,
          useFrequency: undefined,
          useSeverity: undefined,
          testOptions: [{ text: 'Moderate', value: 2 }],
          trackTime: true,
        },
        testAnswerDocument: {},
      }),
      state: {
        Tests: {
          Test: {
            useWeights: false,
            useFrequency: undefined,
            useSeverity: undefined,
            testOptions: [{ text: 'Moderate', value: 2 }],
            trackTime: true,
          },
        },
      },
      dispatch: jest.fn().mockResolvedValue(),
      commit: jest.fn(),
    }

    useStore.mockReturnValue(store)

    const wrapper = shallowMount(HeuristicsSettings, {
      props: { isTemplate: false },
      global: {
        stubs: {
          'v-card': true,
          'v-card-title': true,
          'v-card-item': true,
          'v-card-subtitle': true,
          'v-card-text': true,
          'v-divider': true,
          'v-radio-group': true,
          'v-row': true,
          'v-col': true,
          'v-radio': true,
          'v-switch': true,
          'v-file-input': true,
          'v-btn': buttonStub,
          'v-alert': true,
          'v-dialog': true,
          'v-icon': true,
        },
      },
    })

    expect(wrapper.vm.studyMode).toBe('detailed')

    store.getters.test = {
      ...store.getters.test,
      useWeights: true,
      useFrequency: false,
      useSeverity: false,
      testOptions: [],
    }
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.studyMode).toBe('weights')

    store.getters.test = {
      ...store.getters.test,
      studyMode: 'detailed',
      useWeights: false,
      useFrequency: true,
      useSeverity: true,
    }
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.studyMode).toBe('detailed')
  })

  it.each([
    { saveFails: false, hasOptions: true, previouslyStarted: false },
    { saveFails: true, hasOptions: true, previouslyStarted: false },
    { saveFails: false, hasOptions: false, previouslyStarted: false },
    { saveFails: false, hasOptions: false, previouslyStarted: true },
  ])(
    'validates initialization and resume: options=$hasOptions, started=$previouslyStarted, saveFails=$saveFails',
    async ({ saveFails, hasOptions, previouslyStarted }) => {
      const answerRequest = deferred()
      const study = {
        id: 'study-1',
        answersDocId: 'answers-1',
        testType: 'HEURISTIC',
        studyMode: 'detailed',
        useFrequency: false,
        useSeverity: false,
        testTitle: 'Heuristic study',
        testDescription: 'Study description',
        testAdmin: { userDocId: 'admin-1' },
        testOptions: hasOptions ? [{ text: 'Yes', value: 1 }] : [],
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
        currentUserTestAnswer: new HeuristicAnswer({
          userDocId: 'user-1',
          testStarted: previouslyStarted,
        }),
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
          if (action === 'saveTestAnswer' && saveFails)
            return Promise.reject(
              Object.assign(new Error('save failed'), {
                code: 'permission-denied',
              }),
            )
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
            'v-list-item': {
              template: '<div><slot name="prepend" /><slot /></div>',
            },
            'v-list-item-title': { template: '<div><slot /></div>' },
            'v-navigation-drawer': {
              template: '<div><slot /><slot name="append" /></div>',
            },
            'v-layout': { template: '<div><slot /></div>' },
            'v-main': { template: '<main><slot /></main>' },
            'v-tooltip': {
              template:
                '<div><slot name="activator" :props="{}" /><slot /></div>',
            },
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
            'v-stepper': { template: '<div><slot /></div>' },
            'v-stepper-header': { template: '<div><slot /></div>' },
            'v-stepper-item': stepperItemStub,
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
        store.dispatch.mock.calls.some(
          ([action]) => action === 'saveTestAnswer',
        ),
      ).toBe(false)

      answerRequest.resolve()
      await flushPromises()

      const readyStartButton = findButton(
        wrapper,
        'HeuristicsTestView.actions.startTest',
      )
      if (!hasOptions) {
        expect(wrapper.vm.testDisabledReason).toBe('no-answer-options')
        expect(wrapper.vm.currentPage).toBe('welcome_page')
        await wrapper.vm.startTest()
        await wrapper.vm.navigateToStep(2)
        expect(wrapper.vm.start).toBe(true)
        expect(wrapper.vm.currentPage).toBe('welcome_page')
        expect(
          store.dispatch.mock.calls.some(
            ([action]) => action === 'saveTestAnswer',
          ),
        ).toBe(false)
        wrapper.unmount()
        return
      }

      expect(readyStartButton.attributes('disabled')).toBeUndefined()
      await expect(readyStartButton.trigger('click')).resolves.toBeUndefined()
      jest.advanceTimersByTime(1000)
      await flushPromises()

      const instructionsStep = wrapper.findComponent({
        name: 'StudyWelcomeStep',
      })
      expect(instructionsStep.exists()).toBe(true)
      instructionsStep.vm.$emit('start')
      await flushPromises()

      wrapper.vm.showHeuristicCards = false
      const activeIndex = wrapper.vm.index
      const instructionsButton = findButton(
        wrapper,
        'HeuristicsTestView.flow.instructions',
      )
      expect(instructionsButton).toBeDefined()
      await instructionsButton.trigger('click')
      await flushPromises()

      expect(wrapper.vm.currentPage).toBe('instructions_page')
      expect(wrapper.vm.start).toBe(true)

      const reopenedInstructions = wrapper.findComponent({
        name: 'StudyWelcomeStep',
      })
      reopenedInstructions.vm.$emit('start')
      await flushPromises()

      expect(wrapper.vm.start).toBe(false)
      expect(wrapper.vm.showHeuristicCards).toBe(false)
      expect(wrapper.vm.index).toBe(activeIndex)

      jest.advanceTimersByTime(1500)
      await flushPromises()

      const saveCall = store.dispatch.mock.calls.find(
        ([action]) => action === 'saveTestAnswer',
      )
      expect(saveCall).toBeDefined()
      expect(saveCall[1].data).toBeInstanceOf(HeuristicAnswer)
      expect(typeof saveCall[1].data.toFirestore).toBe('function')
      const answer = wrapper.vm.currentUserTestAnswer
      answer.heuristicQuestions[0].heuristicQuestions[0].heuristicComment =
        'Keep this note'
      const stepButton = (step) =>
        findButton(wrapper, `HeuristicsTestView.flow.${step}`)
      expect(stepButton('finalSubmission').attributes('disabled')).toBeDefined()
      await stepButton('instructions').trigger('click')
      await flushPromises()
      expect(wrapper.findComponent({ name: 'StudyWelcomeStep' }).exists()).toBe(
        true,
      )
      expect(wrapper.vm.heuristicStepperValue).toBe(1)
      wrapper.findComponent({ name: 'StudyWelcomeStep' }).vm.$emit('start')
      await flushPromises()
      expect(wrapper.vm.showHeuristicCards).toBe(false)
      expect(wrapper.vm.heuristicStepperValue).toBe(2)
      expect(
        answer.heuristicQuestions[0].heuristicQuestions[0].heuristicComment,
      ).toBe('Keep this note')

      wrapper.vm.calculatedProgress = 100
      await wrapper.vm.$nextTick()
      await stepButton('finalSubmission').trigger('click')
      expect(wrapper.vm.heuristicStepperValue).toBe(3)
      await stepButton('instructions').trigger('click')
      await flushPromises()
      wrapper.findComponent({ name: 'StudyWelcomeStep' }).vm.$emit('start')
      await flushPromises()
      expect(wrapper.vm.heuristicStepperValue).toBe(2)
      expect(wrapper.vm.review).toBe(true)

      if (saveFails) {
        expect(wrapper.vm.saveStatusMessage).toContain('permission-denied')
        jest.advanceTimersByTime(5000)
        await flushPromises()
        expect(wrapper.vm.saveStatusMessage).toContain('permission-denied')
        expect(wrapper.vm.saveStatusType).toBe('error')
        expect(wrapper.vm.autoSaveInProgress).toBe(false)
        await expect(wrapper.vm.manualSaveAnswer()).resolves.toBeUndefined()
        expect(wrapper.vm.saveStatusType).toBe('error')
        await expect(wrapper.vm.submitAnswer()).resolves.toBeUndefined()
        expect(getters.currentUserTestAnswer.submitted).toBe(false)
        expect(useRouter().push).not.toHaveBeenCalled()
      }

      wrapper.unmount()
    },
  )
})
