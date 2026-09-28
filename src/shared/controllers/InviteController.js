import axios from 'axios'
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

  static async generateInvitationLink(payload) {
    const { data } = await axios.post(
      `${process.env.VUE_APP_CLOUD_FUNCTIONS_URL}/generateInvitationLink`,
      {
        data: payload,
      },
    )

    return data.result
  }
}
