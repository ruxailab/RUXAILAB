import Invite from '@/shared/store/Invite'
import EmailController from '@/shared/controllers/EmailController'
import InviteController from '@/shared/controllers/InviteController.js'
import { manageStudyMembership } from '@/shared/services/studyMembershipService'

jest.mock('@/shared/controllers/EmailController', () => jest.fn())
jest.mock('@/shared/controllers/InviteController.js', () => ({
  __esModule: true,
  default: { generateInvitationLink: jest.fn() },
}))
jest.mock('@/shared/services/studyMembershipService', () => ({
  manageStudyMembership: jest.fn(),
}))
jest.mock('@/controllers/StudyController', () => jest.fn())

const study = {
  id: 'study-1',
  testTitle: 'Checkout',
  testDescription: '',
  testType: 'USER',
  testAdmin: { email: 'owner@example.test' },
  cooperators: [],
}
const owner = { email: 'owner@example.test', name: 'Owner' }

// EmailController.send() never throws; a failure is { success: false }.
const failEmailsTo = (...failing) => {
  const send = jest.fn(async ({ to }) =>
    failing.includes(to)
      ? { success: false, message: 'Request failed with status code 500' }
      : { success: true },
  )
  EmailController.mockImplementation(() => ({ send }))
  return send
}

const context = () => ({ commit: jest.fn(), dispatch: jest.fn() })

describe('Invite store email delivery', () => {
  beforeEach(() => {
    InviteController.generateInvitationLink.mockResolvedValue({
      inviteToken: 'token-1',
      inviteLink: 'https://ruxailab.test/invite/token-1',
      expirationDate: 1,
    })
    manageStudyMembership.mockImplementation(async ({ targetEmail, role }) => ({
      cooperator: { email: targetEmail, userDocId: null, accessLevel: role },
      participant: { email: targetEmail, userDocId: null, accessLevel: role },
    }))
  })

  it('reports which participant invitation emails were not sent', async () => {
    const send = failEmailsTo('ben@example.test')

    const invites = await Invite.actions.sendParticipantInvitations(context(), {
      study,
      user: owner,
      selectedParticipants: ['ana@example.test', 'ben@example.test'],
      selectedRole: 5,
      users: [],
      studyParticipants: [],
    })

    expect(send).toHaveBeenCalledTimes(2)
    expect(
      invites.map(({ email, emailSent }) => ({ email, emailSent })),
    ).toEqual([
      { email: 'ana@example.test', emailSent: true },
      { email: 'ben@example.test', emailSent: false },
    ])
  })

  it('reports a failed staff invitation email', async () => {
    failEmailsTo('ana@example.test')

    const [invite] = await Invite.actions.sendInvitations(context(), {
      study,
      user: owner,
      selectedCoops: ['ana@example.test'],
      selectedRole: 1,
      users: [],
    })

    expect(invite.emailSent).toBe(false)
  })

  it('reports a failed email when re-inviting staff', async () => {
    failEmailsTo('ana@example.test')

    const invite = await Invite.actions.reinviteCooperator(context(), {
      study,
      user: owner,
      guest: { email: 'ana@example.test', accessLevel: 1 },
    })

    expect(invite).toMatchObject({
      email: 'ana@example.test',
      emailSent: false,
    })
  })

  it('returns the invitation when re-inviting a participant', async () => {
    failEmailsTo()

    const invite = await Invite.actions.reinviteParticipant(context(), {
      study,
      user: owner,
      participant: { email: 'ana@example.test', accessLevel: 5 },
    })

    expect(invite).toMatchObject({
      email: 'ana@example.test',
      emailSent: true,
    })
  })

  it('reports a failed email for a member message', async () => {
    failEmailsTo('ana@example.test')
    const ctx = context()

    const result = await Invite.actions.sendMemberMessage(ctx, {
      user: { userDocId: 'user-1', email: 'ana@example.test' },
      study,
      title: 'Hello',
      content: 'Please finish the study',
    })

    expect(result).toEqual({ emailSent: false })
    // The in-app notification is still delivered.
    expect(ctx.dispatch).toHaveBeenCalledWith(
      'addNotification',
      expect.objectContaining({ userId: 'user-1' }),
    )
  })

  it('reports no email for a member without an address', async () => {
    const send = failEmailsTo()

    const result = await Invite.actions.sendMemberMessage(context(), {
      user: { userDocId: 'user-1', email: '' },
      study,
      title: 'Hello',
      content: 'Hi',
    })

    expect(result).toEqual({ emailSent: null })
    expect(send).not.toHaveBeenCalled()
  })
})
