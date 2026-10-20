import { describe, expect, it } from '@jest/globals'
import {
  buildStudyMembershipPatch,
  buildStudyMembershipRecord,
  buildStudyMembershipRemovalPatch,
  buildStudyMembershipRolePatch,
} from '../src/shared/study/studyMembershipRecord.js'

const study = {
  testTitle: 'Staff Invitation Demo Study',
  testType: 'USER',
  subType: 'USER_UNMODERATED',
  creationDate: 1700000000000,
  cooperators: [{ userDocId: 'owner' }, { userDocId: 'staff' }],
}

describe('study membership records', () => {
  it('describes the membership like the studies a user owns', () => {
    expect(
      buildStudyMembershipRecord({
        study,
        studyId: 'study-1',
        accessLevel: 3,
        now: 1700000009999,
      }),
    ).toEqual({
      testDocId: 'study-1',
      testTitle: 'Staff Invitation Demo Study',
      testType: 'USER',
      subType: 'USER_UNMODERATED',
      numberColaborators: 2,
      accessLevel: 3,
      creationDate: 1700000000000,
      updateDate: 1700000009999,
    })
  })

  it('stores the membership in the study list of the user', () => {
    const patch = buildStudyMembershipPatch(
      'study-1',
      buildStudyMembershipRecord({
        study,
        studyId: 'study-1',
        accessLevel: 3,
      }),
    )

    expect(Object.keys(patch)).toEqual(['myTests.study-1'])
  })

  it('only updates the maps that already hold the membership', () => {
    expect(
      buildStudyMembershipRolePatch('study-1', 4, { membership: true }),
    ).toEqual({ 'myTests.study-1.accessLevel': 4 })

    expect(
      buildStudyMembershipRolePatch('study-1', 4, { legacy: true }),
    ).toEqual({ 'myAnswers.study-1.accessLevel': 4 })

    expect(
      buildStudyMembershipRolePatch('study-1', 4, {
        membership: true,
        legacy: true,
      }),
    ).toEqual({
      'myTests.study-1.accessLevel': 4,
      'myAnswers.study-1.accessLevel': 4,
    })

    expect(buildStudyMembershipRolePatch('study-1', 4)).toEqual({})
  })

  it('removes the membership and keeps a participation record untouched', () => {
    const patch = buildStudyMembershipRemovalPatch('study-1')

    expect(Object.keys(patch)).toEqual(['myTests.study-1'])
    expect(patch['myTests.study-1']).toBeDefined()

    const legacyPatch = buildStudyMembershipRemovalPatch('study-1', {
      legacy: true,
    })

    expect(Object.keys(legacyPatch)).toEqual([
      'myTests.study-1',
      'myAnswers.study-1',
    ])
  })
})
