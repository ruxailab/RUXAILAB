import AIAgent, {
  AGENT_VISIBILITY,
} from '@/features/agents/models/AIAgent'

describe('AIAgent', () => {
  it('normalizes reusable agent configuration', () => {
    const agent = new AIAgent({
      name: '  Accessibility reviewer  ',
      ownerId: 'owner-1',
      sharedWith: ['user-1', 'user-1'],
      capabilities: ['review', 'review'],
      temperature: 3,
    })

    expect(agent.name).toBe('Accessibility reviewer')
    expect(agent.sharedWith).toEqual(['user-1'])
    expect(agent.capabilities).toEqual(['review'])
    expect(agent.temperature).toBe(2)
  })

  it('enforces visibility rules', () => {
    const privateAgent = new AIAgent({
      name: 'Private',
      ownerId: 'owner-1',
    })
    const sharedAgent = new AIAgent({
      name: 'Shared',
      ownerId: 'owner-1',
      visibility: AGENT_VISIBILITY.SHARED,
      sharedWith: ['user-1'],
    })
    const publicAgent = new AIAgent({
      name: 'Public',
      ownerId: 'owner-1',
      visibility: AGENT_VISIBILITY.PUBLIC,
    })

    expect(privateAgent.canBeUsedBy('owner-1')).toBe(true)
    expect(privateAgent.canBeUsedBy('user-1')).toBe(false)
    expect(sharedAgent.canBeUsedBy('user-1')).toBe(true)
    expect(publicAgent.canBeUsedBy('user-2')).toBe(true)
  })

  it('rejects incomplete agents', () => {
    expect(() => new AIAgent({ ownerId: 'owner-1' })).toThrow(
      'Agent name is required.',
    )
    expect(() => new AIAgent({ name: 'Agent' })).toThrow(
      'Agent ownerId is required.',
    )
  })
})
