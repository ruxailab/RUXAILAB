import DiscussionTopic from '@/ux/FocusGroup/models/DiscussionTopic'

describe('DiscussionTopic', () => {
  it('fills in defaults and generates an id when constructed empty', () => {
    const topic = new DiscussionTopic()
    expect(topic.id).toMatch(/^topic-/)
    expect(topic.title).toBe('')
    expect(topic.prompts).toEqual([])
    expect(topic.durationMinutes).toBe(5)
  })

  it('generates unique ids', () => {
    const a = DiscussionTopic.generateId()
    const b = DiscussionTopic.generateId()
    expect(a).not.toBe(b)
  })

  it('round-trips through Firestore', () => {
    const topic = new DiscussionTopic({
      id: 'topic-1',
      title: 'Warm-up',
      prompts: ['What did you notice first?'],
      durationMinutes: 10,
    })
    const restored = DiscussionTopic.fromFirestore(topic.toFirestore())

    expect(restored.id).toBe('topic-1')
    expect(restored.title).toBe('Warm-up')
    expect(restored.prompts).toEqual(['What did you notice first?'])
    expect(restored.durationMinutes).toBe(10)
  })
})
