import { FirebaseFunctionsController } from '@/app/plugins/firebase/FirebaseFunctionsService'

export default class InviteController {
  static async resolveInvite(token, uid) {
    const response = await FirebaseFunctionsController.callHttpsCallableFunction(
      'resolveInvite',
      { token, uid },
    )

    return response.data
  }

  static async validateInvite(token) {
    const response = await FirebaseFunctionsController.callHttpsCallableFunction(
      'validateInvite',
      { token },
    )

    return response.data
  }

  // The callable client sends the signed-in user's token, which the server
  // needs to check that this user may create the invitation.
  static async generateInvitationLink(payload) {
    const response = await FirebaseFunctionsController.callHttpsCallableFunction(
      'generateInvitationLink',
      payload,
    )

    return response.data
  }
}
