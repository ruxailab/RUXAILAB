import { shallowMount } from '@vue/test-utils'
import ChatCoverage from '@/ux/FocusGroup/components/analytics/ChatCoverage.vue'

const translations = {
  'focusGroup.analytics.chatCoverageCount': ({ responded, total }) =>
    `${responded} of ${total} participants responded in chat`,
  'focusGroup.analytics.chatCoverageMissing': ({ names }) => `No chat response recorded: ${names}`,
  'focusGroup.analytics.chatCoverageAllResponded': () =>
    'Every participant has a recorded chat response',
  'focusGroup.analytics.noTopicParticipation': () =>
    'No participant chat messages are available for this session.',
  'focusGroup.modules.untitledTopic': () => 'Untitled topic',
}

function mountCoverage({ topics, participants, matrix }) {
  return shallowMount(ChatCoverage, {
    props: { topics, participants, matrix },
    global: {
      mocks: {
        $t: (key, params) => translations[key]?.(params) ?? key,
      },
      stubs: {
        'v-progress-linear': true,
      },
    },
  })
}

describe('ChatCoverage', () => {
  it('shows chat response coverage and names participants without a recorded response', () => {
    const wrapper = mountCoverage({
      topics: [{ id: 'topic-1', title: 'First impressions' }],
      participants: [{ id: 'p1', name: 'Ari' }, { id: 'p2', name: 'Bo' }],
      matrix: { 'topic-1': { p1: 2, p2: 0 } },
    })

    expect(wrapper.text()).toContain('1 of 2 participants responded in chat')
    expect(wrapper.text()).toContain('No chat response recorded: Bo')
    expect(wrapper.text()).not.toContain('2 chat messages')
  })

  it('indicates complete coverage and handles a session without participants', () => {
    const covered = mountCoverage({
      topics: [{ id: 'topic-1', title: 'First impressions' }],
      participants: [{ id: 'p1', name: 'Ari' }],
      matrix: { 'topic-1': { p1: 1 } },
    })
    expect(covered.text()).toContain('Every participant has a recorded chat response')

    const empty = mountCoverage({ topics: [{ id: 'topic-1' }], participants: [], matrix: {} })
    expect(empty.text()).toContain('No participant chat messages are available for this session.')
  })
})
