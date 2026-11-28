import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'

let mockStore

// Stands in for vuedraggable: it renders one row per item and lets the test
// emit the same `change` event vuedraggable emits when a drag ends
const mockDraggable = {
  name: 'Draggable',
  props: ['modelValue', 'disabled', 'handle', 'itemKey', 'tag', 'ghostClass'],
  emits: ['change'],
  template: `
    <div class="draggable" :data-disabled="disabled">
      <template v-for="element in modelValue" :key="element.index">
        <slot name="item" :element="element" />
      </template>
    </div>
  `,
}

jest.mock('vuedraggable', () => ({ __esModule: true, default: mockDraggable }))
jest.mock('vuex', () => ({ useStore: () => mockStore }))
jest.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key) => key }) }))
jest.mock('@/ux/UserTest/components/FormDialog.vue', () => ({
  name: 'FormDialog',
  render: () => null,
}))

const ListTasks = require('@/ux/UserTest/components/ListTasks.vue').default

let currentPage = 1

// Like v-data-table, it hands the rows of the current page to the #tbody slot
const DataTableStub = {
  props: ['items', 'itemsPerPage'],
  computed: {
    internalItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      return this.items
        .map((raw, index) => ({ raw, index }))
        .slice(start, start + this.itemsPerPage)
    },
  },
  template: `
    <div>
      <slot
        name="tbody"
        :internalItems="internalItems"
        :page="currentPage"
        :itemsPerPage="itemsPerPage"
      />
    </div>
  `,
  data: () => ({ currentPage }),
}

const DataTableRowStub = {
  props: ['item'],
  template: `
    <div class="task-row">
      <span class="task-name">{{ item.raw.taskName }}</span>
      <slot name="item.drag" :item="item.raw" />
      <slot name="item.actions" :item="item.raw" />
    </div>
  `,
}

const SlotStub = { template: '<div><slot /></div>' }

const makeTasks = (count) =>
  Array.from({ length: count }, (_, i) => ({ taskName: `Task ${i + 1}` }))

const mountList = async ({ isTemplate = false, tasks, page = 1 } = {}) => {
  currentPage = page
  mockStore = {
    state: {
      Tests: {
        Test: {
          testStructure: {
            userTasks: tasks ?? makeTasks(3),
          },
        },
      },
    },
    getters: { 'UserStudy/tasks': [] },
    dispatch: jest.fn(() => Promise.resolve()),
  }

  const wrapper = mount(ListTasks, {
    props: { isTemplate },
    global: {
      mocks: {
        $t: (key) => key,
        $vuetify: { theme: { current: { colors: {} } } },
      },
      stubs: {
        'v-data-table': DataTableStub,
        'v-data-table-row': DataTableRowStub,
        'v-btn': SlotStub,
        'v-icon': SlotStub,
        'v-row': SlotStub,
        'v-col': SlotStub,
        'v-card': SlotStub,
        'v-card-title': SlotStub,
        'v-card-text': SlotStub,
        'v-dialog': true,
        'v-card-actions': true,
        'v-chip': true,
        'v-divider': true,
        'v-spacer': true,
      },
    },
  })
  // ListTasks loads the tasks in onMounted, so wait for the next render
  await nextTick()
  return wrapper
}

const taskNames = (wrapper) =>
  wrapper.findAll('.task-name').map((name) => name.text())

const dropTask = async (wrapper, oldIndex, newIndex) => {
  wrapper
    .findComponent(mockDraggable)
    .vm.$emit('change', { moved: { oldIndex, newIndex } })
  await nextTick()
}

const savedNames = () =>
  mockStore.dispatch.mock.calls[0][1].map((task) => task.taskName)

describe('ListTasks drag and drop reordering', () => {
  it('moves a dragged task to its new position and saves the new order', async () => {
    const wrapper = await mountList()

    await dropTask(wrapper, 0, 2)

    expect(taskNames(wrapper)).toEqual(['Task 2', 'Task 3', 'Task 1'])
    expect(mockStore.dispatch).toHaveBeenCalledTimes(1)
    expect(mockStore.dispatch).toHaveBeenCalledWith(
      'UserStudy/setTasks',
      expect.any(Array),
    )
    expect(savedNames()).toEqual(['Task 2', 'Task 3', 'Task 1'])
    expect(wrapper.emitted('change')).toHaveLength(1)
  })

  it('maps positions on page 2 to positions in the full task list', async () => {
    const wrapper = await mountList({ tasks: makeTasks(12), page: 2 })
    expect(taskNames(wrapper)).toEqual(['Task 11', 'Task 12'])

    // Drag the 2nd row of page 2 (Task 12) above the 1st row (Task 11)
    await dropTask(wrapper, 1, 0)

    expect(savedNames().slice(9)).toEqual(['Task 10', 'Task 12', 'Task 11'])
    expect(wrapper.emitted('change')).toHaveLength(1)
  })

  it('does nothing when a task is dropped where it started', async () => {
    const wrapper = await mountList()

    await dropTask(wrapper, 1, 1)

    expect(taskNames(wrapper)).toEqual(['Task 1', 'Task 2', 'Task 3'])
    expect(mockStore.dispatch).not.toHaveBeenCalled()
    expect(wrapper.emitted('change')).toBeUndefined()
  })

  it('ignores positions outside the task list', async () => {
    const wrapper = await mountList()

    await dropTask(wrapper, 0, 3)
    await dropTask(wrapper, -1, 0)

    expect(taskNames(wrapper)).toEqual(['Task 1', 'Task 2', 'Task 3'])
    expect(mockStore.dispatch).not.toHaveBeenCalled()
    expect(wrapper.emitted('change')).toBeUndefined()
  })

  it('shows a drag handle on every task', async () => {
    const wrapper = await mountList()

    const handles = wrapper.findAll('.task-drag-handle')
    expect(handles).toHaveLength(3)
    expect(handles[0].attributes('title')).toBe(
      'UserTestTable.buttons.dragToReorder',
    )
    expect(
      wrapper.findComponent(mockDraggable).attributes('data-disabled'),
    ).toBe('false')
  })

  it('does not reorder tasks in a template', async () => {
    const wrapper = await mountList({ isTemplate: true })

    expect(wrapper.findAll('.task-drag-handle')).toHaveLength(0)
    expect(
      wrapper.findComponent(mockDraggable).attributes('data-disabled'),
    ).toBe('true')

    await dropTask(wrapper, 0, 2)

    expect(taskNames(wrapper)).toEqual(['Task 1', 'Task 2', 'Task 3'])
    expect(mockStore.dispatch).not.toHaveBeenCalled()
    expect(wrapper.emitted('change')).toBeUndefined()
  })
})
