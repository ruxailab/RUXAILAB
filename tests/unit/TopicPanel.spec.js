import { mount } from '@vue/test-utils'
import TopicPanel from '@/ux/FocusGroup/components/session/TopicPanel.vue'

jest.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key) => key }),
}))

const VBtnStub = {
  emits: ['click'],
  template: '<button type="button" @click="$emit(\'click\')"><slot /></button>',
}

describe('Focus Group TopicPanel', () => {
  const prompt = 'What would you improve about the checkout experience?'
  const topic = { title: 'Shopping', prompts: [prompt] }

  const createWrapper = (currentPromptText = '') =>
    mount(TopicPanel, {
      props: {
        topic,
        isFacilitator: true,
        currentPromptText,
      },
      global: {
        stubs: {
          'v-btn': VBtnStub,
          'v-card': { template: '<div><slot /></div>' },
          'v-chip': { template: '<span><slot /></span>' },
          'v-icon': { template: '<span><slot /></span>' },
        },
      },
    })

  it('surfaces a prompt and replaces Ask with the Asked confirmation', async () => {
    const wrapper = createWrapper()

    expect(wrapper.find('.prompt-row__ask').text()).toBe(
      'focusGroup.session.ask',
    )

    await wrapper.find('.prompt-row__ask').trigger('click')
    expect(wrapper.emitted('ask')).toEqual([[prompt]])

    await wrapper.setProps({ currentPromptText: prompt })
    expect(wrapper.find('.prompt-row__ask').exists()).toBe(false)
    expect(wrapper.find('.prompt-row__asked').text()).toBe(
      'focusGroup.session.asked',
    )
  })
})
