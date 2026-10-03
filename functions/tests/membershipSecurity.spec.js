import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals'
import { initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { admin } from '../src/core/firebase/f.firebase.js'
import { manageStudyMembership } from '../src/https/studyMembership.js'
import { generateInvitationLink } from '../src/https/invite.js'

// Runs the real callables against the Firestore emulator. Joining a study must
// always go through an invitation created by someone allowed to invite, and
// the granted role must come from that invitation, never from the request.

const projectId = 'demo-ruxailab-membership'
let testEnv
let ownedAdminApp
jest.setTimeout(30000)

const db = () => admin.firestore()
const studyRoles = async () =>
  (await db().doc('tests/study-1').get()).data().studyRoleMap || {}

const as = (uid, data, { email, anonymous = false } = {}) => ({
  auth: {
    uid,
    token: {
      ...(email ? { email } : {}),
      firebase: { sign_in_provider: anonymous ? 'anonymous' : 'password' },
    },
  },
  data,
})

const accept = (uid, data, options) =>
  manageStudyMembership.run(
    as(uid, { studyId: 'study-1', action: 'accept', ...data }, options),
  )

const createInvite = (token, fields = {}) =>
  db()
    .collection('invites')
    .add({
      studyId: 'study-1',
      email: null,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      acceptedAt: null,
      isPublic: true,
      accessLevel: 5,
      requiredLogin: true,
      membershipType: 'participant',
      ...fields,
    })

beforeAll(async () => {
  if (!admin.apps.length) ownedAdminApp = admin.initializeApp({ projectId })
  testEnv = await initializeTestEnvironment({ projectId })
})

afterAll(async () => {
  await testEnv.cleanup()
  if (ownedAdminApp) await ownedAdminApp.delete()
})

beforeEach(async () => {
  await testEnv.clearFirestore()
  await db()
    .doc('tests/study-1')
    .set({
      testType: 'USER',
      subType: 'USER_UNMODERATED',
      testTitle: 'Study',
      answersDocId: 'answers-1',
      isPublic: false,
      testAdmin: { userDocId: 'owner', email: 'owner@example.test' },
      cooperators: [
        {
          userDocId: 'manager',
          accessLevel: 4,
          accepted: true,
          status: 'accepted',
        },
      ],
      studyRoleMap: { manager: 4 },
    })
  await db()
    .doc('users/owner')
    .set({ email: 'owner@example.test', accessLevel: 1 })
  await db()
    .doc('users/manager')
    .set({ email: 'manager@example.test', accessLevel: 1 })
  await db()
    .doc('users/outsider')
    .set({ email: 'outsider@example.test', accessLevel: 1 })
})

describe('joining a study', () => {
  it.each(['cooperator', 'participant'])(
    'needs an invitation to join as a %s',
    async (membershipType) => {
      await expect(
        accept('outsider', {
          membershipType,
          role: 0,
          targetUserId: 'outsider',
        }),
      ).rejects.toMatchObject({ code: 'permission-denied' })

      expect(await studyRoles()).not.toHaveProperty('outsider')
    },
  )

  it('grants the role from the invitation, not the one requested', async () => {
    await createInvite('participant-link')

    await accept('outsider', {
      membershipType: 'participant',
      role: 0,
      targetUserId: 'outsider',
      inviteToken: 'participant-link',
    })

    expect((await studyRoles()).outsider).toBe(5)
  })

  it.each([
    ['an expired invitation', { expiresAt: new Date(Date.now() - 1000) }],
    ['an invitation to another study', { studyId: 'study-2' }],
    ['a private invitation', { isPublic: false }],
    [
      'an invitation of another membership type',
      { membershipType: 'cooperator' },
    ],
  ])('rejects %s', async (_label, fields) => {
    await createInvite('link', fields)

    await expect(
      accept('outsider', {
        membershipType: 'participant',
        targetUserId: 'outsider',
        inviteToken: 'link',
      }),
    ).rejects.toMatchObject({ code: 'permission-denied' })
    expect(await studyRoles()).not.toHaveProperty('outsider')
  })

  it('never makes a participant more than a participant', async () => {
    await createInvite('admin-as-participant', { accessLevel: 0 })

    await expect(
      accept('outsider', {
        membershipType: 'participant',
        targetUserId: 'outsider',
        inviteToken: 'admin-as-participant',
      }),
    ).rejects.toMatchObject({ code: 'permission-denied' })
    expect(await studyRoles()).not.toHaveProperty('outsider')
  })
})

describe('creating invitation links', () => {
  const link = (uid, data) =>
    generateInvitationLink.run(
      as(uid, {
        studyId: 'study-1',
        isPublic: true,
        requiredLogin: true,
        ...data,
      }),
    )

  it('is not allowed for someone without a staff role', async () => {
    await expect(
      link('outsider', { accessLevel: 0, membershipType: 'cooperator' }),
    ).rejects.toMatchObject({ code: 'permission-denied' })
    expect((await db().collection('invites').get()).empty).toBe(true)
  })

  it('only offers roles the inviter may assign', async () => {
    await expect(
      link('manager', { accessLevel: 0, membershipType: 'cooperator' }),
    ).rejects.toMatchObject({ code: 'permission-denied' })
    await expect(
      link('manager', { accessLevel: 5, membershipType: 'participant' }),
    ).resolves.toHaveProperty('inviteToken')
  })

  it('lets the owner create a participant link', async () => {
    const { inviteToken } = await link('owner', {
      accessLevel: 5,
      membershipType: 'participant',
    })

    await accept('outsider', {
      membershipType: 'participant',
      targetUserId: 'outsider',
      inviteToken,
    })
    expect((await studyRoles()).outsider).toBe(5)
  })
})

describe('anonymous participants', () => {
  const anonymous = { anonymous: true }

  it('can join through a link that does not require login', async () => {
    await createInvite('open-link', { requiredLogin: false })
    const join = () =>
      accept(
        'anon-1',
        {
          membershipType: 'participant',
          targetUserId: 'anon-1',
          inviteToken: 'open-link',
        },
        anonymous,
      )

    await join()
    // Joining again (e.g. a reload) keeps the role without listing them.
    await join()

    expect((await studyRoles())['anon-1']).toBe(5)
    const participants = await db()
      .collection('tests/study-1/participants')
      .get()
    expect(participants.empty).toBe(true)
  })

  it('cannot use a link that requires login', async () => {
    await createInvite('login-link', { requiredLogin: true })

    await expect(
      accept(
        'anon-1',
        {
          membershipType: 'participant',
          targetUserId: 'anon-1',
          inviteToken: 'login-link',
        },
        anonymous,
      ),
    ).rejects.toMatchObject({ code: 'permission-denied' })
  })

  it('cannot join as a cooperator', async () => {
    await createInvite('staff-link', {
      membershipType: 'cooperator',
      accessLevel: 3,
      requiredLogin: false,
    })

    await expect(
      accept(
        'anon-1',
        { membershipType: 'cooperator', inviteToken: 'staff-link' },
        anonymous,
      ),
    ).rejects.toMatchObject({ code: 'permission-denied' })
    expect(await studyRoles()).not.toHaveProperty('anon-1')
  })
})
