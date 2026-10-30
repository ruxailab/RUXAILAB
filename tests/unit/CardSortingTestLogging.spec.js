import { flushPromises, shallowMount } from '@vue/test-utils'
import { useStore } from 'vuex'
import CardSortingTest from '@/ux/CardSorting/components/CardSortingTest.vue'
import { createStudyLoggingRuntime } from '@/shared/services/studyLoggingRuntime'

jest.mock('vue-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('vuex', () => ({
  useStore: jest.fn(),
}))

jest.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key) => key }),
}))

jest.mock('@/shared/utils/toast', () => ({
  showSuccess: jest.fn(),
  showError: jest.fn(),
  showInfo: jest.fn(),
}))

jest.mock('@/shared/composables/useStepAnnouncement', () => {
  const { ref } = jest.requireActual('vue')
  return {
    useStepAnnouncement: () => ({
      showStepAnnouncement: ref(false),
      stepAnnouncementOverlay: ref(null),
      nextStepAnnouncementTitle: ref(''),
      nextStepAnnouncementKicker: ref(''),
      safelyAnnounce: jest.fn(() => Promise.resolve()),
    }),
  }
})

jest.mock('@/app/plugins/firebase/FirebaseFunctionsService', () => ({
  FirebaseFunctionsController: { callHttpsCallableFunction: jest.fn() },
}))

jest.mock('@/shared/services/studyLoggingRuntime', () => ({
  createStudyLoggingRuntime: jest.fn(),
}))

jest.mock('@/shared/components/StudyWelcomeStep.vue', () => ({
  name: 'StudyWelcomeStep',
  emits: ['start'],
  template: '<div />',
}))

const FREE_TEXT = ['Billing card', 'My money stuff']

const test = {
  id: 'study-1',
  testType: 'CARD_SORTING',
  answersDocId: 'answer-1',
  testTitle: 'Card sorting',
  testStructure: {
    consent: 'Consent text',
    cardSorting: {
      cards: [{ id: 'card-1', title: FREE_TEXT[0] }],
      categories: [{ id: 'category-1', title: FREE_TEXT[1] }],
      options: {},
    },
  },
}

const createRuntime = () => ({
  consentAccepted: jest.fn(() => Promise.resolve()),
  resumeAfterConsent: jest.fn(() => Promise.resolve()),
  submitted: jest.fn(() => Promise.resolve()),
  cardSortStarted: jest.fn(() => Promise.resolve()),
  cardSortFinished: jest.fn(() => Promise.resolve()),
  checkpointStructuredScope: jest.fn(() => Promise.resolve()),
  seedStructuredScope: jest.fn(),
  editHandlers: { focusin: jest.fn(), input: jest.fn(), focusout: jest.fn() },
  destroy: jest.fn(),
})

const mountView = (
  answer = {},
  { dispatch, preview = false, study = test, inspectSteps = false } = {},
) => {
  useStore.mockReturnValue({
    getters: {
      user: { id: 'participant' },
      currentCardSortingAnswer: answer,
      mediaUrls: {},
    },
    dispatch: dispatch || jest.fn(() => Promise.resolve()),
  })
  return shallowMount(CardSortingTest, {
    props: { test: study, preview },
    global: {
      mocks: { $t: (key) => key },
      stubs: inspectSteps
        ? {
            PreTestStep: false,
            PostTestStep: false,
            ShowInfo: { template: '<div><slot name="content" /></div>' },
          }
        : {},
    },
  })
}

const reachConsentStep = async (wrapper) => {
  jest.useFakeTimers()
  await wrapper
    .findAll('v-btn')
    .find((button) => button.text() === 'UserTestView.actions.startTest')
    .trigger('click')
  jest.advanceTimersByTime(1000)
  jest.useRealTimers()
  await flushPromises()
  wrapper.findComponent({ name: 'StudyWelcomeStep' }).vm.$emit('start')
  await flushPromises()
}

