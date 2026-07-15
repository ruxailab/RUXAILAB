import { flushPromises, shallowMount } from '@vue/test-utils'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import TestView from '@/views/public/TestView.vue'
import { showError } from '@/shared/utils/toast'
import { getStudyInvitation } from '@/shared/services/studyMembershipService'

jest.mock('vue-router', () => ({
  useRouter: jest.fn(),
}))

jest.mock('vuex', () => ({
  useStore: jest.fn(),
}))

jest.mock('@/shared/utils/toast', () => ({
  showError: jest.fn(),
}))

jest.mock('@/shared/services/studyMembershipService', () => ({
  getStudyInvitation: jest.fn(),
  manageStudyMembership: jest.fn(),
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

const mountTestView = ({ store, router, props = {} }) =>
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

  beforeEach(() => {
    store = {
      dispatch: jest.fn().mockResolvedValue(undefined),
      getters: {
        test: null,
        user: { id: 'user-1', accessLevel: 1 },
      },
    }
    router = {
      currentRoute: { value: { fullPath: '/testview/study-1' } },
      replace: jest.fn().mockResolvedValue(undefined),
    }

    useStore.mockReturnValue(store)
    useRouter.mockReturnValue(router)
    showError.mockClear()
    getStudyInvitation.mockClear()
  })

  it('shows no-access feedback and redirects instead of rendering a blank page', async () => {
    const wrapper = mountTestView({ store, router })

    await flushPromises()

    expect(store.dispatch).toHaveBeenCalledWith('getStudy', { id: 'study-1' })
    expect(getStudyInvitation).not.toHaveBeenCalled()
    expect(showError).toHaveBeenCalledWith('AccessNotAllowed.noAccess')
    expect(router.replace).toHaveBeenCalledWith('/admin')
    expect(wrapper.text()).toContain(
      "You do not have access to the page you're trying to access.",
    )
  })
})
