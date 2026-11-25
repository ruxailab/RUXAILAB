import { reactive } from 'vue'
import { flushPromises, shallowMount } from '@vue/test-utils'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'

jest.mock('vue-router', () => ({ useRouter: jest.fn(), useRoute: jest.fn() }))
jest.mock('vuex', () => ({ useStore: jest.fn() }))

jest.mock('vue-i18n', () => ({
  ...jest.requireActual('vue-i18n'),
  useI18n: jest.fn(),
}))

// AdminView only hosts these as placeholders; stubbing them keeps the real
// views, Firebase and Vuetify out of the import graph.
const navbarSections = [
  'SessionsSection',
  'TemplatesSection',
  'StudiesSection',
  'CommunityStudiesSection',
  'CommunityTemplatesSection',
  'StorageSection',
  'AgentsSection',
  'CommunityAgentsSection',
]

const stubbedViews = [
  '@/features/auth/views/ProfileView.vue',
  '@/features/notifications/views/NotificationPage.vue',
  '@/features/dashboard/views/DashboardView.vue',
  ...navbarSections.map(
    (name) => `@/features/navigation/components/navbarSections/${name}.vue`,
  ),
]

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
  let AdminView
  let store
  let route
  let router
  let addListener
  let removeListener
  let errorHandler

  beforeAll(async () => {
    stubbedViews.forEach((path) =>
      jest.doMock(path, () => ({
        name: path.split('/').pop().replace('.vue', ''),
        template: '<div />',
      })),
    )
    jest.doMock('@/features/navigation/utils', () => ({
      DashboardSidebar: { name: 'DashboardSidebar', template: '<div />' },
    }))

    AdminView = (await import('@/features/navigation/views/AdminView.vue'))
      .default
  })

  beforeEach(() => {
    store = {
      getters: { sessions: [], tests: [] },
      dispatch: jest.fn().mockResolvedValue(),
    }
    useStore.mockReturnValue(store)
    route = reactive({ query: {} })
    router = {
      push: jest.fn(({ query }) => {
        route.query = query
      }),
    }
    useRouter.mockReturnValue(router)
    useRoute.mockReturnValue(route)
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

  // "View all" switches the section and the toolbar button opens the drawer.
  const expectButtonsToWork = (wrapper) => {
    expect(wrapper.vm.drawerOpen).toBe(false)
    dispatchChangeSection('studies')
    expect(router.push).toHaveBeenCalledWith({
      query: expect.objectContaining({ section: 'studies' }),
    })
    window.dispatchEvent(new Event('toggle-dashboard-drawer'))
    expect(wrapper.vm.drawerOpen).toBe(true)
  }

  // Every listener added on window was removed again, using the same handler.
  const expectListenersRemoved = () => {
    for (const event of ['change-section', 'toggle-dashboard-drawer']) {
      const added = handlersFor(addListener, event)
      expect(added).toHaveLength(1)
      expect(handlersFor(removeListener, event)).toEqual(added)
    }
  }

  it('switches section on change-section and toggles the drawer on toggle-dashboard-drawer', async () => {
    const wrapper = mountView()
    await flushPromises()

    expectButtonsToWork(wrapper)

    wrapper.unmount()
  })

  it('returns to the dashboard from the sidebar after "View all"', async () => {
    route.query = { section: 'dashboard' }
    const wrapper = mountView()
    await flushPromises()
    const sidebar = wrapper.findComponent({ name: 'DashboardSidebar' })

    dispatchChangeSection('studies')
    await flushPromises()
    expect(route.query.section).toBe('studies')
    expect(wrapper.vm.activeSection).toBe('studies')

    sidebar.vm.$emit('navigate', { sectionId: 'dashboard' })
    await flushPromises()
    expect(route.query.section).toBe('dashboard')
    expect(wrapper.vm.activeSection).toBe('dashboard')

    wrapper.unmount()
  })

  it('removes the exact listeners it registered when unmounted', async () => {
    const wrapper = mountView()
    await flushPromises()
    wrapper.unmount()

    expectListenersRemoved()
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
    expectButtonsToWork(wrapper)

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
    expectButtonsToWork(wrapper)

    wrapper.unmount()
  })

  it('leaves no listeners behind when unmounted before the fetch finishes', async () => {
    const pendingFetch = deferred()
    store.dispatch.mockReturnValue(pendingFetch.promise)

    const wrapper = mountView()
    wrapper.unmount()
    pendingFetch.resolve()
    await flushPromises()

    expectListenersRemoved()
  })
})
