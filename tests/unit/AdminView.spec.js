import { flushPromises, shallowMount } from '@vue/test-utils'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import AdminView from '@/features/navigation/views/AdminView.vue'

jest.mock('vue-router', () => ({
  useRouter: jest.fn(),
  useRoute: jest.fn(),
}))

jest.mock('vuex', () => ({
  useStore: jest.fn(),
}))

jest.mock('vue-i18n', () => ({
  ...jest.requireActual('vue-i18n'),
  useI18n: jest.fn(),
}))

// AdminView only hosts these as placeholders; stubbing them keeps the real
// views, Firebase and Vuetify out of the import graph.
jest.mock('@/features/navigation/utils', () => ({
  DashboardSidebar: { name: 'DashboardSidebar', template: '<div />' },
}))

jest.mock('@/features/auth/views/ProfileView.vue', () => ({
  name: 'ProfileView',
  template: '<div />',
}))
jest.mock('@/features/notifications/views/NotificationPage.vue', () => ({
  name: 'NotificationPage',
  template: '<div />',
}))
jest.mock('@/features/dashboard/views/DashboardView.vue', () => ({
  name: 'DashboardView',
  template: '<div />',
}))

jest.mock(
  '@/features/navigation/components/navbarSections/SessionsSection.vue',
  () => ({
    name: 'SessionsSection',
    template: '<div />',
  }),
)
jest.mock(
  '@/features/navigation/components/navbarSections/TemplatesSection.vue',
  () => ({
    name: 'TemplatesSection',
    template: '<div />',
  }),
)
jest.mock(
  '@/features/navigation/components/navbarSections/StudiesSection.vue',
  () => ({
    name: 'StudiesSection',
    template: '<div />',
  }),
)
jest.mock(
  '@/features/navigation/components/navbarSections/CommunityStudiesSection.vue',
  () => ({
    name: 'CommunityStudiesSection',
    template: '<div />',
  }),
)
jest.mock(
  '@/features/navigation/components/navbarSections/CommunityTemplatesSection.vue',
  () => ({
    name: 'CommunityTemplatesSection',
    template: '<div />',
  }),
)
jest.mock(
  '@/features/navigation/components/navbarSections/StorageSection.vue',
  () => ({
    name: 'StorageSection',
    template: '<div />',
  }),
)
jest.mock(
  '@/features/navigation/components/navbarSections/AgentsSection.vue',
  () => ({
    name: 'AgentsSection',
    template: '<div />',
  }),
)
jest.mock(
  '@/features/navigation/components/navbarSections/CommunityAgentsSection.vue',
  () => ({
    name: 'CommunityAgentsSection',
    template: '<div />',
  }),
)

const deferred = () => {
  let resolve
  let reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe('AdminView window listeners', () => {
  let store
  let addListener
  let removeListener
  let errorHandler

  beforeEach(() => {
    store = {
      getters: { sessions: [], tests: [] },
      dispatch: jest.fn().mockResolvedValue(),
    }
    useStore.mockReturnValue(store)
    useRouter.mockReturnValue({ push: jest.fn() })
    useRoute.mockReturnValue({ query: {} })
    useI18n.mockReturnValue({ t: (key) => key })

    errorHandler = jest.fn()
    addListener = jest.spyOn(window, 'addEventListener')
    removeListener = jest.spyOn(window, 'removeEventListener')
  })

  afterEach(() => {
    addListener.mockRestore()
    removeListener.mockRestore()
  })

  const mountView = () =>
    shallowMount(AdminView, {
      global: { mocks: { $t: (key) => key }, config: { errorHandler } },
    })

  const handlersFor = (spy, event) =>
    spy.mock.calls.filter(([type]) => type === event).map(([, fn]) => fn)

  const dispatchChangeSection = (section) =>
    window.dispatchEvent(new CustomEvent('change-section', { detail: section }))

  it('switches section on change-section and toggles the drawer on toggle-dashboard-drawer', async () => {
    const wrapper = mountView()
    await flushPromises()

    dispatchChangeSection('studies')
    expect(wrapper.vm.activeSection).toBe('studies')

    expect(wrapper.vm.drawerOpen).toBe(false)
    window.dispatchEvent(new Event('toggle-dashboard-drawer'))
    expect(wrapper.vm.drawerOpen).toBe(true)

    wrapper.unmount()
  })

  it('removes the exact listeners it registered when unmounted', async () => {
    const wrapper = mountView()
    await flushPromises()
    wrapper.unmount()

    for (const event of ['change-section', 'toggle-dashboard-drawer']) {
      const added = handlersFor(addListener, event)
      expect(added).toHaveLength(1)
      expect(handlersFor(removeListener, event)).toEqual(added)
    }
  })

  it('does not accumulate listeners across repeated visits', async () => {
    for (let visit = 0; visit < 3; visit++) {
      const wrapper = mountView()
      await flushPromises()
      wrapper.unmount()
    }

    for (const event of ['change-section', 'toggle-dashboard-drawer']) {
      expect(handlersFor(addListener, event)).toHaveLength(3)
      expect(handlersFor(removeListener, event)).toHaveLength(3)
    }
  })

  it('wires the buttons before the initial fetch has finished', async () => {
    const pendingFetch = deferred()
    store.dispatch.mockReturnValue(pendingFetch.promise)

    const wrapper = mountView()

    // Nothing has resolved yet, but "View all" and the drawer already work.
    dispatchChangeSection('studies')
    expect(wrapper.vm.activeSection).toBe('studies')
    window.dispatchEvent(new Event('toggle-dashboard-drawer'))
    expect(wrapper.vm.drawerOpen).toBe(true)

    pendingFetch.resolve()
    await flushPromises()
    wrapper.unmount()
  })

  it('keeps the buttons working when the initial fetch fails', async () => {
    const fetchError = new Error('network down')
    store.dispatch.mockImplementation((action) =>
      action === 'fetchUserSessions'
        ? Promise.reject(fetchError)
        : Promise.resolve(),
    )

    const wrapper = mountView()
    await flushPromises()

    // The failure still surfaces through Vue's error handling...
    expect(errorHandler).toHaveBeenCalledWith(
      fetchError,
      expect.anything(),
      expect.any(String),
    )

    // ...but it no longer leaves the window listeners unregistered.
    dispatchChangeSection('studies')
    expect(wrapper.vm.activeSection).toBe('studies')
    window.dispatchEvent(new Event('toggle-dashboard-drawer'))
    expect(wrapper.vm.drawerOpen).toBe(true)

    wrapper.unmount()
  })

  it('leaves no listeners behind when unmounted before the fetch finishes', async () => {
    const pendingFetch = deferred()
    store.dispatch.mockReturnValue(pendingFetch.promise)

    const wrapper = mountView()
    wrapper.unmount()
    pendingFetch.resolve()
    await flushPromises()

    for (const event of ['change-section', 'toggle-dashboard-drawer']) {
      const added = handlersFor(addListener, event)
      expect(added).toHaveLength(1)
      expect(handlersFor(removeListener, event)).toEqual(added)
    }
  })
})
