import { shallowMount, flushPromises } from '@vue/test-utils'
import { reactive } from 'vue'
import { showError } from '@/shared/utils/toast'

const mockStore = { getters: {}, dispatch: jest.fn(), commit: jest.fn() }
const mockRouter = { push: jest.fn() }
const mockRuntime = {
  resumeAfterConsent: jest.fn(),
  submitted: jest.fn(),
  destroy: jest.fn(),
}
jest.mock('vuex', () => ({ useStore: () => mockStore }))
jest.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => ({ params: { token: 'session-1' } }),
}))
jest.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key) => key }) }))
jest.mock('@/app/plugins/firebase/index', () => ({ database: {} }))
jest.mock('@/app/plugins/firebase/FirebaseFunctionsService', () => ({
  FirebaseFunctionsController: {},
}))
jest.mock('@/shared/services/studyLoggingRuntime', () => ({
  createStudyLoggingRuntime: () => mockRuntime,
}))
jest.mock('@/shared/utils/toast', () => ({
  showError: jest.fn(),
  showWarning: jest.fn(),
  showInfo: jest.fn(),
  showSuccess: jest.fn(),
}))
jest.mock('@/shared/utils/animations', () => ({
  animateStepAnnouncement: jest.fn(),
}))
jest.mock('@/ux/UserTest/components/steps/WelcomeStep.vue', () => ({
  template: '<div />',
}))
jest.mock('@/ux/UserTest/components/steps/ModeratorWelcomeStep.vue', () => ({
  template: '<div />',
}))
jest.mock('@/ux/UserTest/components/steps/TaskStep.vue', () => ({
  template: '<div />',
}))
jest.mock('@/shared/components/videoCall/VideoCallFactory.vue', () => ({
  template: '<div />',
}))
jest.mock('@/ux/CardSorting/components/CardSortingTask.vue', () => ({
  template: '<div />',
}))
global.MediaStream = class {}
const ModeratedTestView =
  require('@/ux/UserTest/views/ModeratedTestView.vue').default
const CardSortingTest =
  require('@/ux/CardSorting/components/CardSortingTest.vue').default

let wrapper
beforeEach(() => {
  window.scrollTo = jest.fn()
  mockStore.getters = reactive({
    user: { id: 'participant', email: 'participant@example.test' },
    test: {
      id: 'study-1',
      testType: 'USER',
      subType: 'USER_MODERATED',
      testAdmin: { userDocId: 'owner' },
      cooperators: [],
      testStructure: { userTasks: [], preTest: [], postTest: [] },
    },
    currentUserTestAnswer: {
      userDocId: 'participant',
      consentCompleted: true,
      tasks: [],
    },
    currentCardSortingAnswer: {},
    mediaUrls: {},
  })
  mockStore.dispatch.mockResolvedValue(undefined)
})
afterEach(() => wrapper?.unmount())

it('contains standalone moderated note-save rejection and does not report failed submission as submitted', async () => {
  wrapper = shallowMount(ModeratedTestView, {
    global: { mocks: { $t: (key) => key, $vuetify: { display: {} } } },
  })
  await flushPromises()
  mockStore.dispatch.mockRejectedValue(new Error('save failed'))
  await expect(wrapper.vm.saveSessionNotes()).resolves.toBeUndefined()
  expect(mockStore.commit).toHaveBeenCalledWith(
    'SET_TOAST',
    expect.objectContaining({ type: 'error' }),
  )
  await expect(wrapper.vm.handleSubmit()).resolves.toBeUndefined()
  expect(mockRuntime.submitted).not.toHaveBeenCalled()
  expect(wrapper.vm.localTestAnswer.submitted).toBe(false)
  mockStore.dispatch.mockResolvedValue(undefined)
  await wrapper.vm.handleSubmit()
  expect(mockRuntime.submitted).toHaveBeenCalledTimes(1)
})

it('routes Card Sorting progress and submission failures to existing error handling', async () => {
  wrapper = shallowMount(CardSortingTest, {
    props: { test: { ...mockStore.getters.test, testType: 'CARD_SORTING' } },
    global: { mocks: { $t: (key) => key, $vuetify: { display: {} } } },
  })
  await flushPromises()
  mockStore.dispatch.mockRejectedValue(new Error('save failed'))
  await expect(wrapper.vm.completeStep('consent')).resolves.toBeUndefined()
  expect(showError).toHaveBeenCalledWith('CardSorting.saveError')
  await expect(wrapper.vm.submit()).resolves.toBeUndefined()
  expect(wrapper.vm.localAnswer.submitted).toBe(false)
  expect(wrapper.vm.submitting).toBe(false)
  expect(mockRouter.push).not.toHaveBeenCalled()
})