describe('CardSortingTest activity logging', () => {
  let runtime

  beforeEach(() => {
    window.scrollTo = jest.fn()
    runtime = createRuntime()
    createStudyLoggingRuntime.mockReset().mockReturnValue(runtime)
  })

  it.each([false, true])(
    'previews every stage without allocating cards or completing answers (questionnaires: %s)',
    async (withQuestionnaires) => {
      const dispatch = jest.fn()
      const study = {
        ...test,
        testStructure: {
          ...test.testStructure,
          preTest: withQuestionnaires
            ? [{ title: 'Pre 1' }, { title: 'Pre 2' }]
            : [],
          postTest: withQuestionnaires
            ? [{ title: 'Post 1' }, { title: 'Post 2' }]
            : [],
        },
      }
      const wrapper = mountView(
        {},
        { dispatch, preview: true, study, inspectSteps: true },
      )
      await flushPromises()
      const vm = wrapper.vm
      const originalSorting = JSON.stringify(vm.localAnswer.sorting)
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
      expect(vm.start).toBe(true)
      await next()
      expect(vm.globalIndex).toBe(0)
      expect(wrapper.classes()).not.toContain('study-preview-start')
      await next()
      expect(vm.globalIndex).toBe(1)
      await next()
      if (withQuestionnaires) {
        expect(vm.globalIndex).toBe(2)
        await next()
        expect(
          wrapper.findComponent({ name: 'PreTestStep' }).vm.$.setupState.step,
        ).toBe(1)
        await next()
      }
      expect(vm.globalIndex).toBe(4)
      wrapper
        .findComponent({ name: 'CardSortingTask' })
        .vm.$emit('update:pending', 1)
      await next()
      if (withQuestionnaires) {
        expect(vm.globalIndex).toBe(5)
        await next()
        expect(
          wrapper.findComponent({ name: 'PostTestStep' }).vm.$.setupState.step,
        ).toBe(1)
        await next()
      }
      expect(wrapper.findComponent({ name: 'FinishStep' }).exists()).toBe(true)
      expect(nav().props('canNext')).toBe(false)
      await next()
      expect(vm.globalIndex).toBe(6)
      expect(vm.localAnswer.consentCompleted).toBe(false)
      expect(vm.localAnswer.preTestCompleted).toBe(false)
      expect(vm.localAnswer.postTestCompleted).toBe(false)
      expect(JSON.stringify(vm.localAnswer.sorting)).toBe(originalSorting)
      await previous()
      if (withQuestionnaires) {
        const post = wrapper.findComponent({ name: 'PostTestStep' })
        expect(post.vm.$.setupState.step).toBe(1)
        await previous()
        expect(post.vm.$.setupState.step).toBe(0)
        await previous()
      }
      expect(vm.globalIndex).toBe(4)
      while (nav().props('canPrevious')) await previous()
      expect(vm.start).toBe(true)
      expect(dispatch).not.toHaveBeenCalled()
      expect(createStudyLoggingRuntime).not.toHaveBeenCalled()
      wrapper.unmount()
    },
  )

  it('does not expose preview controls or bypass stages in Answer', async () => {
    const wrapper = mountView()
    await flushPromises()
    expect(
      wrapper.findComponent({ name: 'StudyPreviewNavigation' }).exists(),
    ).toBe(false)
    await wrapper.vm.navigatePreview(1)
    expect(wrapper.vm.start).toBe(true)
    wrapper.unmount()
  })

  it('uses temporary answers in preview without saving or logging consent and submission', async () => {
    const dispatch = jest.fn()
    const answer = {
      submitted: true,
      consentCompleted: true,
      fullName: 'Real response',
    }
    const wrapper = mountView(answer, { dispatch, preview: true })
    await flushPromises()
    expect(wrapper.vm.localAnswer.submitted).toBe(false)
    expect(wrapper.vm.fullName).toBe('')
    await reachConsentStep(wrapper)
    wrapper.findComponent({ name: 'ConsentStep' }).vm.$emit('continue')
    await flushPromises()
    expect(wrapper.vm.localAnswer.consentCompleted).toBe(true)
    wrapper.findComponent({ name: 'SubmitDialog' }).vm.$emit('submit')
    await flushPromises()
    wrapper.unmount()
    expect(dispatch).not.toHaveBeenCalled()
    expect(createStudyLoggingRuntime).not.toHaveBeenCalled()
    expect(answer).toEqual({
      submitted: true,
      consentCompleted: true,
      fullName: 'Real response',
    })
  })

  it('creates a consent-gated card sorting runtime and waits for consent', async () => {
    const wrapper = mountView()
    await flushPromises()

    expect(createStudyLoggingRuntime).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerUid: 'participant',
        studyId: 'study-1',
        studyType: 'CARD_SORTING',
        consentRequired: true,
      }),
    )
    expect(runtime.resumeAfterConsent).not.toHaveBeenCalled()
    expect(runtime.consentAccepted).not.toHaveBeenCalled()

    wrapper.unmount()
    expect(runtime.destroy).toHaveBeenCalled()
  })

  it('reports consent only after the consent answer is saved', async () => {
    const dispatch = jest.fn(() => Promise.resolve())
    const wrapper = mountView({}, { dispatch })
    await reachConsentStep(wrapper)

    wrapper.findComponent({ name: 'ConsentStep' }).vm.$emit('continue')
    await flushPromises()

    expect(dispatch).toHaveBeenCalledWith(
      'saveTestAnswer',
      expect.objectContaining({ testType: 'CARD_SORTING' }),
    )
    expect(dispatch.mock.invocationCallOrder[0]).toBeLessThan(
      runtime.consentAccepted.mock.invocationCallOrder[0],
    )
    expect(runtime.consentAccepted).toHaveBeenCalledWith(
      expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
    )
    wrapper.unmount()
  })

  it('does not report consent when saving it fails', async () => {
    const dispatch = jest.fn(() => Promise.resolve())
    const wrapper = mountView({}, { dispatch })
    await reachConsentStep(wrapper)
    dispatch.mockRejectedValueOnce(new Error('offline'))

    wrapper.findComponent({ name: 'ConsentStep' }).vm.$emit('continue')
    await flushPromises()

    expect(runtime.consentAccepted).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('logs card sorting start when entering the sorting step', async () => {
    const wrapper = mountView({ consentCompleted: true })
    await flushPromises()
    wrapper.vm.globalIndex = 4
    await flushPromises()
    expect(runtime.cardSortStarted).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it('resumes logging for a returning participant who already consented', async () => {
    const wrapper = mountView({ consentCompleted: true })
    await flushPromises()

    expect(runtime.resumeAfterConsent).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it('reports submission after a successful save and never passes answer text', async () => {
    const dispatch = jest.fn(() => Promise.resolve())
    const wrapper = mountView({ consentCompleted: true }, { dispatch })
    await flushPromises()

    wrapper.findComponent({ name: 'SubmitDialog' }).vm.$emit('submit')
    await flushPromises()

    expect(runtime.submitted).toHaveBeenCalledTimes(1)
    expect(runtime.submitted).toHaveBeenCalledWith()
    const loggingCalls = JSON.stringify([
      createStudyLoggingRuntime.mock.calls,
      runtime.consentAccepted.mock.calls,
      runtime.resumeAfterConsent.mock.calls,
      runtime.submitted.mock.calls,
    ])
    for (const text of FREE_TEXT) expect(loggingCalls).not.toContain(text)
    wrapper.unmount()
  })

  it('does not report submission when the submit save fails', async () => {
    const dispatch = jest.fn(() => Promise.reject(new Error('offline')))
    const wrapper = mountView({ consentCompleted: true }, { dispatch })
    await flushPromises()

    wrapper.findComponent({ name: 'SubmitDialog' }).vm.$emit('submit')
    await flushPromises()

    expect(runtime.submitted).not.toHaveBeenCalled()
    wrapper.unmount()
  })
})
