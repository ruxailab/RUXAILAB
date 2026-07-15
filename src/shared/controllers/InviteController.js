import axios from 'axios'

export default class InviteController {
  static async resolveInvite(token, uid) {
    const { data } = await axios.post(
      `${process.env.VUE_APP_CLOUD_FUNCTIONS_URL}/resolveInvite`,
      {
        data: { token, uid },
      },
    )

    return data.result
  }

  static async validateInvite(token) {
    const { data } = await axios.post(
      `${process.env.VUE_APP_CLOUD_FUNCTIONS_URL}/validateInvite`,
      {
        data: { token },
      },
    )

    return data.result
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
