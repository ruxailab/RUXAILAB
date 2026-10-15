import { mount } from '@vue/test-utils'
import TestProgressPanel from '@/shared/components/videoCall/TestProgressPanel.vue'

it('picks a task from the dropdown without restarting the task step', async () => {
  const goToStep = jest.fn()
  const goToSpecificTask = jest.fn()
  const wrapper = mount(TestProgressPanel, {
    props: {
      caller: true,
      currentStepperValue: 2,
      currentTaskIndex: 3,
      taskDropdownItems: [{ title: 'Task 4: SUS', index: 3 }],
      test: { testStructure: { userTasks: [{}, {}, {}, {}] } },
      goToStep,
      goToSpecificTask,
    },
    global: {
      stubs: {
        'v-select': {
          emits: ['update:modelValue'],
          template: `<button class="task-select" @click="$emit('update:modelValue', 3)" />`,
        },
        'v-icon': { template: '<i />' },
        'v-list-item': { template: '<div />' },
      },
    },
  })

  await wrapper.find('.task-select').trigger('click')

  expect(goToSpecificTask).toHaveBeenCalledWith(3)
  expect(goToStep).not.toHaveBeenCalled()
})
