import { FirebaseFunctionsController } from '@/app/plugins/firebase/FirebaseFunctionsService'
import InviteController from '@/shared/controllers/InviteController'

jest.mock('@/app/plugins/firebase/FirebaseFunctionsService', () => ({
  FirebaseFunctionsController: {
    callHttpsCallableFunction: jest.fn(),
  },
}))

describe('InviteController', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('resolves invites through the authenticated Firebase callable client', async () => {
    const inviteResult = { success: true, invite: { studyId: 'study-1' } }
    FirebaseFunctionsController.callHttpsCallableFunction.mockResolvedValue({
      data: inviteResult,
    })

    await expect(
      InviteController.resolveInvite('invite-token', 'user-1'),
    ).resolves.toEqual(inviteResult)

    expect(
      FirebaseFunctionsController.callHttpsCallableFunction,
    ).toHaveBeenCalledWith('resolveInvite', {
      token: 'invite-token',
      uid: 'user-1',
    })
  })

  it('validates invites through the authenticated Firebase callable client', async () => {
    const validationResult = { valid: true, invite: { studyId: 'study-1' } }
    FirebaseFunctionsController.callHttpsCallableFunction.mockResolvedValue({
      data: validationResult,
    })

    await expect(
      InviteController.validateInvite('invite-token'),
    ).resolves.toEqual(validationResult)

    expect(
      FirebaseFunctionsController.callHttpsCallableFunction,
    ).toHaveBeenCalledWith('validateInvite', { token: 'invite-token' })
  })

  it('generates invitation links through the authenticated Firebase callable client', async () => {
    const linkResult = {
      inviteLink: 'https://example.com/invite?token=invite-token',
      inviteToken: 'invite-token',
      expirationDate: 123456789,
    }
    FirebaseFunctionsController.callHttpsCallableFunction.mockResolvedValue({
      data: linkResult,
    })

    const payload = {
      studyId: 'study-1',
      accessLevel: 4,
      isPublic: true,
      studyTitle: 'Test study',
    }

    await expect(
      InviteController.generateInvitationLink(payload),
    ).resolves.toEqual(linkResult)

    expect(
      FirebaseFunctionsController.callHttpsCallableFunction,
    ).toHaveBeenCalledWith('generateInvitationLink', payload)
  })
})
