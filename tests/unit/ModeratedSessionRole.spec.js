import { shallowMount, flushPromises } from '@vue/test-utils'
import { reactive } from 'vue'

const mockStore = { getters: {}, dispatch: jest.fn(), commit: jest.fn() }
jest.mock('vuex', () => ({ useStore: () => mockStore }))
jest.mock('vue-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useRoute: () => ({ params: { token: 'session-1' } }),
}))
jest.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key) => key }) }))
jest.mock('@/app/plugins/firebase/index', () => ({ database: {} }))
const mockUpdates = []
jest.mock('firebase/database', () => ({
  ref: (_database, path) => ({ path }),
  onValue: () => () => {},
  update: async (target, value) => {
    mockUpdates.push({ path: target?.path, value })
  },
  get: async () => ({ exists: () => false, val: () => null }),
  remove: async () => {},
}))
jest.mock('@/app/plugins/firebase/FirebaseFunctionsService', () => ({
  FirebaseFunctionsController: {},
}))
jest.mock('@/shared/services/studyLoggingRuntime', () => ({
  createStudyLoggingRuntime: () => ({
    resumeAfterConsent: () => {},
    submitted: () => {},
    destroy: () => {},
  }),
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
global.MediaStream = class {}
const ModeratedTestView =
  require('@/ux/UserTest/views/ModeratedTestView.vue').default

const mountWithSession = async (session, extraGetters = {}) => {
  mockStore.dispatch.mockResolvedValue(undefined)
  mockStore.getters = reactive({
    user: { id: 'participant', email: 'Participant@Example.test' },
    test: {
      id: 'study-1',
      testType: 'USER',
      subType: 'USER_MODERATED',
      testAdmin: { userDocId: 'owner' },
      studyRoleMap: { participant: 5 },
      cooperators: [],
      testStructure: { userTasks: [], preTest: [], postTest: [] },
    },
    currentUserTestAnswer: { userDocId: 'participant', tasks: [] },
    ...extraGetters,
    session,
    mediaUrls: {},
  })
  const wrapper = shallowMount(ModeratedTestView, {
    global: { mocks: { $t: (key) => key, $vuetify: { display: {} } } },
  })
  await flushPromises()
  return wrapper
}

let wrapper
beforeEach(() => {
  window.scrollTo = jest.fn()
})
afterEach(() => wrapper?.unmount())

it('does not treat a participant as an observer before the session loads', async () => {
  wrapper = await mountWithSession(null)

  expect(wrapper.vm.isObservator).toBe(false)
  expect(wrapper.vm.currentUserAccessLevel).toBe(5)
})

it('recognises a session participant saved without a user ID by email', async () => {
  wrapper = await mountWithSession({
    staff: [{ userDocId: 'owner', role: 'FACILITATOR' }],
    participants: [
      { userDocId: null, email: 'participant@example.test', role: 5 },
    ],
  })

  expect(wrapper.vm.isObservator).toBe(false)
  expect(wrapper.vm.isModerator).toBe(false)
  expect(wrapper.vm.currentUserAccessLevel).toBe(5)
})

it('does not re-run Start once the session has started', async () => {
  const requestFullscreen = jest.fn(async () => {})
  document.documentElement.requestFullscreen = requestFullscreen
  wrapper = await mountWithSession({
    staff: [{ userDocId: 'owner', role: 'FACILITATOR' }],
    participants: [{ userDocId: 'participant', role: 5 }],
  })
  requestFullscreen.mockClear()

  await wrapper.vm.startTest()
  await wrapper.vm.startTest()

  expect(requestFullscreen).toHaveBeenCalledTimes(1)
})

it('shares finished tasks and submission with the facilitator', async () => {
  wrapper = await mountWithSession(
    { participants: [{ userDocId: 'participant', role: 5 }] },
    {
      currentUserTestAnswer: {
        userDocId: 'participant',
        consentCompleted: true,
        preTestCompleted: true,
        postTestCompleted: true,
        tasks: [
          { attempted: true, completed: true },
          { attempted: true, completed: false },
        ],
      },
    },
  )
  mockUpdates.length = 0

  expect(wrapper.vm.completedSteps.tasks).toBe(true)
  await wrapper.vm.handleSubmit()
  await flushPromises()

  const published = mockUpdates.filter((item) => item.value?.progress).pop()
  expect(published.path).toBe('calls/study-1/participants/participant')
  expect(published.value.progress).toMatchObject({
    tasks: true,
    completion: true,
  })
})
