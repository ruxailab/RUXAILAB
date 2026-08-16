import {
  splitIntoGroups,
  reassignParticipant,
} from '@/ux/FocusGroup/utils/breakoutGroups'

describe('splitIntoGroups', () => {
  it('splits evenly when participants divide cleanly by the group count', () => {
    const groups = splitIntoGroups(['a', 'b', 'c', 'd'], 2)
    expect(Object.keys(groups)).toEqual(['group-1', 'group-2'])
    expect(groups['group-1'].participantIds).toEqual(['a', 'c'])
    expect(groups['group-2'].participantIds).toEqual(['b', 'd'])
  })

  it('spreads the remainder round-robin when it does not divide evenly', () => {
    const groups = splitIntoGroups(['a', 'b', 'c', 'd', 'e'], 2)
    expect(groups['group-1'].participantIds).toEqual(['a', 'c', 'e'])
    expect(groups['group-2'].participantIds).toEqual(['b', 'd'])
  })

  it('clamps the group count to the number of participants (no empty groups)', () => {
    const groups = splitIntoGroups(['a', 'b'], 5)
    expect(Object.keys(groups)).toHaveLength(2)
    Object.values(groups).forEach((group) => {
      expect(group.participantIds.length).toBeGreaterThan(0)
    })
  })

  it('clamps to at least one group even with no participants', () => {
    const groups = splitIntoGroups([], 3)
    expect(Object.keys(groups)).toEqual(['group-1'])
    expect(groups['group-1'].participantIds).toEqual([])
  })

  it('clamps a group count below 1', () => {
    const groups = splitIntoGroups(['a', 'b'], 0)
    expect(Object.keys(groups)).toHaveLength(1)
  })
})

describe('reassignParticipant', () => {
  const baseGroups = () => ({
    'group-1': { name: 'Group 1', participantIds: ['a', 'b'] },
    'group-2': { name: 'Group 2', participantIds: ['c'] },
  })

  it('moves a participant from one group to another', () => {
    const next = reassignParticipant(baseGroups(), 'a', 'group-2')
    expect(next['group-1'].participantIds).toEqual(['b'])
    expect(next['group-2'].participantIds).toEqual(['c', 'a'])
  })

  it('does not mutate the input groups object', () => {
    const original = baseGroups()
    reassignParticipant(original, 'a', 'group-2')
    expect(original['group-1'].participantIds).toEqual(['a', 'b'])
  })

  it('leaves the participant unassigned when the target group does not exist', () => {
    const next = reassignParticipant(baseGroups(), 'a', 'nonexistent')
    expect(next['group-1'].participantIds).toEqual(['b'])
    expect(next['group-2'].participantIds).toEqual(['c'])
  })

  it('is a no-op when reassigning to the same group', () => {
    const next = reassignParticipant(baseGroups(), 'a', 'group-1')
    expect(next['group-1'].participantIds).toEqual(['b', 'a'])
  })
})
