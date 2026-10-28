import { flushPromises, shallowMount } from '@vue/test-utils'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import TestView from '@/views/public/TestView.vue'
import { showError } from '@/shared/utils/toast'

jest.mock('vue-router', () => ({
  useRouter: jest.fn(),
  useRoute: jest.fn(),
}))

jest.mock('vuex', () => ({
  useStore: jest.fn(),
}))

jest.mock('@/shared/utils/toast', () => ({
  showError: jest.fn(),
}))

jest.mock('@/ux/UserTest/views/UserTestView.vue', () => ({
  name: 'UserTestView',
  template: '<div />',
}))

jest.mock('@/ux/UserTest/views/ModeratedTestView.vue', () => ({
  name: 'ModeratedTestView',
  template: '<div />',
}))

jest.mock('@/ux/Heuristic/views/HeuristicTestView.vue', () => ({
  name: 'HeuristicTestView',
  template: '<div />',
}))

jest.mock('@/ux/CardSorting/components/CardSortingTest.vue', () => ({
  name: 'CardSortingTest',
  template: '<div />',
}))

const mockAnonymousParticipant = jest.fn()
jest.mock('@/features/auth/controllers/AuthController', () => ({
  __esModule: true,
  default: class {
    anonymousParticipant(...args) {
      return mockAnonymousParticipant(...args)
    }
  },
}))

const mountTestView = ({ store, router, route, props = {} }) =>
  shallowMount(TestView, {
    props: {
      id: 'study-1',
      token: null,
      ...props,
    },
    global: {
      stubs: {
        'v-container': { template: '<div><slot /></div>' },
        'v-row': { template: '<div><slot /></div>' },
        'v-col': { template: '<div><slot /></div>' },
        'v-alert': { template: '<div><slot /></div>' },
        'v-card': { template: '<div><slot /></div>' },
        'v-card-actions': { template: '<div><slot /></div>' },
        'v-card-text': { template: '<div><slot /></div>' },
        'v-card-title': { template: '<div><slot /></div>' },
        'v-btn': { template: '<button><slot /></button>' },
        'v-progress-circular': true,
        'v-spacer': true,
      },
    },
  })

describe('TestView', () => {
  let store
  let router
  let route

  beforeEach(() => {
    store = {
      dispatch: jest.fn().mockResolvedValue(null),
      getters: {
        test: null,
        user: {
          id: 'user-1',
          accessLevel: 1,
        },
      },
    }

    router = {
      currentRoute: {
        value: {
          fullPath: '/testview/study-1',
        },
      },
      replace: jest.fn().mockResolvedValue(undefined),
    }

    route = {
      query: {},
    }

    useStore.mockReturnValue(store)
    useRouter.mockReturnValue(router)
    useRoute.mockReturnValue(route)

    showError.mockClear()
  })

  it('shows no-access feedback and redirects when the study cannot be loaded', async () => {
    const wrapper = mountTestView({
      store,
      router,
      route,
    })

    await flushPromises()

    expect(store.dispatch).toHaveBeenCalledWith('getStudy', {
      id: 'study-1',
    })

    expect(showError).toHaveBeenCalledWith('AccessNotAllowed.noAccess')

    expect(router.replace).toHaveBeenCalledWith('/admin')

    expect(wrapper.text()).toContain(
      "You do not have access to the page you're trying to access.",
    )
  })

  describe('invitation links', () => {
    const useInvite = (invite) => {
      store.getters.user = null
      route.query = { inviteToken: 'open-link' }
      store.dispatch.mockImplementation(async (action) =>
        action === 'loadPendingInvite' ? invite : null,
      )
    }
    const actions = () => store.dispatch.mock.calls.map(([action]) => action)

    it('joins anonymously through a link that does not require login before loading the study', async () => {
      useInvite({ studyId: 'study-1', requiredLogin: false })
      mockAnonymousParticipant.mockResolvedValue({ uid: 'anon-1' })

      mountTestView({ store, router, route })
      await flushPromises()

      expect(store.dispatch).toHaveBeenCalledWith('acceptStudyCollaboration', {
        studyId: 'study-1',
        cooperator: { id: 'anon-1', email: null },
        membershipType: 'participant',
        inviteToken: 'open-link',
      })
      expect(actions().indexOf('acceptStudyCollaboration')).toBeLessThan(
        actions().indexOf('getStudy'),
      )
    })

    it('does not sign in anonymously for a link that requires login', async () => {
      useInvite({ studyId: 'study-1', requiredLogin: true })

      mountTestView({ store, router, route })
      await flushPromises()

      expect(mockAnonymousParticipant).not.toHaveBeenCalled()
      expect(actions()).not.toContain('acceptStudyCollaboration')
    })
  })
})
