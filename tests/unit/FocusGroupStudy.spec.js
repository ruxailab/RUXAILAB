import FocusGroupStudy from '@/ux/FocusGroup/models/FocusGroupStudy'
import DiscussionTopic from '@/ux/FocusGroup/models/DiscussionTopic'
import FocusGroupConfig from '@/ux/FocusGroup/models/FocusGroupConfig'
import StudyAdmin from '@/shared/models/StudyAdmin'

describe('FocusGroupStudy', () => {
  it('always sets testType to FOCUS_GROUP, regardless of input', () => {
    const study = new FocusGroupStudy({ testType: 'HEURISTIC' })
    expect(study.testType).toBe('FOCUS_GROUP')
  })

  it('defaults discussionGuide to an empty array and config to defaults', () => {
    const study = new FocusGroupStudy()
    expect(study.discussionGuide).toEqual([])
    expect(study.config).toBeInstanceOf(FocusGroupConfig)
    expect(study.config.maxParticipants).toBe(8)
  })

  it('wraps raw discussion guide entries in DiscussionTopic instances', () => {
    const study = new FocusGroupStudy({
      discussionGuide: [{ id: 'topic-1', title: 'Warm-up' }],
    })
    expect(study.discussionGuide[0]).toBeInstanceOf(DiscussionTopic)
    expect(study.discussionGuide[0].title).toBe('Warm-up')
  })

  it('does not re-wrap a DiscussionTopic instance already provided', () => {
    const topic = new DiscussionTopic({ title: 'Already a topic' })
    const study = new FocusGroupStudy({ discussionGuide: [topic] })
    expect(study.discussionGuide[0]).toBe(topic)
  })

  it('does not re-wrap a FocusGroupConfig instance already provided', () => {
    const config = new FocusGroupConfig({ maxParticipants: 4 })
    const study = new FocusGroupStudy({ config })
    expect(study.config).toBe(config)
  })

  it('serializes the discussion guide and config on top of the base Study fields', () => {
    const study = new FocusGroupStudy({
      testAdmin: new StudyAdmin({ email: 'f@example.com', userDocId: 'u1' }),
      testTitle: 'My Focus Group',
      discussionGuide: [{ id: 'topic-1', title: 'Warm-up', durationMinutes: 5 }],
      config: { maxParticipants: 6 },
    })

    const data = study.toFirestore()

    expect(data.testType).toBe('FOCUS_GROUP')
    expect(data.testTitle).toBe('My Focus Group')
    expect(data.discussionGuide).toEqual([
      { id: 'topic-1', title: 'Warm-up', prompts: [], durationMinutes: 5 },
    ])
    expect(data.config).toMatchObject({ maxParticipants: 6 })
  })
})
