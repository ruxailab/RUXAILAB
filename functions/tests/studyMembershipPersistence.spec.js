import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals'
import { admin } from '../src/core/firebase/f.firebase.js'
import { manageStudyMembership } from '../src/https/studyMembership.js'

// A Study Membership is the association an accepted invitation creates. It
// belongs to the study list of the user (`myTests`), not to the participation
// records (`myAnswers`). These tests run the real callable against the
// Firestore emulator.

const projectId = 'demo-ruxailab-membership-persistence'
let ownedAdminApp
jest.setTimeout(30000)

const db = () => admin.firestore()

const as = (uid, data) => ({
  auth: {
    uid,
    token: {
      email: `${uid}@example.test`,
      firebase: { sign_in_provider: 'password' },
    },
  },
  data,
})

const accept = (uid, data = {}) =>
  manageStudyMembership.run(
    as(uid, {
      studyId: 'study-1',
      action: 'accept',
      membershipType: 'cooperator',
      ...data,
    }),
  )

const remove = (uid, data = {}) =>
  manageStudyMembership.run(
    as(uid, {
      studyId: 'study-1',
      action: 'remove',
      membershipType: 'cooperator',
      ...data,
    }),
  )

const userDoc = async (uid) => (await db().doc(`users/${uid}`).get()).data()

// Accepts the pending invitation of the staff member without going through
// the callable, for the cases that only need an accepted membership.
const acceptStaffMembership = async () => {
  const study = (await db().doc('tests/study-1').get()).data()

  await db()
    .doc('tests/study-1')
    .update({
      cooperators: study.cooperators.map((cooperator) => ({
        ...cooperator,
        userDocId: 'staff',
        accepted: true,
        status: 'accepted',
      })),
      studyRoleMap: { owner: 0, staff: 3 },
    })
}

beforeAll(async () => {
  if (!admin.apps.length) ownedAdminApp = admin.initializeApp({ projectId })
})

afterAll(async () => {
  if (ownedAdminApp) await ownedAdminApp.delete()
})

beforeEach(async () => {
  await db().recursiveDelete(db().collection('tests'))
  await db().recursiveDelete(db().collection('users'))
  await db()
    .doc('tests/study-1')
    .set({
      testType: 'USER',
      subType: 'USER_UNMODERATED',
      testTitle: 'Staff Invitation Demo Study',
      answersDocId: 'answers-1',
      isPublic: false,
      creationDate: 1700000000000,
      testAdmin: { userDocId: 'owner', email: 'owner@example.test' },
      cooperators: [
        {
          userDocId: null,
          email: 'staff@example.test',
          accessLevel: 3,
          accepted: false,
          status: 'pending',
          token: 'staff-token',
        },
      ],
      studyRoleMap: { owner: 0 },
    })
  await db()
    .doc('users/owner')
    .set({ email: 'owner@example.test', accessLevel: 1 })
  await db()
    .doc('users/staff')
    .set({
      email: 'staff@example.test',
      accessLevel: 1,
      myTests: {},
      myAnswers: {},
    })
})

describe('accepting a staff invitation', () => {
  it('adds the study to the study list of the member', async () => {
    await accept('staff', { targetEmail: 'staff@example.test' })

    const staff = await userDoc('staff')

    expect(staff.myTests['study-1']).toMatchObject({
      testDocId: 'study-1',
      testTitle: 'Staff Invitation Demo Study',
      testType: 'USER',
      subType: 'USER_UNMODERATED',
      accessLevel: 3,
      creationDate: 1700000000000,
    })

    // The membership is not a participation record.
    expect(staff.myAnswers).toEqual({})
  })

  it('grants the study role of the membership', async () => {
    await accept('staff', { targetEmail: 'staff@example.test' })

    const study = (await db().doc('tests/study-1').get()).data()

    expect(study.studyRoleMap.staff).toBe(3)
    expect(study.cooperators[0]).toMatchObject({
      userDocId: 'staff',
      accepted: true,
      status: 'accepted',
    })
  })

  it('keeps the membership when the role of the member changes', async () => {
    await accept('staff', { targetEmail: 'staff@example.test' })

    await manageStudyMembership.run(
      as('owner', {
        studyId: 'study-1',
        action: 'assignRole',
        membershipType: 'cooperator',
        targetUserId: 'staff',
        role: 4,
      }),
    )

    const staff = await userDoc('staff')

    expect(staff.myTests['study-1'].accessLevel).toBe(4)
  })
})

describe('removing a staff membership', () => {
  it('removes the study from the study list of the member', async () => {
    await accept('staff', { targetEmail: 'staff@example.test' })

    await remove('owner', { targetUserId: 'staff' })

    const staff = await userDoc('staff')

    expect(staff.myTests['study-1']).toBeUndefined()
    expect(staff.myAnswers['study-1']).toBeUndefined()
  })

  it('removes a membership that older releases stored as participation', async () => {
    await acceptStaffMembership()
    await db()
      .doc('users/staff')
      .set(
        { myAnswers: { 'study-1': { accessLevel: 3, progress: 0 } } },
        { merge: true },
      )

    await remove('owner', { targetUserId: 'staff' })

    const staff = await userDoc('staff')

    expect(staff.myAnswers['study-1']).toBeUndefined()
  })

  it('keeps the participation record of a member who also takes part', async () => {
    await acceptStaffMembership()
    await db()
      .doc('users/staff')
      .set(
        { myAnswers: { 'study-1': { accessLevel: 5, progress: 40 } } },
        { merge: true },
      )
    await db()
      .doc('tests/study-1/participants/p1')
      .set({
        userDocId: 'staff',
        accessLevel: 5,
        accepted: true,
        status: 'accepted',
      })

    await remove('owner', { targetUserId: 'staff' })

    const staff = await userDoc('staff')

    expect(staff.myAnswers['study-1']).toMatchObject({ progress: 40 })
  })
})
