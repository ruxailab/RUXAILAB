import { shallowMount } from '@vue/test-utils'

const mockStore = {
  getters: {},
  dispatch: jest.fn(),
  commit: jest.fn(),
  state: { Tests: { Test: { testStructure: { userTasks: [] } } } },
}

jest.mock('vuex', () => ({ useStore: () => mockStore }))
jest.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key) => key }) }))
jest.mock('@/app/plugins/firebase', () => ({ db: {} }))
jest.mock('@/app/plugins/firebase/FirebaseFunctionsService', () => ({
  FirebaseFunctionsController: {
    callHttpsCallableFunction: jest.fn(),
  },
}))

import StudyController from '@/controllers/StudyController'
import StudyStoreModule from '@/store/modules/Study'
import { FirebaseFunctionsController } from '@/app/plugins/firebase/FirebaseFunctionsService'

const callHttpsCallableFunction =
  FirebaseFunctionsController.callHttpsCallableFunction

const ListTasks = require('@/ux/UserTest/components/ListTasks.vue').default

const vuetify = {
  display: {},
  theme: { current: { colors: { 'on-surface': '#000000' } } },
}

const dataTableStub = {
  name: 'v-data-table',
  props: ['items'],
  template: '<div class="data-table" />',
}

const mountListTasks = () =>
  shallowMount(ListTasks, {
    global: {
      mocks: { $t: (key) => key, $vuetify: vuetify },
      stubs: { 'v-data-table': dataTableStub },
    },
  })

describe('concurrent study edits', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    callHttpsCallableFunction.mockResolvedValue({ data: { status: 'updated' } })
    mockStore.getters = { 'UserStudy/tasks': [] }
    mockStore.state = { Tests: { Test: { testStructure: { userTasks: [] } } } }
  })

  it('sends the snapshot the editor based its changes on to the server', async () => {
    const controller = new StudyController()
    const base = { testTitle: 'Study', testStructure: { userTasks: [] } }

    await controller.updateStudy(
      {
        id: 'study-1',
        toFirestore: () => ({ testTitle: 'Study', testStructure: {} }),
      },
      base,
    )

    expect(callHttpsCallableFunction).toHaveBeenCalledWith(
      'updateStudyWithAudit',
      {
        studyId: 'study-1',
        study: { testTitle: 'Study', testStructure: {} },
        base,
      },
    )
  })

  it('does not send a base snapshot when the editor has none', async () => {
    const controller = new StudyController()

    await controller.updateStudy({
      id: 'study-1',
      toFirestore: () => ({ testTitle: 'Study' }),
    })

    expect(callHttpsCallableFunction).toHaveBeenCalledWith(
      'updateStudyWithAudit',
      {
        studyId: 'study-1',
        study: { testTitle: 'Study' },
      },
    )
  })

  it('passes the base snapshot through the store action', async () => {
    const updateStudy = jest.fn().mockResolvedValue({ status: 'updated' })
    const study = { id: 'study-1', toFirestore: () => ({ testTitle: 'Study' }) }
    const base = { testTitle: 'Study', testStructure: { userTasks: [] } }
    jest
      .spyOn(StudyController.prototype, 'updateStudy')
      .mockImplementation((...args) => updateStudy(...args))

    await StudyStoreModule.actions.updateStudy({ commit: jest.fn() }, { study, base })

    expect(updateStudy).toHaveBeenCalledWith(study, base)
  })

  it('keeps the task list of the store instead of a stale copy', async () => {
    const storedTasks = [{ taskName: 'Original task', taskType: 'no-answer' }]
    mockStore.getters = { 'UserStudy/tasks': storedTasks }

    const wrapper = mountListTasks()
    const table = wrapper.findComponent({ name: 'v-data-table' })
    expect(table.props('items')).toEqual(storedTasks)

    // Another admin adds a task while this editor is open: the list follows
    // the store instead of keeping the tasks of the loaded study.
    storedTasks.push({ taskName: 'Task added by owner', taskType: 'no-answer' })
    await wrapper.vm.$nextTick()
    expect(table.props('items')).toEqual(storedTasks)
  })

  it('saves the whole task list when a task is added', async () => {
    const storedTasks = [{ taskName: 'Original task', taskType: 'no-answer' }]
    mockStore.getters = { 'UserStudy/tasks': storedTasks }

    const wrapper = mountListTasks()

    wrapper.findComponent({ name: 'FormDialog' }).vm.$emit('addTask', {
      toFirestore: () => ({ taskName: 'Task added by admin' }),
    })
    await wrapper.vm.$nextTick()

    expect(mockStore.dispatch).toHaveBeenCalledWith('UserStudy/setTasks', [
      { taskName: 'Original task', taskType: 'no-answer' },
      { taskName: 'Task added by admin' },
    ])
  })
})
