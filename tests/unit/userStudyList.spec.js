import { buildUserStudyList } from '@/shared/utils/userStudyList'

describe('buildUserStudyList', () => {
  it('lists the study memberships and the participation records', () => {
    const list = buildUserStudyList(
      { 'study-1': { id: 'study-1', testTitle: 'Owned study' } },
      { 'study-2': { id: 'study-2', testTitle: 'Answered study' } },
    )

    expect(list).toEqual([
      { id: 'study-1', testTitle: 'Owned study' },
      { id: 'study-2', testTitle: 'Answered study' },
    ])
  })

  it('lists a study once when the user is a member and a participant of it', () => {
    const list = buildUserStudyList(
      { 'study-1': { id: 'study-1', testTitle: 'Study', accessLevel: 3 } },
      { 'study-1': { id: 'study-1', testTitle: 'Study', accessLevel: 5 } },
    )

    expect(list).toHaveLength(1)
    expect(list[0]).toMatchObject({ id: 'study-1', testTitle: 'Study' })
  })

  it('keeps the participation fields of a merged study', () => {
    const list = buildUserStudyList(
      { 'study-1': { id: 'study-1', testTitle: 'Study', accessLevel: 3 } },
      {
        'study-1': {
          id: 'study-1',
          testTitle: 'Study',
          accessLevel: 3,
          progress: 40,
          total: 2,
        },
      },
    )

    expect(list).toHaveLength(1)
    expect(list[0]).toMatchObject({
      accessLevel: 3,
      progress: 40,
      total: 2,
    })
  })

  it('returns an empty list when the user has no studies', () => {
    expect(buildUserStudyList()).toEqual([])
    expect(buildUserStudyList({}, {})).toEqual([])
  })
})
