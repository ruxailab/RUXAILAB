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

jest.mock('@/shared/components/AudioRecorder.vue', () => ({
  name: 'AudioRecorder',
  template: '<div />',
}))
jest.mock('@/shared/components/ScreenRecorder.vue', () => ({
  name: 'ScreenRecorder',
  template: '<div />',
}))
jest.mock('@/shared/components/VideoRecorder.vue', () => ({
  name: 'VideoRecorder',
  template: '<div />',
}))
jest.mock('@/shared/components/ScreenShareInstructions.vue', () => ({
  name: 'ScreenShareInstructions',
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
  destroy: jest.fn(),
})

const mountView = (answer = {}, { dispatch } = {}) => {
  useStore.mockReturnValue({
    getters: {
      user: { id: 'participant' },
      currentCardSortingAnswer: answer,
      mediaUrls: {},
    },
    dispatch: dispatch || jest.fn(() => Promise.resolve()),
  })
  return shallowMount(CardSortingTest, {
    props: { test },
    global: { mocks: { $t: (key) => key } },
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
    runtime = createRuntime()
    createStudyLoggingRuntime.mockReset().mockReturnValue(runtime)
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
    const dispatch = jest.fn(() => Promise.reject(new Error('offline')))
    const wrapper = mountView({}, { dispatch })
    await reachConsentStep(wrapper)

    wrapper.findComponent({ name: 'ConsentStep' }).vm.$emit('continue')
    await flushPromises()

    expect(runtime.consentAccepted).not.toHaveBeenCalled()
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
