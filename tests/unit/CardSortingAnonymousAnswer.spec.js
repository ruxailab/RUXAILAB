import { flushPromises, shallowMount } from '@vue/test-utils'
import { useStore } from 'vuex'
import { getAuth } from 'firebase/auth'
import CardSortingTest from '@/ux/CardSorting/components/CardSortingTest.vue'
import { showError, showSuccess } from '@/shared/utils/toast'

const mockAuth = { currentUser: null }

jest.mock('@/shared/components/StudyWelcomeStep.vue', () => ({
  name: 'StudyWelcomeStep',
  emits: ['start'],
  template: '<div />',
}))

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
  createStudyLoggingRuntime: jest.fn(() => null),
}))

const study = {
  id: 'study-1',
  testType: 'CARD_SORTING',
  answersDocId: 'answer-1',
  testTitle: 'Card sorting',
  testStructure: {
    consent: 'Consent text',
    cardSorting: {
      cards: [{ id: 'card-1', title: 'Card' }],
      categories: [{ id: 'category-1', title: 'Category' }],
      options: {},
    },
  },
}

const mountView = ({ user = null, answer = {} } = {}) => {
  const dispatch = jest.fn(() => Promise.resolve())
  useStore.mockReturnValue({
    getters: { user, currentCardSortingAnswer: answer, mediaUrls: {} },
    dispatch,
  })
  const wrapper = shallowMount(CardSortingTest, {
    props: { test: study, preview: false },
    global: { mocks: { $t: (key) => key } },
  })
  return { wrapper, dispatch }
}

const savedAnswers = (dispatch) =>
  dispatch.mock.calls
    .filter(([action]) => action === 'saveTestAnswer')
    .map(([, payload]) => payload)

describe('CardSortingTest answer owner', () => {
  beforeEach(() => {
    window.scrollTo = jest.fn()
    mockAuth.currentUser = null
    getAuth.mockReturnValue(mockAuth)
  })

  it('saves an anonymous participant under the anonymous account id', async () => {
    mockAuth.currentUser = { uid: 'anon-1', isAnonymous: true }
    const { wrapper, dispatch } = mountView()

    await wrapper.vm.submit()
    await flushPromises()

    const [payload] = savedAnswers(dispatch)
    expect(payload.answersDocId).toBe('answer-1')
    expect(payload.data.userDocId).toBe('anon-1')
    expect(payload.data.invited).toBe(false)
    expect(payload.data.submitted).toBe(true)
    expect(showSuccess).toHaveBeenCalledWith('CardSorting.answerSubmitted')
  })

  it('keeps saving a signed-in participant under their user id', async () => {
    mockAuth.currentUser = { uid: 'participant', isAnonymous: false }
    const { wrapper, dispatch } = mountView({ user: { id: 'participant' } })

    await wrapper.vm.submit()
    await flushPromises()

    const [payload] = savedAnswers(dispatch)
    expect(payload.data.userDocId).toBe('participant')
    expect(payload.data.invited).toBe(true)
  })

  it('reports a save error instead of a false success when nobody is signed in', async () => {
    const { wrapper, dispatch } = mountView()

    await wrapper.vm.submit()
    await flushPromises()

    expect(savedAnswers(dispatch)).toHaveLength(0)
    expect(showSuccess).not.toHaveBeenCalled()
    expect(showError).toHaveBeenCalledWith('CardSorting.saveError')
    expect(wrapper.vm.localAnswer.submitted).toBe(false)
  })
})
